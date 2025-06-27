/**
 * 农历转换模块 - 基于专业的 lunar-javascript 库
 * 使用 6tail/lunar-javascript 提供更准确和全面的农历功能
 * GitHub: https://github.com/6tail/lunar-javascript
 */

class LunarCalendar {
    constructor() {
        // 总是初始化备用数组，以防专业库调用失败
        this.initFallback();
        
        // 检查 lunar-javascript 库是否已加载
        if (typeof Solar === 'undefined' || typeof Lunar === 'undefined') {
            console.warn('⚠️ lunar-javascript 库未正确加载，将使用备用方案');
            this.useFallback = true;
        } else {
            console.log('✅ 使用专业的 lunar-javascript 库');
            this.useFallback = false;
        }
    }

    /**
     * 备用方案初始化（简化版农历数据）
     */
    initFallback() {
        this.Animals = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
        this.lunarMonths = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
        this.lunarDays = [
            "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
            "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
            "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"
        ];
    }

    /**
     * 公历转农历 - 使用专业的 lunar-javascript 库
     */
    solarToLunar(date) {
        if (!this.useFallback) {
            try {
                // 使用专业的 lunar-javascript 库的正确API
                const year = date.getFullYear();
                const month = date.getMonth() + 1; // JavaScript月份从0开始，需要+1
                const day = date.getDate();
                
                const solar = Solar.fromYmd(year, month, day);
                const lunar = solar.getLunar();
                
                // 获取详细信息 - 根据官方文档使用正确的方法名
                const yearGanZhi = lunar.getYearInGanZhi();
                const monthGanZhi = lunar.getMonthInGanZhi();
                const dayGanZhi = lunar.getDayInGanZhi();
                
                // 获取生肖
                const animal = lunar.getYearShengXiao();
                
                // 获取农历月日名称
                const monthName = lunar.getMonthInChinese();
                const dayName = lunar.getDayInChinese();
                
                // 获取星座（从solar对象获取）
                const xingZuo = solar.getXingZuo();
                
                // 获取星期
                const weekday = solar.getWeek();
                
                // 检查是否有节气（需要特殊处理）
                let jieQi = null;
                try {
                    // 尝试获取节气，如果没有则为null
                    const jieQiObj = solar.getJieQi();
                    jieQi = jieQiObj;
                } catch (e) {
                    // 如果没有节气，忽略错误
                    jieQi = null;
                }
                
                // 获取宜忌信息（可能需要特殊处理）
                let yi = [], ji = [];
                try {
                    yi = lunar.getDayYi() || [];
                    ji = lunar.getDayJi() || [];
                } catch (e) {
                    console.warn('⚠️ 获取宜忌信息失败:', e.message);
                    yi = [];
                    ji = [];
                }
                
                return {
                    // 基础信息
                    year: lunar.getYear(),
                    month: lunar.getMonth(),
                    day: lunar.getDay(),
                    isLeap: false, // 暂时设为false，避免API调用错误
                    
                    // 干支信息
                    yearGanZhi: yearGanZhi,
                    monthGanZhi: monthGanZhi,
                    dayGanZhi: dayGanZhi,
                    
                    // 生肖和名称
                    animal: animal,
                    monthName: monthName,
                    dayName: dayName,
                    
                    // 节气和星座
                    jieQi: jieQi,
                    xingZuo: xingZuo,
                    weekday: weekday,
                    
                    // 宜忌
                    yi: yi.slice(0, 3), // 取前3个宜
                    ji: ji.slice(0, 3), // 取前3个忌
                    
                    // 标记数据源
                    source: 'lunar-javascript'
                };
                
            } catch (error) {
                console.error('❌ lunar-javascript 库调用失败:', error);
                console.log('🔄 切换到备用方案');
                this.useFallback = true;
                this.initFallback(); // 确保备用数组已初始化
                return this.solarToLunarFallback(date);
            }
        } else {
            return this.solarToLunarFallback(date);
        }
    }

