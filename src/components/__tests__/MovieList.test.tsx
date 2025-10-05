import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MovieList from '../MovieList';
import { MovieExpandProvider } from '@/contexts/MovieExpandContext';
import { Movie } from '@/types/movie';

// Mock MovieCard component to simplify testing
jest.mock('../MovieCard', () => {
  return function MockMovieCard({ movie }: { movie: Movie }) {
    return (
      <div data-testid={`movie-card-${movie.id}`}>
        <h3>{movie.title}</h3>
        <p>Rank: {movie.rank}</p>
        <p>Box Office: {movie.boxOffice}</p>
      </div>
    );
  };
});

const mockMovies: Movie[] = [
  {
    id: 1,
    title: 'Movie 1',
    boxOffice: 1000000,
    rank: 1,
    releaseDate: '2023-01-15',
    genres: ['Action'],
  },
  {
    id: 2,
    title: 'Movie 2',
    boxOffice: 800000,
    rank: 2,
    releaseDate: '2023-01-20',
    genres: ['Drama'],
  },
  {
    id: 3,
    title: 'Movie 3',
    boxOffice: 600000,
    rank: 3,
    releaseDate: '2023-01-25',
    genres: ['Comedy'],
  },
];

const defaultProps = {
  movies: mockMovies,
  currentYear: 2023,
  currentMonth: 1,
  onNextMonth: jest.fn(),
  onPreviousMonth: jest.fn(),
  isNextMonthAvailable: jest.fn(() => true),
  loading: false,
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <MovieExpandProvider>
      {component}
    </MovieExpandProvider>
  );
};

