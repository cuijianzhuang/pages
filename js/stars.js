class StarEffect {
    constructor() {
        this.lastX = 0;
        this.lastY = 0;
        this.minDistance = 25; // 更小的距离，更密集的星星
        this.colors = [
            '#c1a86a', // 基础金色
            '#d4c293', // 浅金色
            '#a89155', // 深金色
            '#e6d5a7', // 特别浅的金色
            '#8f7b47'  // 特别深的金色
        ];
        this.specialStarChance = 0.2; // 20%几率生成特殊星星
        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        document.addEventListener('click', (e) => this.handleClick(e));
    }

    handleMouseMove(e) {
        const distance = Math.hypot(e.clientX - this.lastX, e.clientY - this.lastY);
        if (distance < this.minDistance) return;

        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.createStar(e.clientX, e.clientY);
    }

    handleTouchMove(e) {
        // 检查是否在播放器区域内
        if (e.target.closest('.aplayer')) {
            return; // 如果在播放器内，不处理星星效果
        }
        
        e.preventDefault();
        const touch = e.touches[0];
        const distance = Math.hypot(touch.clientX - this.lastX, touch.clientY - this.lastY);
        if (distance < this.minDistance) return;

        this.lastX = touch.clientX;
        this.lastY = touch.clientY;
        this.createStar(touch.clientX, touch.clientY);
    }

    handleClick(e) {
        // 检查是否启用星星效果
        if (!CONFIG.EFFECTS.CLICK_EFFECTS.STARS) {
            return;
        }

        // 检查是否在播放器区域内
        if (e.target.closest('.aplayer')) {
            return;
        }

        const config = CONFIG.EFFECTS.STARS;
        // 随机确定这次爆炸产生的星星数量
        const starCount = Math.floor(
            Math.random() * (config.COUNT.MAX - config.COUNT.MIN + 1) + config.COUNT.MIN
        );

        // 创建星星组
        for (let i = 0; i < starCount; i++) {
            // 计算每个星星的角度
            const angle = (Math.PI * 2 * i) / starCount + Math.random() * 0.5 - 0.25;
            
            // 随机确定这个星星的扩散距离
            const distance = Math.random() * 
                (config.DISTANCE.MAX - config.DISTANCE.MIN) + config.DISTANCE.MIN;
            
            // 随机确定延迟时间
            const delay = Math.random() * 
                (config.DELAY.MAX - config.DELAY.MIN) + config.DELAY.MIN;

            setTimeout(() => {
                const x = e.clientX + Math.cos(angle) * distance;
                const y = e.clientY + Math.sin(angle) * distance;
                this.createExplosionStar(x, y, config);
            }, delay);
        }
    }

    createExplosionStar(x, y, config) {
        const star = document.createElement('div');
        star.className = 'star star-explosion';
        
        // 随机大小
        const size = Math.random() * 
            (config.SIZE.MAX - config.SIZE.MIN) + config.SIZE.MIN;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // 随机颜色
        const colorIndex = Math.floor(Math.random() * this.colors.length);
        const color = this.colors[colorIndex];
        
        // 随机星星样式
        const starTypes = ['fa-star', 'fa-star-o', 'fa-asterisk', 'fa-snowflake-o'];
        const starType = starTypes[Math.floor(Math.random() * starTypes.length)];
        
        // 随机旋转角度
        const rotation = Math.random() * 
            (config.ROTATION.MAX - config.ROTATION.MIN) + config.ROTATION.MIN;
        
        // 随机生命周期
        const life = Math.random() * 
            (config.LIFE.MAX - config.LIFE.MIN) + config.LIFE.MIN;
        
        // 设置CSS变量用于动画
        star.style.setProperty('--rotation', `${rotation}deg`);
        star.style.setProperty('--scale', Math.random() * 0.5 + 1.5);
        star.style.setProperty('--life', `${life}ms`);
        star.style.setProperty('--color', color);
        
        // 随机选择动画类型
        const animationTypes = ['scale', 'rotate', 'fade', 'spiral'];
        const animationType = animationTypes[Math.floor(Math.random() * animationTypes.length)];
        star.classList.add(`star-explosion-${animationType}`);
        
        star.style.left = `${x}px`;
        star.style.top = `${y}px`;
        
        // 创建内部星星和光晕效果
        star.innerHTML = `
            <i class="fa ${starType}" style="color: ${color}"></i>
            <div class="star-glow"></div>
            ${Math.random() > 0.5 ? '<div class="star-trail"></div>' : ''}
        `;
        
        document.body.appendChild(star);
        
        // 添加粒子轨迹效果
        if (Math.random() > 0.3) {
            this.createStarTrail(x, y, color, rotation, life);
        }
        
        setTimeout(() => {
            if (document.body.contains(star)) {
                star.classList.add('removing');
                setTimeout(() => {
                    document.body.removeChild(star);
                }, 300);
            }
        }, life);
    }

    createStarTrail(x, y, color, rotation, life) {
        const trail = document.createElement('div');
        trail.className = 'star-particle-trail';
        trail.style.setProperty('--color', color);
        trail.style.setProperty('--rotation', `${rotation}deg`);
        trail.style.setProperty('--life', `${life * 0.8}ms`);
        trail.style.left = `${x}px`;
        trail.style.top = `${y}px`;
        document.body.appendChild(trail);
        
        setTimeout(() => {
            if (document.body.contains(trail)) {
                document.body.removeChild(trail);
            }
        }, life * 0.8);
    }

    createStar(x, y, isSpecial = false) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // 随机偏移
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        
        star.style.left = `${x + offsetX}px`;
        star.style.top = `${y + offsetY}px`;
        
        // 随机大小
        const size = Math.random() * 12 + (isSpecial ? 12 : 8);
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // 随机颜色
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        // 随机星星样式
        const starTypes = ['fa-star', 'fa-star-o', 'fa-asterisk', 'fa-snowflake-o'];
        const starType = starTypes[Math.floor(Math.random() * starTypes.length)];
        
        // 特殊效果星星
        if (isSpecial || Math.random() < this.specialStarChance) {
            star.classList.add('star-special');
        }
        
        star.innerHTML = `<i class="fa ${starType}" style="color: ${color};"></i>`;
        
        document.body.appendChild(star);
        
        star.addEventListener('animationend', () => {
            if (document.body.contains(star)) {
                document.body.removeChild(star);
            }
        });
    }
} 