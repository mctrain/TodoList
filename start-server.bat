@echo off
chcp 65001 >nul
echo ========================================
echo   TodoList PWA 局域网服务器启动器
echo ========================================
echo.

echo 正在获取本机 IP 地址...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
    set IP=%%a
    set IP=!IP: =!
)
echo 本机 IP 地址: %IP%
echo.

echo ========================================
echo 启动 Python HTTP 服务器...
echo 端口: 8080
echo.
echo 请确保：
echo 1. 鸿蒙手机和电脑连接同一 Wi-Fi
echo 2. 手机浏览器访问: http://%IP%:8080
echo 3. 手机上点击浏览器菜单 -> 添加到主屏幕
echo ========================================
echo.

python -m http.server 8080 --bind 0.0.0.0

pause
