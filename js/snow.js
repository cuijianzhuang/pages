class SnowEffect {
    constructor() {
        // 初始化颜色数组
        this.colors = {
            dark: ['#ffffff', '#f0f0f0', '#e0e0e0'],
            light: ['#8b7355', '#a08b6c', '#b39c7d']
        };
        
        // 检查是否是冬季
        const isWinterSeason = this.isWinter();
        
        // 获取本地存储的状态
        // 冬季时默认开启，非冬季时默认关闭
        if (localStorage.getItem('snowEnabled') === null) {
            localStorage.setItem('snowEnabled', isWinterSeason ? 'true' : 'false');
        }
        
        // 设置初始状态
        this.isEnabled = localStorage.getItem('snowEnabled') === 'true';
        
        // 设置开关
        this.setupToggle();
        
        // 如果启用，初始化雪花
        if (this.isEnabled) {
            this.initSnow();
            requestAnimationFrame(() => this.animate());
        }
    }

    setupToggle() {
        this.toggle = document.querySelector('.snow-toggle');
        if (this.toggle) {
            // 根据当前状态设置开关样式
            if (this.isEnabled) {
                this.toggle.classList.add('active');
            } else {
                this.toggle.classList.remove('active');
            }
            
            // 添加点击事件
            this.toggle.addEventListener('click', () => {
                this.isEnabled = !this.isEnabled;
                localStorage.setItem('snowEnabled', this.isEnabled);
                
                if (this.isEnabled) {
                    this.toggle.classList.add('active');
                    this.initSnow();
                    requestAnimationFrame(() => this.animate());
                } else {
                    this.toggle.classList.remove('active');
                    this.removeSnow();
                }
            });
        }
    }

    initSnow() {
        this.container = document.createElement('div');
        this.container.className = 'snow-container';
        document.body.appendChild(this.container);
        
        this.snowflakes = [];
        this.snowflakeCount = 50;
        this.icons = ['fa-snowflake-o', 'fa-asterisk'];
        
        this.init();
        this.animate();
    }

    removeSnow() {
        if (this.container) {
            document.body.removeChild(this.container);
            this.container = null;
            this.snowflakes = [];
        }
    }

    isWinter() {
        const now = new Date();
        const month = now.getMonth() + 1;
        return month === 12 || month === 1 || month === 2;
    }

    init() {
        if (!this.container) return; // 如果不是冬季，直接返回
        
        // 创建初始雪花
        for (let i = 0; i < this.snowflakeCount; i++) {
            this.createSnowflake();
        }
    }

    createSnowflake() {
        if (!this.container) return;
        
        const snowflake = document.createElement('i');
        snowflake.className = `fa ${this.icons[Math.floor(Math.random() * this.icons.length)]} snowflake`;
        
        // 根据主题选择颜色
        const isLightTheme = document.body.classList.contains('light-theme');
        const colorArray = isLightTheme ? this.colors.light : this.colors.dark;
        const color = colorArray[Math.floor(Math.random() * colorArray.length)];
        
        // 随机属性
        const size = Math.random() * 15 + 8;
        const startX = Math.random() * window.innerWidth;
        const duration = Math.random() * 5 + 5;
        const delay = Math.random() * 5;
        
        // 应用样式
        Object.assign(snowflake.style, {
            left: `${startX}px`,
            top: '-20px',
            fontSize: `${size}px`,
            color: color,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
            // 添加阴影效果
            textShadow: isLightTheme 
                ? `0 0 8px rgba(139, 115, 85, 0.6), 0 0 15px rgba(139, 115, 85, 0.4)`
                : `0 0 5px rgba(255, 255, 255, 0.5)`
        });

        this.container.appendChild(snowflake);
        this.snowflakes.push({
            element: snowflake,
            x: startX,
            speed: Math.random() * 1 + 0.5,
            swing: Math.random() * 2 - 1,
            swingSpeed: Math.random() * 0.02
        });

        // 动画结束后移除
        snowflake.addEventListener('animationend', () => {
            if (this.container && this.container.contains(snowflake)) {
                this.container.removeChild(snowflake);
                this.snowflakes = this.snowflakes.filter(s => s.element !== snowflake);
                this.createSnowflake(); // 创建新雪花保持数量
            }
        });
    }

    animate() {
        if (!this.container || !this.isEnabled) return;
        
        // 添加轻微摆动
        this.snowflakes.forEach(snowflake => {
            snowflake.x += snowflake.swing * Math.sin(Date.now() * snowflake.swingSpeed);
            snowflake.element.style.transform = `translateX(${snowflake.swing}px)`;
        });

        requestAnimationFrame(() => this.animate());
    }
} 