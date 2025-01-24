// 粒子特效
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        const config = CONFIG.EFFECTS.PARTICLES;
        this.size = Math.random() * config.MAX_SIZE + config.MIN_SIZE;
        this.speedX = Math.random() * (config.MAX_SPEED - config.MIN_SPEED) + config.MIN_SPEED;
        this.speedY = Math.random() * (config.MAX_SPEED - config.MIN_SPEED) + config.MIN_SPEED;
        this.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
        this.life = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= CONFIG.EFFECTS.PARTICLES.LIFE_DECREASE;
        if (this.size > 0.3) this.size -= 0.1;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class ParticleEffect {
    constructor() {
        this.init();
        this.particles = [];
        this.animate = this.animate.bind(this);
        this.isEnabled = true; // 添加状态标志
        requestAnimationFrame(this.animate);
    }

    init() {
        // 初始化画布
        this.canvas = document.getElementById('particles');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // 设置画布样式
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';

        // 根据 cookie 设置初始显示状态
        const clickEffectsEnabled = document.cookie.split(';')
            .find(c => c.trim().startsWith('clickEffects='));
        if (clickEffectsEnabled && clickEffectsEnabled.split('=')[1] === 'false') {
            this.disable();
        }

        // 处理点击事件
        document.addEventListener('click', (e) => {
            // 检查是否在播放器区域内
            if (e.target.closest('.aplayer')) {
                return; // 如果在播放器内，不处理特效
            }

            // 检查特效是否启用
            if (!this.isEnabled) return;

            if (CONFIG.EFFECTS.CLICK_EFFECTS.PARTICLES) {
                for (let i = 0; i < CONFIG.EFFECTS.PARTICLES.COUNT; i++) {
                    this.particles.push(new Particle(e.clientX, e.clientY));
                }
            }
        });

        // 处理窗口大小变化
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    enable() {
        this.isEnabled = true;
        if (this.canvas) {
            this.canvas.style.display = '';
            this.particles = []; // 清空现有粒子
        }
    }

    disable() {
        this.isEnabled = false;
        if (this.canvas) {
            this.canvas.style.display = 'none';
            this.particles = []; // 清空现有粒子
            // 清除画布
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    animate() {
        if (!this.isEnabled) {
            requestAnimationFrame(this.animate);
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            this.particles[i].draw(this.ctx);
            
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        requestAnimationFrame(this.animate);
    }
}

// 等待 DOM 加载完成后再初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.particleEffect = new ParticleEffect();
    });
} else {
    window.particleEffect = new ParticleEffect();
} 