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

    getSessionStorage(name) {
        try {
            return sessionStorage.getItem(name);
        } catch (error) {
            console.warn('无法访问sessionStorage:', error);
            return null;
        }
    }

    setSessionStorage(name, value) {
        try {
            sessionStorage.setItem(name, value);
        } catch (error) {
            console.warn('无法设置sessionStorage:', error);
        }
    }

    // 保持getCookie和setCookie方法用于非主题相关的设置
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
        
        // 首次加载时如果没有cookie，设置cookie为false
        // if (this.getCookie('mouseTrail') === null) {
        //     this.setCookie('mouseTrail', 'false');
        // }

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
        
        // 初始化主题切换功能
        this.initThemeToggle();
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
                
                // 使用新的壁纸管理器
                if (window.wallpaperManager) {
                    window.wallpaperManager.load();
                } else if (typeof getBingWallpaper === 'function') {
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

    // 主题切换功能
    initThemeToggle() {
        // 检查主题加载器是否已经完成初始化，如果是则不重新设置主题
        if (window.themeLoaderCompleted) {
            console.log('⚙️ Settings: 主题加载器已完成，跳过重复初始化');
        }
        
        const themeToggle = document.querySelector('.theme-toggle');
        if (!themeToggle) {
            console.warn('未找到主题切换按钮');
            return;
        }

        const themeIcon = themeToggle.querySelector('i');
        if (!themeIcon) {
            console.warn('未找到主题切换图标');
            return;
        }

        // 设置初始图标状态
        this.updateThemeIcon();

        // 清除可能的旧事件监听器
        const newThemeToggle = themeToggle.cloneNode(true);
        themeToggle.parentNode.replaceChild(newThemeToggle, themeToggle);
        
        // 重新获取DOM引用
        const updatedThemeToggle = document.querySelector('.theme-toggle');
        const updatedThemeIcon = updatedThemeToggle.querySelector('i');

        // 添加点击事件
        updatedThemeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('主题切换按钮被点击');

            // 添加旋转动画
            this.addRotationAnimation();
            updatedThemeToggle.classList.add('rotating');

            // 切换主题
            const currentTheme = document.body.classList.contains('light-theme');
            const newTheme = currentTheme ? 'dark-theme' : 'light-theme';
            
            this.setTheme(newTheme);

            // 动画结束后移除类
            setTimeout(() => {
                updatedThemeToggle.classList.remove('rotating');
            }, 600);
        });

        console.log('主题切换功能初始化完成');
    }

    setTheme(theme) {
        console.log('⚙️ Settings: 开始切换主题为:', theme);
        
        // 使用统一的主题管理器保存和应用
        if (window.ThemeStorage) {
            // 保存主题
            window.ThemeStorage.saveTheme(theme);
            // 应用主题
            window.ThemeStorage.applyTheme(theme);
        } else {
            // 降级处理
            console.log('⚠️ 主题管理器不可用，使用降级模式');
            const body = document.body;
            const aplayer = document.querySelector('.aplayer');

            // 清除现有主题类并添加新主题类
            body.classList.remove('light-theme', 'dark-theme');
            body.classList.add(theme);

            // 应用到音乐播放器
            if (aplayer) {
                aplayer.classList.remove('light-theme', 'dark-theme');
                aplayer.classList.add(theme);
            }
            
            try {
                localStorage.setItem('cjz-theme', theme);
                localStorage.setItem('theme', theme);
                this.setCookie('theme', theme);
                console.log('⚙️ Settings: 主题已保存(降级模式):', theme);
            } catch (error) {
                console.warn('保存主题失败:', error);
            }
        }

        // 更新主题图标
        this.updateThemeIcon();

        // 更新壁纸遮罩颜色
        this.updateWallpaperOverlay(theme);

        console.log(`✅ Settings: 主题已切换为: ${theme}`);
    }

    updateThemeIcon() {
        const themeIcon = document.querySelector('.theme-toggle i');
        if (!themeIcon) return;

        const isLight = document.body.classList.contains('light-theme');
        themeIcon.classList.remove('fa-sun-o', 'fa-moon-o');
        themeIcon.classList.add(isLight ? 'fa-moon-o' : 'fa-sun-o');
    }

    updateWallpaperOverlay(theme) {
        // 使用新的壁纸管理器
        if (window.wallpaperManager) {
            window.wallpaperManager.updateOverlay();
        } else {
            // 降级处理
            const overlay = document.querySelector('.bg-wallpaper-overlay');
            if (overlay) {
                const overlayColor = theme === 'light-theme' ? 
                    'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.5)';
                overlay.style.backgroundColor = overlayColor;
            }
        }
    }

    addRotationAnimation() {
        if (!document.getElementById('theme-rotation-style')) {
            const style = document.createElement('style');
            style.id = 'theme-rotation-style';
            style.textContent = `
                .theme-toggle.rotating {
                    animation: rotate360 0.6s ease;
                }
                @keyframes rotate360 {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }




}

// Create settings instance
window.pageSettings = new Settings(); 