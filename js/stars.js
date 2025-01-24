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
        this.characters = ["✦", "✧", "⋆", "✫", "✬", "✭", "✯", "✰"];
        // 从 cookie 读取状态
        const mouseTrailEnabled = document.cookie.split(';')
            .find(c => c.trim().startsWith('mouseTrail='));
        this.isEnabled = mouseTrailEnabled 
            ? mouseTrailEnabled.split('=')[1] === 'true'
            : CONFIG.EFFECTS.MOUSE_STARS.ENABLED;
        this.gravity = 0.15;
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
        const star = document.createElement('span');
        star.className = 'mouse-star';
        
        // Random properties
        const character = this.characters[Math.floor(Math.random() * this.characters.length)];
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const size = Math.random() * 15 + 10;
        const angle = Math.random() * Math.PI * 2;
        
        // 创建发光效果的容器
        const glowContainer = document.createElement('div');
        glowContainer.className = 'star-glow-container';
        
        // 添加内部发光星星
        const innerStar = document.createElement('span');
        innerStar.textContent = character;
        innerStar.className = 'inner-star';
        
        // 将内部星星添加到发光容器中
        glowContainer.appendChild(innerStar);
        star.appendChild(glowContainer);
        
        // 初始速度和位置
        const velocity = {
            x: (Math.random() - 0.5) * 4,
            y: -Math.random() * 3 - 2
        };
        const position = {
            x: x,
            y: y
        };

        // Apply styles
        Object.assign(star.style, {
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            color: color,
            fontSize: `${size}px`,
            pointerEvents: 'none',
            userSelect: 'none',
            transform: `rotate(${angle}rad)`,
            // 增强发光效果
            textShadow: `0 0 10px ${color},
                        0 0 20px ${color},
                        0 0 30px ${color},
                        0 0 40px ${color}`,
            transition: 'none'
        });

        this.container.appendChild(star);

        let frame = 0;
        const maxFrames = 120;
        
        const animate = () => {
            if (frame >= maxFrames) {
                if (this.container.contains(star)) {
                    this.container.removeChild(star);
                }
                return;
            }

            velocity.y += this.gravity;
            position.x += velocity.x;
            position.y += velocity.y;

            const swing = Math.sin(frame * 0.1) * 0.5;
            velocity.x += swing * 0.1;

            star.style.left = `${position.x}px`;
            star.style.top = `${position.y}px`;
            star.style.transform = `rotate(${angle + frame * 0.05}rad)`;
            
            // 添加脉冲发光效果
            const pulseIntensity = Math.sin(frame * 0.1) * 0.3 + 0.7;
            star.style.filter = `brightness(${pulseIntensity})`;
            
            star.style.opacity = Math.max(0, 1 - (frame / maxFrames));

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