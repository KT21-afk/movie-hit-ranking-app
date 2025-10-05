# Design Document

## Overview

Movie Hit Rankingは、ユーザーが入力した生年月日に基づいて、その年月の興行収入上位10作品を表示するWebアプリケーションです。Next.js 14を使用してフロントエンドとAPI Routesを統合し、外部映画APIを活用してデータを取得します。

### Next.js採用理由
- **統合開発**: フロントエンドとバックエンドAPIを一つのプロジェクトで管理
- **SEO最適化**: 映画情報の検索エンジン最適化
- **画像最適化**: 映画ポスターの自動最適化とパフォーマンス向上
- **簡単デプロイ**: Vercelでのワンクリックデプロイ
- **TypeScript統合**: 型安全性の向上

## Architecture

### システム構成
```
[ユーザー] ↔ [Next.js App (Frontend + API Routes)] ↔ [外部映画API]
```

### 技術スタック
- **フレームワーク**: Next.js 14 + TypeScript
- **スタイリング**: Tailwind CSS
- **HTTP クライアント**: 内蔵fetch API
- **外部API**: TMDb API (The Movie Database)
- **開発ツール**: ESLint, Prettier
- **画像最適化**: Next.js Image コンポーネント

### デプロイメント構成
- **統合デプロイ**: Vercel（フロントエンド + API Routes）
- **代替**: Netlify または Railway

## Components and Interfaces

### フロントエンドコンポーネント

#### 1. App Component
- アプリケーションのメインコンテナ
- ルーティングとグローバル状態管理

#### 2. DateInputForm Component
```typescript
interface DateInputFormProps {
  onSubmit: (year: number, month: number) => void;
  loading: boolean;
}
```
- 年月入力フォーム
- バリデーション機能
- 送信ボタン

#### 3. MovieList Component
```typescript
interface Movie {
  id: number;
  title: string;
  boxOffice: number;
  rank: number;
  posterUrl?: string;
  releaseDate: string;
  genres: string[];
}

interface MovieListProps {
  movies: Movie[];
  loading: boolean;
  error?: string;
}
```
- 映画リスト表示
- ランキング順での並び替え

#### 4. MovieCard Component
```typescript
interface MovieCardProps {
  movie: Movie;
  rank: number;
}
```
- 個別映画情報カード
- ポスター画像、タイトル、興行収入表示

#### 5. LoadingSpinner Component
- データ読み込み中の表示

#### 6. ErrorMessage Component
```typescript
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}
```
- エラーメッセージ表示
- 再試行ボタン

### Next.js API Routes

#### 1. API Route Handler
```typescript
// app/api/movies/box-office/route.ts
interface BoxOfficeRequest {
  year: number;
  month: number;
}

interface BoxOfficeResponse {
  movies: Movie[];
  year: number;
  month: number;
}

export async function GET(request: NextRequest) {
  // API ロジック
}
```

#### 2. API Endpoints
- `GET /api/movies/box-office?year={year}&month={month}`
- レスポンス: 興行収入TOP10映画リスト

#### 3. External API Service
```typescript
interface TMDbService {
  getMoviesByDate(year: number, month: number): Promise<Movie[]>;
  getMovieDetails(movieId: number): Promise<MovieDetails>;
}
```

## Data Models

### Movie Model
```typescript
interface Movie {
  id: number;
  title: string;
  boxOffice: number;
  rank: number;
  posterUrl?: string;
  releaseDate: string;
  genres: string[];
  overview?: string;
}
```

### API Response Models
```typescript
interface TMDbMovieResponse {
  id: number;
  title: string;
  release_date: string;
  poster_path?: string;
  genre_ids: number[];
  overview: string;
}

interface BoxOfficeData {
  movieId: number;
  revenue: number;
}
```

### Error Models
```typescript
interface ApiError {
  code: string;
  message: string;
  details?: any;
}
```

## Error Handling

### フロントエンド
1. **入力バリデーション**
   - 年: 1900-現在年の範囲チェック
   - 月: 1-12の範囲チェック
   - 必須項目チェック

2. **API エラーハンドリング**
   - ネットワークエラー: 接続エラーメッセージ表示
   - 404エラー: データ未発見メッセージ
   - 500エラー: サーバーエラーメッセージ
   - タイムアウト: 再試行オプション提供

3. **ユーザーフィードバック**
   - ローディング状態の表示
   - エラーメッセージの表示
   - 再試行ボタンの提供

### バックエンド
1. **入力バリデーション**
   - リクエストパラメータの型チェック
   - 範囲バリデーション
   - 必須パラメータチェック

2. **外部API エラーハンドリング**
   - API レート制限対応
   - タイムアウト設定
   - フォールバック機能

3. **レスポンス標準化**
   - 統一されたエラーレスポンス形式
   - 適切なHTTPステータスコード
   - ログ記録

## Testing Strategy

### フロントエンドテスト
1. **Unit Tests (Jest + React Testing Library)**
   - コンポーネントの個別機能テスト
   - フォームバリデーションテスト
   - ユーティリティ関数テスト

2. **Integration Tests**
   - API呼び出しとレスポンス処理
   - コンポーネント間の連携テスト

3. **E2E Tests (Cypress)**
   - ユーザーフロー全体のテスト
   - 年月入力から結果表示まで

### API Routes テスト
1. **Unit Tests (Jest)**
   - API Route ハンドラーテスト
   - サービス層のロジックテスト
   - バリデーション機能テスト

2. **Integration Tests**
   - 外部API統合テスト
   - Next.js API Routes統合テスト

3. **API Tests**
   - HTTPリクエスト/レスポンステスト
   - エラーハンドリングテスト

### テストデータ
- モック映画データの作成
- 様々な年月のテストケース
- エラーケースのシミュレーション

## Performance Considerations

1. **キャッシング戦略**
   - 外部API レスポンスのキャッシュ
   - 画像の遅延読み込み

2. **最適化**
   - コンポーネントのメモ化
   - バンドルサイズの最適化
   - 画像の最適化

3. **レスポンシブデザイン**
   - モバイルファーストアプローチ
   - 様々な画面サイズへの対応