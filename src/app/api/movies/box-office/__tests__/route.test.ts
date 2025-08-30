/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET } from '../route';

// Mock the tmdbService module
jest.mock('../../../../../services/tmdb', () => ({
  tmdbService: {
    getMoviesByDate: jest.fn(),
  },
}));

import { tmdbService } from '../../../../../services/tmdb';
const mockGetMoviesByDate = tmdbService.getMoviesByDate as jest.MockedFunction<typeof tmdbService.getMoviesByDate>;

// Mock data
const mockMovies = [
  {
    id: 1,
    title: 'Test Movie 1',
    boxOffice: 1000000,
    rank: 1,
    releaseDate: '2023-01-15',
    genres: ['Action'],
    overview: 'Test overview 1',
  },
  {
    id: 2,
    title: 'Test Movie 2',
    boxOffice: 800000,
    rank: 2,
    releaseDate: '2023-01-20',
    genres: ['Drama'],
    overview: 'Test overview 2',
  },
];

// Helper function to create NextRequest
function createRequest(url: string): NextRequest {
  return new NextRequest(url);
}

describe('/api/movies/box-office', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to avoid noise in test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Successful Requests', () => {
    it('returns movies for valid year and month', async () => {
      mockGetMoviesByDate.mockResolvedValue(mockMovies);

      const request = createRequest('http://localhost:3000/api/movies/box-office?year=2023&month=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual({
        movies: mockMovies,
        year: 2023,
        month: 1,
      });
      expect(mockGetMoviesByDate).toHaveBeenCalledWith(2023, 1);
    });

    it('sets correct cache headers', async () => {
      mockGetMoviesByDate.mockResolvedValue(mockMovies);

      const request = createRequest('http://localhost:3000/api/movies/box-office?year=2023&month=1');
      const response = await GET(request);

      expect(response.headers.get('Cache-Control')).toBe(
        'public, s-maxage=3600, stale-while-revalidate=86400'
      );
    });

    it('handles edge case years (1900 and current year)', async () => {
      mockGetMoviesByDate.mockResolvedValue([]);
      const currentYear = new Date().getFullYear();

      // Test minimum year
      const request1900 = createRequest('http://localhost:3000/api/movies/box-office?year=1900&month=1');
      const response1900 = await GET(request1900);
      expect(response1900.status).toBe(200);

      // Test current year
      const requestCurrent = createRequest(`http://localhost:3000/api/movies/box-office?year=${currentYear}&month=12`);
      const responseCurrent = await GET(requestCurrent);
      expect(responseCurrent.status).toBe(200);
    });
  });

  describe('Validation Errors', () => {
    it('returns 400 when year parameter is missing', async () => {
      const request = createRequest('http://localhost:3000/api/movies/box-office?month=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('VALIDATION_ERROR');
      expect(data.error?.message).toBe('Year and month parameters are required');
    });

    it('returns 400 when month parameter is missing', async () => {
      const request = createRequest('http://localhost:3000/api/movies/box-office?year=2023');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('VALIDATION_ERROR');
      expect(data.error?.message).toBe('Year and month parameters are required');
    });

    it('returns 400 when both parameters are missing', async () => {
      const request = createRequest('http://localhost:3000/api/movies/box-office');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('VALIDATION_ERROR');
      expect(data.error?.message).toBe('Year and month parameters are required');
    });

    it('returns 400 when year is not a valid number', async () => {
      const request = createRequest('http://localhost:3000/api/movies/box-office?year=abc&month=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('VALIDATION_ERROR');
      expect(data.error?.message).toBe('Year and month must be valid numbers');
    });

    it('returns 400 when month is not a valid number', async () => {
      const request = createRequest('http://localhost:3000/api/movies/box-office?year=2023&month=abc');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('VALIDATION_ERROR');
      expect(data.error?.message).toBe('Year and month must be valid numbers');
    });

    it('returns 400 when year is below minimum (1900)', async () => {
      const request = createRequest('http://localhost:3000/api/movies/box-office?year=1899&month=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('VALIDATION_ERROR');
      expect(data.error?.message).toContain('Year must be between 1900 and');
    });

    it('returns 400 when year is above current year', async () => {
      const currentYear = new Date().getFullYear();
      const futureYear = currentYear + 1;
      
      const request = createRequest(`http://localhost:3000/api/movies/box-office?year=${futureYear}&month=1`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('VALIDATION_ERROR');
      expect(data.error?.message).toContain('Year must be between 1900 and');
    });

    it('returns 400 when month is below 1', async () => {
      const request = createRequest('http://localhost:3000/api/movies/box-office?year=2023&month=0');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('VALIDATION_ERROR');
      expect(data.error?.message).toBe('Month must be between 1 and 12');
    });

    it('returns 400 when month is above 12', async () => {
      const request = createRequest('http://localhost:3000/api/movies/box-office?year=2023&month=13');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('VALIDATION_ERROR');
      expect(data.error?.message).toBe('Month must be between 1 and 12');
    });
  });

  describe('Service Error Handling', () => {
    it('handles validation errors from service', async () => {
      const validationError = {
        code: 'VALIDATION_ERROR',
        message: 'Service validation error',
      };
      mockGetMoviesByDate.mockRejectedValue(validationError);

      const request = createRequest('http://localhost:3000/api/movies/box-office?year=2023&month=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toEqual(validationError);
    });

    it('handles not found errors from service', async () => {
      const notFoundError = {
        code: 'NOT_FOUND',
        message: 'No movies found for this period',
      };
      mockGetMoviesByDate.mockRejectedValue(notFoundError);

      const request = createRequest('http://localhost:3000/api/movies/box-office?year=2023&month=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toEqual(notFoundError);
    });

    it('handles unknown errors from service', async () => {
      const unknownError = new Error('Unknown error');
      mockGetMoviesByDate.mockRejectedValue(unknownError);

      const request = createRequest('http://localhost:3000/api/movies/box-office?year=2023&month=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('SERVER_ERROR');
      expect(data.error?.message).toBe('An unexpected error occurred');
    });
  });

  describe('Response Format', () => {
    it('returns correct response structure for successful requests', async () => {
      mockGetMoviesByDate.mockResolvedValue(mockMovies);

      const request = createRequest('http://localhost:3000/api/movies/box-office?year=2023&month=1');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('movies');
      expect(data.data).toHaveProperty('year', 2023);
      expect(data.data).toHaveProperty('month', 1);
      expect(data.data.movies).toEqual(mockMovies);
    });

    it('returns correct response structure for error requests', async () => {
      const request = createRequest('http://localhost:3000/api/movies/box-office?year=abc&month=1');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('code');
      expect(data.error).toHaveProperty('message');
      expect(data).not.toHaveProperty('data');
    });
  });

  describe('Parameter Parsing', () => {
    it('correctly parses integer parameters', async () => {
      mockGetMoviesByDate.mockResolvedValue([]);

      const request = createRequest('http://localhost:3000/api/movies/box-office?year=2023&month=5');
      await GET(request);

      expect(mockGetMoviesByDate).toHaveBeenCalledWith(2023, 5);
    });

    it('handles string numbers correctly', async () => {
      mockGetMoviesByDate.mockResolvedValue([]);

      const request = createRequest('http://localhost:3000/api/movies/box-office?year=2023&month=05');
      await GET(request);

      expect(mockGetMoviesByDate).toHaveBeenCalledWith(2023, 5);
    });

    it('handles floating point numbers by truncating', async () => {
      mockGetMoviesByDate.mockResolvedValue([]);

      const request = createRequest('http://localhost:3000/api/movies/box-office?year=2023.5&month=5.9');
      await GET(request);

      expect(mockGetMoviesByDate).toHaveBeenCalledWith(2023, 5);
    });
  });
});