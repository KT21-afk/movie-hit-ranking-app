# セキュリティガイド

## API キー管理

### 現在の設定
- ✅ API キーは GitHub Secrets で管理
- ✅ 本番環境は Vercel Environment Variables で管理  
- ✅ 開発環境は `.env.local` で管理（Git除外済み）
- ✅ `.env.local.template` で開発者向けガイド提供

### 重要な注意事項

#### ❌ 絶対にやってはいけないこと
```bash
# これらのファイルをコミットしない
git add .env.local
git add .env.production
git commit -m "Add API keys" # ← 危険！
```

#### ✅ 正しい方法
```bash
# 開発環境
cp .env.local.template .env.local
# .env.local を編集してAPI キーを設定

# 本番環境
# GitHub Secrets と Vercel Environment Variables で設定
```

## Git履歴のクリーンアップ

もしAPI キーを誤ってコミットしてしまった場合：

### 1. 最新コミットから削除
```bash
# ファイルを修正
git add .env.local
git commit --amend --no-edit

# または、ファイルを完全に削除
git rm --cached .env.local
git commit --amend --no-edit
```

### 2. 履歴全体からAPI キーを削除
```bash
# git-filter-repo を使用（推奨）
pip install git-filter-repo
git filter-repo --path .env.local --invert-paths

# または BFG Repo-Cleaner を使用
java -jar bfg.jar --delete-files .env.local
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

### 3. API キーの無効化
```bash
# 1. TMDB でAPI キーを無効化
# 2. 新しいAPI キーを生成
# 3. GitHub Secrets と Vercel で更新
```

## 継続的なセキュリティ

### 定期チェック
```bash
# 脆弱性スキャン
npm run security-check

# 環境変数確認
npm run env-check

# 依存関係の更新
npm audit fix
npm update
```

### Git Hooks（推奨）
```bash
# pre-commit hook でAPI キーの検出
echo '#!/bin/sh
if git diff --cached --name-only | grep -E "\.(env|key)"; then
  echo "Warning: Environment files detected in commit"
  exit 1
fi' > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## 緊急時の対応

### API キーが漏洩した場合
1. **即座にAPI キーを無効化**
2. **新しいAPI キーを生成**
3. **GitHub Secrets を更新**
4. **Vercel Environment Variables を更新**
5. **Git履歴からAPI キーを削除**
6. **チームメンバーに通知**

### 連絡先
- セキュリティ問題: [GitHub Issues](https://github.com/your-repo/issues)
- 緊急時: プロジェクト管理者に直接連絡

## 参考資料
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [OWASP API Security](https://owasp.org/www-project-api-security/)