// Theme Loader - 主题初始化模块
(function() {
  'use strict';
  
  // 主题变量配置
  const THEME_VARS = {
    light: {
      '--bg-color': '#f5f5f5',
      '--text-color': '#8b7355',
      '--link-bg': '#e8e8e8',
      '--link-hover-bg': '#8b7355',
      '--link-hover-text': '#ffffff',
      '--shadow-color': 'rgba(139, 115, 85, 0.3)',
      '--app-bg': 'rgba(245, 245, 245, 0.75)',
      '--overlay-color': 'rgba(255, 255, 255, 0)'
    },
    dark: {
      '--bg-color': '#121212',
      '--text-color': '#c1a86a',
      '--link-bg': '#0d0d0d',
      '--link-hover-bg': '#c1a86a',
      '--link-hover-text': '#0c0c0c',
      '--shadow-color': 'rgba(193, 168, 106, 0.3)',
      '--app-bg': 'rgba(18, 18, 18, 0.75)',
      '--overlay-color': 'rgba(0, 0, 0, 0.5)'
    }
  };

  /**
   * 获取Cookie值
   * @param {string} name - Cookie名称
   * @returns {string|null} Cookie值
   */
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop().split(';').shift() : null;
  }

  /**
   * 设置Cookie
   * @param {string} name - Cookie名称
   * @param {string} value - Cookie值
   */
  function setCookie(name, value) {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    document.cookie = `${name}=${value};expires=${expiryDate.toUTCString()};path=/`;
  }

  /**
   * 应用主题变量
   * @param {string} theme - 主题名称 ('light' | 'dark')
   */
  function applyThemeVars(theme) {
    const vars = THEME_VARS[theme];
    if (!vars) return;
    
    const root = document.documentElement;
    Object.entries(vars).forEach(([prop, value]) => {
      root.style.setProperty(prop, value);
    });
  }

  /**
   * 获取默认主题
   * @returns {string} 主题名称
   */
  function getDefaultTheme() {
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 18;
    return isDay ? 'light' : 'dark';
  }

  /**
   * 初始化主题
   */
  function initTheme() {
    try {
      // 设置壁纸加载标记
      document.documentElement.setAttribute('data-loading-wallpaper', 'true');
      
      // 获取保存的主题或使用默认主题
      const savedTheme = getCookie('theme');
      const themeType = savedTheme ? savedTheme.replace('-theme', '') : getDefaultTheme();
      const themeClass = `${themeType}-theme`;
      
      // 清除现有主题类并应用新主题
      document.body.classList.remove('light-theme', 'dark-theme');
      document.body.classList.add(themeClass);
      
      // 应用主题变量
      applyThemeVars(themeType);
      
      // 保存主题设置
      if (!savedTheme) {
        setCookie('theme', themeClass);
      }
      
      console.log('主题初始化完成:', themeClass);
      
    } catch (error) {
      console.error('主题初始化失败:', error);
      // 降级到默认主题
      document.body.classList.add('dark-theme');
    }
  }

  // 立即执行初始化
  initTheme();
})(); 