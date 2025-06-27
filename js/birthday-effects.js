/**
 * 生日彩蛋效果管理器
 * 检测特殊日期并触发相应的庆祝效果
 */
class BirthdayEasterEgg {
    constructor() {
        this.config = CONFIG.BIRTHDAY;
        this.effectsContainer = null;
        this.isActive = false;
        this.checkTimer = null;
        this.lunar = null;
        this.lastCheckedDate = null;
        this.audioContext = null;
        this.currentAudio = null; // 当前播放的音频对象
        
        // 初始化农历计算器
        try {
            this.lunar = new LunarCalendar();
            console.log('✅ 农历计算器初始化成功');
        } catch (error) {
            console.warn('⚠️ 农历计算器初始化失败:', error);
        }
        
        // 绑定方法
        this.init = this.init.bind(this);
        this.checkBirthday = this.checkBirthday.bind(this);
        this.triggerEffects = this.triggerEffects.bind(this);
    }

    // 初始化生日彩蛋系统
    init() {
        if (!this.config.ENABLED) {
            console.log('🚫 生日彩蛋功能已禁用');
            return;
        }

        this.createEffectsContainer();
        this.startAutoCheck();
        
        // 立即检查一次
        this.checkBirthday();
        
        console.log('🎂 生日彩蛋系统已启动');
        console.log('📅 公历生日:', this.config.SOLAR_DATES);
        console.log('🌙 农历生日:', this.config.LUNAR_DATES);
    }

    // 开始自动检测
    startAutoCheck() {
        // 清除现有定时器
        if (this.checkTimer) {
            clearInterval(this.checkTimer);
        }

        // 设置定时检查
        this.checkTimer = setInterval(() => {
            this.checkBirthday();
        }, this.config.CHECK_INTERVAL);

        console.log(`⏰ 生日自动检测已启动，每${this.config.CHECK_INTERVAL / 1000 / 60}分钟检查一次`);
    }

    // 创建特效容器
    createEffectsContainer() {
        if (this.effectsContainer) return;

        this.effectsContainer = document.createElement('div');
        this.effectsContainer.className = 'birthday-effects-container';
        this.effectsContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 9999;
            overflow: hidden;
        `;
        document.body.appendChild(this.effectsContainer);
    }

    // 检查今天是否是生日
    checkBirthday() {
        const today = new Date();
        const todayString = this.formatDate(today);
        
        // 避免重复检查同一天
        if (this.lastCheckedDate === todayString) {
            return;
        }
        this.lastCheckedDate = todayString;

        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const solarDateStr = `${month}-${day}`;

        console.log(`🗓️ 检查日期: ${todayString} (公历: ${solarDateStr})`);

        // 检查公历生日
        let isBirthday = false;
        let birthdayType = '';

        if (this.config.SOLAR_DATES && this.config.SOLAR_DATES.includes(solarDateStr)) {
            isBirthday = true;
            birthdayType = '公历';
            console.log('🎉 检测到公历生日！');
        }

        // 检查农历生日
        if (!isBirthday && this.config.LUNAR_DATES && this.config.LUNAR_DATES.length > 0 && this.lunar) {
            const lunarDate = this.getLunarDate(today);
            if (lunarDate) {
                const lunarMonth = String(lunarDate.month).padStart(2, '0');
                const lunarDay = String(lunarDate.day).padStart(2, '0');
                const lunarDateStr = `${lunarMonth}-${lunarDay}`;
                
                console.log(`🌙 今日农历: ${lunarDateStr} (${lunarDate.monthName}月${lunarDate.dayName})`);
                
                if (this.config.LUNAR_DATES.includes(lunarDateStr)) {
                    isBirthday = true;
                    birthdayType = '农历';
                    console.log('🎉 检测到农历生日！');
                }
            }
        }

        // 触发生日彩蛋
        if (isBirthday) {
            console.log(`🎂 触发${birthdayType}生日彩蛋！`);
            this.triggerEffects(birthdayType);
        }
    }

    // 获取农历日期
    getLunarDate(date) {
        if (!this.lunar) return null;
        
        try {
            const lunarData = this.lunar.solarToLunar(date);
            return lunarData;
        } catch (error) {
            console.warn('⚠️ 获取农历日期失败:', error);
            return null;
        }
    }

    // 格式化日期为字符串
    formatDate(date) {
        return date.getFullYear() + '-' + 
               String(date.getMonth() + 1).padStart(2, '0') + '-' + 
               String(date.getDate()).padStart(2, '0');
    }

    // 触发所有生日效果
    async triggerEffects(birthdayType = '') {
        if (this.isActive) return;
        this.isActive = true;

        try {
            // 显示生日祝福消息
            if (this.config.EFFECTS.BIRTHDAY_MESSAGE) {
                this.showBirthdayMessage(birthdayType);
            }

            // 等待一秒后开始特效
            await this.delay(1000);

            // 启动烟花效果
            if (this.config.EFFECTS.FIREWORKS) {
                this.startFireworks();
            }

            // 启动彩纸效果
            if (this.config.EFFECTS.CONFETTI) {
                this.startConfetti();
            }

            // 应用特殊主题
            if (this.config.EFFECTS.SPECIAL_THEME) {
                this.applySpecialTheme();
            }

            // 播放生日音乐（可选）
            if (this.config.EFFECTS.BIRTHDAY_MUSIC) {
                this.playBirthdayMusic();
            }

        } catch (error) {
            console.error('生日彩蛋效果出错:', error);
        }
    }

    // 显示生日祝福消息
    showBirthdayMessage(birthdayType = '') {
        const messages = this.config.MESSAGES;
        let selectedMessages = messages;
        
        // 根据生日类型选择合适的祝福消息
        if (birthdayType === '农历') {
            const lunarMessages = messages.filter(msg => 
                msg.includes('农历') || msg.includes('老历法') || msg.includes('🌙') || msg.includes('🏮')
            );
            if (lunarMessages.length > 0) {
                selectedMessages = [...lunarMessages, ...messages.slice(0, 3)]; // 农历消息 + 通用消息
            }
        }
        
        const randomMessage = selectedMessages[Math.floor(Math.random() * selectedMessages.length)];
        
        const messageElement = document.createElement('div');
        messageElement.className = 'birthday-cake-container';
        
        // 根据生日类型设置主题
        const isLunar = birthdayType === '农历';
        const themeClass = isLunar ? 'lunar-theme' : 'solar-theme';
        
        messageElement.innerHTML = `
            <!-- 背景模糊遮罩 -->
            <div class="birthday-backdrop"></div>
            
            <div class="birthday-cake-modern ${themeClass}">
                <!-- 现代简约蛋糕 -->
                <div class="modern-cake">
                    <!-- 蛋糕主体 -->
                    <div class="cake-main">
                        <!-- 顶层装饰 -->
                        <div class="cake-top-decoration">
                            <div class="birthday-number">🎂</div>
                            <div class="sparkles">
                                <span class="sparkle">✨</span>
                                <span class="sparkle">✨</span>
                                <span class="sparkle">✨</span>
                            </div>
                        </div>
                        
                        <!-- 蛋糕层 -->
                        <div class="cake-layer-main"></div>
                        <div class="cake-layer-base"></div>
                        
                        <!-- 装饰带 -->
                        <div class="decoration-ribbon"></div>
                        
                        <!-- 蛋糕底座 -->
                        <div class="cake-stand"></div>
                    </div>
                    
                    <!-- 周围装饰 -->
                    <div class="surrounding-decorations">
                        <div class="gift-box gift-1">🎁</div>
                        <div class="gift-box gift-2">🎀</div>
                        <div class="balloon balloon-1">🎈</div>
                        <div class="balloon balloon-2">🎈</div>
                        <div class="party-hat">🎩</div>
                        <div class="music-note">🎵</div>
                    </div>
                </div>
                
                <!-- 祝福消息卡片 -->
                <div class="birthday-card">
                    <div class="card-header">
                        <div class="card-icon">${isLunar ? '🌙' : '🎉'}</div>
                        <div class="card-title">${isLunar ? '农历生日快乐' : '生日快乐'}</div>
                    </div>
                    <div class="card-content">
                        <div class="birthday-message">${randomMessage}</div>
                        <div class="birthday-subtitle">${birthdayType ? `今天是你的${birthdayType}生日！` : '今天是特别的日子！'}</div>
                    </div>
                    <div class="card-decoration">
                        <div class="heart">💖</div>
                        <div class="star">⭐</div>
                        <div class="heart">💝</div>
                    </div>
                </div>
                
                <!-- 粒子效果 -->
                <div class="particle-effects">
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                </div>
            </div>
        `;
        
        messageElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 10000;
            pointer-events: auto;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            animation: backdropFadeIn 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        `;

        // 添加蛋糕样式
        this.addCakeStyles();
        
        messageElement.addEventListener('click', () => {
            this.hideBirthdayMessage(messageElement);
        });

        this.effectsContainer.appendChild(messageElement);

        // 自动隐藏
        setTimeout(() => {
            this.hideBirthdayMessage(messageElement);
        }, this.config.DURATION.MESSAGE);
    }