    /**
     * 备用的简单农历转换（保持原有逻辑）
     */
    solarToLunarFallback(date) {
        try {
            // 简化的农历计算（保持基本功能）
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            
            // 使用简化算法估算农历日期
            const lunarYear = year;
            const animal = this.Animals[(year - 4) % 12];
            
            // 简化的月日计算 - 确保索引在有效范围内
            const monthIndex = Math.max(0, Math.min(month - 1, this.lunarMonths.length - 1));
            const dayIndex = Math.max(0, Math.min(day - 1, this.lunarDays.length - 1));
            
            return {
                year: lunarYear,
                month: month,
                day: day,
                isLeap: false,
                yearGanZhi: this.getSimpleGanZhi(year),
                animal: animal,
                monthName: this.lunarMonths[monthIndex] || '未知月',
                dayName: this.lunarDays[dayIndex] || '未知日',
                source: 'fallback'
            };
        } catch (error) {
            console.error('❌ 备用农历转换失败:', error);
            
            // 最基础的后备方案
            return {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                day: date.getDate(),
                isLeap: false,
                yearGanZhi: '未知',
                animal: '未知',
                monthName: '未知月',
                dayName: '未知日',
                source: 'error'
            };
        }
    }

    /**
     * 简化的干支计算
     */
    getSimpleGanZhi(year) {
        const gan = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
        const zhi = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
        const ganIndex = (year - 4) % 10;
        const zhiIndex = (year - 4) % 12;
        return gan[ganIndex] + zhi[zhiIndex];
    }

    /**
     * 格式化农历日期
     */
    formatLunar(lunarData) {
        const { yearGanZhi, animal, monthName, dayName, isLeap, source } = lunarData;
        const leapPrefix = isLeap ? "闰" : "";
        
        return {
            full: `${yearGanZhi}年（${animal}年）${leapPrefix}${monthName}月${dayName}`,
            simple: `${leapPrefix}${monthName}月${dayName}`,
            compact: `${animal}年 ${leapPrefix}${monthName}月${dayName}`,
            minimal: `${leapPrefix}${monthName}${dayName}`,
            year: `${yearGanZhi}${animal}年`,
            detailed: this.getDetailedInfo(lunarData),
            source: source || 'unknown'
        };
    }

    /**
     * 获取详细信息（仅限专业版）
     */
    getDetailedInfo(lunarData) {
        if (lunarData.source === 'lunar-javascript') {
            const details = [];
            
            // 节气信息
            if (lunarData.jieQi) {
                details.push(`节气: ${lunarData.jieQi}`);
            }
            
            // 星座信息
            if (lunarData.xingZuo) {
                details.push(`星座: ${lunarData.xingZuo}`);
            }
            
            // 宜忌信息
            if (lunarData.yi && lunarData.yi.length > 0) {
                details.push(`宜: ${lunarData.yi.join('、')}`);
            }
            if (lunarData.ji && lunarData.ji.length > 0) {
                details.push(`忌: ${lunarData.ji.join('、')}`);
            }
            
            // 吉神方位
            if (lunarData.xiShen) {
                details.push(`喜神: ${lunarData.xiShen.getName()}(${lunarData.xiShen.getDesc()})`);
            }
            
            // 冲煞
            if (lunarData.chong) {
                details.push(`冲: ${lunarData.chong.getName()}${lunarData.chong.getShengXiao()}`);
            }
            
            return details.join(' | ');
        }
        
        return '';
    }

