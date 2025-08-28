import {
  Movie,
  TMDbMovieResponse,
  TMDbDiscoverResponse,
  TMDbGenresResponse,
  ApiError,
  ErrorCode,
  NetworkError
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

      // Fetch movies from TMDb API
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}&sort_by=revenue.desc&page=1`
      );

      const data: TMDbDiscoverResponse = await response.json();
      
      if (!response.ok) {
        throw this.createNetworkError(response.status, data);
      }

      // Load genres if not cached
      if (this.genreCache.size === 0) {
        await this.loadGenres();
      }

      // Transform and rank movies
      const movies = data.results
        .slice(0, 10) // Get top 10
        .map((movie, index) => this.transformMovie(movie, index + 1));

      return movies;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get detailed movie information
   */
  async getMovieDetails(movieId: number): Promise<TMDbMovieResponse> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}`
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
   * Load and cache genre mappings
   */
  private async loadGenres(): Promise<void> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/genre/movie/list?api_key=${this.apiKey}`
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
  private createNetworkError(statusCode: number, data?: any): NetworkError {
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
      statusCode,
      details: data
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