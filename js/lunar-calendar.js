/**
 * 农历转换模块
 * 包含公历转农历的算法和日期时间显示功能
 */

class LunarCalendar {
    constructor() {
        // 农历数据：1900-2100年
        this.lunarInfo = [
            0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
            0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
            0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
            0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
            0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
            0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
            0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
            0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
            0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
            0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
            0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
            0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
            0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
            0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
            0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
            0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
            0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
            0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
            0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
            0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
            0x0d520
        ];

        // 天干
        this.Gan = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
        
        // 地支
        this.Zhi = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
        
        // 生肖
        this.Animals = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
        
        // 农历月份名称
        this.lunarMonths = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
        
        // 农历日期名称
        this.lunarDays = [
            "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
            "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
            "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"
        ];

        // 二十四节气
        this.solarTerms = [
            "小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨",
            "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑",
            "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"
        ];
    }

    /**
     * 获取农历年份信息
     */
    lunarYearInfo(year) {
        return this.lunarInfo[year - 1900];
    }

    /**
     * 获取农历年份天数
     */
    lunarYearDays(year) {
        let sum = 348;
        for (let i = 0x8000; i > 0x8; i >>= 1) {
            sum += (this.lunarYearInfo(year) & i) ? 1 : 0;
        }
        return sum + this.leapDays(year);
    }

    /**
     * 获取农历闰月天数
     */
    leapDays(year) {
        if (this.leapMonth(year)) {
            return (this.lunarYearInfo(year) & 0x10000) ? 30 : 29;
        }
        return 0;
    }

    /**
     * 获取农历闰月月份
     */
    leapMonth(year) {
        return this.lunarYearInfo(year) & 0xf;
    }

    /**
     * 获取农历月份天数
     */
    monthDays(year, month) {
        return (this.lunarYearInfo(year) & (0x10000 >> month)) ? 30 : 29;
    }

    /**
     * 公历转农历
     */
    solarToLunar(date) {
        const baseDate = new Date(1900, 0, 31);
        let offset = Math.floor((date - baseDate) / 86400000);
        
        let lunarYear = 1900;
        let temp = 0;
        
        // 计算农历年份
        while (lunarYear < 2100 && offset >= (temp = this.lunarYearDays(lunarYear))) {
            offset -= temp;
            lunarYear++;
        }
        
        let lunarMonth = 1;
        let leap = this.leapMonth(lunarYear);
        let isLeap = false;
        
        // 计算农历月份
        while (lunarMonth <= 12) {
            // 处理闰月
            if (leap === lunarMonth && !isLeap) {
                temp = this.leapDays(lunarYear);
                if (offset < temp) {
                    isLeap = true;
                    break;
                } else {
                    offset -= temp;
                }
            }
            
            temp = this.monthDays(lunarYear, lunarMonth);
            if (offset < temp) {
                break;
            }
            offset -= temp;
            lunarMonth++;
        }
        
        const lunarDay = offset + 1;
        
        // 确保索引在有效范围内
        const monthIndex = Math.max(0, Math.min(lunarMonth - 1, this.lunarMonths.length - 1));
        const dayIndex = Math.max(0, Math.min(lunarDay - 1, this.lunarDays.length - 1));
        
        return {
            year: lunarYear,
            month: lunarMonth,
            day: lunarDay,
            isLeap: isLeap,
            yearGanZhi: this.getYearGanZhi(lunarYear),
            animal: this.Animals[(lunarYear - 4) % 12],
            monthName: this.lunarMonths[monthIndex],
            dayName: this.lunarDays[dayIndex]
        };
    }

    /**
     * 获取干支年
     */
    getYearGanZhi(year) {
        const ganIndex = (year - 4) % 10;
        const zhiIndex = (year - 4) % 12;
        return this.Gan[ganIndex] + this.Zhi[zhiIndex];
    }

    /**
     * 格式化农历日期
     */
    formatLunar(lunarDate) {
        const { year, monthName, dayName, isLeap, yearGanZhi, animal } = lunarDate;
        const leapPrefix = isLeap ? "闰" : "";
        return {
            full: `${yearGanZhi}年（${animal}年）${leapPrefix}${monthName}月${dayName}`,
            simple: `${leapPrefix}${monthName}月${dayName}`,
            compact: `${animal}年 ${leapPrefix}${monthName}月${dayName}`,
            minimal: `${leapPrefix}${monthName}${dayName}`,
            year: `${yearGanZhi}${animal}年`
        };
    }
}

class DateTimeDisplay {
    constructor() {
        this.lunar = new LunarCalendar();
        this.timeElement = null;
        this.dateElement = null;
        this.lunarElement = null;
        this.timer = null;
        
        this.init();
    }

    init() {
        this.createElements();
        this.updateDateTime();
        this.startTimer();
    }

    createElements() {
        // 查找或创建日期时间容器
        let container = document.querySelector('.datetime-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'datetime-container fade-in-text delay-2';
            
            // 将容器插入到一言之后
            const hitokoto = document.querySelector('.hitokoto');
            if (hitokoto) {
                hitokoto.parentNode.insertBefore(container, hitokoto.nextSibling);
            } else {
                // 如果找不到一言，插入到主容器中
                const app = document.getElementById('app');
                const menu = document.querySelector('.menu');
                if (menu) {
                    app.insertBefore(container, menu);
                } else {
                    app.appendChild(container);
                }
            }
        }

        container.innerHTML = `
            <div class="datetime-display">
                <div class="current-time">
                    <span id="current-time-text">00:00:00</span>
                </div>
                <div class="current-date">
                    <span id="current-date-text">2024年1月1日</span>
                    <span class="weekday" id="current-weekday">星期一</span>
                </div>
                <div class="lunar-date">
                    <span id="lunar-date-text">甲辰龙年 正月初一</span>
                </div>
            </div>
        `;

        this.timeElement = document.getElementById('current-time-text');
        this.dateElement = document.getElementById('current-date-text');
        this.weekdayElement = document.getElementById('current-weekday');
        this.lunarElement = document.getElementById('lunar-date-text');
    }

    updateDateTime() {
        const now = new Date();
        
        // 更新时间
        const timeStr = now.toLocaleTimeString('zh-CN', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        this.timeElement.textContent = timeStr;
        
        // 更新日期
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const dateStr = `${year}年${month}月${day}日`;
        this.dateElement.textContent = dateStr;
        
        // 更新星期
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        this.weekdayElement.textContent = weekdays[now.getDay()];
        
        // 更新农历 - 使用紧凑格式
        const lunarDate = this.lunar.solarToLunar(now);
        const formatted = this.lunar.formatLunar(lunarDate);
        // 使用更紧凑的显示格式：只显示生肖年 + 农历月日
        this.lunarElement.textContent = `${lunarDate.animal}年 ${formatted.simple}`;
    }

    startTimer() {
        // 清除之前的定时器
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // 每秒更新一次
        this.timer = setInterval(() => {
            this.updateDateTime();
        }, 1000);
    }

    destroy() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        const container = document.querySelector('.datetime-container');
        if (container) {
            container.remove();
        }
    }
}

// 导出类供其他模块使用
window.LunarCalendar = LunarCalendar;
window.DateTimeDisplay = DateTimeDisplay; 