class StarEffect {
    constructor() {
        this.lastX = 0;
        this.lastY = 0;
        this.minDistance = 15; // Reduced distance for more frequent stars
        this.colors = [
            '#FF69B4', // 热粉色
            '#00FFFF', // 青色
            '#FF6B6B', // 珊瑚红
            '#4FFFB0', // 绿松石色
            '#FFD700', // 金色
            '#FF1493', // 深粉色
            '#00FF7F', // 春绿色
            '#FF4500'  // 橙红色
        ];
        this.characters = ["✦", "✧", "⋆", "✫", "✬", "✭", "✯", "✰", "★", "☆", "✮", "✴"];
        // 从 cookie 读取状态
        const mouseTrailEnabled = document.cookie.split(';')
            .find(c => c.trim().startsWith('mouseTrail='));
        this.isEnabled = mouseTrailEnabled 
            ? mouseTrailEnabled.split('=')[1] === 'true'
            : CONFIG.EFFECTS.MOUSE_STARS.ENABLED;
        this.gravity = 0.15;
        this.particlePool = [];
        this.maxPoolSize = 50;
        this.init();
    }

    init() {
        if (this.isEnabled) {
            this.container = document.createElement('div');
            this.container.className = 'star-container';
            Object.assign(this.container.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: '99999'
            });
            document.body.appendChild(this.container);

            this.mouseMoveHandler = (e) => this.handleMouseMove(e);
            this.touchMoveHandler = (e) => this.handleTouchMove(e);
            
            document.addEventListener('mousemove', this.mouseMoveHandler);
            document.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
        }
    }

    handleMouseMove(e) {
        if (!this.isEnabled) return;
        
        const distance = Math.hypot(e.clientX - this.lastX, e.clientY - this.lastY);
        if (distance < this.minDistance) return;

        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.createStar(e.clientX, e.clientY);
    }

    handleTouchMove(e) {
        if (!this.isEnabled || e.target.closest('.aplayer')) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        const distance = Math.hypot(touch.clientX - this.lastX, touch.clientY - this.lastY);
        if (distance < this.minDistance) return;

        this.lastX = touch.clientX;
        this.lastY = touch.clientY;
        this.createStar(touch.clientX, touch.clientY);
    }

    createStar(x, y) {
        // 尝试从对象池中获取星星
        let star = this.particlePool.pop();
        if (!star) {
            star = document.createElement('span');
            star.className = 'mouse-star';
            
            // 创建发光效果的容器
            const glowContainer = document.createElement('div');
            glowContainer.className = 'star-glow-container';
            
            // 添加内部发光星星
            const innerStar = document.createElement('span');
            innerStar.className = 'inner-star';
            
            glowContainer.appendChild(innerStar);
            star.appendChild(glowContainer);
        }

        const character = this.characters[Math.floor(Math.random() * this.characters.length)];
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const size = Math.random() * 15 + 10;
        const angle = Math.random() * Math.PI * 2;
        
        // 更新内部星星的文本
        star.querySelector('.inner-star').textContent = character;
        
        // 随机动画参数
        const rotationSpeed = (Math.random() - 0.5) * 0.1;
        const pulseSpeed = Math.random() * 0.2 + 0.1;
        const fadeOutSpeed = Math.random() * 0.5 + 0.5;
        
        // 初始速度和位置，增加更多随机性
        const velocity = {
            x: (Math.random() - 0.5) * 6,
            y: -Math.random() * 4 - 3
        };
        const position = {
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10
        };

        // Apply styles with enhanced effects
        Object.assign(star.style, {
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            color: color,
            fontSize: `${size}px`,
            pointerEvents: 'none',
            userSelect: 'none',
            transform: `rotate(${angle}rad) scale(1)`,
            textShadow: `0 0 10px ${color},
                        0 0 20px ${color},
                        0 0 30px ${color},
                        0 0 40px ${color}`,
            transition: 'none',
            opacity: '1'
        });

        if (!star.parentNode) {
            this.container.appendChild(star);
        }

        let frame = 0;
        const maxFrames = 120;
        
        const animate = () => {
            if (frame >= maxFrames) {
                if (this.container.contains(star)) {
                    // 将星星放回对象池而不是删除
                    if (this.particlePool.length < this.maxPoolSize) {
                        this.particlePool.push(star);
                        star.remove();
                    } else {
                        star.remove();
                    }
                }
                return;
            }

            // 增强重力效果
            velocity.y += this.gravity * (1 + frame / maxFrames * 0.5);
            position.x += velocity.x;
            position.y += velocity.y;

            // 添加摆动效果
            const swingAmplitude = Math.sin(frame * 0.1) * (1 - frame / maxFrames);
            velocity.x += swingAmplitude * 0.2;

            // 缩放效果
            const scale = 1 - (frame / maxFrames) * 0.3;
            
            star.style.left = `${position.x}px`;
            star.style.top = `${position.y}px`;
            star.style.transform = `rotate(${angle + frame * rotationSpeed}rad) scale(${scale})`;
            
            // 增强的脉冲发光效果
            const pulseIntensity = Math.sin(frame * pulseSpeed) * 0.3 + 0.7;
            star.style.filter = `brightness(${pulseIntensity})`;
            
            // 平滑的淡出效果
            const fadeOut = Math.max(0, 1 - (frame / maxFrames) * fadeOutSpeed);
            star.style.opacity = fadeOut;

            frame++;
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    enable() {
        this.isEnabled = true;
        if (!this.container) {
            this.init();
        } else {
            // Re-add event listeners if container exists
            document.addEventListener('mousemove', this.mouseMoveHandler);
            document.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
        }
    }

    disable() {
        this.isEnabled = false;
        // Remove event listeners
        if (this.mouseMoveHandler) {
            document.removeEventListener('mousemove', this.mouseMoveHandler);
        }
        if (this.touchMoveHandler) {
            document.removeEventListener('touchmove', this.touchMoveHandler);
        }
        // Remove container if it exists
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
            this.container = null;
        }
    }

    toggle() {
        if (this.isEnabled) {
            this.disable();
        } else {
            this.enable();
        }
        return this.isEnabled;
    }
} 