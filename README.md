# ✨ Todo List

一个酷炫的日历待办事项应用，支持多主题切换和数据导入导出。

![Pure Frontend](https://img.shields.io/badge/Pure-Frontend-blue)
![No Dependencies](https://img.shields.io/badge/Dependencies-None-green)

## 功能特性

- 📅 **日历视图** - 按日期管理待办事项
- 🎨 **多主题切换** - 6 种精美主题（梦幻紫、赛博朋克、自然绿、日落橙、海洋蓝、简约白）
- 💾 **数据持久化** - 本地存储，数据不丢失
- 📤 **导入/导出** - JSON 格式备份与恢复
- ✨ **动画效果** - 玻璃态设计、流畅动画

## 快速开始

直接在浏览器中打开 `index.html` 即可使用，无需安装任何依赖。

```bash
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

## 项目结构

```
TodoList/
├── index.html    # 页面结构
├── style.css     # 样式与主题
├── app.js        # 应用逻辑
└── CLAUDE.md     # Claude Code 指南
```

## 数据存储

- 待办数据存储在 `localStorage`，键名 `coolTodosCalendar`
- 主题偏好存储在 `localStorage`，键名 `todoTheme`
- 数据格式：`{ 'YYYY-MM-DD': [{ id, text, completed, createdAt }] }`

## 预览

支持的主题：

| 主题 | 描述 |
|------|------|
| 梦幻紫 | 默认主题，紫色渐变 |
| 赛博朋克 | 霓虹风格 |
| 自然绿 | 清新自然 |
| 日落橙 | 温暖日落 |
| 海洋蓝 | 深海风格 |
| 简约白 | 明亮简洁 |

## License

MIT