    // 添加蛋糕样式
    addCakeStyles() {
        if (document.getElementById('birthday-cake-styles')) return;

        const style = document.createElement('style');
        style.id = 'birthday-cake-styles';
        style.textContent = `
            .birthday-cake-container {
                font-family: 'Inter', sans-serif;
            }

            /* 背景模糊遮罩 */
            .birthday-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.4);
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                z-index: -1;
                animation: backdropBlurIn 0.8s ease-out forwards;
            }

            /* 农历主题的背景模糊 */
            .birthday-cake.lunar-theme ~ .birthday-backdrop {
                background: rgba(139, 69, 19, 0.2);
            }

            .birthday-cake-modern {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-width: 500px;
                min-height: 600px;
                padding: 50px;
                transform: scale(0);
                animation: modernCakeAppear 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.3s forwards;
            }

            /* 现代蛋糕容器 */
            .modern-cake {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                z-index: 2;
            }

            /* 蛋糕主体 */
            .cake-main {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                animation: gentleFloat 4s ease-in-out infinite;
            }

            /* 顶层装饰 */
            .cake-top-decoration {
                position: relative;
                margin-bottom: 15px;
                z-index: 5;
            }

            .birthday-number {
                font-size: 48px;
                animation: bounceScale 2s ease-in-out infinite;
                filter: drop-shadow(0 4px 12px rgba(255, 107, 107, 0.6));
            }

            .sparkles {
                position: absolute;
                top: -10px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 20px;
            }

            .sparkle {
                font-size: 20px;
                animation: sparkleRotate 3s linear infinite;
            }

            .sparkle:nth-child(1) { animation-delay: 0s; }
            .sparkle:nth-child(2) { animation-delay: 1s; }
            .sparkle:nth-child(3) { animation-delay: 2s; }

            /* 蛋糕层 */
            .cake-layer-main {
                width: 180px;
                height: 100px;
                background: linear-gradient(145deg, #ff6b9d 0%, #c44569 30%, #ff8a5c 60%, #ff6b6b 100%);
                border-radius: 20px;
                position: relative;
                box-shadow: 
                    0 25px 50px rgba(255, 107, 107, 0.4),
                    inset 0 1px 0 rgba(255, 255, 255, 0.4),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
                border: 4px solid rgba(255, 255, 255, 0.8);
                margin-bottom: -10px;
                z-index: 4;
            }

            .cake-layer-main::before {
                content: '';
                position: absolute;
                top: -6px;
                left: -6px;
                right: -6px;
                bottom: -6px;
                background: linear-gradient(145deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
                border-radius: 26px;
                z-index: -1;
            }

            .cake-layer-base {
                width: 240px;
                height: 120px;
                background: linear-gradient(145deg, #4ecdc4 0%, #44a08d 30%, #26d0ce 60%, #45b7d1 100%);
                border-radius: 25px;
                position: relative;
                box-shadow: 
                    0 30px 60px rgba(78, 205, 196, 0.4),
                    inset 0 1px 0 rgba(255, 255, 255, 0.4),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
                border: 4px solid rgba(255, 255, 255, 0.8);
                z-index: 3;
            }

            .cake-layer-base::before {
                content: '';
                position: absolute;
                top: -6px;
                left: -6px;
                right: -6px;
                bottom: -6px;
                background: linear-gradient(145deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
                border-radius: 31px;
                z-index: -1;
            }

            /* 装饰带 */
            .decoration-ribbon {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 200px;
                height: 8px;
                background: linear-gradient(90deg, #ffd700, #ff6b9d, #4ecdc4, #ffd700);
                background-size: 200% 100%;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                animation: ribbonShine 3s linear infinite;
                z-index: 6;
            }

            /* 蛋糕底座 */
            .cake-stand {
                width: 280px;
                height: 25px;
                background: linear-gradient(145deg, #9c27b0, #673ab7, #3f51b5);
                border-radius: 50%;
                margin-top: -5px;
                box-shadow: 
                    0 20px 40px rgba(156, 39, 176, 0.3),
                    inset 0 2px 4px rgba(255, 255, 255, 0.3);
                border: 3px solid rgba(255, 255, 255, 0.6);
                z-index: 2;
            }

            /* 周围装饰 */
            .surrounding-decorations {
                position: absolute;
                width: 100%;
                height: 100%;
                pointer-events: none;
            }

            .gift-box, .balloon, .party-hat, .music-note {
                position: absolute;
                font-size: 32px;
                animation: decorationFloat 4s ease-in-out infinite;
            }

            .gift-1 { top: 20%; left: 10%; animation-delay: 0s; }
            .gift-2 { top: 30%; right: 15%; animation-delay: 1s; }
            .balloon-1 { top: 60%; left: 5%; animation-delay: 2s; animation: balloonBob 3s ease-in-out infinite; }
            .balloon-2 { top: 70%; right: 10%; animation-delay: 0.5s; animation: balloonBob 3s ease-in-out infinite 1s; }
            .party-hat { top: 10%; right: 5%; animation-delay: 1.5s; }
            .music-note { top: 80%; left: 15%; animation-delay: 2.5s; animation: musicDance 2s ease-in-out infinite; }

            /* 农历主题样式 */
            .birthday-cake-modern.lunar-theme .cake-layer-main {
                background: linear-gradient(145deg, #d4af37 0%, #b8860b 30%, #ffd700 60%, #ffb347 100%);
                box-shadow: 0 25px 50px rgba(212, 175, 55, 0.4),
                           inset 0 1px 0 rgba(255, 255, 255, 0.4),
                           inset 0 -1px 0 rgba(0, 0, 0, 0.1);
            }

            .birthday-cake-modern.lunar-theme .cake-layer-base {
                background: linear-gradient(145deg, #cd853f 0%, #daa520 30%, #f4a460 60%, #deb887 100%);
                box-shadow: 0 30px 60px rgba(205, 133, 63, 0.4),
                           inset 0 1px 0 rgba(255, 255, 255, 0.4),
                           inset 0 -1px 0 rgba(0, 0, 0, 0.1);
            }

            .birthday-cake-modern.lunar-theme .decoration-ribbon {
                background: linear-gradient(90deg, #d4af37, #ffd700, #ffb347, #d4af37);
            }

            /* 祝福消息区域 */
            .birthday-wish {
                position: absolute;
                bottom: -120px;
                left: 50%;
                transform: translateX(-50%);
                text-align: center;
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                padding: 25px 35px;
                border-radius: 25px;
                box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25), 
                           0 5px 15px rgba(0, 0, 0, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.8);
                min-width: 300px;
                animation: wishAppear 1s ease-out 0.6s both;
            }

            .birthday-cake.lunar-theme .birthday-wish {
                background: rgba(255, 248, 220, 0.98);
                border: 2px solid rgba(212, 175, 55, 0.6);
                box-shadow: 0 15px 40px rgba(212, 175, 55, 0.2), 
                           0 5px 15px rgba(139, 69, 19, 0.1);
            }

            .wish-title {
                font-size: 24px;
                font-weight: bold;
                color: #333;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
            }

            .birthday-cake.lunar-theme .wish-title {
                color: #b8860b;
            }

            .wish-message {
                font-size: 16px;
                color: #555;
                margin-bottom: 8px;
                line-height: 1.4;
            }

            .wish-subtitle {
                font-size: 14px;
                color: #777;
                font-style: italic;
            }

            /* 装饰元素 */
            .decoration-elements {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
            }

            .floating-heart, .floating-star, .floating-balloon, .party-confetti {
                position: absolute;
                font-size: 24px;
                animation: floatAround 6s ease-in-out infinite;
            }

            .floating-heart:nth-child(1) { 
                top: 15%; left: 8%; 
                animation-delay: 0s;
                animation: heartPulse 3s ease-in-out infinite;
            }
            .floating-heart:nth-child(2) { 
                top: 25%; right: 12%; 
                animation-delay: 1.5s;
                animation: heartPulse 3s ease-in-out infinite 1.5s;
            }

            .floating-star:nth-child(3) { 
                top: 45%; left: 5%; 
                animation-delay: 0.8s;
                animation: starTwinkle 2.5s ease-in-out infinite;
            }
            .floating-star:nth-child(4) { 
                top: 55%; right: 8%; 
                animation-delay: 2s;
                animation: starTwinkle 2.5s ease-in-out infinite 1s;
            }

            .floating-balloon:nth-child(5) { 
                top: 70%; left: 15%; 
                animation-delay: 1s;
                animation: balloonFloat 4s ease-in-out infinite;
            }
            .floating-balloon:nth-child(6) { 
                top: 75%; right: 18%; 
                animation-delay: 2.5s;
                animation: balloonFloat 4s ease-in-out infinite 2s;
            }

            .party-confetti:nth-child(7) { 
                top: 35%; left: 20%; 
                animation-delay: 1.2s;
                animation: confettiSpin 3s linear infinite;
            }
            .party-confetti:nth-child(8) { 
                top: 65%; right: 25%; 
                animation-delay: 0.5s;
                animation: confettiSpin 3s linear infinite 1.5s;
            }

            @keyframes heartPulse {
                0%, 100% { 
                    transform: scale(1) rotate(0deg);
                    opacity: 0.8;
                }
                50% { 
                    transform: scale(1.3) rotate(-5deg);
                    opacity: 1;
                    filter: drop-shadow(0 0 8px #ff69b4);
                }
            }

            @keyframes starTwinkle {
                0%, 100% { 
                    transform: scale(0.8) rotate(0deg);
                    opacity: 0.6;
                }
                25% { 
                    transform: scale(1.2) rotate(90deg);
                    opacity: 1;
                    filter: drop-shadow(0 0 10px #ffd700);
                }
                75% { 
                    transform: scale(1) rotate(270deg);
                    opacity: 0.8;
                }
            }

            @keyframes balloonFloat {
                0%, 100% { 
                    transform: translateY(0px) rotate(-2deg);
                    opacity: 0.9;
                }
                50% { 
                    transform: translateY(-8px) rotate(2deg);
                    opacity: 1;
                }
            }

            @keyframes confettiSpin {
                0% { 
                    transform: rotate(0deg) scale(1);
                    opacity: 0.7;
                }
                50% { 
                    transform: rotate(180deg) scale(1.2);
                    opacity: 1;
                }
                100% { 
                    transform: rotate(360deg) scale(1);
                    opacity: 0.7;
                }
            }

            @keyframes floatAround {
                0%, 100% { 
                    transform: translateX(0px) translateY(0px) rotate(0deg);
                }
                25% { 
                    transform: translateX(5px) translateY(-3px) rotate(5deg);
                }
                50% { 
                    transform: translateX(-3px) translateY(-5px) rotate(-3deg);
                }
                75% { 
                    transform: translateX(-2px) translateY(2px) rotate(2deg);
                }
            }

            /* 祝福消息出现动画 */
            @keyframes wishAppear {
                0% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(20px);
                }
                100% {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }

            /* 背景模糊淡入动画 */
            @keyframes backdropBlurIn {
                0% {
                    backdrop-filter: blur(0px);
                    -webkit-backdrop-filter: blur(0px);
                    opacity: 0;
                }
                100% {
                    backdrop-filter: blur(15px);
                    -webkit-backdrop-filter: blur(15px);
                    opacity: 1;
                }
            }

            /* 背景淡入动画 */
            @keyframes backdropFadeIn {
                0% {
                    opacity: 0;
                }
                100% {
                    opacity: 1;
                }
            }

            /* 背景淡出动画 */
            @keyframes backdropFadeOut {
                0% {
                    opacity: 1;
                }
                100% {
                    opacity: 0;
                }
            }

            /* 蛋糕出现动画 */
            @keyframes cakeAppear {
                0% {
                    transform: scale(0) rotate(-10deg);
                    opacity: 0;
                }
                60% {
                    transform: scale(1.1) rotate(5deg);
                    opacity: 0.8;
                }
                100% {
                    transform: scale(1) rotate(0deg);
                    opacity: 1;
                }
            }

            /* 蛋糕消失动画 */
            @keyframes cakeDisappear {
                0% {
                    transform: scale(1) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: scale(0) rotate(10deg);
                    opacity: 0;
                }
            }

            /* 悬停效果 */
            .birthday-cake-container:hover .birthday-cake {
                animation: cakeHover 0.5s ease-in-out forwards;
            }

            @keyframes cakeHover {
                0% { transform: scale(1); }
                100% { transform: scale(1.05); }
            }

            /* 生日卡片 */
            .birthday-card {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border-radius: 20px;
                padding: 30px;
                margin-top: 40px;
                box-shadow: 
                    0 20px 40px rgba(0, 0, 0, 0.1),
                    0 10px 20px rgba(0, 0, 0, 0.05),
                    inset 0 1px 0 rgba(255, 255, 255, 0.9);
                border: 1px solid rgba(255, 255, 255, 0.2);
                max-width: 400px;
                text-align: center;
                transform: translateY(30px);
                opacity: 0;
                animation: cardSlideUp 1s ease-out 1.2s forwards;
            }

            .card-header {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
                margin-bottom: 20px;
            }

            .card-icon {
                font-size: 36px;
                animation: iconBounce 2s ease-in-out infinite;
            }

            .card-title {
                font-size: 28px;
                font-weight: 700;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .card-content {
                margin-bottom: 20px;
            }

            .birthday-message {
                font-size: 20px;
                color: #2c3e50;
                margin-bottom: 12px;
                line-height: 1.5;
                font-weight: 500;
            }

            .birthday-subtitle {
                font-size: 16px;
                color: #7f8c8d;
                font-style: italic;
                opacity: 0.8;
            }

            .card-decoration {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin-top: 15px;
            }

            .card-decoration .heart,
            .card-decoration .star {
                font-size: 24px;
                animation: decorationPulse 2s ease-in-out infinite;
            }

            .card-decoration .heart:nth-child(1) { animation-delay: 0s; }
            .card-decoration .star { animation-delay: 0.5s; }
            .card-decoration .heart:nth-child(3) { animation-delay: 1s; }

            /* 农历主题卡片 */
            .birthday-cake-modern.lunar-theme .card-title {
                background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .birthday-cake-modern.lunar-theme .birthday-card {
                background: rgba(255, 248, 230, 0.95);
                border: 1px solid rgba(212, 175, 55, 0.2);
            }

            /* 粒子效果 */
            .particle-effects {
                position: absolute;
                width: 100%;
                height: 100%;
                pointer-events: none;
                overflow: hidden;
            }

            .particle {
                position: absolute;
                width: 6px;
                height: 6px;
                background: radial-gradient(circle, #fff 0%, #ff6b9d 100%);
                border-radius: 50%;
                animation: particleFloat 8s linear infinite;
                opacity: 0;
            }

            .particle:nth-child(1) { left: 10%; animation-delay: 0s; }
            .particle:nth-child(2) { left: 20%; animation-delay: 1s; }
            .particle:nth-child(3) { left: 30%; animation-delay: 2s; }
            .particle:nth-child(4) { left: 40%; animation-delay: 3s; }
            .particle:nth-child(5) { left: 60%; animation-delay: 4s; }
            .particle:nth-child(6) { left: 70%; animation-delay: 5s; }
            .particle:nth-child(7) { left: 80%; animation-delay: 6s; }
            .particle:nth-child(8) { left: 90%; animation-delay: 7s; }

            /* 现代动画效果 */
            @keyframes modernCakeAppear {
                0% {
                    transform: scale(0) rotateY(-20deg);
                    opacity: 0;
                }
                50% {
                    transform: scale(1.05) rotateY(10deg);
                    opacity: 0.8;
                }
                100% {
                    transform: scale(1) rotateY(0deg);
                    opacity: 1;
                }
            }

            @keyframes cardSlideUp {
                0% {
                    transform: translateY(50px);
                    opacity: 0;
                }
                100% {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            @keyframes gentleFloat {
                0%, 100% {
                    transform: translateY(0px);
                }
                50% {
                    transform: translateY(-8px);
                }
            }

            @keyframes bounceScale {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.1);
                }
            }

            @keyframes sparkleRotate {
                0% {
                    transform: rotate(0deg) scale(1);
                    opacity: 0.6;
                }
                50% {
                    transform: rotate(180deg) scale(1.2);
                    opacity: 1;
                }
                100% {
                    transform: rotate(360deg) scale(1);
                    opacity: 0.6;
                }
            }

            @keyframes ribbonShine {
                0% {
                    background-position: 0% 50%;
                }
                100% {
                    background-position: 200% 50%;
                }
            }

            @keyframes decorationFloat {
                0%, 100% {
                    transform: translateY(0px) rotate(0deg);
                    opacity: 0.8;
                }
                50% {
                    transform: translateY(-10px) rotate(5deg);
                    opacity: 1;
                }
            }

            @keyframes balloonBob {
                0%, 100% {
                    transform: translateY(0px) rotate(-2deg);
                }
                50% {
                    transform: translateY(-15px) rotate(2deg);
                }
            }

            @keyframes musicDance {
                0%, 100% {
                    transform: rotate(0deg) scale(1);
                }
                25% {
                    transform: rotate(-10deg) scale(1.1);
                }
                75% {
                    transform: rotate(10deg) scale(1.1);
                }
            }

            @keyframes iconBounce {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.2);
                }
            }

            @keyframes decorationPulse {
                0%, 100% {
                    transform: scale(1);
                    opacity: 0.8;
                }
                50% {
                    transform: scale(1.3);
                    opacity: 1;
                }
            }

            @keyframes particleFloat {
                0% {
                    transform: translateY(100vh) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100px) rotate(360deg);
                    opacity: 0;
                }
            }

            /* 响应式设计 */
            @media (max-width: 480px) {
                .birthday-cake-modern {
                    min-width: 350px;
                    min-height: 450px;
                    padding: 30px;
                }
                
                .cake-layer-main { 
                    width: 140px; 
                    height: 80px; 
                }
                .cake-layer-base { 
                    width: 180px; 
                    height: 90px; 
                }
                .cake-stand { 
                    width: 220px; 
                }
                
                .birthday-number {
                    font-size: 36px;
                }
                
                .sparkle {
                    font-size: 16px;
                }
                
                .gift-box, .balloon, .party-hat, .music-note {
                    font-size: 24px;
                }
                
                .birthday-card {
                    max-width: 320px;
                    padding: 25px;
                }
                
                .card-title { font-size: 24px; }
                .birthday-message { font-size: 18px; }
                .birthday-subtitle { font-size: 14px; }
                .card-icon { font-size: 30px; }
            }
        `;
        document.head.appendChild(style);
    }

