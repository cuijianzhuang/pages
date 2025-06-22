// Theme Loader - 主题初始化模块
(function() {
  'use strict';
  
  // 主题变量配置
  const THEME_VARS = {
    light: {
      '--bg-color': '#f5f5f5',
      '--text-color': '#ffffff',
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

  // 使用统一的主题管理器（如果可用）
  function useThemeStorage() {
    return window.ThemeStorage || null;
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
      
      console.log('===== 主题加载器 =====');
      
      // 尝试使用统一的主题管理器
      const themeStorage = useThemeStorage();
      let themeClass;
      
      if (themeStorage) {
        console.log('✅ 使用统一主题管理器');
        themeClass = themeStorage.initTheme();
      } else {
        console.log('⚠️ 降级到基本主题逻辑');
        // 降级处理
        const savedTheme = localStorage.getItem('cjz-theme') || localStorage.getItem('theme');
        if (savedTheme) {
          themeClass = savedTheme;
          console.log('🎨 使用已保存的主题:', themeClass);
        } else {
          const themeType = getDefaultTheme();
          themeClass = `${themeType}-theme`;
          localStorage.setItem('cjz-theme', themeClass);
          console.log('🎨 首次访问，根据时间选择主题:', themeClass);
        }
      }
      
      // 清除现有主题类并应用新主题
      document.body.classList.remove('light-theme', 'dark-theme');
      document.body.classList.add(themeClass);
      
      // 应用主题变量
      const themeType = themeClass.replace('-theme', '');
      applyThemeVars(themeType);
      
      // 防止其他脚本覆盖主题设置
      window.themeLoaderCompleted = true;
      window.currentTheme = themeClass;
      
      console.log('🎨 主题初始化完成:', themeClass);
      console.log('======================');
      
    } catch (error) {
      console.error('主题初始化失败:', error);
      // 降级到默认主题
      document.body.classList.add('dark-theme');
    }
  }

  // 立即执行初始化
  initTheme();
})(); 