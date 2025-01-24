class Settings {
    constructor() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        // Get DOM elements
        this.settingsToggle = document.querySelector('.settings-toggle');
        this.settingsPanel = document.querySelector('.settings-panel');
        this.closeSettings = document.querySelector('.close-settings');
        this.clickEffectsToggle = document.getElementById('click-effects-toggle');
        this.mouseTrailToggle = document.getElementById('mouse-trail-toggle');
        
        // Load saved settings first
        this.initializeSettings();
        
        // Initialize star effect with current settings
        window.starEffect = new StarEffect();
        
        // Apply initial state if disabled
        if (!CONFIG.EFFECTS.MOUSE_STARS.ENABLED) {
            window.starEffect.disable();
        }
        
        // Setup event listeners last
        this.setupEventListeners();
    }

    getCookie(name) {
        const cookies = document.cookie.split(';');
        const cookie = cookies.find(c => c.trim().startsWith(name + '='));
        return cookie ? cookie.split('=')[1].trim() : null;
    }

    setCookie(name, value) {
        // 设置cookie，过期时间为1年
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        document.cookie = `${name}=${value};expires=${expiryDate.toUTCString()};path=/`;
    }

    initializeSettings() {
        // Load settings from cookies or use defaults
        const clickEffectsEnabled = this.getCookie('clickEffects') !== null 
            ? this.getCookie('clickEffects') === 'true'
            : CONFIG.EFFECTS.CLICK_EFFECTS.PARTICLES;
        this.clickEffectsToggle.checked = clickEffectsEnabled;
        CONFIG.EFFECTS.CLICK_EFFECTS.PARTICLES = clickEffectsEnabled;

        // Mouse trail
        const mouseTrailEnabled = this.getCookie('mouseTrail') !== null
            ? this.getCookie('mouseTrail') === 'true'
            : CONFIG.EFFECTS.MOUSE_STARS.ENABLED;
        this.mouseTrailToggle.checked = mouseTrailEnabled;
        CONFIG.EFFECTS.MOUSE_STARS.ENABLED = mouseTrailEnabled;

        // 初始化时应用设置
        if (!mouseTrailEnabled && window.starEffect) {
            window.starEffect.disable();
        }
        
        // 如果在 about 页面，初始化粒子效果
        if (document.querySelector('.AboutPage')) {
            this.initializeParticleEffects(clickEffectsEnabled);
        }
    }

    initializeParticleEffects(enabled) {
        if (enabled) {
            // 初始化粒子画布和事件监听
            const canvas = document.getElementById('particles');
            if (canvas) {
                canvas.style.display = 'block';
                // 确保粒子动画正在运行
                if (typeof animate === 'function') {
                    requestAnimationFrame(animate);
                }
            }
        } else {
            // 禁用粒子效果
            const canvas = document.getElementById('particles');
            if (canvas) {
                canvas.style.display = 'none';
            }
        }
    }

    setupEventListeners() {
        // Toggle settings panel
        this.settingsToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.settingsPanel.classList.toggle('show');
        });

        // Close settings panel
        this.closeSettings.addEventListener('click', () => {
            this.settingsPanel.classList.remove('show');
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!this.settingsPanel.contains(e.target) && 
                !this.settingsToggle.contains(e.target) && 
                this.settingsPanel.classList.contains('show')) {
                this.settingsPanel.classList.remove('show');
            }
        });

        // Handle click effects toggle
        this.clickEffectsToggle.addEventListener('change', (e) => {
            CONFIG.EFFECTS.CLICK_EFFECTS.PARTICLES = e.target.checked;
            this.setCookie('clickEffects', e.target.checked);
        });

        // Handle mouse trail toggle
        this.mouseTrailToggle.addEventListener('change', (e) => {
            CONFIG.EFFECTS.MOUSE_STARS.ENABLED = e.target.checked;
            if (window.starEffect) {
                if (e.target.checked) {
                    window.starEffect.enable();
                } else {
                    window.starEffect.disable();
                }
            }
            this.setCookie('mouseTrail', e.target.checked);
        });
    }
}

// Create settings instance
window.pageSettings = new Settings(); 