    // 隐藏生日消息
    hideBirthdayMessage(messageElement) {
        // 为整个容器添加淡出动画
        messageElement.style.animation = 'backdropFadeOut 0.5s ease-in forwards';
        
        // 为蛋糕添加收缩动画
        const cake = messageElement.querySelector('.birthday-cake');
        if (cake) {
            cake.style.animation = 'cakeDisappear 0.5s ease-in forwards';
        }
        
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 500);
    }

    // 启动烟花效果
    startFireworks() {
        console.log('🎆 启动烟花效果');
        
        const fireworksContainer = document.createElement('div');
        fireworksContainer.className = 'fireworks-container';
        fireworksContainer.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
        `;
        
        this.effectsContainer.appendChild(fireworksContainer);
        
        // 创建多个烟花
        const fireworksCount = 15;
        for (let i = 0; i < fireworksCount; i++) {
            setTimeout(() => {
                this.createFirework(fireworksContainer);
            }, i * 800);
        }

        // 清理烟花效果
        setTimeout(() => {
            if (fireworksContainer.parentNode) {
                fireworksContainer.parentNode.removeChild(fireworksContainer);
            }
        }, this.config.DURATION.FIREWORKS);
    }

    // 创建单个烟花
    createFirework(container) {
        const firework = document.createElement('div');
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * (window.innerHeight * 0.6) + window.innerHeight * 0.2;
        
        firework.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: ${this.getRandomColor()};
            box-shadow: 0 0 20px ${this.getRandomColor()};
        `;
        
        container.appendChild(firework);
        
        // 创建烟花爆炸效果
        setTimeout(() => {
            this.explodeFirework(firework, container);
        }, 100);
    }

    // 烟花爆炸效果
    explodeFirework(firework, container) {
        const particlesCount = 20;
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
        
        for (let i = 0; i < particlesCount; i++) {
            const particle = document.createElement('div');
            const angle = (360 / particlesCount) * i;
            const velocity = Math.random() * 3 + 2;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.style.cssText = `
                position: absolute;
                left: ${firework.offsetLeft}px;
                top: ${firework.offsetTop}px;
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: ${color};
                box-shadow: 0 0 10px ${color};
                animation: fireworkParticle 2s ease-out forwards;
                transform-origin: center;
                --angle: ${angle}deg;
                --velocity: ${velocity};
            `;
            
            container.appendChild(particle);
            
            // 移除粒子
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 2000);
        }
        
        // 移除原始烟花
        if (firework.parentNode) {
            firework.parentNode.removeChild(firework);
        }
        
        this.addFireworkStyles();
    }

    // 添加烟花样式
    addFireworkStyles() {
        if (document.getElementById('firework-styles')) return;

        const style = document.createElement('style');
        style.id = 'firework-styles';
        style.textContent = `
            @keyframes fireworkParticle {
                0% {
                    transform: rotate(var(--angle)) translateX(0px) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: rotate(var(--angle)) translateX(calc(var(--velocity) * 50px)) scale(0);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 启动彩纸效果
    startConfetti() {
        console.log('🎊 启动彩纸效果');
        
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        confettiContainer.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
        `;
        
        this.effectsContainer.appendChild(confettiContainer);
        
        // 创建彩纸
        const confettiInterval = setInterval(() => {
            this.createConfettiPiece(confettiContainer);
        }, 100);

        // 停止创建彩纸并清理
        setTimeout(() => {
            clearInterval(confettiInterval);
            setTimeout(() => {
                if (confettiContainer.parentNode) {
                    confettiContainer.parentNode.removeChild(confettiContainer);
                }
            }, 3000);
        }, this.config.DURATION.CONFETTI);
    }

    // 创建彩纸片
    createConfettiPiece(container) {
        const confetti = document.createElement('div');
        const x = Math.random() * window.innerWidth;
        const rotation = Math.random() * 360;
        const color = this.getRandomColor();
        const size = Math.random() * 8 + 4;
        const duration = Math.random() * 3 + 2;
        
        confetti.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: -20px;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            transform: rotate(${rotation}deg);
            animation: confettiFall ${duration}s linear forwards;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        `;
        
        container.appendChild(confetti);
        
        // 移除彩纸
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, duration * 1000);
        
        this.addConfettiStyles();
    }

    // 添加彩纸样式
    addConfettiStyles() {
        if (document.getElementById('confetti-styles')) return;

        const style = document.createElement('style');
        style.id = 'confetti-styles';
        style.textContent = `
            @keyframes confettiFall {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh) rotate(720deg);
                    opacity: 0.5;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 应用特殊主题
    applySpecialTheme() {
        console.log('🌈 应用生日特殊主题');
        
        document.body.classList.add('birthday-theme');
        
        // 添加特殊主题样式
        this.addSpecialThemeStyles();
        
        // 30秒后移除特殊主题
        setTimeout(() => {
            document.body.classList.remove('birthday-theme');
        }, 30000);
    }

    // 添加特殊主题样式
    addSpecialThemeStyles() {
        if (document.getElementById('birthday-theme-styles')) return;

        const style = document.createElement('style');
        style.id = 'birthday-theme-styles';
    }

    // 播放生日音乐（支持本地文件和MIDI）
    async playBirthdayMusic() {
        // 检查是否配置了本地音频文件
        if (this.config.BIRTHDAY_AUDIO_FILE) {
            console.log('🎵 播放本地生日音乐文件');
            await this.playLocalAudioFile();
        } else {
            // 播放默认的MIDI版本
            if (!window.AudioContext && !window.webkitAudioContext) {
                console.log('浏览器不支持 Web Audio API');
                return;
            }

            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('🎵 播放生日快乐歌 MIDI 版本');
                this.playCompleteBirthdaySong();
            } catch (error) {
                console.log('无法播放生日音乐:', error);
            }
        }
    }

    // 播放本地音频文件
    async playLocalAudioFile() {
        try {
            // 停止当前播放的音频
            this.stopCurrentAudio();

            // 创建新的音频对象
            this.currentAudio = new Audio();
            
            // 设置音频源
            if (typeof this.config.BIRTHDAY_AUDIO_FILE === 'string') {
                // 直接文件路径
                this.currentAudio.src = this.config.BIRTHDAY_AUDIO_FILE;
            } else if (this.config.BIRTHDAY_AUDIO_FILE instanceof File) {
                // 文件对象（通过文件选择器选择）
                this.currentAudio.src = URL.createObjectURL(this.config.BIRTHDAY_AUDIO_FILE);
            }

            // 设置音频属性
            this.currentAudio.volume = this.config.BIRTHDAY_VOLUME || 0.7;
            this.currentAudio.loop = false;
            
            // 添加事件监听器
            this.currentAudio.addEventListener('loadstart', () => {
                console.log('🔄 开始加载音频文件...');
            });

            this.currentAudio.addEventListener('canplay', () => {
                console.log('✅ 音频文件加载完成，开始播放');
            });

            this.currentAudio.addEventListener('ended', () => {
                console.log('🎵 音频播放完成');
                this.cleanupAudio();
            });

            this.currentAudio.addEventListener('error', (e) => {
                console.error('❌ 音频播放出错:', e);
                console.log('🔄 回退到 MIDI 版本');
                this.playMIDIFallback();
            });

            // 开始播放
            await this.currentAudio.play();
            console.log('🎶 本地音频文件播放中...');

        } catch (error) {
            console.error('❌ 播放本地音频文件失败:', error);
            console.log('🔄 回退到 MIDI 版本');
            this.playMIDIFallback();
        }
    }

    // 回退到MIDI播放
    playMIDIFallback() {
        if (!window.AudioContext && !window.webkitAudioContext) {
            console.log('浏览器不支持 Web Audio API');
            return;
        }

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.playCompleteBirthdaySong();
        } catch (error) {
            console.log('无法播放 MIDI 音乐:', error);
        }
    }

    // 停止当前播放的音频
    stopCurrentAudio() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.cleanupAudio();
        }
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }

    // 清理音频资源
    cleanupAudio() {
        if (this.currentAudio) {
            if (this.currentAudio.src.startsWith('blob:')) {
                URL.revokeObjectURL(this.currentAudio.src);
            }
            this.currentAudio = null;
        }
    }

    // 播放完整的生日快乐歌（MIDI格式音序）
    playCompleteBirthdaySong() {
        // 完整的《生日快乐歌》MIDI音序
        // 分为4个短句：生日快乐歌 + 重复版本
        const song = [
            // 第一句："祝你生日快乐"
            { note: 'C4', duration: 0.75, delay: 0 },     // 祝
            { note: 'C4', duration: 0.25, delay: 0.75 },  // 你
            { note: 'D4', duration: 1, delay: 1 },        // 生
            { note: 'C4', duration: 1, delay: 2 },        // 日
            { note: 'F4', duration: 1, delay: 3 },        // 快
            { note: 'E4', duration: 2, delay: 4 },        // 乐

            // 间隔
            { note: 'REST', duration: 0.5, delay: 6 },

            // 第二句："祝你生日快乐"（重复）
            { note: 'C4', duration: 0.75, delay: 6.5 },
            { note: 'C4', duration: 0.25, delay: 7.25 },
            { note: 'D4', duration: 1, delay: 7.5 },
            { note: 'C4', duration: 1, delay: 8.5 },
            { note: 'G4', duration: 1, delay: 9.5 },
            { note: 'F4', duration: 2, delay: 10.5 },

            // 间隔
            { note: 'REST', duration: 0.5, delay: 12.5 },

            // 第三句："祝你生日快乐"（高音版）
            { note: 'C4', duration: 0.75, delay: 13 },
            { note: 'C4', duration: 0.25, delay: 13.75 },
            { note: 'C5', duration: 1, delay: 14 },
            { note: 'A4', duration: 1, delay: 15 },
            { note: 'F4', duration: 1, delay: 16 },
            { note: 'E4', duration: 1, delay: 17 },
            { note: 'D4', duration: 2, delay: 18 },

            // 间隔
            { note: 'REST', duration: 0.5, delay: 20 },

            // 第四句："祝你生日快乐"（结尾）
            { note: 'A#4', duration: 0.75, delay: 20.5 },
            { note: 'A#4', duration: 0.25, delay: 21.25 },
            { note: 'A4', duration: 1, delay: 21.5 },
            { note: 'F4', duration: 1, delay: 22.5 },
            { note: 'G4', duration: 1, delay: 23.5 },
            { note: 'F4', duration: 3, delay: 24.5 }      // 长结尾
        ];

        // 播放每个音符
        song.forEach(({ note, duration, delay }) => {
            if (note !== 'REST') {
                const frequency = this.getNoteFrequency(note);
                this.playNote(frequency, this.audioContext.currentTime + delay, duration);
            }
        });

        console.log('🎶 完整生日快乐歌播放中... (约28秒)');
    }

    // 获取音符对应的频率（MIDI音符转换）
    getNoteFrequency(noteName) {
        const noteFrequencies = {
            // 第4八度音符（中央C区域）
            'C4': 261.63,   // 中央C
            'C#4': 277.18,  // C升
            'D4': 293.66,   // D
            'D#4': 311.13,  // D升
            'E4': 329.63,   // E
            'F4': 349.23,   // F
            'F#4': 369.99,  // F升
            'G4': 392.00,   // G
            'G#4': 415.30,  // G升
            'A4': 440.00,   // A（标准音）
            'A#4': 466.16,  // A升/B降
            'B4': 493.88,   // B

            // 第5八度音符（高音区）
            'C5': 523.25,   // 高音C
            'C#5': 554.37,
            'D5': 587.33,
            'D#5': 622.25,
            'E5': 659.25,
            'F5': 698.46,
            'F#5': 739.99,
            'G5': 783.99,
            'G#5': 830.61,
            'A5': 880.00,
            'A#5': 932.33,
            'B5': 987.77,

            // 第3八度音符（低音区）
            'C3': 130.81,
            'C#3': 138.59,
            'D3': 146.83,
            'D#3': 155.56,
            'E3': 164.81,
            'F3': 174.61,
            'F#3': 185.00,
            'G3': 196.00,
            'G#3': 207.65,
            'A3': 220.00,
            'A#3': 233.08,
            'B3': 246.94
        };

        return noteFrequencies[noteName] || 440.00; // 默认返回A4
    }

    // 播放单个音符（增强版，支持更好的音质）
    playNote(frequency, startTime, duration) {
        // 创建主振荡器
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // 创建轻微的和声（增加音乐性）
        const harmonicOsc = this.audioContext.createOscillator();
        const harmonicGain = this.audioContext.createGain();
        
        // 连接音频节点
        oscillator.connect(gainNode);
        harmonicOsc.connect(harmonicGain);
        gainNode.connect(this.audioContext.destination);
        harmonicGain.connect(this.audioContext.destination);
        
        // 设置主音符
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = 'sine'; // 使用正弦波获得纯净音色
        
        // 设置和声（五度音程，增加丰富度）
        harmonicOsc.frequency.setValueAtTime(frequency * 1.5, startTime); // 五度和声
        harmonicOsc.type = 'triangle'; // 三角波
        
        // 主音量包络（ADSR）
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);     // Attack
        gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.1);     // Decay
        gainNode.gain.setValueAtTime(0.25, startTime + duration - 0.1);   // Sustain
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration); // Release
        
        // 和声音量（较小）
        harmonicGain.gain.setValueAtTime(0, startTime);
        harmonicGain.gain.linearRampToValueAtTime(0.08, startTime + 0.05);
        harmonicGain.gain.linearRampToValueAtTime(0.06, startTime + 0.1);
        harmonicGain.gain.setValueAtTime(0.06, startTime + duration - 0.1);
        harmonicGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        // 启动和停止振荡器
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
        harmonicOsc.start(startTime);
        harmonicOsc.stop(startTime + duration);
    }

    // 获取随机颜色
    getRandomColor() {
        const colors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
            '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd',
            '#00d2d3', '#ff9f43', '#ee5a24', '#0abde3'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 手动触发生日效果（用于测试）
    triggerManual() {
        console.log('🎂 手动触发生日彩蛋');
        this.isActive = false; // 重置状态
        this.triggerEffects();
    }

    // 清理所有效果
    cleanup() {
        this.isActive = false;
        
        // 清除定时器
        if (this.checkTimer) {
            clearInterval(this.checkTimer);
            this.checkTimer = null;
        }
        
        // 清理DOM元素
        if (this.effectsContainer) {
            this.effectsContainer.innerHTML = '';
        }
        
        // 关闭音频上下文
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        // 移除特殊主题
        document.body.classList.remove('birthday-theme');
        
        // 重置日期检查
        this.lastCheckedDate = null;
        
        console.log('🧹 生日彩蛋系统已清理');
    }

    // 停止自动检测
    stopAutoCheck() {
        if (this.checkTimer) {
            clearInterval(this.checkTimer);
            this.checkTimer = null;
            console.log('⏹️ 生日自动检测已停止');
        }
    }
}

