import {
  Movie,
  TMDbMovieResponse,
  TMDbMovieDetailsResponse,
  TMDbDiscoverResponse,
  TMDbGenresResponse,
  TMDbWatchProvidersResponse,
  WatchProvider,
  ApiError,
  ErrorCode
} from '@/types';

export class TMDbService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number = 10000; // 10 seconds
  private genreCache: Map<number, string> = new Map();

  constructor() {
    this.apiKey = process.env.TMDB_API_KEY || '';
    this.baseUrl = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

    if (!this.apiKey) {
      throw new Error('TMDB_API_KEY environment variable is required');
    }
  }

  /**
   * Get movies by release date (year and month)
   */
  async getMoviesByDate(year: number, month: number): Promise<Movie[]> {
    try {
      // Validate input parameters
      this.validateDateInput(year, month);

      // Format date range for API query
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = this.getEndOfMonth(year, month);

      // Load genres if not cached
      if (this.genreCache.size === 0) {
        await this.loadGenres();
      }

      let allMovies: Movie[] = [];
      let page = 1;
      const maxPages = 3; // 最大3ページまで取得

      // 複数ページから映画を取得して、十分な数の映画を確保
      while (allMovies.length < 10 && page <= maxPages) {
        const movies = await this.fetchMoviesFromPage(startDate, endDate, page);
        allMovies = allMovies.concat(movies);
        page++;
      }

      // 興行収入でソートして上位10件を返す
      const topMovies = allMovies
        .sort((a, b) => b.boxOffice - a.boxOffice)
        .slice(0, 10)
        .map((movie, index) => ({ ...movie, rank: index + 1 }));

      return topMovies;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 指定されたページから映画データを取得
   */
  private async fetchMoviesFromPage(startDate: string, endDate: string, page: number): Promise<Movie[]> {
    // 人気順で映画を取得（日本語で）
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}&sort_by=popularity.desc&page=${page}&language=ja-JP`
    );

    const data: TMDbDiscoverResponse = await response.json();

    if (!response.ok) {
      throw this.createNetworkError(response.status, data);
    }

    // 各映画の詳細情報とWatch Providersを並列取得
    const moviePromises = data.results.map(async movie => {
      const [details, watchProviders] = await Promise.all([
        this.getMovieDetailsWithRevenue(movie.id),
        this.getWatchProviders(movie.id)
      ]);
      return { details, watchProviders };
    });
    
    const movieData = await Promise.all(moviePromises);

    // 興行収入データがある映画のみを変換して返す
    const validMovies = movieData
      .filter(({ details }) => details && details.revenue > 0)
      .map(({ details, watchProviders }) => this.transformDetailedMovie(details!, watchProviders));

    // 興行収入データがない映画も含める（人気度ベースでフォールバック）
    const fallbackMovies = data.results
      .filter(originalMovie => 
        !movieData.some(({ details }) => details && details.id === originalMovie.id && details.revenue > 0)
      )
      .map((movie, index) => {
        const watchProviders = movieData.find(({ details }) => details?.id === movie.id)?.watchProviders || [];
        return this.transformMovieWithFallback(movie, watchProviders);
      })
      .slice(0, Math.max(0, 10 - validMovies.length)); // 不足分だけ追加

    return [...validMovies, ...fallbackMovies];
  }

  /**
   * Get detailed movie information
   */
  async getMovieDetails(movieId: number): Promise<TMDbMovieResponse> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}&language=ja-JP`
      );

      const data: TMDbMovieResponse = await response.json();

      if (!response.ok) {
        throw this.createNetworkError(response.status, data);
      }

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get detailed movie information with revenue data
   */
  async getMovieDetailsWithRevenue(movieId: number): Promise<TMDbMovieDetailsResponse | null> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}&language=ja-JP`
      );

      const data: TMDbMovieDetailsResponse = await response.json();

      if (!response.ok) {
        console.warn(`Failed to get details for movie ${movieId}:`, response.status);
        return null;
      }

      return data;
    } catch (error) {
      console.warn(`Error getting details for movie ${movieId}:`, error);
      return null;
    }
  }

  /**
   * Get watch providers for a movie (Japan region)
   */
  async getWatchProviders(movieId: number): Promise<WatchProvider[]> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/movie/${movieId}/watch/providers?api_key=${this.apiKey}`
      );

      const data: TMDbWatchProvidersResponse = await response.json();

      if (!response.ok) {
        console.warn(`Failed to get watch providers for movie ${movieId}:`, response.status);
        return [];
      }

      // 日本のストリーミングサービス情報を取得
      const jpProviders = data.results.JP;
      if (!jpProviders) {
        return [];
      }

      // flatrate (サブスク), rent (レンタル), buy (購入) の順で優先
      const providers: WatchProvider[] = [];
      
      if (jpProviders.flatrate) {
        providers.push(...jpProviders.flatrate);
      }
      if (jpProviders.rent) {
        providers.push(...jpProviders.rent);
      }
      if (jpProviders.buy) {
        providers.push(...jpProviders.buy);
      }

      // 重複を除去
      const uniqueProviders = providers.filter((provider, index, self) => 
        index === self.findIndex(p => p.provider_id === provider.provider_id)
      );

      return uniqueProviders;
    } catch (error) {
      console.warn(`Error getting watch providers for movie ${movieId}:`, error);
      return [];
    }
  }

  /**
   * Load and cache genre mappings
   */
  private async loadGenres(): Promise<void> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/genre/movie/list?api_key=${this.apiKey}&language=ja-JP`
      );

      const data: TMDbGenresResponse = await response.json();

      if (response.ok) {
        data.genres.forEach(genre => {
          this.genreCache.set(genre.id, genre.name);
        });
      }
    } catch (error) {
      // Genre loading is not critical, log but don't throw
      console.warn('Failed to load genres:', error);
    }
  }

  /**
   * Transform TMDb movie response to internal Movie type
   */
  private transformMovie(tmdbMovie: TMDbMovieResponse, rank: number): Movie {
    const genres = tmdbMovie.genre_ids
      .map(id => this.genreCache.get(id))
      .filter(Boolean) as string[];

    return {
      id: tmdbMovie.id,
      title: tmdbMovie.title,
      boxOffice: tmdbMovie.revenue || 0,
      rank,
      posterUrl: tmdbMovie.poster_path
        ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
        : undefined,
      releaseDate: tmdbMovie.release_date,
      genres,
      overview: tmdbMovie.overview
    };
  }

  /**
   * Transform TMDb detailed movie response to internal Movie type
   */
  private transformDetailedMovie(tmdbMovie: TMDbMovieDetailsResponse, watchProviders: WatchProvider[] = []): Movie {
    const genres = tmdbMovie.genres.map(genre => genre.name);

    return {
      id: tmdbMovie.id,
      title: tmdbMovie.title,
      boxOffice: tmdbMovie.revenue,
      rank: 0, // Will be set later
      posterUrl: tmdbMovie.poster_path
        ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
        : undefined,
      releaseDate: tmdbMovie.release_date,
      genres,
      overview: tmdbMovie.overview,
      watchProviders
    };
  }

  /**
   * Transform TMDb movie response with fallback for missing revenue data
   */
  private transformMovieWithFallback(tmdbMovie: TMDbMovieResponse, watchProviders: WatchProvider[] = []): Movie {
    const genres = tmdbMovie.genre_ids
      .map(id => this.genreCache.get(id))
      .filter(Boolean) as string[];

    // 人気度を疑似的な興行収入として使用（実際の収入データがない場合）
    const fallbackRevenue = Math.floor(tmdbMovie.popularity * 100000);

    return {
      id: tmdbMovie.id,
      title: tmdbMovie.title,
      boxOffice: fallbackRevenue,
      rank: 0, // Will be set later
      posterUrl: tmdbMovie.poster_path
        ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
        : undefined,
      releaseDate: tmdbMovie.release_date,
      genres,
      overview: tmdbMovie.overview,
      watchProviders
    };
  }

  /**
   * Fetch with timeout support
   */
  private async fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createApiError(ErrorCode.TIMEOUT_ERROR, 'Request timeout');
      }

      throw error;
    }
  }

  /**
   * Validate date input parameters
   */
  private validateDateInput(year: number, month: number): void {
    const currentYear = new Date().getFullYear();

    if (year < 1900 || year > currentYear) {
      throw this.createApiError(
        ErrorCode.VALIDATION_ERROR,
        `Year must be between 1900 and ${currentYear}`
      );
    }

    if (month < 1 || month > 12) {
      throw this.createApiError(
        ErrorCode.VALIDATION_ERROR,
        'Month must be between 1 and 12'
      );
    }
  }

  /**
   * Get the last day of the month
   */
  private getEndOfMonth(year: number, month: number): string {
    const lastDay = new Date(year, month, 0).getDate();
    return `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
  }

  /**
   * Create standardized API error
   */
  private createApiError(code: ErrorCode, message: string, details?: any): ApiError {
    return {
      code,
      message,
      details
    };
  }

  /**
   * Create network error with status code
   */
  private createNetworkError(statusCode: number, data?: any): ApiError {
    let message = 'Network error occurred';
    let code = ErrorCode.NETWORK_ERROR;

    switch (statusCode) {
      case 401:
        message = 'Invalid API key';
        break;
      case 404:
        message = 'Resource not found';
        code = ErrorCode.NOT_FOUND;
        break;
      case 429:
        message = 'Rate limit exceeded';
        code = ErrorCode.RATE_LIMIT_ERROR;
        break;
      case 500:
      case 502:
      case 503:
        message = 'External API server error';
        code = ErrorCode.EXTERNAL_API_ERROR;
        break;
    }

    return {
      code,
      message,
      details: { statusCode, data }
    };
  }

  /**
   * Handle and transform errors
   */
  private handleError(error: unknown): ApiError {
    if (error instanceof Error) {
      // If it's already an ApiError, return as is
      if ('code' in error) {
        return error as ApiError;
      }

      // Handle fetch errors
      if (error.message.includes('fetch')) {
        return this.createApiError(
          ErrorCode.NETWORK_ERROR,
          'Network connection failed'
        );
      }
    }

    // Default server error
    return this.createApiError(
      ErrorCode.SERVER_ERROR,
      'An unexpected error occurred',
      error
    );
  }
}

// Export singleton instance
export const tmdbService = new TMDbService();