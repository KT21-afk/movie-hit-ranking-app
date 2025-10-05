import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { MovieExpandProvider } from '@/contexts/MovieExpandContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '映画ヒットランキング | その年月の映画興行収入TOP10',
  description: '好きな年月を入力して、その時期の映画興行収入TOP10を確認しましょう。映画ヒットランキングで映画の歴史を振り返ろう。',
  keywords: ['映画', '興行収入', 'ランキング', 'TOP10', '映画ヒット', '映画歴史'],
  authors: [{ name: 'Movie Hit Ranking' }],
  creator: 'Movie Hit Ranking',
  publisher: 'Movie Hit Ranking',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://movie-hit-ranking.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '映画ヒットランキング | その年月の映画興行収入TOP10',
    description: '好きな年月を入力して、その時期の映画興行収入TOP10を確認しましょう。',
    url: '/',
    siteName: '映画ヒットランキング',
    locale: 'ja_JP',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '映画ヒットランキング',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '映画ヒットランキング | その年月の映画興行収入TOP10',
    description: '好きな年月を入力して、その時期の映画興行収入TOP10を確認しましょう。',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50 dark:bg-gray-900`}
      >
        <CurrencyProvider>
          <MovieExpandProvider>
            <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      🎬 映画ヒットランキング
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1 pl-8">
                      その年月に流行った映画を振り返る
                    </p>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full">
              {children}
            </main>

          {/* Footer */}
          <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  © 2025 Movie Hit Ranking - Powered by TMDb
                </p>
                <div className="flex justify-center items-center space-x-4 text-xs">
                  <a
                    href="https://forms.gle/X1WeMRJKq1fBp2wn7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    改善要望を送る
                  </a>
                </div>
              </div>
            </div>
          </footer>
            </div>
          </MovieExpandProvider>
        </CurrencyProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
