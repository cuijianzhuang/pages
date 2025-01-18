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
        // 添加点击效果
        document.addEventListener('click', (e) => this.handleClick(e));
    }

    handleClick(e) {
        // 点击时创建多个星星
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const angle = (Math.PI * 2 * i) / 8;
                const distance = 30;
                const x = e.clientX + Math.cos(angle) * distance;
                const y = e.clientY + Math.sin(angle) * distance;
                this.createStar(x, y, true);
            }, i * 50);
        }
    }

    handleMouseMove(e) {
        const distance = Math.hypot(e.clientX - this.lastX, e.clientY - this.lastY);
        if (distance < this.minDistance) return;

        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.createStar(e.clientX, e.clientY);
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const distance = Math.hypot(touch.clientX - this.lastX, touch.clientY - this.lastY);
        if (distance < this.minDistance) return;

        this.lastX = touch.clientX;
        this.lastY = touch.clientY;
        this.createStar(touch.clientX, touch.clientY);
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