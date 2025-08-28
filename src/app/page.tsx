'use client';

import { useState } from 'react';
import DateInputForm from '@/components/DateInputForm';
import { Movie } from '@/types';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDateSubmit = async (year: number, month: number) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: API呼び出しを実装
      console.log('Searching for movies:', { year, month });

      // 仮のデータで表示テスト
      setTimeout(() => {
        setMovies([]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('映画データの取得に失敗しました');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          年月を指定して映画の興行収入ランキングを確認できます
          </p>
        </header>

        <main>
          <DateInputForm onSubmit={handleDateSubmit} loading={loading} />

          {error && (
            <div className="mt-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded-md text-center">
              {error}
            </div>
          )}

          {movies.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                ランキング結果
              </h2>
              {/* TODO: 映画リストコンポーネントを実装 */}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
