# 🔄 GitHub + OpenClaw 双向自动化配置指南

## 🎯 目标

实现 **GitHub 和 OpenClaw 的双向自动化**：
1. GitHub Actions 定时触发 → 更新代码
2. OpenClaw Cron 定时拉取 → 执行任务并推送

---

## 📋 已配置的自动化

### 1️⃣ GitHub Actions（云端）

| 工作流 | 触发条件 | 功能 |
|--------|----------|------|
| **Auto Deploy** | 每次 push | 自动部署到 GitHub Pages |
| **Daily Sync** | 每天 21:00 | 生成每日报告 |
| **Weekly Validation** | 每周日 20:00 | 数据验证 |
| **Auto Backup** | 每天 08:00 | 自动备份 |

**位置**: `.github/workflows/`

---

### 2️⃣ OpenClaw Cron（本地）

| 任务 | 触发条件 | 功能 |
|------|----------|------|
| **每日汇报** | 每天 21:00 | 发送日报到 Feishu |
| **GitHub 同步** | 每天 10:00 | 拉取 GitHub → 执行任务 → 推送 |

**位置**: `/root/.openclaw/cron/`

---

## 🔄 完整工作流

```
┌─────────────────────────────────────────────────┐
│              GitHub Repository                   │
│  (earyantLe/ai-tools-directory)                 │
└───────────────┬─────────────────────────────────┘
                │
        ┌───────┴───────┐
        │               │
        ↓               ↓
┌───────────────┐ ┌──────────────┐
│ GitHub Actions│ │ OpenClaw Cron│
│ (云端定时)     │ │ (本地定时)    │
└───────┬───────┘ └──────┬───────┘
        │               │
        │  Push         │ Pull
        │──────────────→│
        │               │
        │               ↓
        │        ┌──────────────┐
        │        │ 执行任务      │
        │        │ - 数据更新    │
        │        │ - 工具搜索    │
        │        │ - 报告生成    │
        │        └──────┬───────┘
        │               │
        ←───────────────┘
        │  Push 结果
        ↓
┌─────────────────────────────────────────────────┐
│         GitHub Pages (自动部署)                  │
│  https://earyantle.github.io/ai-tools-directory/│
└─────────────────────────────────────────────────┘
```

---

## ⏰ 定时任务时间表

| 时间（北京） | 任务 | 执行方 |
|-------------|------|--------|
| **08:00** | 自动备份 | GitHub Actions |
| **10:00** | GitHub 同步 + 数据更新 | OpenClaw Cron |
| **20:00** | 数据验证（周日） | GitHub Actions |
| **21:00** | 每日报告 + 汇报 | GitHub Actions + OpenClaw |

---

## 🔧 配置步骤

### Step 1: GitHub Secrets

访问 https://github.com/earyantLe/ai-tools-directory/settings/secrets/actions

添加以下 secrets：

| Name | Value | 用途 |
|------|-------|------|
| `GH_PAT` | 你的 GitHub Token | Actions 推送权限 |

**创建 Token**:
1. 访问 https://github.com/settings/tokens/new
2. Scopes: `repo`, `workflow`, `admin:repo_hook`
3. 生成并复制

---

### Step 2: OpenClaw Cron

已配置，无需额外操作。

**查看当前 Cron**:
```bash
crontab -l
```

**查看日志**:
```bash
tail -f /root/.openclaw/logs/github-sync.log
tail -f /root/.openclaw/logs/daily-report.log
```

---

### Step 3: 手动触发测试

#### 触发 GitHub Actions
```bash
cd /root/.openclaw/workspace/ai-tools-directory
git commit --allow-empty -m "test: 触发 Actions"
git push
```

#### 触发 OpenClaw Cron
```bash
/root/.openclaw/cron/github-sync.sh
```

---

## 📊 监控和日志

### GitHub Actions 日志
https://github.com/earyantLe/ai-tools-directory/actions

### OpenClaw 日志
```bash
# 实时查看
tail -f /root/.openclaw/logs/github-sync.log

# 查看历史
cat /root/.openclaw/logs/github-sync.log | less
```

### 同步报告
- GitHub: `github-sync-report.md`
- 本地: `/root/.openclaw/logs/github-sync.log`

---

## 🛠️ 自定义任务

### 添加新的 GitHub Actions

创建 `.github/workflows/custom.yml`:

```yaml
name: Custom Task

on:
  schedule:
    - cron: '0 6 * * *'  # 北京时间 14:00
  workflow_dispatch:

jobs:
  custom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run task
        run: echo "Custom task running!"
      - name: Commit changes
        run: |
          git config user.name "Actions Bot"
          git config user.email "actions@github.com"
          git add .
          git commit -m "feat: custom update"
          git push
```

---

### 添加新的 OpenClaw 任务

创建 `/root/.openclaw/cron/custom.sh`:

```bash
#!/bin/bash
# 自定义任务脚本

WORKSPACE="/root/.openclaw/workspace"
cd "$WORKSPACE/ai-tools-directory"

# 你的任务逻辑
echo "Running custom task..."

# 推送结果
git add .
git commit -m "feat: custom task"
git push
```

添加到 crontab:
```bash
crontab -e
# 添加：30 14 * * * /root/.openclaw/cron/custom.sh
```

---

## ⚠️ 注意事项

### GitHub Actions 限制
- ⏱️ **最小间隔**: 5 分钟（不能更频繁）
- ⏰ **时间精度**: 可能延迟几分钟
- ⏳ **超时**: 最长 6 小时
- 💾 **存储**: Artifacts 保留 90 天

### OpenClaw Cron 限制
- 🖥️ **依赖本地**: 服务器必须在线
- 🔌 **网络**: 需要能访问 GitHub
- 📝 **时区**: 使用 Asia/Shanghai

### 最佳实践
1. ✅ **错开时间**: 避免 GitHub 和 OpenClaw 同时推送
2. ✅ **错误处理**: 脚本中处理失败情况
3. ✅ **日志记录**: 保留执行日志便于排查
4. ✅ **定期清理**: 删除旧日志和备份

---

## 🔗 相关链接

- **GitHub Actions**: https://github.com/earyantLe/ai-tools-directory/actions
- **GitHub Pages**: https://earyantle.github.io/ai-tools-directory/
- **仓库设置**: https://github.com/earyantLe/ai-tools-directory/settings

---

## 🎉 配置完成！

现在你拥有了：
- ✅ GitHub 定时自动化
- ✅ OpenClaw 定时自动化
- ✅ 双向同步机制
- ✅ 完整的监控和日志

**下一步**:
1. 设置 GitHub Secrets (GH_PAT)
2. 测试手动触发
3. 观察第一次自动执行

有问题随时问我！🚀
