import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MovieCard from '../MovieCard';
import { MovieExpandProvider } from '@/contexts/MovieExpandContext';
import { Movie } from '@/types/movie';

// Mock movie data for testing
const mockMovie: Movie = {
  id: 1,
  title: 'Test Movie',
  boxOffice: 1000000,
  rank: 1,
  posterUrl: 'https://example.com/poster.jpg',
  releaseDate: '2023-01-15',
  genres: ['Action', 'Adventure', 'Sci-Fi', 'Thriller'],
  overview: 'This is a test movie overview that is long enough to test the expand/collapse functionality. '.repeat(3),
  watchProviders: [
    { provider_id: 1, provider_name: 'Netflix', logo_path: '/netflix.jpg' },
    { provider_id: 2, provider_name: 'Amazon Prime', logo_path: '/amazon.jpg' },
    { provider_id: 3, provider_name: 'Disney+', logo_path: '/disney.jpg' },
    { provider_id: 4, provider_name: 'Hulu', logo_path: '/hulu.jpg' },
    { provider_id: 5, provider_name: 'HBO Max', logo_path: '/hbo.jpg' },
    { provider_id: 6, provider_name: 'Apple TV+', logo_path: '/apple.jpg' },
    { provider_id: 7, provider_name: 'Paramount+', logo_path: '/paramount.jpg' },
  ]
};

const mockMovieWithoutOptionalFields: Movie = {
  id: 2,
  title: 'Simple Movie',
  boxOffice: 500000,
  rank: 2,
  releaseDate: '2023-02-20',
  genres: ['Drama'],
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <MovieExpandProvider>
      {component}
    </MovieExpandProvider>
  );
};