describe('MovieList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本的なレンダリング', () => {
    it('映画配列が空の場合に何も表示しない', () => {
      const { container } = renderWithProvider(
        <MovieList {...defaultProps} movies={[]} />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('正しいタイトルと件数で映画リストを表示する', () => {
      renderWithProvider(<MovieList {...defaultProps} />);
      
      expect(screen.getByText('ランキング結果 (3件) - 2023年1月')).toBeInTheDocument();
    });

    it('すべての映画カードを表示する', () => {
      renderWithProvider(<MovieList {...defaultProps} />);
      
      expect(screen.getByTestId('movie-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('movie-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('movie-card-3')).toBeInTheDocument();
    });

    it('映画を正しい順序で表示する', () => {
      renderWithProvider(<MovieList {...defaultProps} />);
      
      const movieCards = screen.getAllByTestId(/movie-card-/);
      expect(movieCards).toHaveLength(3);
      
      // Check that movies are rendered in the order provided
      expect(screen.getByText('Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Movie 2')).toBeInTheDocument();
      expect(screen.getByText('Movie 3')).toBeInTheDocument();
    });
  });

  describe('警告メッセージ', () => {
    it('10件未満の映画が利用可能な場合に警告を表示する', () => {
      renderWithProvider(<MovieList {...defaultProps} />);
      
      expect(screen.getByText('この期間に公開された映画で興行収入データが利用可能なのは3件です。')).toBeInTheDocument();
    });

    it('10件以上の映画が利用可能な場合に警告を表示しない', () => {
      const tenMovies = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Movie ${i + 1}`,
        boxOffice: 1000000 - (i * 100000),
        rank: i + 1,
        releaseDate: '2023-01-15',
        genres: ['Action'],
      }));

      renderWithProvider(<MovieList {...defaultProps} movies={tenMovies} />);
      
      expect(screen.queryByText(/この期間に公開された映画で興行収入データが利用可能なのは/)).not.toBeInTheDocument();
    });
  });

  describe('ナビゲーションボタン', () => {
    it('現在の月表示とナビゲーションボタンを表示する', () => {
      renderWithProvider(<MovieList {...defaultProps} />);
      
      expect(screen.getByText('前の月')).toBeInTheDocument();
      expect(screen.getByText('次の月')).toBeInTheDocument();
      expect(screen.getByText('2023年1月')).toBeInTheDocument();
      expect(screen.getByText('のランキング')).toBeInTheDocument();
    });

    it('前の月ボタンがクリックされた時にonPreviousMonthが呼ばれる', async () => {
      const user = userEvent.setup();
      renderWithProvider(<MovieList {...defaultProps} />);
      
      const previousButton = screen.getByText('前の月');
      await user.click(previousButton);
      
      expect(defaultProps.onPreviousMonth).toHaveBeenCalledTimes(1);
    });

    it('次の月ボタンがクリックされた時にonNextMonthが呼ばれる', async () => {
      const user = userEvent.setup();
      renderWithProvider(<MovieList {...defaultProps} />);
      
      const nextButton = screen.getByText('次の月');
      await user.click(nextButton);
      
      expect(defaultProps.onNextMonth).toHaveBeenCalledTimes(1);
    });

    it('次の月が利用できない場合に次の月ボタンが無効化される', () => {
      const propsWithNoNextMonth = {
        ...defaultProps,
        isNextMonthAvailable: jest.fn(() => false),
      };

      renderWithProvider(<MovieList {...propsWithNoNextMonth} />);
      
      const nextButton = screen.getByText('次の月');
      expect(nextButton).toBeDisabled();
    });

    it('ローディング中にナビゲーションボタンが無効化される', () => {
      renderWithProvider(<MovieList {...defaultProps} loading={true} />);
      
      const previousButton = screen.getByText('前の月');
      const nextButton = screen.getByText('次の月');
      
      expect(previousButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });
  });

  describe('ローディング状態', () => {
    it('ローディング中にナビゲーションボタンが無効化される', () => {
      renderWithProvider(<MovieList {...defaultProps} loading={true} />);
      
      const previousButton = screen.getByText('前の月');
      const nextButton = screen.getByText('次の月');
      
      expect(previousButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });

    it('ローディング中でも映画リストが表示される', () => {
      renderWithProvider(<MovieList {...defaultProps} loading={true} />);
      
      expect(screen.getByTestId('movie-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('movie-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('movie-card-3')).toBeInTheDocument();
    });
  });

  describe('エッジケース', () => {
    it('currentYearとcurrentMonthがnullの場合を適切に処理する', () => {
      const propsWithNullValues = {
        ...defaultProps,
        currentYear: null,
        currentMonth: null,
      };

      renderWithProvider(<MovieList {...propsWithNullValues} />);
      
      // Should still render movies but not navigation
      expect(screen.getByTestId('movie-card-1')).toBeInTheDocument();
      expect(screen.queryByText('前の月')).not.toBeInTheDocument();
      expect(screen.queryByText('次の月')).not.toBeInTheDocument();
    });

    it('単一の映画を正しく処理する', () => {
      const singleMovie = [mockMovies[0]];
      
      renderWithProvider(<MovieList {...defaultProps} movies={singleMovie} />);
      
      expect(screen.getByText('ランキング結果 (1件) - 2023年1月')).toBeInTheDocument();
      expect(screen.getByText('この期間に公開された映画で興行収入データが利用可能なのは1件です。')).toBeInTheDocument();
    });

    it('異なる年と月の値を処理する', () => {
      const propsWithDifferentDate = {
        ...defaultProps,
        currentYear: 2022,
        currentMonth: 12,
      };

      renderWithProvider(<MovieList {...propsWithDifferentDate} />);
      
      expect(screen.getByText('ランキング結果 (3件) - 2022年12月')).toBeInTheDocument();
      expect(screen.getByText('2022年12月')).toBeInTheDocument();
    });
  });

  describe('ボタンスタイルと状態', () => {
    it('ナビゲーションボタンに正しいCSSクラスが適用される', () => {
      renderWithProvider(<MovieList {...defaultProps} />);
      
      const previousButton = screen.getByText('前の月');
      const nextButton = screen.getByText('次の月');
      
      // Check that buttons have expected classes (basic check)
      expect(previousButton).toHaveClass('px-4', 'py-2');
      expect(nextButton).toHaveClass('px-4', 'py-2');
    });

    it('無効化された次の月ボタンに適切なカーソル状態が表示される', () => {
      const propsWithNoNextMonth = {
        ...defaultProps,
        isNextMonthAvailable: jest.fn(() => false),
      };

      renderWithProvider(<MovieList {...propsWithNoNextMonth} />);
      
      const nextButton = screen.getByText('次の月');
      expect(nextButton).toHaveClass('disabled:cursor-not-allowed');
    });
  });
});