// 创建全局实例
window.birthdayEasterEgg = new BirthdayEasterEgg();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.birthdayEasterEgg.init();
});

// 添加开发者控制台快捷方式
window.triggerBirthday = () => {
    window.birthdayEasterEgg.triggerManual();
};

// 测试农历生日功能
window.testLunarBirthday = () => {
    console.log('🌙 测试农历生日功能');
    const today = new Date();
    const lunarDate = window.birthdayEasterEgg.getLunarDate(today);
    if (lunarDate) {
        console.log('📅 当前农历日期:', {
            农历: `${lunarDate.monthName}月${lunarDate.dayName}`,
            格式化: `${String(lunarDate.month).padStart(2, '0')}-${String(lunarDate.day).padStart(2, '0')}`,
            详细: lunarDate
        });
    } else {
        console.log('❌ 无法获取农历日期');
    }
    
    console.log('🎂 当前配置的农历生日:', CONFIG.BIRTHDAY.LUNAR_DATES);
    
    // 手动触发农历生日
    window.birthdayEasterEgg.isActive = false;
    window.birthdayEasterEgg.triggerEffects('农历');
};

// 测试生日音乐功能
window.testBirthdayMusic = () => {
    console.log('🎵 测试生日快乐歌 MIDI 音乐');
    window.birthdayEasterEgg.playBirthdayMusic();
};

