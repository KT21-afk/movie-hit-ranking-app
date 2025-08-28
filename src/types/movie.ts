// Movie data types and interfaces

export interface Movie {
  id: number;
  title: string;
  boxOffice: number;
  rank: number;
  posterUrl?: string;
  releaseDate: string;
  genres: string[];
  overview?: string;
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