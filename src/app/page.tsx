'use client';

import { useState, useEffect } from 'react';
import DateInputForm from '@/components/DateInputForm';
import MovieList from '@/components/MovieList';
import { MovieExpandProvider } from '@/contexts/MovieExpandContext';
import { Movie, ApiResponse, BoxOfficeResponse } from '@/types';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number | null>(null);
  const [shouldScrollToTop, setShouldScrollToTop] = useState(false);

  // スクロール処理のuseEffect
  useEffect(() => {
    if (shouldScrollToTop && movies.length > 0) {
      // 少し遅延を入れてDOMの更新を待つ
      setTimeout(() => {
        const rankingTitle = document.querySelector('h2');
        if (rankingTitle) {
          // ヘッダーの高さを考慮してオフセットを追加
          const headerOffset = 100; // ヘッダーの高さ + 余白
          const elementPosition = rankingTitle.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
        setShouldScrollToTop(false);
      }, 100);
    }
  }, [shouldScrollToTop, movies]);

  const handleDateSubmit = async (year: number, month: number, shouldScroll: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/movies/box-office?year=${year}&month=${month}`);
      const data: ApiResponse<BoxOfficeResponse> = await response.json();

      if (data.success && data.data) {
        setMovies(data.data.movies);
        setCurrentYear(year);
        setCurrentMonth(month);
        if (shouldScroll) {
          setShouldScrollToTop(true);
        }
      } else {
        setError(data.error?.message || '映画データの取得に失敗しました');
      }
    } catch (err) {
      console.error('API call failed:', err);
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };



  const getNextMonth = (year: number, month: number) => {
    if (month === 12) {
      return { year: year + 1, month: 1 };
    }
    return { year, month: month + 1 };
  };

  const getPreviousMonth = (year: number, month: number) => {
    if (month === 1) {
      return { year: year - 1, month: 12 };
    }
    return { year, month: month - 1 };
  };

  const handleNextMonth = () => {
    if (currentYear && currentMonth) {
      const { year, month } = getNextMonth(currentYear, currentMonth);
      handleDateSubmit(year, month, true);
    }
  };

  const handlePreviousMonth = () => {
    if (currentYear && currentMonth) {
      const { year, month } = getPreviousMonth(currentYear, currentMonth);
      handleDateSubmit(year, month, true);
    }
  };

  const isNextMonthAvailable = () => {
    if (!currentYear || !currentMonth) return false;
    const { year, month } = getNextMonth(currentYear, currentMonth);
    const currentDate = new Date();
    const nextMonthDate = new Date(year, month - 1); // monthは0ベース
    return nextMonthDate <= currentDate;
  };

  return (
    <MovieExpandProvider>
      <div className="w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <main>
            <DateInputForm onSubmit={handleDateSubmit} loading={loading} />

            {error && (
              <div className="mt-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded-md text-center">
                {error}
              </div>
            )}

            <MovieList
              movies={movies}
              currentYear={currentYear}
              currentMonth={currentMonth}
              onNextMonth={handleNextMonth}
              onPreviousMonth={handlePreviousMonth}
              isNextMonthAvailable={isNextMonthAvailable}
              loading={loading}
            />
          </main>
        </div>
      </div>
    </MovieExpandProvider>
  );
}