// 停止当前播放的音乐
window.stopBirthdayMusic = () => {
    console.log('⏹️ 停止生日音乐');
    window.birthdayEasterEgg.stopCurrentAudio();
    console.log('🔇 所有音频已停止');
};

// 设置本地音频文件（通过文件路径）
window.setBirthdayAudioFile = (filePath) => {
    CONFIG.BIRTHDAY.BIRTHDAY_AUDIO_FILE = filePath;
    CONFIG.BIRTHDAY.BIRTHDAY_VOLUME = 0.7;
    console.log('🎵 已设置本地音频文件:', filePath);
    console.log('💡 现在触发生日音乐将播放您的本地文件');
};

// 清除本地音频文件设置
window.clearBirthdayAudioFile = () => {
    delete CONFIG.BIRTHDAY.BIRTHDAY_AUDIO_FILE;
    delete CONFIG.BIRTHDAY.BIRTHDAY_VOLUME;
    console.log('🗑️ 已清除本地音频文件设置');
    console.log('💡 现在将使用默认的 MIDI 生日歌');
};

// 通过文件选择器选择音频文件
window.selectBirthdayAudioFile = () => {
    console.log('📁 打开文件选择器...');
    
    // 创建文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log('📄 选择的文件:', file.name);
            console.log('📏 文件大小:', (file.size / 1024 / 1024).toFixed(2) + ' MB');
            console.log('🎵 文件类型:', file.type);
            
            // 验证是否为音频文件
            if (!file.type.startsWith('audio/')) {
                console.error('❌ 请选择有效的音频文件');
                return;
            }
            
            // 设置文件对象
            CONFIG.BIRTHDAY.BIRTHDAY_AUDIO_FILE = file;
            CONFIG.BIRTHDAY.BIRTHDAY_VOLUME = 0.7;
            
            console.log('✅ 音频文件设置成功！');
            console.log('🎶 现在可以通过 testBirthdayMusic() 测试播放');
        }
        
        // 清理文件输入元素
        document.body.removeChild(fileInput);
    });
    
    // 添加到页面并触发点击
    document.body.appendChild(fileInput);
    fileInput.click();
};

