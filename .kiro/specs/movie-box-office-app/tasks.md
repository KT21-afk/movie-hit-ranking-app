# Implementation Plan

- [x] 1. プロジェクトセットアップとNext.js環境構築
  - Next.js 14プロジェクトをTypeScriptで初期化
  - Tailwind CSSとESLint、Prettierを設定
  - プロジェクト構造とディレクトリを作成
  - _Requirements: 4.1, 4.2_

- [x] 2. 基本レイアウトとUIコンポーネント作成
- [x] 2.1 メインレイアウトコンポーネント実装
  - app/layout.tsxでグローバルレイアウト作成
  - Tailwind CSSでレスポンシブデザイン設定
  - _Requirements: 4.1, 4.3_

- [x] 2.2 年月入力フォームコンポーネント作成
  - DateInputFormコンポーネントをTypeScriptで実装
  - 年（1900-現在年）と月（1-12）のバリデーション機能
  - フォーム送信とローディング状態の管理
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2.3 ローディングとエラー表示コンポーネント作成
  - LoadingSpinnerコンポーネント実装
  - ErrorMessageコンポーネントと再試行機能実装
  - _Requirements: 4.2, 5.3_

- [x] 3. 映画データ型定義とインターフェース作成
- [x] 3.1 TypeScript型定義ファイル作成
  - Movie、BoxOfficeResponse等の型定義
  - API レスポンス型とエラー型の定義
  - _Requirements: 2.3, 3.1, 3.2, 3.3_

- [x] 3.2 TMDb API統合サービス作成
  - 外部API呼び出し用のサービスクラス実装
  - API キー管理と環境変数設定
  - エラーハンドリングとタイムアウト設定
  - _Requirements: 2.1, 5.1, 5.2_

- [x] 4. Next.js API Routes実装
- [x] 4.1 興行収入データ取得API Route作成
  - app/api/movies/box-office/route.tsでGETハンドラー実装
  - 年月パラメータのバリデーション
  - TMDb APIからデータ取得とレスポンス整形
  - _Requirements: 2.1, 2.2, 5.1_

- [x] 4.2 API Routeのエラーハンドリング実装
  - 適切なHTTPステータスコードとエラーメッセージ
  - API制限とタイムアウトの処理
  - ログ記録機能の実装
  - _Requirements: 5.1, 5.2, 5.4_

- [x] 5. 映画表示コンポーネント実装
- [x] 5.1 MovieCardコンポーネント作成
  - 個別映画情報カードのUI実装
  - Next.js Imageコンポーネントでポスター画像最適化
  - 映画タイトル、興行収入、ランキング表示
  - _Requirements: 2.3, 3.1, 3.2, 3.3_

- [x] 5.2 MovieListコンポーネント作成
  - TOP10映画リストの表示実装
  - 興行収入順でのソート機能
  - レスポンシブグリッドレイアウト
  - _Requirements: 2.2, 4.3_

- [x] 6. メインページとデータフロー統合
- [x] 6.1 ホームページコンポーネント実装
  - app/page.tsxでメインページ作成
  - フォーム送信からAPI呼び出しまでの状態管理
  - ローディング、エラー、成功状態の切り替え
  - _Requirements: 1.4, 2.4, 4.2, 4.4_

- [x] 6.2 クライアントサイドデータフェッチング実装
  - useStateとuseEffectでAPI呼び出し管理
  - エラーハンドリングと再試行機能
  - ユーザーフィードバックの表示
  - _Requirements: 4.4, 5.3_

- [x] 7. テスト実装
- [x] 7.1 コンポーネント単体テスト作成
  - DateInputForm、MovieCard、MovieListのテスト
  - Jest + React Testing Libraryでテスト実装
  - フォームバリデーションとUI表示のテスト
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 7.2 API Routeテスト作成
  - API エンドポイントの単体テスト
  - 正常ケースとエラーケースのテスト
  - モックデータを使用したテスト実装
  - _Requirements: 2.1, 5.1, 5.2_

- [-] 8. 最終統合とデプロイ準備
- [x] 8.1 エンドツーエンドテスト実装
  - ユーザーフロー全体のテスト作成
  - 年月入力から結果表示までの統合テスト
  - _Requirements: 1.4, 2.2, 4.3_

- [-] 8.2 本番環境設定とデプロイ
  - 環境変数の設定とセキュリティ確認
  - Vercelデプロイ設定とドメイン設定
  - パフォーマンス最適化の確認
  - _Requirements: 5.4_