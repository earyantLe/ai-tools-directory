# AI 工具导航 - 大模型生态全景图

收录 60+ AI 工具，覆盖从基础模型到应用开发的完整生态链。

🌐 **在线访问**: https://earyantle.github.io/ai-tools-directory/

## 分类体系

| 分类 | 说明 |
|------|------|
| 基础大模型 | GPT-4、Claude、Gemini、Llama 等 |
| 大模型产品 | ChatGPT、Notion AI、Copilot 等 |
| AI Agent | AutoGPT、LangChain Agents、CrewAI 等 |
| 开发框架 | LangChain、LlamaIndex、Haystack 等 |
| 工具链 | Pinecone、vLLM、Hugging Face 等 |
| 多模态创作 | Midjourney、DALL-E、Runway、Suno 等 |
| 企业解决方案 | Azure AI、AWS Bedrock、Vertex AI 等 |
| 研究 & 学习 | Coursera、Papers With Code、Kaggle 等 |

## 功能特性

- 🔍 **搜索筛选**: 支持关键词搜索、分类筛选、价格筛选
- ⭐ **收藏功能**: 本地收藏常用工具，支持导出
- 🎨 **主题切换**: 支持亮色/暗色主题
- 📊 **热门标签**: 快速定位热门工具
- 📱 **响应式**: 适配桌面和移动端

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/earyantLe/ai-tools-directory.git
cd ai-tools-directory

# 直接打开 index.html 或使用任意静态服务器
# 例如使用 Node.js 的 http-server
npx http-server -p 3000
```

## 数据结构

工具数据存储在 `data.json`，每个工具包含：

```json
{
  "id": 1,
  "name": "工具名称",
  "description": "描述",
  "category": "分类",
  "pricing": "免费 | 付费 | 免费 + 付费",
  "url": "https://...",
  "tags": ["标签 1", "标签 2"],
  "rating": 4.5,
  "favorites": 1000,
  "logo": "🚀",
  "features": ["功能 1", "功能 2"]
}
```

## 提交新工具

欢迎通过以下方式提交新工具：

1. **GitHub Issues**: https://github.com/earyantLe/ai-tools-directory/issues
2. **直接 PR**: 修改 `data.json` 添加新工具

## 自动化

本项目使用 GitHub Actions 实现自动化：

| Workflow | 触发条件 | 功能 |
|----------|----------|------|
| Deploy | push/PR | 自动部署到 GitHub Pages |
| CI | push/PR + 每周 | 数据验证 |
| Auto Update | 每天 10:00 | 自动更新数据 |

## 统计

- 📦 总工具数：60+
- 📂 分类数：8
- 🏷️ 标签数：50+

## License

MIT

---

💡 持续更新中 | Made with ❤️
