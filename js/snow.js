class SnowEffect {
    constructor() {
        this.isEnabled = localStorage.getItem('snowEnabled') === 'true';
        this.setupToggle();
        
        if (this.isEnabled && this.isWinter()) {
            this.initSnow();
        }
    }

    setupToggle() {
        this.toggle = document.querySelector('.snow-toggle');
        if (this.toggle) {
            // 设置初始状态
            if (this.isEnabled) {
                this.toggle.classList.add('active');
            }
            
            // 添加点击事件
            this.toggle.addEventListener('click', () => {
                this.isEnabled = !this.isEnabled;
                localStorage.setItem('snowEnabled', this.isEnabled);
                
                if (this.isEnabled && this.isWinter()) {
                    this.toggle.classList.add('active');
                    this.initSnow();
                } else {
                    this.toggle.classList.remove('active');
                    this.removeSnow();
                }
            });

            // 只在冬季显示开关
            if (!this.isWinter()) {
                this.toggle.style.display = 'none';
            }
        }
    }

    initSnow() {
        this.container = document.createElement('div');
        this.container.className = 'snow-container';
        document.body.appendChild(this.container);
        
        this.snowflakes = [];
        this.snowflakeCount = 50;
        this.colors = ['#ffffff', '#f0f0f0', '#e0e0e0'];
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
        if (!this.container) return; // 如果不是冬季，直接返回
        
        const snowflake = document.createElement('i');
        snowflake.className = `fa ${this.icons[Math.floor(Math.random() * this.icons.length)]} snowflake`;
        
        // 随机属性
        const size = Math.random() * 15 + 8;
        const startX = Math.random() * window.innerWidth;
        const duration = Math.random() * 5 + 5; // 5-10秒
        const delay = Math.random() * 5; // 0-5秒延迟
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        // 应用样式
        Object.assign(snowflake.style, {
            left: `${startX}px`,
            top: '-20px',
            fontSize: `${size}px`,
            color: color,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`
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
        if (!this.container) return; // 如果不是冬季，直接返回
        
        // 添加轻微摆动
        this.snowflakes.forEach(snowflake => {
            snowflake.x += snowflake.swing * Math.sin(Date.now() * snowflake.swingSpeed);
            snowflake.element.style.transform = `translateX(${snowflake.swing}px)`;
        });

        requestAnimationFrame(() => this.animate());
    }
} 