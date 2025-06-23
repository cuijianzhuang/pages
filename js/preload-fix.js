/**
 * 预加载修复脚本 - 修复undefined问题
 */

(function() {
  'use strict';

  console.log('🔧 应用预加载修复...');

  // 等待wallpaperManager初始化
  function fixPreload() {
    if (window.wallpaperManager && window.wallpaperManager.preloadNextWallpaper) {
      
      // 保存原函数引用
      const originalPreload = window.wallpaperManager.preloadNextWallpaper;
      
      // 替换为修复版本
      window.wallpaperManager.preloadNextWallpaper = async function() {
        if (!this.preloadEnabled) {
          console.log('🔮 预加载已禁用');
          return;
        }
        
        console.log('🔮 开始预加载下一张壁纸（修复版本）...');
        
        try {
          // 安全获取配置
          const config = window.CONFIG || {};
          const wallpaperConfig = config.BING_WALLPAPER || {};
          
          let preloadUrl;
          
          // 1. 优先使用主端点
          if (wallpaperConfig.ENDPOINT) {
            preloadUrl = wallpaperConfig.ENDPOINT + '?t=' + (Date.now() + 1000);
            console.log('🎯 使用主端点预加载');
          }
          // 2. 其次使用备用端点
          else if (wallpaperConfig.FALLBACK_ENDPOINTS && wallpaperConfig.FALLBACK_ENDPOINTS.length > 0) {
            preloadUrl = wallpaperConfig.FALLBACK_ENDPOINTS[0] + '&t=' + (Date.now() + 1000);
            console.log('🔄 使用备用端点预加载');
          }
          // 3. 最后使用硬编码端点
          else {
            preloadUrl = 'https://bing.img.run/rand.php?t=' + (Date.now() + 1000);
            console.log('⚡ 使用默认端点预加载');
          }
          
          // 验证URL有效性
          if (!preloadUrl || preloadUrl.includes('undefined')) {
            console.error('❌ 预加载URL无效:', preloadUrl);
            return;
          }
          
          console.log('🔗 预加载URL:', preloadUrl.substring(0, 60) + '...');
          
          // 执行预加载
          if (window.apiManager && window.apiManager.requestImageFast) {
            await window.apiManager.requestImageFast(preloadUrl);
            console.log('✅ 下一张壁纸预加载完成（修复版本）');
          } else {
            console.warn('⚠️ API管理器不可用');
          }
          
        } catch (error) {
          console.log('⚠️ 预加载失败（已修复，不影响主要功能）:', error.message);
        }
      };
      
      console.log('✅ 预加载函数已修复');
      return true;
      
    } else {
      return false;
    }
  }

  // 立即尝试修复
  if (!fixPreload()) {
    // 如果失败，延迟重试
    let retryCount = 0;
    const maxRetries = 5;
    
    const retryInterval = setInterval(() => {
      retryCount++;
      
      if (fixPreload()) {
        clearInterval(retryInterval);
        console.log('✅ 延迟修复成功');
      } else if (retryCount >= maxRetries) {
        clearInterval(retryInterval);
        console.warn('⚠️ 预加载修复超时，但不影响主要功能');
      }
    }, 500);
  }

})(); 