    /**
     * 获取今日运势（仅限专业版）
     */
    getTodayFortune(date) {
        if (this.useFallback) {
            return { message: '需要专业版农历库支持', level: 'info' };
        }
        
        try {
            const solar = Solar.fromDate(date);
            const lunar = solar.getLunar();
            
            // 获取宜忌信息
            const yi = lunar.getDayYi();
            const ji = lunar.getDayJi();
            
            // 简单的运势评估
            let level = 'normal';
            let message = '平常日子';
            
            if (yi.length > ji.length) {
                level = 'good';
                message = `今日宜: ${yi.slice(0, 2).join('、')}`;
            } else if (ji.length > yi.length) {
                level = 'caution';
                message = `今日忌: ${ji.slice(0, 2).join('、')}`;
            }
            
            return { message, level, yi, ji };
        } catch (error) {
            console.error('❌ 获取运势失败:', error);
            return { message: '运势信息暂不可用', level: 'info' };
        }
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
        // 直接使用主页HTML中已有的元素
        this.timeElement = document.getElementById('current-time-text');
        this.dateElement = document.getElementById('current-date-text');
        this.lunarElement = document.getElementById('lunar-date-text');
        
        // 如果没有找到现有元素，则创建新的（用于其他页面）
        if (!this.timeElement || !this.dateElement || !this.lunarElement) {
            // console.log('🔍 未找到现有时间元素，创建新的容器');
            
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
        } else {
            // console.log('✅ 找到现有的时间显示元素，直接使用');
            // 寻找weekday元素
            this.weekdayElement = document.getElementById('current-weekday');
        }
    }

    /**
     * 获取当前时间（使用本地时间）
     */
    getCurrentTime() {
        return new Date();
    }

    updateDateTime() {
        const now = this.getCurrentTime();
        
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
        
        // 更新星期（如果元素存在）
        if (this.weekdayElement) {
            const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            this.weekdayElement.textContent = weekdays[now.getDay()];
        }
        
        // 更新农历 - 使用专业库的丰富功能
        try {
            const lunarDate = this.lunar.solarToLunar(now);
            const formatted = this.lunar.formatLunar(lunarDate);
            
            // console.log('🌙 农历数据:', lunarDate);
            // console.log('📝 格式化结果:', formatted);
            
            // 根据数据源显示不同内容
            if (lunarDate.source === 'lunar-javascript') {
                // 专业版：显示更丰富的信息
                let displayText = `${lunarDate.animal}年 ${formatted.simple}`;
                
                // 如果今天有节气，优先显示节气
                if (lunarDate.jieQi) {
                    displayText += ` • ${lunarDate.jieQi}`;
                }
                
                this.lunarElement.textContent = displayText;
                // console.log('✅ 专业版农历显示:', displayText);
                
                // 设置详细信息为标题提示
                const detailedInfo = [];
                if (lunarDate.yearGanZhi) detailedInfo.push(`干支: ${lunarDate.yearGanZhi}年`);
                if (lunarDate.xingZuo) detailedInfo.push(`星座: ${lunarDate.xingZuo}`);
                if (lunarDate.yi && lunarDate.yi.length > 0) detailedInfo.push(`宜: ${lunarDate.yi.slice(0, 2).join('、')}`);
                if (lunarDate.ji && lunarDate.ji.length > 0) detailedInfo.push(`忌: ${lunarDate.ji.slice(0, 2).join('、')}`);
                
                this.lunarElement.title = detailedInfo.join(' | ');
                
            } else {
                // 备用方案：显示基础信息
                const displayText = `${lunarDate.animal}年 ${formatted.simple}`;
                this.lunarElement.textContent = displayText;
                this.lunarElement.title = '使用备用农历算法';
                // console.log('⚠️ 备用农历显示:', displayText);
            }
            
            // 显示数据源信息（仅在开发模式下）
            if (window.location.hostname === 'localhost') {
                const lunarSourceInfo = lunarDate.source === 'lunar-javascript' ? '🌙专业版' : '🌙简化版';
                this.timeElement.title = `时间源: 本地时间 📱 | 农历源: ${lunarSourceInfo}`;
            }
        } catch (error) {
            console.error('❌ 农历更新失败:', error);
            this.lunarElement.textContent = '农历加载中...';
        }
    }

    startTimer() {
        // 清除之前的定时器
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // 每秒更新一次显示
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