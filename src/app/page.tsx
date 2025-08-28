'use client';

import { useState, useEffect } from 'react';
import DateInputForm from '@/components/DateInputForm';
import { Movie, ApiResponse, BoxOfficeResponse } from '@/types';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedOverviews, setExpandedOverviews] = useState<Set<number>>(new Set());
  const [expandedProviders, setExpandedProviders] = useState<Set<number>>(new Set());
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
    setExpandedOverviews(new Set()); // リセット
    setExpandedProviders(new Set()); // リセット

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

  const toggleOverview = (movieId: number) => {
    setExpandedOverviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(movieId)) {
        newSet.delete(movieId);
      } else {
        newSet.add(movieId);
      }
      return newSet;
    });
  };

  const toggleProviders = (movieId: number) => {
    setExpandedProviders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(movieId)) {
        newSet.delete(movieId);
      } else {
        newSet.add(movieId);
      }
      return newSet;
    });
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
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                ランキング結果 ({movies.length}件) - {currentYear}年{currentMonth}月
              </h2>
              {movies.length < 10 && (
                <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 text-yellow-700 dark:text-yellow-200 rounded-md text-center text-sm">
                  この期間に公開された映画で興行収入データが利用可能なのは{movies.length}件です。
                </div>
              )}
              <div className="space-y-4">
                {movies.map((movie) => (
                  <div key={movie.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    {/* デスクトップ表示 (md以上) */}
                    <div className="hidden md:block">
                      {/* ヘッダー部分：ランキング順位とタイトル */}
                      <div className="flex items-center p-4 bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 rounded-full flex items-center justify-center mr-4 shadow-lg">
                          <span className="text-white font-bold text-xl drop-shadow-sm">
                            {movie.rank}
                          </span>
                        </div>
                        <h3 className="text-white font-semibold text-xl flex-1">
                          {movie.title}
                        </h3>
                      </div>

                      {/* コンテンツ部分 */}
                      <div className="p-4">
                        <div className="flex gap-4 mb-4">
                          {/* ポスター画像 */}
                          <div className="flex-shrink-0 w-32 h-48 bg-gray-200 dark:bg-gray-700 rounded">
                            {movie.posterUrl ? (
                              <img
                                src={movie.posterUrl}
                                alt={movie.title}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No Image
                              </div>
                            )}
                          </div>

                          {/* 基本情報 */}
                          <div className="flex-1 min-w-0">
                            <div className="space-y-3 mb-4">

                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">興行収入:</span><br />
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                  ${movie.boxOffice.toLocaleString()}
                                </span>
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">公開日:</span> {movie.releaseDate}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* ジャンル */}
                        {movie.genres.length > 0 && (
                          <div className="mb-4 flex flex-wrap gap-1">
                            {movie.genres.slice(0, 4).map((genre, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* サブスク情報 */}
                        {movie.watchProviders && movie.watchProviders.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              視聴可能サービス
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {(expandedProviders.has(movie.id) ? movie.watchProviders : movie.watchProviders.slice(0, 6)).map((provider) => (
                                <div
                                  key={provider.provider_id}
                                  className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md px-2 py-1"
                                >
                                  {provider.logo_path && (
                                    <img
                                      src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                                      alt={provider.provider_name}
                                      className="w-4 h-4 mr-1 rounded"
                                    />
                                  )}
                                  <span className="text-xs text-gray-700 dark:text-gray-300">
                                    {provider.provider_name}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {movie.watchProviders.length > 6 && (
                              <button
                                onClick={() => toggleProviders(movie.id)}
                                className="mt-2 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 text-xs font-medium"
                              >
                                {expandedProviders.has(movie.id) ? '折りたたむ' : `他${movie.watchProviders.length - 6}個のサービスを見る`}
                              </button>
                            )}
                          </div>
                        )}

                        {/* あらすじ */}
                        {movie.overview && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              あらすじ
                            </h4>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <p className={expandedOverviews.has(movie.id) ? '' : 'line-clamp-4'}>
                                {movie.overview}
                              </p>
                              {movie.overview.length > 150 && (
                                <button
                                  onClick={() => toggleOverview(movie.id)}
                                  className="mt-1 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 text-xs font-medium"
                                >
                                  {expandedOverviews.has(movie.id) ? '折りたたむ' : 'もっと見る'}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* モバイル表示 (md未満) */}
                    <div className="md:hidden">
                      {/* ヘッダー部分：ランキング順位とタイトル */}
                      <div className="flex items-center p-3 bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 rounded-full flex items-center justify-center mr-3 shadow-lg">
                          <span className="text-white font-bold text-lg drop-shadow-sm">
                            {movie.rank}
                          </span>
                        </div>
                        <h3 className="text-white font-semibold text-base line-clamp-2 flex-1">
                          {movie.title}
                        </h3>
                      </div>

                      {/* コンテンツ部分 */}
                      <div className="p-4">
                        <div className="flex gap-3 mb-3">
                          {/* ポスター画像 - モバイルでは小さく */}
                          <div className="flex-shrink-0 w-20 h-28 bg-gray-200 dark:bg-gray-700 rounded">
                            {movie.posterUrl ? (
                              <img
                                src={movie.posterUrl}
                                alt={movie.title}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                No Image
                              </div>
                            )}
                          </div>

                          {/* 基本情報 */}
                          <div className="flex-1 min-w-0">
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">興行収入:</span><br />
                                <span className="text-base font-semibold text-gray-900 dark:text-white">
                                  ${movie.boxOffice.toLocaleString()}
                                </span>
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">公開日:</span> {movie.releaseDate}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* ジャンル */}
                        {movie.genres.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-1">
                            {movie.genres.slice(0, 3).map((genre, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* サブスク情報 */}
                        {movie.watchProviders && movie.watchProviders.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              視聴可能サービス
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {(expandedProviders.has(movie.id) ? movie.watchProviders : movie.watchProviders.slice(0, 3)).map((provider) => (
                                <div
                                  key={provider.provider_id}
                                  className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md px-2 py-1"
                                >
                                  {provider.logo_path && (
                                    <img
                                      src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                                      alt={provider.provider_name}
                                      className="w-4 h-4 mr-1 rounded"
                                    />
                                  )}
                                  <span className="text-xs text-gray-700 dark:text-gray-300">
                                    {provider.provider_name}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {movie.watchProviders.length > 3 && (
                              <button
                                onClick={() => toggleProviders(movie.id)}
                                className="mt-2 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 text-xs font-medium"
                              >
                                {expandedProviders.has(movie.id) ? '折りたたむ' : `他${movie.watchProviders.length - 3}個のサービスを見る`}
                              </button>
                            )}
                          </div>
                        )}

                        {/* あらすじ */}
                        {movie.overview && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              あらすじ
                            </h4>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <p className={expandedOverviews.has(movie.id) ? '' : 'line-clamp-3'}>
                                {movie.overview}
                              </p>
                              {movie.overview.length > 100 && (
                                <button
                                  onClick={() => toggleOverview(movie.id)}
                                  className="mt-1 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 text-xs font-medium"
                                >
                                  {expandedOverviews.has(movie.id) ? '折りたたむ' : 'もっと見る'}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ナビゲーションボタン */}
              {currentYear && currentMonth && (
                <div className="mt-8 flex justify-center items-center gap-4">
                  <button
                    onClick={handlePreviousMonth}
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
                    onClick={handleNextMonth}
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
          )}
        </main>
      </div>
    </div>
  );
}
