# 🤖 GitHub Actions 自动化配置指南

## 📋 已配置的工作流

### 1. 🚀 Auto Deploy (`deploy.yml`)
**触发条件**: 每次 push 到 master 分支
**功能**:
- ✅ 自动验证 JSON 数据
- ✅ 生成统计信息
- ✅ 部署到 GitHub Pages
- ✅ 发送部署通知

**执行时间**: 实时（push 后立即执行）

---

### 2. 📅 Daily Sync (`daily-sync.yml`)
**触发条件**: 每天北京时间 21:00
**功能**:
- 🔄 自动检查数据更新
- 📊 生成每日报告
- 📝 提交统计信息
- 🔔 可选发送通知

**Cron 表达式**: `0 13 * * *` (UTC 13:00 = 北京 21:00)

---

### 3. 🔍 Weekly Validation (`weekly-validation.yml`)
**触发条件**: 每周日北京时间 20:00
**功能**:
- ✅ 验证数据结构完整性
- 🔍 检查必需字段
- ⚠️ 警告异常数据
- 📊 生成验证报告

**Cron 表达式**: `0 12 * * 0` (UTC 12:00 = 北京 20:00)

---

### 4. 🔄 Auto Backup (`auto-backup.yml`)
**触发条件**: 每天北京时间 08:00
**功能**:
- 💾 创建备份分支
- 📦 生成备份信息
- 🗑️ 清理旧备份（保留 7 天）

**Cron 表达式**: `0 0 * * *` (UTC 00:00 = 北京 08:00)

---

## 🔧 配置步骤

### 方式 1：自动脚本（推荐）

```bash
cd /root/.openclaw/workspace/ai-tools-directory
./scripts/setup-github-actions.sh
```

脚本会：
1. 检查 GitHub CLI 登录状态
2. 引导创建 Personal Access Token (PAT)
3. 设置 GH_PAT secret
4. 启用 GitHub Actions

---

### 方式 2：手动配置

#### Step 1: 创建 Personal Access Token

1. 访问 https://github.com/settings/tokens/new
2. 选择 scopes:
   - ✅ `repo` (完整控制仓库)
   - ✅ `workflow` (更新 workflows)
   - ✅ `admin:repo_hook` (管理 hooks)
3. 生成并复制 token

#### Step 2: 添加 Secret

1. 访问 https://github.com/earyantLe/ai-tools-directory/settings/secrets/actions
2. 点击 "New repository secret"
3. 添加:
   - **Name**: `GH_PAT`
   - **Value**: 你的 token
4. 点击 "Add secret"

#### Step 3: 启用 Actions

1. 访问 https://github.com/earyantLe/ai-tools-directory/actions
2. 点击 "I understand my workflows, go ahead and enable them"

---

## 📊 查看执行状态

### 查看所有工作流
https://github.com/earyantLe/ai-tools-directory/actions

### 手动触发工作流
1. 进入对应 workflow 页面
2. 点击 "Run workflow" 按钮
3. 选择分支（默认 master）
4. 点击 "Run workflow"

---

## ⏰ Cron 语法说明

```
┌───────────── 分钟 (0 - 59)
│ ┌───────────── 小时 (0 - 23)
│ │ ┌───────────── 日期 (1 - 31)
│ │ │ ┌───────────── 月份 (1 - 12)
│ │ │ │ ┌───────────── 星期几 (0 - 6, 0=周日)
│ │ │ │ │
* * * * *
```

**常用示例**:
- `0 13 * * *` - 每天 21:00 (北京)
- `0 0 * * *` - 每天 08:00 (北京)
- `0 12 * * 0` - 每周日 20:00 (北京)
- `*/30 * * * *` - 每 30 分钟
- `0 */6 * * *` - 每 6 小时

---

## 🔔 添加通知（可选）

### Feishu 通知

在 workflow 中添加：

```yaml
- name: 📬 Send Feishu Notification
  if: always()
  run: |
    curl -X POST -H "Content-Type: application/json" \
      -d '{
        "msg_type": "text",
        "content": {
          "text": "🚀 AI Tools 部署完成！\n状态：${{ job.status }}\n时间：$(date)"
        }
      }' \
      ${{ secrets.FEISHU_WEBHOOK }}
```

然后在 Secrets 中添加 `FEISHU_WEBHOOK`。

---

## 🛠️ 自定义工作流

### 添加新的定时任务

创建 `.github/workflows/custom.yml`:

```yaml
name: Custom Task

on:
  schedule:
    - cron: '0 6 * * *'  # 每天 14:00 北京
  workflow_dispatch:

jobs:
  custom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run custom task
        run: echo "Hello from custom task!"
```

---

## 📈 监控和日志

### 查看运行日志
1. 进入 Actions 页面
2. 点击具体运行记录
3. 查看每个 step 的详细日志

### 下载报告
验证报告会在 Artifacts 中保留 30 天

---

## ⚠️ 注意事项

1. **分钟限制**: GitHub Actions 最少 5 分钟间隔，不能更频繁
2. **时间精度**: Cron 任务可能延迟几分钟执行
3. **超时限制**: 每个 job 最长 6 小时
4. **存储限制**: Artifacts 保留 90 天（免费账户）
5. **并发限制**: 免费账户最多 20 个并发 job

---

## 🔗 相关链接

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Cron 语法参考](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#onschedule)
- [Actions 市场](https://github.com/marketplace?type=actions)
- [仓库 Actions](https://github.com/earyantLe/ai-tools-directory/actions)

---

*配置完成时间：2026-03-18*
