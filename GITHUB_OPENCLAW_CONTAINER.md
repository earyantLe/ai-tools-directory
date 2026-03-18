# 🐳 GitHub Actions + OpenClaw 容器化方案

## 🎯 方案说明

在 GitHub Actions 中**每次启动容器，全新安装 OpenClaw**，执行任务后提交结果。

---

## 📋 三种实现方式

### 方式 1: Simple Runner ⭐⭐⭐ 推荐

**特点**: 简单直接，每次安装 OpenClaw
**时长**: ~3-5 分钟
**适用**: 大多数场景

**文件**: `.github/workflows/openclaw-simple.yml`

```yaml
name: ⚡ OpenClaw Simple Runner

on:
  schedule:
    - cron: '0 2 * * *'  # 每天 10:00 北京
  workflow_dispatch:

jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install -g openclaw
      - run: openclaw <your-command>
      - run: git commit && git push
```

---

### 方式 2: Docker Runner ⭐⭐

**特点**: 自定义 Docker 镜像，预装 OpenClaw
**时长**: ~1-2 分钟
**适用**: 频繁执行，需要节省时长

**文件**: 
- `.github/workflows/openclaw-docker.yml`
- `docker/Dockerfile`

**步骤**:
1. 构建镜像（首次 ~5 分钟）
2. 推送到 Docker Hub 或 GitHub Container Registry
3. Actions 直接拉取镜像运行

---

### 方式 3: Full Container ⭐

**特点**: 完整 OpenClaw 环境，包含所有配置
**时长**: ~2-3 分钟
**适用**: 复杂任务，需要完整环境

**文件**: `.github/workflows/openclaw-container.yml`

---

## 🔧 配置步骤

### Step 1: 创建 GitHub Secrets

访问：https://github.com/earyantLe/ai-tools-directory/settings/secrets/actions

添加以下 secrets：

| Name | Value | 必需 |
|------|-------|------|
| `GH_PAT` | GitHub Personal Access Token | ✅ |
| `FEISHU_APP_ID` | 飞书 App ID | ❌ |
| `FEISHU_APP_SECRET` | 飞书 App Secret | ❌ |

**创建 GH_PAT**:
1. https://github.com/settings/tokens/new
2. Scopes: `repo`, `workflow`
3. 生成并复制

---

### Step 2: 选择并启用 Workflow

#### 使用 Simple Runner（推荐）

```bash
cd /root/.openclaw/workspace/ai-tools-directory

# 启用 simple workflow
gh workflow enable openclaw-simple.yml
```

#### 手动启用

1. 访问：https://github.com/earyantLe/ai-tools-directory/actions
2. 点击 "I understand my workflows, go ahead and enable them"

---

### Step 3: 测试运行

#### 手动触发
```bash
# 方式 1: 使用 gh CLI
gh workflow run openclaw-simple.yml

# 方式 2: GitHub 网页
# 访问 Actions → OpenClaw Simple Runner → Run workflow
```

#### 查看执行
https://github.com/earyantLe/ai-tools-directory/actions

---

## 📊 对比分析

| 方案 | 安装时间 | 执行时间 | 总时长 | 成本/月* | 复杂度 |
|------|---------|---------|--------|---------|--------|
| **Simple** | 2-3 分钟 | 1-2 分钟 | 3-5 分钟 | ~150 分钟 | ⭐ |
| **Docker** | 30 秒 | 1-2 分钟 | 1-3 分钟 | ~90 分钟 | ⭐⭐ |
| **Full** | 1-2 分钟 | 1-2 分钟 | 2-4 分钟 | ~120 分钟 | ⭐⭐⭐ |

*假设每天执行 1 次，GitHub Actions 免费额度 2000 分钟/月

---

## 💡 实际使用建议

### 场景 1: 每天执行 1-2 次
✅ **用 Simple Runner**
- 配置简单
- 免费额度够用
- 维护成本低

