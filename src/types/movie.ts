// Movie data types and interfaces

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path?: string;
}

export interface Movie {
  id: number;
  title: string;
  boxOffice: number;
  rank: number;
  posterUrl?: string;
  releaseDate: string;
  genres: string[];
  overview?: string;
  watchProviders?: WatchProvider[];
}

export interface BoxOfficeResponse {
  movies: Movie[];
  year: number;
  month: number;
}

// TMDb API response types
export interface TMDbMovieResponse {
  id: number;
  title: string;
  release_date: string;
  poster_path?: string;
  genre_ids: number[];
  overview: string;
  revenue?: number;
  popularity: number;
}

// TMDb Movie Details API response (includes revenue)
export interface TMDbMovieDetailsResponse {
  id: number;
  title: string;
  release_date: string;
  poster_path?: string;
  genres: { id: number; name: string }[];
  overview: string;
  revenue: number;
  budget: number;
  runtime: number;
  vote_average: number;
  vote_count: number;
}

export interface TMDbDiscoverResponse {
  page: number;
  results: TMDbMovieResponse[];
  total_pages: number;
  total_results: number;
}

export interface TMDbGenre {
  id: number;
  name: string;
}

export interface TMDbGenresResponse {
  genres: TMDbGenre[];
}

// Box office data interface
export interface BoxOfficeData {
  movieId: number;
  revenue: number;
}

// TMDb Watch Providers API response types
export interface TMDbWatchProvidersResponse {
  id: number;
  results: {
    JP?: {
      flatrate?: WatchProvider[];
      rent?: WatchProvider[];
      buy?: WatchProvider[];
    };
  };
}