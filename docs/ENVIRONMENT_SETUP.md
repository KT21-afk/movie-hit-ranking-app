# 環境変数設定ガイド

## 概要
このプロジェクトでは、セキュリティのためAPI キーを以下のように管理しています：

- **ローカル開発**: `.env.local` ファイル（Git除外）
- **CI/CD**: GitHub Secrets
- **本番環境**: Vercel Environment Variables

## ローカル開発環境の設定

### 1. 環境変数ファイルの作成
```bash
# テンプレートをコピー
cp .env.local.example .env.local
```

### 2. TMDB API キーの取得
1. [TMDB](https://www.themoviedb.org/) でアカウント作成
2. [API Settings](https://www.themoviedb.org/settings/api) にアクセス
3. "Request an API Key" をクリック
4. 必要情報を入力してAPI キーを取得

### 3. .env.local の編集
```bash
# .env.local ファイルを編集
TMDB_API_KEY=your_actual_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
```

### 4. 動作確認
```bash
# 環境変数の確認
npm run env-check

# 開発サーバー起動
npm run dev
```

## 本番環境の設定

### GitHub Secrets
Repository Settings > Secrets and variables > Actions で設定:

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `TMDB_API_KEY` | TMDB API キー | ✅ |
| `VERCEL_TOKEN` | Vercel デプロイ用トークン | ✅ |
| `VERCEL_PROJECT_ID` | Vercel プロジェクトID | ✅ |
| `VERCEL_ORG_ID` | Vercel 組織ID | チームアカウントのみ |

### Vercel Environment Variables
Vercel Dashboard > Settings > Environment Variables で設定:

| Variable Name | Environment | Value |
|---------------|-------------|-------|
| `TMDB_API_KEY` | Production, Preview | Your TMDB API Key |
| `TMDB_BASE_URL` | Production, Preview | `https://api.themoviedb.org/3` |
| `NODE_ENV` | Production | `production` |
| `NEXT_PUBLIC_APP_URL` | Production | Your domain URL |

## トラブルシューティング

### API キーが認識されない
```bash
# 環境変数の確認
npm run env-check

# .env.local ファイルの確認
cat .env.local
```

### ビルドエラー
```bash
# ローカルビルドテスト
npm run build:production

# 型チェック
npm run type-check
```

### 権限エラー
- TMDB API キーが有効か確認
- API キーの使用制限を確認
- ネットワーク接続を確認

## セキュリティ注意事項

### ❌ やってはいけないこと
- `.env.local` をGitにコミット
- API キーをコードに直接記述
- API キーをSlackやメールで共有

### ✅ 正しい方法
- 個人のAPI キーは `.env.local` で管理
- 本番API キーは GitHub Secrets で管理
- API キーは定期的にローテーション

## 参考リンク
- [TMDB API Documentation](https://developers.themoviedb.org/3)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
## チームアカウ
ント用の設定

Vercelチームアカウントを使用している場合は、追加設定が必要です：

### 1. GitHub Actions ワークフローの更新
`.github/workflows/ci.yml` で以下のコメントアウトを解除:

```yaml
# チームアカウント用の設定を有効化
vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
scope: ${{ secrets.VERCEL_ORG_ID }}
```

### 2. GitHub Secrets に追加
```
VERCEL_ORG_ID=your_vercel_org_id
```

### 3. Vercel ORG ID の取得方法
```bash
# Vercel CLI でログイン
vercel login

# プロジェクトをリンク
vercel link

# 設定ファイルを確認
cat .vercel/project.json
```

出力例:
```json
{
  "orgId": "team_xxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxx"
}
```