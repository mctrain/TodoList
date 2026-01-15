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

        // Initial render
        this.renderCalendar();
        this.render();
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

        if (!SpeechRecognition) {
            this.voiceBtn.style.display = 'none';
            return;
        }

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

            if (event.error !== 'no-speech') {
                this.showToast('语音识别失败，请重试', 'error');
            }
        };
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
