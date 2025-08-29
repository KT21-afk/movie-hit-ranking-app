import { useEffect } from 'react';
import { Movie } from '@/types/movie';
import MovieCard from './MovieCard';
import { useMovieExpand } from '@/contexts/MovieExpandContext';

interface MovieListProps {
  movies: Movie[];
  currentYear: number | null;
  currentMonth: number | null;
  onNextMonth: () => void;
  onPreviousMonth: () => void;
  isNextMonthAvailable: () => boolean;
  loading: boolean;
}

export default function MovieList({
  movies,
  currentYear,
  currentMonth,
  onNextMonth,
  onPreviousMonth,
  isNextMonthAvailable,
  loading
}: MovieListProps) {
  const { resetExpansions } = useMovieExpand();

  // 新しいデータが来た時に展開状態をリセット
  useEffect(() => {
    if (movies.length > 0) {
      resetExpansions();
    }
  }, [movies, resetExpansions]);

  if (movies.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
        ランキング結果 ({movies.length}件) - {currentYear}年{currentMonth}月
      </h2>
      {movies.length < 10 && (
        <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 text-yellow-700 dark:text-yellow-200 rounded-md text-center text-sm">
          この期間に公開された映画で興行収入データが利用可能なのは{movies.length}件です。
        </div>
      )}
      <div className="space-y-4">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
          />
        ))}
      </div>

      {/* ナビゲーションボタン */}
      {currentYear && currentMonth && (
        <div className="mt-8 flex justify-center items-center gap-4">
          <button
            onClick={onPreviousMonth}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            前の月
          </button>

          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentYear}年{currentMonth}月
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              のランキング
            </p>
          </div>

          <button
            onClick={onNextMonth}
            disabled={loading || !isNextMonthAvailable()}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
          >
            次の月
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}