### 场景 2: 每小时执行
✅ **用 Docker Runner**
- 预装镜像节省时间
- 减少 Actions 时长消耗
- 需要维护 Docker 镜像

### 场景 3: 复杂任务（需要 Feishu/Cookie）
✅ **用 Full Container**
- 完整 OpenClaw 环境
- 支持所有功能
- 配置复杂但灵活

---

## 🚀 示例任务

### 任务 1: 自动更新 AI 工具数据

```yaml
- name: 🚀 Execute Task
  run: |
    cd ai-tools-directory
    node update-tools.js  # 你的更新脚本
    git add .
    git commit -m "feat: auto update"
    git push
```

### 任务 2: 调用 OpenClaw 技能

```yaml
- name: 🚀 Execute OpenClaw Skill
  run: |
    openclaw skill xhs-note-creator create \
      --title "AI 工具推荐" \
      --content "..." \
      --category 科技
```

### 任务 3: 搜索并添加新工具

```yaml
- name: 🔍 Search AI Tools
  run: |
    openclaw exec "
      const tools = await searchAITools();
      await addTools(tools);
    "
```

---

## ⚠️ 注意事项

### 1. 安装时间
- Simple: 每次安装 OpenClaw (~2-3 分钟)
- Docker: 首次构建镜像，后续拉取 (~30 秒)

### 2. 配置管理
- 敏感信息用 Secrets
- 配置文件可以提交到仓库
- Cookie 等用 Secrets 注入

### 3. 成本控制
- 免费额度：2000 分钟/月
- 优化建议：
  - 减少执行频率
  - 使用 Docker 镜像
  - 优化任务逻辑

### 4. 错误处理
```yaml
- name: 🚀 Execute Task
  continue-on-error: true  # 失败不中断
  run: |
    # 你的任务
    || echo "任务失败，继续后续步骤"
```

---

## 🔗 完整示例

### openclaw-simple.yml (推荐)

```yaml
name: ⚡ OpenClaw Simple Runner

on:
  schedule:
    - cron: '0 2 * * *'  # 每天 10:00 北京
  workflow_dispatch:

jobs:
  run:
    runs-on: ubuntu-latest
    
    steps:
    - name: 📥 Checkout
      uses: actions/checkout@v4
      with:
        token: ${{ secrets.GH_PAT }}
    
    - name: 🔧 Setup Node
      uses: actions/setup-node@v4
      with:
        node-version: '18'
    
    - name: 📦 Install OpenClaw
      run: npm install -g openclaw
    
    - name: 🚀 Execute Task
      run: |
        cd ai-tools-directory
        
        # 你的任务逻辑
        node -e "
        const data = require('./data.json');
        console.log('当前工具:', data.tools.length);
        // 添加新工具...
        "
        
        # 提交结果
        git config user.name "OpenClaw Bot"
        git config user.email "bot@github.com"
        git add .
        git commit -m "feat: auto update $(date '+%Y-%m-%d')" || echo "No changes"
        git push
    
    - name: ✅ Complete
      run: echo "任务完成！"
```

---

## 📈 监控和优化

### 查看执行历史
https://github.com/earyantLe/ai-tools-directory/actions

### 分析时长消耗
```bash
# 查看每次运行时长
gh run list --repo earyantLe/ai-tools-directory --limit 10
```

### 优化建议
1. **缓存 node_modules**
```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: npm-${{ hashFiles('package-lock.json') }}
```

2. **并行执行**
```yaml
strategy:
  matrix:
    task: [update, validate, backup]
```

3. **条件执行**
```yaml
if: github.event_name == 'schedule' || github.event_name == 'workflow_dispatch'
```

---

## 🎉 开始使用

1. **选择方案**: Simple Runner (推荐)
2. **配置 Secrets**: GH_PAT
3. **启用 Workflow**: GitHub Actions 页面
4. **手动测试**: Run workflow
5. **观察执行**: 查看日志

**完成！** 🚀

---

*文档更新时间：2026-03-18*
