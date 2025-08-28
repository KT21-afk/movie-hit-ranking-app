import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '映画興行収入TOP10 - あなたの生年月日の映画ランキング',
  description: 'あなたの生年月日を入力して、その時期の映画興行収入TOP10を確認しましょう',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800`}
      >
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center">
                🎬 映画ヒットカレンダー
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 text-center mt-2">
                その月に流行った映画を振り返る/クイズでも
              </p>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                © 2024 映画興行収入TOP10アプリ - Powered by TMDb
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
