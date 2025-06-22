// 主题存储管理器 - 统一处理主题的保存和读取
(function() {
  'use strict';
  
  // 创建全局主题管理器
  window.ThemeStorage = {
    
    /**
     * 获取保存的主题
     * @returns {string|null} 主题名称
     */
    getTheme: function() {
      try {
        // 直接返回localStorage中的主题，这是最可靠的存储
        const theme = localStorage.getItem('cjz-theme');
        if (theme && theme !== '' && theme !== 'null' && theme !== 'undefined') {
          console.log('🎨 从localStorage获取主题:', theme);
          return theme;
        }
        
        console.log('📭 localStorage中没有有效主题');
        return null;
      } catch (error) {
        console.warn('获取主题失败:', error);
        return null;
      }
    },
    
    /**
     * 保存主题
     * @param {string} theme 主题名称
     */
    saveTheme: function(theme) {
      try {
        console.log('🎨 保存主题:', theme);
        
        // 保存到localStorage（主要存储）
        localStorage.setItem('cjz-theme', theme);
        
        // 保存到sessionStorage（会话备份）
        sessionStorage.setItem('cjz-theme', theme);
        
        // 保存到Cookie（兼容备份）
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        document.cookie = `theme=${theme};expires=${expiryDate.toUTCString()};path=/`;
        
        console.log('✅ 主题保存成功:', theme);
        
        // 触发自定义事件，通知其他组件主题已变化
        window.dispatchEvent(new CustomEvent('themeChanged', { 
          detail: { theme: theme } 
        }));
        
        return true;
      } catch (error) {
        console.error('❌ 保存主题失败:', error);
        return false;
      }
    },
    
    /**
     * 获取默认主题（基于时间）
     * @returns {string} 主题名称
     */
    getDefaultTheme: function() {
      const hour = new Date().getHours();
      const isDay = hour >= 6 && hour < 18;
      const theme = isDay ? 'light-theme' : 'dark-theme';
      console.log('🕐 根据时间选择默认主题:', theme, '(当前时间:', hour + ':00)');
      return theme;
    },
    
    /**
     * 初始化主题（如果没有保存的主题则使用默认）
     * @returns {string} 最终的主题名称
     */
    initTheme: function() {
      console.log('🔄 开始初始化主题...');
      
      // 直接检查localStorage中的主题（最可靠的存储）
      let theme = localStorage.getItem('cjz-theme');
      console.log('📖 从localStorage读取到的主题:', theme);
      
      if (theme && theme !== '' && theme !== 'null' && theme !== 'undefined') {
        // 有有效的保存主题，直接使用
        console.log('✅ 使用已保存的主题:', theme);
        return theme;
      }
      
      // 检查sessionStorage作为备份
      theme = sessionStorage.getItem('cjz-theme');
      if (theme && theme !== '' && theme !== 'null' && theme !== 'undefined') {
        console.log('📖 从sessionStorage恢复主题:', theme);
        // 同步到localStorage
        localStorage.setItem('cjz-theme', theme);
        return theme;
      }
      
      // 检查Cookie作为最后备份
      theme = this.getCookieValue('theme');
      if (theme && theme !== '' && theme !== 'null' && theme !== 'undefined') {
        console.log('📖 从Cookie恢复主题:', theme);
        // 同步到localStorage
        localStorage.setItem('cjz-theme', theme);
        return theme;
      }
      
      // 真正的首次访问，根据时间选择主题
      theme = this.getDefaultTheme();
      console.log('🆕 首次访问，根据时间选择主题:', theme);
      
      // 保存新选择的主题
      this.saveTheme(theme);
      
      return theme;
    },
    
    /**
     * 获取Cookie值的辅助方法
     * @param {string} name Cookie名称
     * @returns {string|null} Cookie值
     */
    getCookieValue: function(name) {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [cookieName, value] = cookie.trim().split('=');
        if (cookieName === name && value) {
          return value;
        }
      }
      return null;
    },
    
    /**
     * 清除所有主题存储
     */
    clearTheme: function() {
      try {
        localStorage.removeItem('cjz-theme');
        sessionStorage.removeItem('cjz-theme');
        document.cookie = 'theme=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        console.log('🗑️ 主题存储已清除');
      } catch (error) {
        console.warn('清除主题失败:', error);
      }
    },
    
    /**
     * 应用主题到页面
     * @param {string} theme 主题名称
     */
    applyTheme: function(theme) {
      try {
        // 清除现有主题类并应用新主题
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(theme);
        
        // 应用到音乐播放器（如果存在）
        const aplayer = document.querySelector('.aplayer');
        if (aplayer) {
          aplayer.classList.remove('light-theme', 'dark-theme');
          aplayer.classList.add(theme);
        }
        
        console.log('🎨 主题已应用到页面:', theme);
        return true;
      } catch (error) {
        console.error('应用主题失败:', error);
        return false;
      }
    },
    
    /**
     * 设置跨页面主题同步监听器
     */
    setupSync: function() {
      // 监听localStorage变化，实现跨页面同步
      window.addEventListener('storage', (e) => {
        if (e.key === 'cjz-theme' && e.newValue) {
          console.log('🔄 检测到其他页面主题变化:', e.newValue);
          this.applyTheme(e.newValue);
          
          // 更新主题图标（如果存在）
          if (window.settings && window.settings.updateThemeIcon) {
            window.settings.updateThemeIcon();
          }
        }
      });
      
      // 监听自定义主题变化事件
      window.addEventListener('themeChanged', (e) => {
        const theme = e.detail.theme;
        console.log('🎭 收到主题变化事件:', theme);
        this.applyTheme(theme);
      });
      
      console.log('📡 跨页面主题同步已启用');
    },
    
    /**
     * 调试信息
     */
    debug: function() {
      console.log('=== 主题存储调试信息 ===');
      console.log('localStorage:', localStorage.getItem('cjz-theme'));
      console.log('sessionStorage:', sessionStorage.getItem('cjz-theme'));
      console.log('Cookie:', document.cookie);
      console.log('当前body class:', document.body.className);
      console.log('========================');
    }
  };
  
  // 创建主题保护机制
  let themeInitialized = false;
  let protectedTheme = null;
  
  // 保护主题不被意外重置
  window.ThemeStorage.protectTheme = function() {
    if (!themeInitialized) return;
    
    console.log('🛡️ 启用主题保护');
    
    // 定期检查并恢复主题
    setInterval(() => {
      const currentTheme = document.body.className.match(/(light|dark)-theme/)?.[0];
      const storedTheme = localStorage.getItem('cjz-theme');
      
      if (storedTheme && storedTheme !== currentTheme) {
        console.log('⚠️ 检测到主题被重置，自动恢复:', storedTheme);
        window.ThemeStorage.applyTheme(storedTheme);
      }
    }, 100); // 每100ms检查一次
  };
  
  // 强制初始化主题
  window.ThemeStorage.forceInit = function() {
    console.log('🔥 强制初始化主题');
    
    const theme = this.initTheme();
    this.applyTheme(theme);
    
    themeInitialized = true;
    protectedTheme = theme;
    
    // 立即启用保护
    setTimeout(() => {
      this.protectTheme();
    }, 1000);
    
    console.log('🛡️ 主题已锁定:', theme);
  };
  
  // 在DOM加载完成后启用同步和保护
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      window.ThemeStorage.setupSync();
      window.ThemeStorage.forceInit();
    });
  } else {
    window.ThemeStorage.setupSync();
    window.ThemeStorage.forceInit();
  }
  
  console.log('✅ 主题存储管理器已加载');
  
})(); 