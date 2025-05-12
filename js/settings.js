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
        console.log('初始化设置面板');
        // Get DOM elements
        this.settingsToggle = document.querySelector('.settings-toggle');
        this.settingsPanel = document.querySelector('.settings-panel');
        this.closeSettings = document.querySelector('.close-settings');
        this.clickEffectsToggle = document.getElementById('click-effects-toggle');
        this.mouseTrailToggle = document.getElementById('mouse-trail-toggle');
        this.particlesToggle = document.getElementById('particles-toggle');
        this.bingWallpaperToggle = document.getElementById('bing-wallpaper-toggle');
        
        // 检查DOM元素是否存在
        if (!this.settingsToggle) {
            console.error('未找到设置开关按钮');
        }
        if (!this.settingsPanel) {
            console.error('未找到设置面板');
        }
        
        // Load saved settings first
        this.initializeSettings();
        
        // Initialize star effect with current settings
        if (typeof StarEffect !== 'undefined' && !window.starEffect) {
            window.starEffect = new StarEffect();
        }
        
        // Apply initial state if disabled
        if (window.starEffect && !CONFIG.EFFECTS.MOUSE_STARS.ENABLED) {
            window.starEffect.disable();
        }
        
        // 使用DOM元素的克隆来移除可能存在的事件监听器
        this.refreshEventListeners();
        
        // Add Sakana Widget toggle handler
        this.sakanaToggle = document.getElementById('sakana-widget-toggle');
        if (this.sakanaToggle) {
            this.initSakanaToggle();
        }
        
        console.log('设置面板初始化完成');
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
        console.log('加载设置状态');
        // Load settings from cookies or use defaults
        const clickEffectsEnabled = this.getCookie('clickEffects') !== null 
            ? this.getCookie('clickEffects') === 'true'
            : CONFIG.EFFECTS.CLICK_EFFECTS.PARTICLES;
        if (this.clickEffectsToggle) {
            this.clickEffectsToggle.checked = clickEffectsEnabled;
        }
        CONFIG.EFFECTS.CLICK_EFFECTS.PARTICLES = clickEffectsEnabled;

        // Mouse trail
        const mouseTrailEnabled = this.getCookie('mouseTrail') !== null
            ? this.getCookie('mouseTrail') === 'true'
            : CONFIG.EFFECTS.MOUSE_STARS.ENABLED;
        if (this.mouseTrailToggle) {
            this.mouseTrailToggle.checked = mouseTrailEnabled;
        }
        CONFIG.EFFECTS.MOUSE_STARS.ENABLED = mouseTrailEnabled;

        // Particles background
        const particlesEnabled = this.getCookie('particles') !== null
            ? this.getCookie('particles') === 'true'
            : true; // 默认启用
        if (this.particlesToggle) {
            this.particlesToggle.checked = particlesEnabled;
            this.updateParticleVisibility(particlesEnabled);
        }

        // Bing wallpaper
        const bingWallpaperEnabled = this.getCookie('bingWallpaper') !== null
            ? this.getCookie('bingWallpaper') === 'true'
            : true; // 强制默认启用壁纸
        if (this.bingWallpaperToggle) {
            this.bingWallpaperToggle.checked = bingWallpaperEnabled;
            CONFIG.BING_WALLPAPER.ENABLED = bingWallpaperEnabled;
            
            // 首次加载时如果没有cookie，设置cookie为true
            if (this.getCookie('bingWallpaper') === null) {
                this.setCookie('bingWallpaper', 'true');
            }
        }

        // 初始化时应用设置
        if (!mouseTrailEnabled && window.starEffect) {
            window.starEffect.disable();
        }
        
        // 如果在 about 页面，初始化粒子效果
        if (document.querySelector('.AboutPage')) {
            this.initializeParticleEffects(clickEffectsEnabled);
        }
        
        console.log('设置状态加载完成');
    }

    updateParticleVisibility(enabled) {
        const particles = document.getElementById('particles');
        if (particles) {
            particles.style.opacity = enabled ? '1' : '0';
            particles.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                if (!enabled) {
                    particles.style.display = 'none';
                } else {
                    particles.style.display = 'block';
                }
            }, enabled ? 0 : 500);
        }
    }

    initializeParticleEffects(enabled) {
        if (enabled) {
            // 启用粒子效果
            if (window.particleEffect) {
                window.particleEffect.enable();
            }
        } else {
            // 禁用粒子效果
            if (window.particleEffect) {
                window.particleEffect.disable();
            }
        }
    }

    refreshEventListeners() {
        console.log('刷新设置面板的事件监听器');
        
        // 使用克隆节点替换原始元素，移除所有事件监听器
        if (this.settingsToggle) {
            const newSettingsToggle = this.settingsToggle.cloneNode(true);
            this.settingsToggle.parentNode.replaceChild(newSettingsToggle, this.settingsToggle);
            this.settingsToggle = newSettingsToggle;
        }
        
        if (this.closeSettings) {
            const newCloseSettings = this.closeSettings.cloneNode(true);
            this.closeSettings.parentNode.replaceChild(newCloseSettings, this.closeSettings);
            this.closeSettings = newCloseSettings;
        }
        
        // 移除全局点击事件
        if (window._documentClickHandler) {
            document.removeEventListener('click', window._documentClickHandler);
            window._documentClickHandler = null;
        }
        
        // 重新绑定事件处理程序
        this.setupEventListeners();
    }

    setupEventListeners() {
        console.log('设置事件监听器');
        
        // 设置面板切换事件
        if (this.settingsToggle && this.settingsPanel) {
            this.settingsToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.settingsPanel.classList.toggle('show');
                console.log('设置面板切换状态：', this.settingsPanel.classList.contains('show') ? '显示' : '隐藏');
            });
        }

        // 关闭设置面板事件
        if (this.closeSettings) {
            this.closeSettings.addEventListener('click', () => {
                this.settingsPanel.classList.remove('show');
                console.log('设置面板已关闭');
            });
        }

        // 点击外部关闭设置面板
        window._documentClickHandler = (e) => {
            if (this.settingsPanel && 
                this.settingsPanel.classList.contains('show') && 
                !this.settingsPanel.contains(e.target) && 
                this.settingsToggle && 
                !this.settingsToggle.contains(e.target)) {
                this.settingsPanel.classList.remove('show');
                console.log('点击外部区域，设置面板已关闭');
            }
        };
        document.addEventListener('click', window._documentClickHandler);

        // 绑定各种开关的事件处理程序
        this.bindToggleEvents();
    }

    bindToggleEvents() {
        // 点击特效开关
        if (this.clickEffectsToggle) {
            this.clickEffectsToggle.addEventListener('change', (e) => {
                CONFIG.EFFECTS.CLICK_EFFECTS.PARTICLES = e.target.checked;
                if (window.particleEffect) {
                    if (e.target.checked) {
                        window.particleEffect.enable();
                    } else {
                        window.particleEffect.disable();
                    }
                }
                this.setCookie('clickEffects', e.target.checked);
                console.log('点击特效已' + (e.target.checked ? '启用' : '禁用'));
            });
        }

        // 鼠标轨迹开关
        if (this.mouseTrailToggle) {
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
                console.log('鼠标轨迹已' + (e.target.checked ? '启用' : '禁用'));
            });
        }

        // 粒子效果开关
        if (this.particlesToggle) {
            this.particlesToggle.addEventListener('change', (e) => {
                this.updateParticleVisibility(e.target.checked);
                this.setCookie('particles', e.target.checked);
                console.log('粒子效果已' + (e.target.checked ? '启用' : '禁用'));
            });
        }

        // 必应壁纸开关
        if (this.bingWallpaperToggle) {
            this.bingWallpaperToggle.addEventListener('change', (e) => {
                CONFIG.BING_WALLPAPER.ENABLED = e.target.checked;
                this.setCookie('bingWallpaper', e.target.checked);
                // 立即应用壁纸设置
                if (typeof getBingWallpaper === 'function') {
                    getBingWallpaper();
                }
                console.log('必应壁纸已' + (e.target.checked ? '启用' : '禁用'));
            });
        }
    }

    initSakanaToggle() {
        // 从 cookie 读取状态
        const enabled = this.getCookie('sakanaWidget') !== null 
            ? this.getCookie('sakanaWidget') === 'true'
            : true; // 默认开启
        
        this.sakanaToggle.checked = enabled;
        if (typeof sakanaConfig !== 'undefined') {
            sakanaConfig.enabled = enabled;
        }
        this.updateSakanaVisibility();

        // 清除可能的旧事件
        const newSakanaToggle = this.sakanaToggle.cloneNode(true);
        this.sakanaToggle.parentNode.replaceChild(newSakanaToggle, this.sakanaToggle);
        this.sakanaToggle = newSakanaToggle;

        // 添加事件监听
        this.sakanaToggle.addEventListener('change', () => {
            if (typeof sakanaConfig !== 'undefined') {
                sakanaConfig.enabled = this.sakanaToggle.checked;
            }
            this.setCookie('sakanaWidget', this.sakanaToggle.checked);
            this.updateSakanaVisibility();
            console.log('看板娘已' + (this.sakanaToggle.checked ? '启用' : '禁用'));
        });
    }

    updateSakanaVisibility() {
        const widget = document.getElementById('sakana-widget');
        const widgetLeft = document.getElementById('sakana-widget-left');
        
        if (widget) {
            widget.style.display = (typeof sakanaConfig !== 'undefined' && sakanaConfig.enabled) ? 'block' : 'none';
        }
        if (widgetLeft) {
            widgetLeft.style.display = (typeof sakanaConfig !== 'undefined' && sakanaConfig.enabled) ? 'block' : 'none';
        }
    }
}

// Create settings instance
window.pageSettings = new Settings(); 