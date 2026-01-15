// Todo List Application with Calendar
class TodoApp {
    constructor() {
        this.todosByDate = {}; // Store todos by date: { '2024-01-15': [...todos] }
        this.selectedDate = new Date();
        this.currentMonth = new Date();
        this.filter = 'all';
        this.init();
    }

    init() {
        // DOM Elements
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.voiceBtn = document.getElementById('voiceBtn');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.filterBtns = document.querySelectorAll('.filter-btn');

        // Calendar Elements
        this.calendarDays = document.getElementById('calendarDays');
        this.calendarTitle = document.getElementById('calendarTitle');
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');
        this.currentDateDisplay = document.getElementById('currentDateDisplay');

        // Stats
        this.totalCount = document.getElementById('totalCount');
        this.pendingCount = document.getElementById('pendingCount');
        this.completedCount = document.getElementById('completedCount');

        // Load from localStorage
        this.loadTodos();

        // Check browser and show Chrome recommendation
        this.checkBrowserAndShowRecommendation();

        // Register Service Worker
        this.registerServiceWorker();

        // Event Listeners
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // Calendar Event Listeners
        this.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
        this.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));

        // Export/Import Elements
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.importFile = document.getElementById('importFile');

        // Export/Import Event Listeners
        this.exportBtn.addEventListener('click', () => this.exportData());
        this.importBtn.addEventListener('click', () => this.importFile.click());
        this.importFile.addEventListener('change', (e) => this.importData(e));

        // Theme Switcher Elements
        this.themeToggle = document.getElementById('themeToggle');
        this.themeDropdown = document.getElementById('themeDropdown');
        this.themeOptions = document.querySelectorAll('.theme-option');

        // Theme Event Listeners
        this.themeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.themeDropdown.classList.toggle('show');
        });

        this.themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.setTheme(option.dataset.theme);
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            this.themeDropdown.classList.remove('show');
        });

        // Load saved theme
        this.loadTheme();

        // Initialize voice recognition
        this.initVoiceRecognition();

        // Voice error close button
        const voiceErrorClose = document.getElementById('voiceErrorClose');
        if (voiceErrorClose) {
            voiceErrorClose.addEventListener('click', () => {
                document.getElementById('voiceError').style.display = 'none';
            });
        }

        // Initialize PWA install prompt
        this.initPWAInstallPrompt();

        // Initial render
        this.renderCalendar();
        this.render();
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            let refreshing = false;

            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('Service Worker registered:', registration);

                registration.onupdatefound = () => {
                    const newWorker = registration.installing;
                    newWorker.onstatechange = () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            if (!refreshing) {
                                refreshing = true;
                                this.showUpdateNotification();
                            }
                        }
                    };
                };
            }).catch(error => {
                console.log('Service Worker registration failed:', error);
            });
        }
    }

    showUpdateNotification() {
        const existingUpdate = document.querySelector('.update-notification');
        if (existingUpdate) return;

        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <span class="update-icon">🔄</span>
                <span class="update-text">发现新版本</span>
                <button class="update-btn" id="updateBtn">立即更新</button>
            </div>
        `;

        document.body.appendChild(notification);

        document.getElementById('updateBtn').addEventListener('click', () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
            }
            window.location.reload();
        });
    }

    initPWAInstallPrompt() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;

            const existingPrompt = document.querySelector('.install-prompt');
            if (existingPrompt) return;

            this.showInstallPrompt(() => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('PWA installed');
                        }
                        deferredPrompt = null;
                    });
                }
            });
        });

        window.addEventListener('appinstalled', () => {
            const prompt = document.querySelector('.install-prompt');
            if (prompt) {
                prompt.remove();
            }
            this.showToast('已安装到桌面', 'success');
        });
    }

    showInstallPrompt(onInstall) {
        const prompt = document.createElement('div');
        prompt.className = 'install-prompt';
        prompt.innerHTML = `
            <div class="install-content">
                <div class="install-info">
                    <span class="install-icon">📱</span>
                    <div class="install-text">
                        <span class="install-title">安装应用</span>
                        <span class="install-desc">添加到主屏幕，离线也能使用</span>
                    </div>
                </div>
                <button class="install-btn" id="installBtn">安装</button>
                <button class="install-close" id="installClose">×</button>
            </div>
        `;

        document.body.appendChild(prompt);

        document.getElementById('installBtn').addEventListener('click', () => {
            onInstall();
            prompt.remove();
        });

        document.getElementById('installClose').addEventListener('click', () => {
            prompt.remove();
        });
    }

    // Date utility functions
    formatDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatDisplayDate(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}年${month}月${day}日`;
    }

    formatMonthYear(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        return `${year}年${month}月`;
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    isToday(date) {
        return this.isSameDay(date, new Date());
    }

    // Calendar functions
    renderCalendar() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();

        // Update title
        this.calendarTitle.textContent = this.formatMonthYear(this.currentMonth);

        // Get first day of month and total days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        // Get days from previous month
        const prevMonthLastDay = new Date(year, month, 0).getDate();

        let html = '';

        // Previous month days
        for (let i = startingDay - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            const date = new Date(year, month - 1, day);
            const dateKey = this.formatDateKey(date);
            const hasTodos = this.todosByDate[dateKey] && this.todosByDate[dateKey].length > 0;
            html += `<div class="calendar-day other-month ${hasTodos ? 'has-todos' : ''}" data-date="${dateKey}">${day}</div>`;
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateKey = this.formatDateKey(date);
            const isSelected = this.isSameDay(date, this.selectedDate);
            const isCurrentDay = this.isToday(date);
            const hasTodos = this.todosByDate[dateKey] && this.todosByDate[dateKey].length > 0;

            let classes = 'calendar-day';
            if (isSelected) classes += ' selected';
            if (isCurrentDay) classes += ' today';
            if (hasTodos) classes += ' has-todos';

            html += `<div class="${classes}" data-date="${dateKey}">${day}</div>`;
        }

        // Next month days
        const totalCells = startingDay + daysInMonth;
        const remainingCells = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
        for (let day = 1; day <= remainingCells; day++) {
            const date = new Date(year, month + 1, day);
            const dateKey = this.formatDateKey(date);
            const hasTodos = this.todosByDate[dateKey] && this.todosByDate[dateKey].length > 0;
            html += `<div class="calendar-day other-month ${hasTodos ? 'has-todos' : ''}" data-date="${dateKey}">${day}</div>`;
        }

        this.calendarDays.innerHTML = html;

        // Add click listeners to days
        this.calendarDays.querySelectorAll('.calendar-day').forEach(dayEl => {
            dayEl.addEventListener('click', (e) => {
                const dateKey = e.target.dataset.date;
                if (dateKey) {
                    this.selectDate(dateKey);
                }
            });
        });

        // Update selected date display
        this.currentDateDisplay.textContent = this.formatDisplayDate(this.selectedDate);
    }

    selectDate(dateKey) {
        const [year, month, day] = dateKey.split('-').map(Number);
        this.selectedDate = new Date(year, month - 1, day);

        // If selected date is in different month, change the calendar view
        if (this.selectedDate.getMonth() !== this.currentMonth.getMonth() ||
            this.selectedDate.getFullYear() !== this.currentMonth.getFullYear()) {
            this.currentMonth = new Date(this.selectedDate);
        }

        this.renderCalendar();
        this.render();
    }

    changeMonth(delta) {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + delta);
        this.renderCalendar();
    }

    // Get todos for selected date
    getTodosForSelectedDate() {
        const dateKey = this.formatDateKey(this.selectedDate);
        return this.todosByDate[dateKey] || [];
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) {
            this.shakeInput();
            return;
        }

        const dateKey = this.formatDateKey(this.selectedDate);

        const todo = {
            id: this.generateId(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        if (!this.todosByDate[dateKey]) {
            this.todosByDate[dateKey] = [];
        }

        this.todosByDate[dateKey].unshift(todo);
        this.saveTodos();
        this.todoInput.value = '';
        this.renderCalendar();
        this.render();

        // Focus back to input
        this.todoInput.focus();
    }

    shakeInput() {
        this.todoInput.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            this.todoInput.style.animation = '';
        }, 500);
    }

    toggleTodo(id) {
        const dateKey = this.formatDateKey(this.selectedDate);
        const todos = this.todosByDate[dateKey] || [];
        const todo = todos.find(t => t.id === id);

        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();

            // Add completion animation
            const item = document.querySelector(`[data-id="${id}"]`);
            if (item && todo.completed) {
                item.classList.add('completing');
                setTimeout(() => {
                    item.classList.remove('completing');
                    this.render();
                }, 500);
            } else {
                this.render();
            }
        }
    }

    deleteTodo(id) {
        const item = document.querySelector(`[data-id="${id}"]`);
        if (item) {
            item.classList.add('removing');
            setTimeout(() => {
                const dateKey = this.formatDateKey(this.selectedDate);
                if (this.todosByDate[dateKey]) {
                    this.todosByDate[dateKey] = this.todosByDate[dateKey].filter(t => t.id !== id);
                    // Clean up empty date entries
                    if (this.todosByDate[dateKey].length === 0) {
                        delete this.todosByDate[dateKey];
                    }
                }
                this.saveTodos();
                this.renderCalendar();
                this.render();
            }, 400);
        }
    }

    clearCompleted() {
        const dateKey = this.formatDateKey(this.selectedDate);
        const completedItems = document.querySelectorAll('.todo-item.completed');

        completedItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('removing');
            }, index * 100);
        });

        setTimeout(() => {
            if (this.todosByDate[dateKey]) {
                this.todosByDate[dateKey] = this.todosByDate[dateKey].filter(t => !t.completed);
                if (this.todosByDate[dateKey].length === 0) {
                    delete this.todosByDate[dateKey];
                }
            }
            this.saveTodos();
            this.renderCalendar();
            this.render();
        }, completedItems.length * 100 + 400);
    }

    setFilter(filter) {
        this.filter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    getFilteredTodos() {
        const todos = this.getTodosForSelectedDate();
        switch (this.filter) {
            case 'pending':
                return todos.filter(t => !t.completed);
            case 'completed':
                return todos.filter(t => t.completed);
            default:
                return todos;
        }
    }

    updateStats() {
        const todos = this.getTodosForSelectedDate();
        const total = todos.length;
        const completed = todos.filter(t => t.completed).length;
        const pending = total - completed;

        this.animateNumber(this.totalCount, total);
        this.animateNumber(this.pendingCount, pending);
        this.animateNumber(this.completedCount, completed);
    }

    animateNumber(element, target) {
        const current = parseInt(element.textContent) || 0;
        if (current === target) return;

        const duration = 300;
        const steps = 20;
        const increment = (target - current) / steps;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            const value = Math.round(current + increment * step);
            element.textContent = value;

            if (step >= steps) {
                element.textContent = target;
                clearInterval(timer);
            }
        }, duration / steps);
    }

    render() {
        const filteredTodos = this.getFilteredTodos();

        // Update empty state
        if (filteredTodos.length === 0) {
            this.emptyState.classList.add('visible');
            this.todoList.innerHTML = '';
        } else {
            this.emptyState.classList.remove('visible');
            this.todoList.innerHTML = filteredTodos.map((todo, index) => this.createTodoHTML(todo, index)).join('');

            // Add event listeners to new items
            this.todoList.querySelectorAll('.checkbox-wrapper input').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    this.toggleTodo(e.target.closest('.todo-item').dataset.id);
                });
            });

            this.todoList.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.deleteTodo(e.target.closest('.todo-item').dataset.id);
                });
            });
        }

        this.updateStats();
    }

    createTodoHTML(todo, index) {
        return `
            <li class="todo-item ${todo.completed ? 'completed' : ''}"
                data-id="${todo.id}"
                style="animation-delay: ${index * 0.05}s">
                <label class="checkbox-wrapper">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label>
                <span class="todo-text">${this.escapeHTML(todo.text)}</span>
                <button class="delete-btn" title="删除">×</button>
            </li>
        `;
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTodos() {
        localStorage.setItem('coolTodosCalendar', JSON.stringify(this.todosByDate));
    }

    loadTodos() {
        const saved = localStorage.getItem('coolTodosCalendar');
        if (saved) {
            try {
                this.todosByDate = JSON.parse(saved);
            } catch (e) {
                this.todosByDate = {};
            }
        }
    }

    // Export data to JSON file
    exportData() {
        const dataStr = JSON.stringify(this.todosByDate, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const now = new Date();
        const filename = `todolist_backup_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.json`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('数据已导出', 'success');
    }

    // Import data from JSON file
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // Validate data structure
                if (typeof data !== 'object' || data === null) {
                    throw new Error('Invalid data format');
                }

                // Merge or replace data
                this.todosByDate = data;
                this.saveTodos();
                this.renderCalendar();
                this.render();

                this.showToast('数据导入成功', 'success');
            } catch (error) {
                this.showToast('导入失败：文件格式错误', 'error');
            }
        };

        reader.onerror = () => {
            this.showToast('导入失败：无法读取文件', 'error');
        };

        reader.readAsText(file);

        // Reset file input
        event.target.value = '';
    }

    // Show toast notification
    showToast(message, type = 'success') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span>
            <span>${message}</span>
        `;

        document.body.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // Set theme
    setTheme(theme) {
        if (theme === 'default') {
            document.body.removeAttribute('data-theme');
        } else {
            document.body.setAttribute('data-theme', theme);
        }

        // Update active state
        this.themeOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.theme === theme);
        });

        // Save to localStorage
        localStorage.setItem('todoTheme', theme);

        // Close dropdown
        this.themeDropdown.classList.remove('show');

        // Show toast
        const themeNames = {
            'default': '梦幻紫',
            'cyberpunk': '赛博朋克',
            'nature': '自然绿',
            'sunset': '日落橙',
            'ocean': '海洋蓝',
            'light': '简约白'
        };
        this.showToast(`已切换到「${themeNames[theme]}」主题`, 'success');
    }

    // Load saved theme
    loadTheme() {
        const savedTheme = localStorage.getItem('todoTheme') || 'default';
        if (savedTheme !== 'default') {
            document.body.setAttribute('data-theme', savedTheme);
        }

        // Update active state
        this.themeOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.theme === savedTheme);
        });
    }

    // Initialize voice recognition
    initVoiceRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const voiceError = document.getElementById('voiceError');

        if (!SpeechRecognition) {
            console.log('Speech recognition not supported in this browser');
            this.voiceBtn.style.display = 'none';
            if (voiceError) {
                voiceError.style.display = 'flex';
                voiceError.querySelector('span').textContent = '⚠️ 此浏览器不支持语音识别。请使用 Chrome、Edge 或支持 Web Speech API 的浏览器。';
            }
            return;
        }

        try {
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'zh-CN';
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.isListening = false;

            this.voiceBtn.addEventListener('click', () => {
                if (this.isListening) {
                    this.recognition.stop();
                } else {
                    this.recognition.start();
                }
            });

            this.recognition.onstart = () => {
                this.isListening = true;
                this.voiceBtn.classList.add('listening');
                this.todoInput.placeholder = '正在聆听...';
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.voiceBtn.classList.remove('listening');
                this.todoInput.placeholder = '添加新任务...';
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.todoInput.value = transcript;
                this.todoInput.focus();
            };

            this.recognition.onerror = (event) => {
                this.isListening = false;
                this.voiceBtn.classList.remove('listening');
                this.todoInput.placeholder = '添加新任务...';

                let errorMsg = '语音识别失败';
                let showDetailed = false;

                switch (event.error) {
                    case 'no-speech':
                        return;
                    case 'audio-capture':
                        errorMsg = '未检测到麦克风';
                        showDetailed = true;
                        break;
                    case 'not-allowed':
                        errorMsg = '麦克风权限被拒绝';
                        showDetailed = true;
                        if (voiceError) {
                            voiceError.style.display = 'flex';
                            voiceError.querySelector('span').textContent = '⚠️ 请允许访问麦克风以使用语音识别功能。点击浏览器地址栏左侧的锁图标授予权限。';
                        }
                        break;
                    case 'network':
                        errorMsg = '网络连接错误';
                        showDetailed = true;
                        break;
                    case 'aborted':
                        errorMsg = '语音识别已取消';
                        break;
                    default:
                        if (event.message) {
                            errorMsg += `: ${event.message}`;
                        } else {
                            errorMsg += ` (${event.error})`;
                        }
                        showDetailed = true;
                }

                if (showDetailed) {
                    this.showToast(errorMsg, 'error');
                    console.error('Speech recognition error:', event);
                }
            };
        } catch (error) {
            this.voiceBtn.style.display = 'none';
            console.error('Failed to initialize speech recognition:', error);
            if (voiceError) {
                voiceError.style.display = 'flex';
                voiceError.querySelector('span').textContent = '⚠️ 语音识别初始化失败。请检查浏览器兼容性并刷新重试。';
            }
        }
    }

    // Check browser and show Chrome recommendation
    checkBrowserAndShowRecommendation() {
        const userAgent = navigator.userAgent;
        const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent) && !/OPR/.test(userAgent);
        const isEdge = /Edg/.test(userAgent);
        const isFirefox = /Firefox/.test(userAgent);
        const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
        const isHarmony = /HuaweiBrowser|HarmonyOS/.test(userAgent);

        // Check if user already dismissed the recommendation
        const dismissed = localStorage.getItem('chromeRecommendationDismissed');
        const installed = localStorage.getItem('chromeRecommendationInstalled');

        // Only show if not Chrome and not previously dismissed
        if (!isChrome && !dismissed && !installed && (isHarmony || isSafari || isFirefox)) {
            this.showBrowserRecommendation();
        }
    }

    showBrowserRecommendation() {
        const existingBanner = document.querySelector('.browser-recommendation');
        if (existingBanner) return;

        const banner = document.createElement('div');
        banner.className = 'browser-recommendation';
        banner.innerHTML = `
            <div class="recommendation-content">
                <div class="recommendation-icon">🌐</div>
                <div class="recommendation-text">
                    <strong>推荐使用 Chrome 浏览器</strong>
                    <p>以获得最佳体验和完整的 PWA 功能支持</p>
                </div>
                <div class="recommendation-actions">
                    <button class="recommendation-close" id="recClose" title="不再提示">✕</button>
                    <button class="recommendation-button" id="recChrome">打开 Chrome</button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Close button - don't show again
        document.getElementById('recClose').addEventListener('click', () => {
            localStorage.setItem('chromeRecommendationDismissed', 'true');
            banner.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => banner.remove(), 300);
        });

        // Open in Chrome button
        document.getElementById('recChrome').addEventListener('click', () => {
            this.openInChrome();
        });

        // Auto-hide after 10 seconds if no action
        setTimeout(() => {
            if (banner.parentNode) {
                banner.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => banner.remove(), 300);
            }
        }, 10000);
    }

    openInChrome() {
        const currentUrl = window.location.href;
        const userAgent = navigator.userAgent;

        // Try different URL schemes based on platform
        let chromeScheme = null;

        if (/Android/.test(userAgent)) {
            chromeScheme = 'intent:' + currentUrl + '#Intent;scheme=https;package=com.android.chrome;end;';
        } else if (/iPhone|iPad|iPod/.test(userAgent)) {
            // iOS - open App Store or Chrome
            window.location.href = 'googlechrome://' + currentUrl.replace(/^https?:\/\//, '');
        } else if (/Windows|Mac|Linux/.test(userAgent)) {
            // Desktop - just copy URL and show message
            navigator.clipboard.writeText(currentUrl);
            this.showToast('网址已复制，请在 Chrome 中打开', 'success');
            localStorage.setItem('chromeRecommendationDismissed', 'true');
            const banner = document.querySelector('.browser-recommendation');
            if (banner) {
                banner.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => banner.remove(), 300);
            }
        }

        if (chromeScheme) {
            window.location.href = chromeScheme;
        }

        // Mark as shown
        localStorage.setItem('chromeRecommendationShown', 'true');
    }
}

// Add shake animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-5px); }
        40%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
