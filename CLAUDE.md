# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A stylish TodoList web application with calendar-based task management, multiple themes, and data export/import functionality. Pure frontend with no build tools or dependencies.

## Running the Application

Open `index.html` directly in a browser, or use:
```bash
start "" "D:\Projects\TodoList\index.html"
```

## Architecture

### Data Storage
- Uses `localStorage` with key `coolTodosCalendar` for todos
- Data structure: `{ 'YYYY-MM-DD': [{ id, text, completed, createdAt }] }`
- Theme preference stored in `localStorage` key `todoTheme`

### Core Class: TodoApp (app.js)
Single class managing all functionality:
- **Calendar**: `renderCalendar()`, `selectDate()`, `changeMonth()`
- **CRUD**: `addTodo()`, `toggleTodo()`, `deleteTodo()`, `clearCompleted()`
- **Filtering**: `setFilter()`, `getFilteredTodos()`
- **Persistence**: `saveTodos()`, `loadTodos()`, `exportData()`, `importData()`
- **Theming**: `setTheme()`, `loadTheme()`

### Theming System (style.css)
- CSS custom properties in `:root` define default theme
- Theme variants use `[data-theme="themename"]` attribute selectors
- 6 themes: default (梦幻紫), cyberpunk, nature, sunset, ocean, light
- Light theme requires special handling for text visibility

### UI Effects
- Glass-morphism: `backdrop-filter: blur()` with rgba backgrounds
- Animated background orbs with `@keyframes float`
- Todo item animations: `slideIn`, `slideOut`, `complete`
- Sparkle effects around title star icon

## Key CSS Variables
```css
--primary, --secondary     /* Accent colors */
--bg-card                  /* Card backgrounds */
--text-primary, --text-secondary
--border-color
--bg-gradient              /* Page background */
--orb-1, --orb-2, --orb-3  /* Floating orb gradients */
```

## Export File Format
JSON file named `todolist_backup_YYYYMMDD.json` containing the entire `todosByDate` object.
