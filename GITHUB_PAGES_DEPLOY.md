# GitHub Pages 部署步骤

## ✅ 代码已推送成功！

仓库地址：https://github.com/mctrain/TodoList

---

## 🚀 启用 GitHub Pages

### 步骤 1：进入仓库设置
访问：https://github.com/mctrain/TodoList/settings

### 步骤 2：找到 Pages 设置
1. 在左侧菜单中找到并点击 **Pages**（靠近底部）
2. 或直接访问：https://github.com/mctrain/TodoList/settings/pages

### 步骤 3：配置部署
1. **Build and deployment** 下
2. **Source** 选择：`Deploy from a branch`
3. **Branch** 选择：`master` (或 `main`)
4. **Folder** 选择：`/ (root)`
5. 点击 **Save**

### 步骤 4：等待部署
- 等待 1-2 分钟
- 刷新页面
- 会显示部署状态：**✓ Your site is live at:**

---

## 📱 鸿蒙手机访问安装

### 1. 获取部署地址
部署成功后会显示：
```
https://mctrain.github.io/TodoList/
```

### 2. 手机浏览器访问
```
打开鸿蒙浏览器 -> 输入上述网址
```

### 3. 安装应用
1. 等待页面完全加载
2. 点击浏览器右上角「...」菜单
3. 选择「添加到主屏幕」
4. 点击「添加」确认

### 4. 启动应用
- 退出浏览器
- 在桌面找到 TodoList 图标
- 点击启动（全屏应用，无地址栏）

---

## 🔗 快速链接

- **仓库地址**：https://github.com/mctrain/TodoList
- **部署设置**：https://github.com/mctrain/TodoList/settings/pages
- **部署后地址**：https://mctrain.github.io/TodoList/

---

## ⚙️ 高级配置（可选）

### 自定义域名
1. 在 Pages 设置中，点击 **Custom domain**
2. 输入你的域名（如：todolist.yourdomain.com）
3. 按提示配置 DNS 记录

### 强制 HTTPS
Pages 默认启用 HTTPS，无需额外配置

### 更新部署
每次推送到 master 分支会自动触发部署
```bash
git add .
git commit -m "更新内容"
git push origin master
```

---

## ✅ 验证部署

### 检查清单
- [ ] 访问 https://mctrain.github.io/TodoList/ 能正常显示
- [ ] 所有功能正常（日历、待办、主题切换）
- [ ] DevTools 显示 Service Worker 已注册
- [ ] 可以添加到主屏幕
- [ ] 离线模式可用

### 手机端测试
- [ ] 鸿蒙浏览器访问正常
- [ ] 图标显示正确
- [ ] 全屏启动（无地址栏）
- [ ] 触摸操作流畅
- [ ] 断网后仍可使用

---

## 🐛 常见问题

### 问题 1：部署后页面空白
```
解决方法：
1. 检查浏览器控制台错误
2. 确认所有文件路径正确
3. 清除浏览器缓存
```

### 问题 2：Service Worker 不工作
```
解决方法：
1. 确保使用 HTTPS 访问
2. 清除应用缓存
3. 检查 sw.js 路径是否正确
```

### 问题 3：安装提示不出现
```
解决方法：
1. 清除浏览器缓存
2. 使用隐私模式测试
3. 检查是否已安装过
```

---

## 📊 部署状态查询

查看部署日志：
https://github.com/mctrain/TodoList/actions

---

**恭喜！** 🎉 你的 TodoList 现在可以通过 GitHub Pages 访问，并在鸿蒙手机上安装使用了！
