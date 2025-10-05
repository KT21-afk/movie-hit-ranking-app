# デプロイメントガイド

## 概要
このプロジェクトは GitHub Actions と Vercel を使用した自動 CI/CD パイプラインを採用しています。

## CI/CD フロー

### 1. プルリクエスト時
```
PR作成 → GitHub Actions実行 → テスト・ビルド → Vercelプレビューデプロイ
```

### 2. メインブランチへのマージ時
```
mainブランチpush → GitHub Actions実行 → テスト・ビルド → Vercel本番デプロイ
```

## 初回セットアップ

### 1. GitHubリポジトリの作成
```bash
# リモートリポジトリを追加
git remote add origin https://github.com/your-username/movie-hit-ranking-app.git

# 初回プッシュ
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 2. Vercelプロジェクトの作成
1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. "New Project" をクリック
3. GitHubリポジトリを選択
4. プロジェクト設定:
   - Framework Preset: Next.js
   - Root Directory: `movie-hit-ranking-app`
   - Build Command: `npm run build:production`
   - Output Directory: `.next`
   - Install Command: `npm ci`

### 3. 環境変数の設定

#### Vercel環境変数
Vercel Dashboard > Settings > Environment Variables で以下を設定:

**Production環境:**
```
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_VERCEL_ANALYTICS=true
```

**Preview環境:**
```
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
NODE_ENV=development
```

#### GitHub Secrets
GitHub Repository > Settings > Secrets and variables > Actions で以下を設定:

**必須:**
```
TMDB_API_KEY=your_tmdb_api_key_here
VERCEL_TOKEN=your_vercel_token
VERCEL_PROJECT_ID=your_vercel_project_id
```

**チームアカウントの場合のみ:**
```
VERCEL_ORG_ID=your_vercel_org_id
```

**⚠️ セキュリティ重要事項:**
- ✅ API キーは GitHub Secrets に移動済み
- ✅ 本番環境のAPI キーは GitHub Secrets と Vercel Environment Variables で管理
- ✅ 開発環境では `.env.local` を使用（.gitignore で除外済み）
- ❌ API キーを含む `.env` ファイルは絶対にコミットしない

**環境変数の確認:**
```bash
npm run env-check
```

### 4. Vercel認証情報の取得

#### VERCEL_TOKEN
1. [Vercel Account Settings](https://vercel.com/account/tokens) にアクセス
2. "Create Token" をクリック
3. トークン名を入力して作成

#### VERCEL_ORG_ID & VERCEL_PROJECT_ID
```bash
# Vercel CLIをインストール
npm i -g vercel

# プロジェクトディレクトリでログイン
cd movie-hit-ranking-app
vercel login

# プロジェクトをリンク
vercel link

# IDを確認
cat .vercel/project.json
```

## デプロイメント

### 自動デプロイ
```bash
# 開発ブランチでの作業
git checkout -b feature/new-feature
# 変更を加える
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# プルリクエストを作成 → プレビューデプロイが自動実行

# メインブランチにマージ → 本番デプロイが自動実行
```

### 手動デプロイ（緊急時）
```bash
# プレビューデプロイ
npm run deploy:preview

# 本番デプロイ
npm run deploy:vercel
```

## 監視とメンテナンス

### ビルド状況の確認
- GitHub Actions: リポジトリの "Actions" タブ
- Vercel: [Vercel Dashboard](https://vercel.com/dashboard) の Deployments

### ログの確認
```bash
# Vercelログの確認
vercel logs your-deployment-url
```

### パフォーマンス監視
- Vercel Analytics（自動有効）
- Core Web Vitals の監視
- エラー追跡

## トラブルシューティング

### よくある問題

#### 1. ビルドエラー
```bash
# ローカルでビルドテスト
npm run build:production
```

#### 2. 環境変数エラー
- Vercel Dashboard で環境変数を確認
- GitHub Secrets の設定を確認

#### 3. テストエラー
```bash
# ローカルでテスト実行
npm run test:coverage
```

#### 4. デプロイ失敗
- GitHub Actions のログを確認
- Vercel のデプロイログを確認

### サポート
- GitHub Issues でバグ報告
- Vercel Support でインフラ関連の問題

## セキュリティ

### 定期的なメンテナンス
```bash
# 依存関係の脆弱性チェック
npm audit

# 依存関係の更新
npm update

# セキュリティ修正の適用
npm audit fix
```

### セキュリティヘッダー
- CSP (Content Security Policy)
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options
- X-Content-Type-Options

これらは `vercel.json` と `next.config.ts` で設定済みです。