// 获取当前音频配置信息
window.getBirthdayAudioInfo = () => {
    const config = CONFIG.BIRTHDAY;
    
    console.log('🎵 当前生日音乐配置:');
    console.log('  📂 音频文件:', config.BIRTHDAY_AUDIO_FILE || '未设置 (使用 MIDI 版本)');
    console.log('  🔊 音量:', config.BIRTHDAY_VOLUME || '0.7 (默认)');
    console.log('  🎛️ 音乐开关:', config.EFFECTS.BIRTHDAY_MUSIC ? '开启' : '关闭');
    
    if (config.BIRTHDAY_AUDIO_FILE) {
        if (typeof config.BIRTHDAY_AUDIO_FILE === 'string') {
            console.log('  📍 文件类型: 路径字符串');
        } else if (config.BIRTHDAY_AUDIO_FILE instanceof File) {
            console.log('  📍 文件类型: File 对象');
            console.log('  📄 文件名:', config.BIRTHDAY_AUDIO_FILE.name);
            console.log('  📏 文件大小:', (config.BIRTHDAY_AUDIO_FILE.size / 1024 / 1024).toFixed(2) + ' MB');
        }
    }
    
    console.log('\n💡 使用方法:');
    console.log('  - selectBirthdayAudioFile() : 选择本地音频文件');
    console.log('  - setBirthdayAudioFile("路径") : 设置音频文件路径');
    console.log('  - clearBirthdayAudioFile() : 清除设置，使用 MIDI');
    console.log('  - testBirthdayMusic() : 测试播放当前设置的音乐');
    console.log('  - stopBirthdayMusic() : 停止播放');
}; 