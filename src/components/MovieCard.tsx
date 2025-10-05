import Image from 'next/image';
import { Movie } from '@/types/movie';
import { useMovieExpand } from '@/contexts/MovieExpandContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatBoxOfficeByCurrency, formatDate } from '@/utils/formatters';

// レスポンシブ設定
const RESPONSIVE_CONFIG = {
  mobile: {
    genreLimit: 3,
    providerLimit: 3,
    overviewThreshold: 100,
  },
  desktop: {
    genreLimit: 4,
    providerLimit: 6,
    overviewThreshold: 150,
  }
} as const;

// 共通スタイルクラス定数
const STYLES = {
  // カード全体
  card: 'bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden',

  // ヘッダー
  header: 'flex items-center p-3 md:p-4 bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900',
  rankBadge: 'flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 rounded-full flex items-center justify-center mr-3 md:mr-4 shadow-lg',
  rankText: 'text-white font-bold text-lg md:text-xl drop-shadow-sm',
  title: 'text-white font-semibold text-base md:text-xl line-clamp-2 md:line-clamp-none flex-1',

  // コンテンツ
  content: 'p-4',
  mainInfo: 'flex gap-3 md:gap-4 mb-3 md:mb-4',
  poster: 'flex-shrink-0 w-20 h-28 md:w-32 md:h-48 bg-gray-200 dark:bg-gray-700 rounded',
  posterImage: 'w-full h-full object-cover rounded',
  posterPlaceholder: 'w-full h-full flex items-center justify-center text-gray-400 text-xs md:text-sm',
  basicInfo: 'flex-1 min-w-0',
  basicInfoContainer: 'space-y-2 md:space-y-3 md:mb-4',

  // テキストスタイル
  secondaryText: 'text-sm text-gray-600 dark:text-gray-400',
  primaryText: 'text-gray-900 dark:text-white',
  tertiaryText: 'text-gray-700 dark:text-gray-300',
  boxOfficeText: 'text-base md:text-lg font-semibold text-gray-900 dark:text-white',
  sectionTitle: 'text-sm font-medium text-gray-900 dark:text-white mb-2',
  overviewTitle: 'text-sm font-medium text-gray-900 dark:text-white mb-1',

  // セクション
  section: 'mb-3 md:mb-4',
  genreContainer: 'mb-3 md:mb-4 flex flex-wrap gap-1',
  providerContainer: 'flex flex-wrap gap-2',

  // バッジ・タグ
  grayBackground: 'bg-gray-100 dark:bg-gray-700',
  genreTag: 'px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded',
  providerTag: 'flex items-center bg-gray-100 dark:bg-gray-700 rounded-md px-2 py-1',
  providerLogo: 'w-4 h-4 mr-1 rounded',
  providerText: 'text-xs text-gray-700 dark:text-gray-300',

  // ボタン
  expandButton: 'mt-2 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 text-xs font-medium',
  overviewButton: 'mt-1 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 text-xs font-medium',

  // 表示制御
  hiddenOnMobile: 'hidden md:inline-block',
  hiddenOnDesktop: 'md:hidden',
  flexHiddenOnDesktop: 'hidden md:flex',
  overviewClamp: 'line-clamp-3 md:line-clamp-4',
} as const;

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const {
    expandedOverviews,
    expandedProviders,
    toggleOverview,
    toggleProviders
  } = useMovieExpand();

  const { currency } = useCurrency();



  return (
    <div className={STYLES.card}>
      {/* ヘッダー部分：ランキング順位とタイトル */}
      <div className={STYLES.header}>
        <div className={STYLES.rankBadge}>
          <span className={STYLES.rankText}>
            {movie.rank}
          </span>
        </div>
        <h3 className={STYLES.title}>
          {movie.title}
        </h3>
      </div>

      {/* コンテンツ部分 */}
      <div className={STYLES.content}>
        <div className={STYLES.mainInfo}>
          {/* ポスター画像 */}
          <div className={STYLES.poster}>
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                width={128}
                height={192}
                className={STYLES.posterImage}
                sizes="(max-width: 768px) 80px, 128px"
              />
            ) : (
              <div className={STYLES.posterPlaceholder}>
                No Image
              </div>
            )}
          </div>

          {/* 基本情報 */}
          <div className={STYLES.basicInfo}>
            <div className={STYLES.basicInfoContainer}>
              <p className={STYLES.secondaryText}>
                <span className="font-medium">興行収入:</span><br />
                <span className={STYLES.boxOfficeText}>
                  {formatBoxOfficeByCurrency(movie.boxOffice, currency)}
                </span>
              </p>
              <p className={STYLES.secondaryText}>
                <span className="font-medium">公開日:</span> {formatDate(movie.releaseDate)}
              </p>
            </div>
          </div>
        </div>

        {/* ジャンル */}
        {movie.genres.length > 0 && (
          <div className={STYLES.genreContainer}>
            {/* モバイル: 3個、デスクトップ: 4個 */}
            {movie.genres.slice(0, RESPONSIVE_CONFIG.mobile.genreLimit).map((genre, index) => (
              <span key={index} className={STYLES.genreTag}>
                {genre}
              </span>
            ))}
            {/* デスクトップでのみ4個目を表示 */}
            {movie.genres.length > RESPONSIVE_CONFIG.mobile.genreLimit &&
              movie.genres[RESPONSIVE_CONFIG.mobile.genreLimit] && (
                <span className={`${STYLES.hiddenOnMobile} ${STYLES.genreTag}`}>
                  {movie.genres[RESPONSIVE_CONFIG.mobile.genreLimit]}
                </span>
              )}
          </div>
        )}

        {/* サブスク情報 */}
        {movie.watchProviders && movie.watchProviders.length > 0 && (
          <div className={STYLES.section}>
            <h4 className={STYLES.sectionTitle}>
              視聴可能サービス
            </h4>
            <div className={STYLES.providerContainer}>
              {/* 展開されている場合は全て表示、そうでなければモバイル3個/デスクトップ6個 */}
              {(expandedProviders.has(movie.id)
                ? movie.watchProviders
                : movie.watchProviders.slice(0, RESPONSIVE_CONFIG.mobile.providerLimit)
              ).map((provider) => (
                <div key={provider.provider_id} className={STYLES.providerTag}>
                  {provider.logo_path && (
                    <Image
                      src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                      alt={provider.provider_name}
                      width={16}
                      height={16}
                      className={STYLES.providerLogo}
                    />
                  )}
                  <span className={STYLES.providerText}>
                    {provider.provider_name}
                  </span>
                </div>
              ))}

              {/* デスクトップでのみ4-6個目を表示（展開されていない場合） */}
              {!expandedProviders.has(movie.id) &&
                movie.watchProviders.slice(
                  RESPONSIVE_CONFIG.mobile.providerLimit,
                  RESPONSIVE_CONFIG.desktop.providerLimit
                ).map((provider) => (
                  <div key={provider.provider_id} className={`${STYLES.flexHiddenOnDesktop} ${STYLES.providerTag}`}>
                    {provider.logo_path && (
                      <Image
                        src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                        alt={provider.provider_name}
                        width={16}
                        height={16}
                        className={STYLES.providerLogo}
                      />
                    )}
                    <span className={STYLES.providerText}>
                      {provider.provider_name}
                    </span>
                  </div>
                ))}
            </div>

            {/* モバイル: 3個以上で表示、デスクトップ: 6個以上で表示 */}
            {((movie.watchProviders.length > RESPONSIVE_CONFIG.mobile.providerLimit) ||
              (movie.watchProviders.length > RESPONSIVE_CONFIG.desktop.providerLimit)) && (
                <button
                  onClick={() => toggleProviders(movie.id)}
                  className={STYLES.expandButton}
                >
                  {expandedProviders.has(movie.id)
                    ? '折りたたむ'
                    : (
                      <>
                        <span className={STYLES.hiddenOnDesktop}>
                          他{movie.watchProviders.length - RESPONSIVE_CONFIG.mobile.providerLimit}個のサービスを見る
                        </span>
                        <span className={STYLES.hiddenOnMobile}>
                          他{movie.watchProviders.length - RESPONSIVE_CONFIG.desktop.providerLimit}個のサービスを見る
                        </span>
                      </>
                    )
                  }
                </button>
              )}
          </div>
        )}

        {/* あらすじ */}
        {movie.overview && (
          <div>
            <h4 className={STYLES.overviewTitle}>
              あらすじ
            </h4>
            <div className={STYLES.secondaryText}>
              <p className={expandedOverviews.has(movie.id) ? '' : STYLES.overviewClamp}>
                {movie.overview}
              </p>
              {/* モバイル: 100文字以上、デスクトップ: 150文字以上で表示 */}
              {((movie.overview.length > RESPONSIVE_CONFIG.mobile.overviewThreshold) ||
                (movie.overview.length > RESPONSIVE_CONFIG.desktop.overviewThreshold)) && (
                  <button
                    onClick={() => toggleOverview(movie.id)}
                    className={STYLES.overviewButton}
                  >
                    {expandedOverviews.has(movie.id) ? '折りたたむ' : 'もっと見る'}
                  </button>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}