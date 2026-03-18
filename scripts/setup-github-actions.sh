#!/bin/bash
# GitHub Actions 配置脚本

set -e

REPO="earyantLe/ai-tools-directory"
WORKFLOW_DIR="/root/.openclaw/workspace/ai-tools-directory/.github/workflows"

echo "🔧 配置 GitHub Actions 自动化..."

# 检查 gh CLI 是否可用
if ! command -v gh &> /dev/null; then
    echo "❌ gh CLI 未安装，请先安装 GitHub CLI"
    exit 1
fi

# 检查是否已登录
if ! gh auth status &> /dev/null; then
    echo "⚠️ 未登录 GitHub，请先运行：gh auth login"
    exit 1
fi

echo "✅ GitHub CLI 已就绪"

# 创建 Personal Access Token (PAT) 说明
cat << 'EOF'

📝 需要创建 Personal Access Token (PAT)：

1. 访问：https://github.com/settings/tokens/new
2. 选择 scopes:
   - ✅ repo (完整控制私有仓库)
   - ✅ workflow (更新 GitHub Action workflows)
   - ✅ admin:repo_hook (管理仓库 hooks)
3. 生成 token 后，复制并保存
4. 运行以下命令设置 secret：

EOF

read -p "请输入你的 PAT (按回车跳过，稍后手动设置): " PAT

if [ -n "$PAT" ]; then
    # 设置 GH_PAT secret
    echo "🔐 设置 GH_PAT secret..."
    gh secret set GH_PAT --body "$PAT" --repo $REPO
    echo "✅ GH_PAT 已设置"
fi

# 启用所有 workflows
echo ""
echo "🚀 启用 GitHub Actions..."
gh api repos/$REPO/actions/permissions -X PUT -f enabled=true
gh api repos/$REPO/actions/permissions/workflow -X PUT -f default_workflow_permissions=write

echo ""
echo "✅ GitHub Actions 配置完成！"
echo ""
echo "📋 已配置的自动化任务："
echo "  1. 🚀 Auto Deploy - 每次 push 自动部署"
echo "  2. 📅 Daily Sync - 每天 21:00 自动同步"
echo "  3. 🔍 Weekly Validation - 每周日 20:00 数据验证"
echo "  4. 🔄 Auto Backup - 每天 08:00 自动备份"
echo ""
echo "🔗 查看 Actions: https://github.com/$REPO/actions"
echo ""
echo "⚠️ 如果还有设置 PAT，请手动前往："
echo "   https://github.com/$REPO/settings/secrets/actions"
echo "   添加 secret: GH_PAT"
