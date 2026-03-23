# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Tools Directory - a static website showcasing 60+ AI tools with filtering, search, and favorites functionality. Deployed to GitHub Pages.

## Commands

```bash
# Validate JSON data
node -e "JSON.parse(require('fs').readFileSync('data.json', 'utf8'))"

# Test locally
# Open index.html in a browser or serve with any static server
```

## Architecture

**Frontend Stack**: Vanilla JS + CSS (no framework, no build step)

**Core Files**:
- `index.html` - Single-page application structure
- `script.js` - All application logic (state management, rendering, event handling)
- `data.json` - Source of truth for tools data, categories, and pricing options

**Data Flow**:
1. `script.js` fetches `data.json` on load
2. Tools are filtered/sorted client-side based on user selections
3. Favorites persisted to localStorage
4. Static site deployed to GitHub Pages via CI/CD

**GitHub Actions Workflows** (`.github/workflows/`):
- `deploy.yml` - Deploy on push to master/PR, validates JSON
- `ci.yml` - Validate data on push/PR + weekly schedule (Sun 20:00 Beijing)
- `auto-update.yml` - Daily auto-update at 10:00 Beijing (requires `GH_PAT` secret)

## Data Schema

**Tool Object** (`data.json.tools[]`):
```typescript
{
  id: number
  name: string
  description: string
  category: "基础大模型" | "大模型产品" | "AI Agent" | "开发框架" | "工具链" | "多模态创作" | "企业解决方案" | "研究 & 学习"
  pricing: "免费" | "付费" | "免费 + 付费"
  url: string
  tags: string[]
  rating: number
  favorites: number
  logo: string (emoji)
  features: string[]
}
```

## Key Conventions

- **JSON First**: All data changes go through `data.json` - validate with `node -e "JSON.parse(...)"` before committing
- **No Build Step**: Direct file edits, no bundler/transpiler
- **Categories/Pricing Arrays**: When adding new tools, ensure category and pricing values exist in `data.json.categories` and `data.json.pricings`

## GitHub Pages

Live site: https://earyantle.github.io/ai-tools-directory/

Deploy triggers:
- Push to `master` branch
- Manual workflow dispatch
