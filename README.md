# Movie Hit Ranking App

映画の興行収入ランキングを表示するNext.jsアプリケーションです。

## 環境設定

### 1. 環境変数の設定

開発環境で実行するには、TMDB API キーが必要です：

```bash
# 環境変数テンプレートをコピー
cp .env.local.example .env.local

# .env.local を編集してAPI キーを設定
# TMDB_API_KEY=your_actual_api_key_here
```

**TMDB API キーの取得方法：**
1. [TMDB](https://www.themoviedb.org/) でアカウント作成
2. [API Settings](https://www.themoviedb.org/settings/api) でAPI キーを取得
3. `.env.local` に設定

**環境変数の確認：**
```bash
npm run env-check
```

詳細な設定方法は [環境変数設定ガイド](./docs/ENVIRONMENT_SETUP.md) を参照してください。

### 2. 依存関係のインストール

```bash
npm install
```

## Getting Started

開発サーバーを起動:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
