#!/bin/bash
# AI 工具聚合网站 - 每日构建和同步脚本
# 用法：./scripts/deploy-sync.sh

set -e

PROJECT_DIR="/root/.openclaw/workspace/ai-tools-directory"
WORKSPACE_DIR="/root/.openclaw/workspace"

echo "🚀 开始同步 AI 工具聚合网站..."

cd "$PROJECT_DIR"

# 检查是否有未提交的更改
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "📝 检测到未提交的更改..."
    git add .
    git commit -m "chore: 自动同步更新 $(date '+%Y-%m-%d %H:%M')"
    echo "✅ 提交完成"
else
    echo "✓ 没有未提交的更改"
fi

# 推送到 GitHub
echo "📤 推送到 GitHub..."
git push origin master

echo "✅ 同步完成！"
echo "🌐 网站地址：https://earyantle.github.io/ai-tools-directory/"