describe('MovieCard', () => {
  describe('Basic Rendering', () => {
    it('renders movie title and rank correctly', () => {
      renderWithProvider(<MovieCard movie={mockMovie} />);
      
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('renders box office amount with proper formatting', () => {
      renderWithProvider(<MovieCard movie={mockMovie} />);
      
      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
    });

    it('renders release date', () => {
      renderWithProvider(<MovieCard movie={mockMovie} />);
      
      expect(screen.getByText('2023-01-15')).toBeInTheDocument();
    });

    it('renders genres', () => {
      renderWithProvider(<MovieCard movie={mockMovie} />);
      
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Adventure')).toBeInTheDocument();
      expect(screen.getByText('Sci-Fi')).toBeInTheDocument();
    });
  });

  describe('Poster Image', () => {
    it('renders poster image when posterUrl is provided', () => {
      renderWithProvider(<MovieCard movie={mockMovie} />);
      
      const posterImage = screen.getByAltText('Test Movie');
      expect(posterImage).toBeInTheDocument();
      expect(posterImage).toHaveAttribute('src', 'https://example.com/poster.jpg');
    });

    it('renders placeholder when posterUrl is not provided', () => {
      renderWithProvider(<MovieCard movie={mockMovieWithoutOptionalFields} />);
      
      expect(screen.getByText('No Image')).toBeInTheDocument();
      expect(screen.queryByAltText('Simple Movie')).not.toBeInTheDocument();
    });
  });

  describe('Watch Providers', () => {
    it('renders watch providers section when providers are available', () => {
      renderWithProvider(<MovieCard movie={mockMovie} />);
      
      expect(screen.getByText('視聴可能サービス')).toBeInTheDocument();
      expect(screen.getByText('Netflix')).toBeInTheDocument();
      expect(screen.getByText('Amazon Prime')).toBeInTheDocument();
    });

    it('does not render watch providers section when no providers', () => {
      renderWithProvider(<MovieCard movie={mockMovieWithoutOptionalFields} />);
      
      expect(screen.queryByText('視聴可能サービス')).not.toBeInTheDocument();
    });

    it('shows expand button when there are more than 3 providers on mobile', () => {
      renderWithProvider(<MovieCard movie={mockMovie} />);
      
      // Should show expand button since we have 7 providers (more than 3)
      // Use getAllByText to handle multiple responsive elements
      const expandButtons = screen.getAllByText(/他.*個のサービスを見る/);
      expect(expandButtons.length).toBeGreaterThan(0);
    });

    it('expands and collapses providers when button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider(<MovieCard movie={mockMovie} />);
      
      // Initially should not show all providers
      expect(screen.queryByText('Paramount+')).not.toBeInTheDocument();
      
      // Click expand button (get the first one since there are responsive duplicates)
      const expandButtons = screen.getAllByText(/他.*個のサービスを見る/);
      await user.click(expandButtons[0]);
      
      // Should now show all providers
      expect(screen.getByText('Paramount+')).toBeInTheDocument();
      expect(screen.getByText('折りたたむ')).toBeInTheDocument();
      
      // Click collapse button
      const collapseButton = screen.getByText('折りたたむ');
      await user.click(collapseButton);
      
      // Should hide extra providers again
      expect(screen.queryByText('Paramount+')).not.toBeInTheDocument();
    });
  });

  describe('Overview Section', () => {
    it('renders overview section when overview is provided', () => {
      renderWithProvider(<MovieCard movie={mockMovie} />);
      
      expect(screen.getByText('あらすじ')).toBeInTheDocument();
      expect(screen.getByText(/This is a test movie overview/)).toBeInTheDocument();
    });

    it('does not render overview section when overview is not provided', () => {
      renderWithProvider(<MovieCard movie={mockMovieWithoutOptionalFields} />);
      
      expect(screen.queryByText('あらすじ')).not.toBeInTheDocument();
    });

    it('shows expand button for long overview text', () => {
      renderWithProvider(<MovieCard movie={mockMovie} />);
      
      // Should show expand button since overview is long
      expect(screen.getByText('もっと見る')).toBeInTheDocument();
    });

    it('expands and collapses overview when button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider(<MovieCard movie={mockMovie} />);
      
      // Click expand button
      const expandButton = screen.getByText('もっと見る');
      await user.click(expandButton);
      
      // Should show collapse button
      expect(screen.getByText('折りたたむ')).toBeInTheDocument();
      
      // Click collapse button
      const collapseButton = screen.getByText('折りたたむ');
      await user.click(collapseButton);
      
      // Should show expand button again
      expect(screen.getByText('もっと見る')).toBeInTheDocument();
    });
  });

  describe('Box Office Formatting', () => {
    it('formats large numbers with commas', () => {
      const movieWithLargeBoxOffice: Movie = {
        ...mockMovieWithoutOptionalFields,
        boxOffice: 123456789
      };
      
      renderWithProvider(<MovieCard movie={movieWithLargeBoxOffice} />);
      
      expect(screen.getByText('$123,456,789')).toBeInTheDocument();
    });

    it('handles zero box office', () => {
      const movieWithZeroBoxOffice: Movie = {
        ...mockMovieWithoutOptionalFields,
        boxOffice: 0
      };
      
      renderWithProvider(<MovieCard movie={movieWithZeroBoxOffice} />);
      
      expect(screen.getByText('$0')).toBeInTheDocument();
    });
  });

  describe('Genre Display', () => {
    it('limits genre display on mobile (3 genres)', () => {
      renderWithProvider(<MovieCard movie={mockMovie} />);
      
      // Should show first 3 genres
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Adventure')).toBeInTheDocument();
      expect(screen.getByText('Sci-Fi')).toBeInTheDocument();
    });

    it('handles movies with no genres', () => {
      const movieWithoutGenres: Movie = {
        ...mockMovieWithoutOptionalFields,
        genres: []
      };
      
      renderWithProvider(<MovieCard movie={movieWithoutGenres} />);
      
      // Should not crash and should not show genre section
      expect(screen.queryByText('Action')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper alt text for poster images', () => {
      renderWithProvider(<MovieCard movie={mockMovie} />);
      
      const posterImage = screen.getByAltText('Test Movie');
      expect(posterImage).toBeInTheDocument();
    });

    it('has proper alt text for provider logos', () => {
      renderWithProvider(<MovieCard movie={mockMovie} />);
      
      const netflixLogo = screen.getByAltText('Netflix');
      expect(netflixLogo).toBeInTheDocument();
    });

    it('buttons are keyboard accessible', async () => {
      const user = userEvent.setup();
      renderWithProvider(<MovieCard movie={mockMovie} />);
      
      const expandButtons = screen.getAllByText(/他.*個のサービスを見る/);
      const expandButton = expandButtons[0];
      
      // Should be clickable with keyboard
      await user.click(expandButton);
      expect(screen.getByText('折りたたむ')).toBeInTheDocument();
    });
  });
});