#!/bin/bash

echo -e "# 🌿 Git 状況\n"
echo "## ブランチ & 直近コミット"
echo "\`\`\`"
git branch --show-current 2>/dev/null
git log -n 5 --oneline 2>/dev/null
echo "\`\`\`"

echo -e "\n## 未コミットの変更 (status)"
echo "\`\`\`"
git status -s 2>/dev/null
echo "\`\`\`"

echo -e "\n# 📂 ディレクトリ構造\n\`\`\`"
find . -maxdepth 4 \
  -name "node_modules" -prune -o \
  -name ".next" -prune -o \
  -name ".git" -prune -o \
  -name "public" -prune -o \
  -name "drizzle" -prune -o \
  -not -path '*/.*' -print | sort
echo -e "\`\`\`\n"

echo -e "# 🗄️ DB マイグレーション履歴（ファイル名一覧のみ）\n\`\`\`"
find drizzle -type f 2>/dev/null | sort
echo -e "\`\`\`\n"

echo -e "# 📄 プロジェクト全コード・ドキュメント（構成・ロジック・ドキュメント）\n"

# 不要なディレクトリ・メタデータ・初期設定系ファイルを除外して全文出力
find . \
  -name "node_modules" -prune -o \
  -name ".next" -prune -o \
  -name ".git" -prune -o \
  -name "public" -prune -o \
  -name "drizzle" -prune -o \
  -name "scripts" -prune -o \
  -type f -not -path '*/.*' \
  -not -name '*.png' -not -name '*.ico' -not -name '*.jpeg' -not -name '*.jpg' \
  -not -name '*.lock' -not -name 'package-lock.json' \
  -not -name 'tsconfig.tsbuildinfo' \
  -not -name 'next-env.d.ts' \
  -not -name 'postcss.config.mjs' \
  -not -name 'eslint.config.mjs' \
  -not -name 'AGENTS.md' \
  -exec tail -n +1 {} + 2>/dev/null | sed 's/==> \(.*\) <==/### 📄 \1/'
