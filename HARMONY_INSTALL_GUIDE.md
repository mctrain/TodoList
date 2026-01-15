# 鸿蒙手机访问安装 PWA 指南

## 📱 方案一：局域网访问（适合快速测试）

### 步骤 1：获取电脑 IP 地址
```bash
# Windows
ipconfig
# 找到 IPv4 地址，例如：192.168.1.100

# 或使用命令快速查看
ipconfig | findstr "IPv4"
```

### 步骤 2：启动本地服务器（允许外部访问）
```bash
# Python（允许所有 IP 访问）
python -m http.server 8080 --bind 0.0.0.0

# 或使用 Node.js http-server
npx http-server -p 8080 -a 0.0.0.0
```

### 步骤 3：手机和电脑连接同一 Wi-Fi
- 确保鸿蒙手机和电脑在同一个局域网
- 检查电脑防火墙设置，允许 8080 端口

### 步骤 4：手机浏览器访问
```
http://192.168.1.100:8080
# 将 192.168.1.100 替换为你的实际 IP
```

---

## 🌐 方案二：部署到公网（推荐）

### 方式 1：Vercel（最简单，免费）

1. **安装 Vercel CLI**
```bash
npm install -g vercel
```

2. **在项目目录执行**
```bash
cd D:\Projects\TodoList
vercel
# 按提示操作，首次需要登录
# 选择部署为 Public
```

3. **获取部署地址**
```
https://todolist-xxxxx.vercel.app
```

4. **手机浏览器访问**
```
打开鸿蒙浏览器 -> 输入上述网址
```

---

### 方式 2：GitHub Pages（免费）

1. **推送到 GitHub**
```bash
git init
git add .
git commit -m "Add PWA support"
git branch -M main
git remote add origin https://github.com/你的用户名/TodoList.git
git push -u origin main
```

2. **开启 GitHub Pages**
- 访问仓库 Settings
- 找到 Pages（左侧菜单）
- Source 选择 `Deploy from a branch`
- Branch 选择 `main/main`，文件夹 `/root`
- 点击 Save

3. **等待部署完成**
```
https://你的用户名.github.io/TodoList
```

4. **手机浏览器访问上述网址**

---

### 方式 3：Netlify（拖拽部署，免费）

1. **访问 https://app.netlify.com**
2. **登录账号**
3. **将 `TodoList` 文件夹拖拽到部署区域**
4. **获得地址：**
```
https://random-name-12345.netlify.app
```

---

## 📲 鸿蒙手机安装 PWA 步骤

### 1. 访问网址
```
打开鸿蒙浏览器 -> 输入部署后的网址
```

### 2. 等待加载
- 首次加载可能较慢
- 确保所有功能正常显示

### 3. 安装到桌面

#### 方法 A：浏览器菜单安装
1. 点击浏览器右上角「...」菜单
2. 选择「添加到主屏幕」或「安装应用」
3. 确认安装

#### 方法 B：自动安装提示
- 浏览器会自动弹出安装提示
- 点击「安装」或「添加」

#### 方法 C：长按地址栏
- 长按浏览器地址栏
- 选择「添加到主屏幕」

### 4. 启动应用
- 退出浏览器
- 在手机桌面找到 TodoList 图标
- 点击启动（独立窗口，无地址栏）

---

## ⚙️ 鸿蒙系统注意事项

### ✅ 已优化兼容性
- [x] 标准 PWA manifest 格式
- [x] Service Worker 缓存
- [x] 触摸交互优化
- [x] 图标适配
- [x] 响应式布局

### ⚠️ 可能的限制
1. **通知权限**：首次使用功能需要手动授权
2. **语音识别**：部分鸿蒙设备可能不支持 Web Speech API
3. **缓存大小**：离线缓存有容量限制（通常 50MB）

### 🔧 遇到问题？

#### 问题 1：安装提示不出现
```
解决方法：
1. 清除浏览器缓存
2. 使用隐私模式重试
3. 确保网址是 HTTPS（公网部署）或 localhost（局域网）
```

#### 问题 2：无法加载资源
```
解决方法：
1. 检查手机网络连接
2. 刷新页面
3. 检查 Service Worker 是否激活（DevTools）
```

#### 问题 3：图标显示异常
```
解决方法：
1. 确认 icons/ 目录下有所有尺寸的 PNG 图标
2. 清除应用缓存后重新安装
```

---

## 🚀 快速开始（推荐流程）

### 最快方案：局域网测试（5分钟）

```bash
# 1. 电脑端执行
cd D:\Projects\TodoList
ipconfig | findstr "IPv4"    # 记下 IP 地址
python -m http.server 8080 --bind 0.0.0.0

# 2. 手机端操作
# 连接同一 Wi-Fi
# 打开浏览器，输入：http://你的IP:8080
# 点击浏览器菜单 -> 添加到主屏幕
```

### 正式方案：Vercel 部署（10分钟）

```bash
# 1. 安装 Vercel（首次）
npm install -g vercel

# 2. 部署
cd D:\Projects\TodoList
vercel

# 3. 获取部署地址
# 按照命令行提示，复制部署后的网址

# 4. 手机访问
# 浏览器输入部署地址
# 添加到主屏幕
```

---

## 📋 测试清单

安装后测试以下功能：

- [ ] 应用图标显示正确
- [ ] 点击图标启动应用（独立窗口）
- [ ] 日历功能正常
- [ ] 添加/删除待办事项
- [ ] 主题切换正常
- [ ] 断网后仍可使用（离线模式）
- [ ] 触摸操作流畅
- [ ] 无明显卡顿

---

## 🎯 成功标志

安装成功的标志：
- ✅ 手机桌面出现 TodoList 图标
- ✅ 点击后全屏启动（无浏览器地址栏）
- ✅ 图标与应用主题一致
- ✅ 断网后仍可打开应用
- ✅ 数据保存正常

---

## 📞 获取帮助

如遇问题：
1. 查看 `PWA_TEST_CHECKLIST.md`
2. 检查浏览器控制台错误
3. 查看 Service Worker 状态

**祝使用愉快！** 🎉
