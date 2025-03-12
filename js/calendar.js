// 使用立即执行函数表达式(IIFE)来避免全局作用域污染
(function() {
    // 常量定义
    const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
    const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', 
                   '七月', '八月', '九月', '十月', '十一月', '十二月'];
    
    // 2025年节假日数据（已校对农历日期）
    const HOLIDAYS = {
        '2025-01-01': '元旦',
        '2025-02-08': '除夕',  // 农历腊月三十
        '2025-02-09': '春节',  // 农历正月初一
        '2025-02-10': '春节',  // 农历正月初二
        '2025-02-11': '春节',  // 农历正月初三
        '2025-02-12': '春节',  // 农历正月初四
        '2025-02-13': '春节',  // 农历正月初五
        '2025-02-14': '春节',  // 农历正月初六
        '2025-02-15': '春节',  // 农历正月初七
        '2025-04-05': '清明节',
        '2025-05-01': '劳动节',
        '2025-05-02': '劳动节',
        '2025-05-03': '劳动节',
        '2025-06-14': '端午节',  // 农历五月初八
        '2025-09-21': '中秋节',  // 农历八月十七
        '2025-10-01': '国庆节',
        '2025-10-02': '国庆节',
        '2025-10-03': '国庆节',
        '2025-10-04': '国庆节',
        '2025-10-05': '国庆节',
        '2025-10-06': '国庆节',
        '2025-10-07': '国庆节'
    };

    // 其他重要节日
    const OTHER_HOLIDAYS = {
        '2025-02-14': '情人节',
        '2025-03-08': '妇女节',
        '2025-03-12': '植树节',
        '2025-04-01': '愚人节',
        '2025-05-04': '青年节',
        '2025-06-01': '儿童节',
        '2025-09-10': '教师节',
        '2025-10-31': '万圣节',
        '2025-12-25': '圣诞节'
    };

    // 日程管理
    const scheduleManager = {
        // 从 localStorage 获取日程数据
        getSchedules() {
            const schedules = localStorage.getItem('calendar_schedules');
            return schedules ? JSON.parse(schedules) : {};
        },

        // 保存日程数据到 localStorage
        saveSchedules(schedules) {
            localStorage.setItem('calendar_schedules', JSON.stringify(schedules));
        },

        // 添加日程
        addSchedule(date, content) {
            const schedules = this.getSchedules();
            if (!schedules[date]) {
                schedules[date] = [];
            }
            schedules[date].push({
                id: Date.now(),
                content: content
            });
            this.saveSchedules(schedules);
        },

        // 删除日程
        deleteSchedule(date, scheduleId) {
            const schedules = this.getSchedules();
            if (schedules[date]) {
                schedules[date] = schedules[date].filter(s => s.id !== scheduleId);
                if (schedules[date].length === 0) {
                    delete schedules[date];
                }
                this.saveSchedules(schedules);
            }
        },

        // 获取指定日期的日程
        getSchedulesByDate(date) {
            const schedules = this.getSchedules();
            return schedules[date] || [];
        }
    };

    // 工具函数：获取指定年月的天数
    function getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    // 工具函数：获取指定日期的星期几（0-6）
    function getWeekday(year, month, day) {
        return new Date(year, month, day).getDay();
    }

    // 工具函数：格式化日期为 YYYY-MM-DD
    function formatDate(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    // 创建日程输入框
    function createScheduleInput(dateStr, dateCell, isDetail = false) {
        // 移除所有其他的日程输入框
        document.querySelectorAll('.schedule-input').forEach(input => input.remove());

        const inputContainer = document.createElement('div');
        inputContainer.className = 'schedule-input';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '输入日程内容';

        const addButton = document.createElement('button');
        addButton.textContent = '添加';
        addButton.onclick = () => {
            const content = input.value.trim();
            if (content) {
                scheduleManager.addSchedule(dateStr, content);
                updateScheduleDisplay(dateStr, dateCell);
                inputContainer.remove();
            }
        };

        const cancelButton = document.createElement('button');
        cancelButton.textContent = '取消';
        cancelButton.className = 'cancel';
        cancelButton.onclick = () => inputContainer.remove();

        inputContainer.appendChild(input);
        inputContainer.appendChild(addButton);
        inputContainer.appendChild(cancelButton);
        dateCell.appendChild(inputContainer);
        inputContainer.classList.add('active');
        input.focus();

        // 点击其他地方关闭输入框
        function handleClickOutside(e) {
            if (!inputContainer.contains(e.target) && e.target !== dateCell) {
                inputContainer.remove();
                document.removeEventListener('click', handleClickOutside);
            }
        }
        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 0);
    }

    // 更新日程显示
    function updateScheduleDisplay(dateStr, dateCell) {
        let scheduleList = dateCell.querySelector('.schedule-list');
        if (!scheduleList) {
            scheduleList = document.createElement('div');
            scheduleList.className = 'schedule-list';
            dateCell.appendChild(scheduleList);
        }

        const schedules = scheduleManager.getSchedulesByDate(dateStr);
        scheduleList.innerHTML = schedules.map(schedule => `
            <div class="schedule-item" data-id="${schedule.id}">
                ${schedule.content}
                <span class="delete-schedule">&times;</span>
            </div>
        `).join('');

        // 添加删除事件监听
        scheduleList.querySelectorAll('.delete-schedule').forEach(deleteBtn => {
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                const scheduleItem = deleteBtn.parentElement;
                const scheduleId = parseInt(scheduleItem.dataset.id);
                scheduleManager.deleteSchedule(dateStr, scheduleId);
                updateScheduleDisplay(dateStr, dateCell);
            };
        });
    }

    // 修改生成日期单元格的函数
    function generateDateCell(year, month, day, isDetail = false) {
        const dateCell = document.createElement('div');
        dateCell.className = 'date-cell';
        
        const dateStr = formatDate(year, month, day);
        const weekday = getWeekday(year, month, day);
        
        if (HOLIDAYS[dateStr] || OTHER_HOLIDAYS[dateStr] || weekday === 0 || weekday === 6) {
            dateCell.classList.add('holiday');
        }

        // 添加日期数字
        const dateNumber = document.createElement('div');
        dateNumber.className = 'date-number';
        dateNumber.textContent = day;
        dateCell.appendChild(dateNumber);

        // 添加农历日期
        const lunarDate = document.createElement('div');
        lunarDate.className = 'lunar-date';
        const lunarInfo = window.LunarCalendar.solarToLunar(year, month + 1, day);
        if (lunarInfo.lunarDayName === '初一') {
            lunarDate.textContent = lunarInfo.lunarMonthName;
            lunarDate.classList.add('lunar-month');
        } else {
            lunarDate.textContent = lunarInfo.lunarDayName;
        }
        dateCell.appendChild(lunarDate);

        // 添加节假日名称
        if (HOLIDAYS[dateStr] || OTHER_HOLIDAYS[dateStr]) {
            const holidayName = document.createElement('div');
            holidayName.className = 'holiday-name';
            holidayName.textContent = HOLIDAYS[dateStr] || OTHER_HOLIDAYS[dateStr];
            dateCell.appendChild(holidayName);
        }

        // 添加日程显示
        updateScheduleDisplay(dateStr, dateCell);

        // 添加点击事件以添加日程
        dateCell.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
            createScheduleInput(dateStr, dateCell, isDetail);
        });

        return dateCell;
    }

    // 修改生成月份卡片的函数
    function generateMonthCard(year, month) {
        const monthCard = document.createElement('div');
        monthCard.className = 'month-card';
        monthCard.setAttribute('data-month', month);
        monthCard.id = `month-${month + 1}`;

        const monthTitle = document.createElement('h3');
        monthTitle.textContent = MONTHS[month];
        monthCard.appendChild(monthTitle);

        const calendarGrid = document.createElement('div');
        calendarGrid.className = 'calendar-grid';

        // 添加星期标题
        WEEKDAYS.forEach(weekday => {
            const weekdayCell = document.createElement('div');
            weekdayCell.className = 'weekday';
            weekdayCell.textContent = weekday;
            calendarGrid.appendChild(weekdayCell);
        });

        const daysInMonth = getDaysInMonth(year, month);
        const firstWeekday = getWeekday(year, month, 1);

        // 添加空白单元格
        for (let i = 0; i < firstWeekday; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'date-cell';
            calendarGrid.appendChild(emptyCell);
        }

        // 添加日期单元格
        for (let day = 1; day <= daysInMonth; day++) {
            const dateCell = generateDateCell(year, month, day);
            calendarGrid.appendChild(dateCell);
        }

        monthCard.appendChild(calendarGrid);
        return monthCard;
    }

    // 修改显示月份详情的函数
    function showMonthDetail(year, month) {
        const modal = document.querySelector('.month-modal');
        const modalContent = modal.querySelector('.month-modal-content');
        const monthCalendar = document.createElement('div');
        monthCalendar.className = 'month-calendar';

        // 设置月份标题
        const monthTitle = document.querySelector('.month-title');
        monthTitle.textContent = `${year}年 ${MONTHS[month]}`;

        // 生成详细日历
        const calendarGrid = document.createElement('div');
        calendarGrid.className = 'calendar-grid';

        // 添加星期标题
        WEEKDAYS.forEach(weekday => {
            const weekdayCell = document.createElement('div');
            weekdayCell.className = 'weekday';
            weekdayCell.textContent = weekday;
            calendarGrid.appendChild(weekdayCell);
        });

        const daysInMonth = getDaysInMonth(year, month);
        const firstWeekday = getWeekday(year, month, 1);

        // 添加空白单元格
        for (let i = 0; i < firstWeekday; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'date-cell';
            calendarGrid.appendChild(emptyCell);
        }

        // 添加日期单元格
        for (let day = 1; day <= daysInMonth; day++) {
            const dateCell = generateDateCell(year, month, day, true);
            calendarGrid.appendChild(dateCell);
        }

        monthCalendar.appendChild(calendarGrid);
        
        // 清空之前的内容
        const existingCalendar = modalContent.querySelector('.month-calendar');
        if (existingCalendar) {
            existingCalendar.remove();
        }
        
        modalContent.appendChild(monthCalendar);
        modal.style.display = 'flex';
    }

    // 初始化日历
    function initCalendar() {
        const year = 2025;
        const calendarContainer = document.querySelector('.calendar-container');
        
        // 生成所有月份卡片
        for (let month = 0; month < 12; month++) {
            const monthCard = generateMonthCard(year, month);
            calendarContainer.appendChild(monthCard);
        }

        // 添加月份卡片点击事件
        document.querySelectorAll('.month-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const month = parseInt(card.getAttribute('data-month'));
                showMonthDetail(year, month);
            });
        });

        // 添加关闭按钮事件
        const closeBtn = document.querySelector('.close-btn');
        const modal = document.querySelector('.month-modal');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // 点击模态框外部关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // 添加月份导航点击事件
        document.querySelectorAll('.month-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const month = parseInt(link.getAttribute('data-month'));
                showMonthDetail(year, month);
                
                // 更新导航栏活动状态
                document.querySelectorAll('.month-nav a').forEach(a => {
                    a.classList.remove('active');
                });
                link.classList.add('active');
            });
        });
    }

    // 页面加载完成后初始化日历
    document.addEventListener('DOMContentLoaded', initCalendar);

    // 分享到小红书
    window.shareToXiaohongshu = async function() {
        try {
            // 生成预览图
            const calendar = document.querySelector('.calendar-container');
            const canvas = await html2canvas(calendar, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false
            });

            // 创建预览模态框
            let previewModal = document.querySelector('.preview-modal');
            if (!previewModal) {
                previewModal = document.createElement('div');
                previewModal.className = 'preview-modal';
                document.body.appendChild(previewModal);
            }

            previewModal.innerHTML = `
                <div class="preview-content">
                    <img src="${canvas.toDataURL('image/png')}" style="max-width: 100%;">
                    <div class="preview-actions">
                        <button class="save-btn" onclick="downloadImage()">
                            <i class="fas fa-download"></i> 保存图片
                        </button>
                        <button class="share-btn" onclick="copyShareText()">
                            <i class="fas fa-copy"></i> 复制文案
                        </button>
                    </div>
                </div>
            `;

            previewModal.style.display = 'flex';
            previewModal.onclick = (e) => {
                if (e.target === previewModal) {
                    previewModal.style.display = 'none';
                }
            };
        } catch (error) {
            console.error('生成预览图失败:', error);
            alert('生成预览图失败，请稍后重试');
        }
    };

    // 下载图片
    window.downloadImage = function() {
        const img = document.querySelector('.preview-content img');
        const link = document.createElement('a');
        link.download = '2025年日历.png';
        link.href = img.src;
        link.click();
    };

    // 复制分享文案
    window.copyShareText = function() {
        const shareText = `
📅 2025年中国日历
✨ 功能特点：
🌙 农历+节假日显示
📝 支持添加日程提醒
🎨 清新界面设计
🔗 在线访问：https://MarkNelson1012.github.io/calendar-2025

快来试试这个超实用的日历吧！
        `.trim();

        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText)
                .then(() => alert('文案已复制到剪贴板'))
                .catch(() => alert('复制失败，请手动复制'));
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = shareText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('文案已复制到剪贴板');
        }
    };

    // 保存为图片
    window.saveAsImage = async function() {
        try {
            const calendar = document.querySelector('.calendar-container');
            const canvas = await html2canvas(calendar, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false
            });

            const link = document.createElement('a');
            link.download = '2025年日历.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('保存图片失败:', error);
            alert('保存图片失败，请稍后重试');
        }
    };
})(); 