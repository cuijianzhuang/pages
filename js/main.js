// 更新年份
document.getElementById('currentYear').textContent = new Date().getFullYear();

// 优化的必应壁纸功能
class BingWallpaperManager {
  constructor() {
    this.loadingState = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.cache = null;
    this.cacheTimestamp = 0;
    this.cacheExpiry = 3600000; // 1小时缓存
  }

  // 检查壁纸是否启用
  isEnabled() {
    const cookies = document.cookie.split(';');
    const bingWallpaperCookie = cookies.find(cookie => cookie.trim().startsWith('bingWallpaper='));
    return !bingWallpaperCookie || bingWallpaperCookie.split('=')[1].trim() !== 'false';
  }

  // 显示加载状态
  showLoadingIndicator() {
    if (!document.querySelector('.wallpaper-loading')) {
      const loader = document.createElement('div');
      loader.className = 'wallpaper-loading';
      loader.innerHTML = '<i class="fa fa-spin fa-circle-o-notch"></i> 加载壁纸中...';
      loader.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
        cursor: pointer;
      `;
      
      // 添加点击重试功能
      loader.addEventListener('click', () => {
        console.log('🔄 用户手动重试壁纸加载');
        this.clearCache();
        this.load();
      });
      
      loader.title = '点击重试';
      document.body.appendChild(loader);
      setTimeout(() => loader.style.opacity = '1', 10);
    }
  }

  // 显示错误状态
  showErrorIndicator(message = '壁纸加载失败') {
    this.hideLoadingIndicator();
    
    if (!document.querySelector('.wallpaper-error')) {
      const error = document.createElement('div');
      error.className = 'wallpaper-error';
      error.innerHTML = `<i class="fa fa-exclamation-triangle"></i> ${message}`;
      error.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(220,53,69,0.9);
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
        cursor: pointer;
      `;
      
      // 添加点击重试功能
      error.addEventListener('click', () => {
        console.log('🔄 用户点击错误提示重试');
        error.remove();
        this.clearCache();
        this.load();
      });
      
      error.title = '点击重试';
      document.body.appendChild(error);
      setTimeout(() => error.style.opacity = '1', 10);
      
      // 5秒后自动消失
      setTimeout(() => {
        if (error.parentNode) {
          error.style.opacity = '0';
          setTimeout(() => error.remove(), 300);
        }
      }, 5000);
    }
  }

  // 清除缓存
  clearCache() {
    this.cache = null;
    this.cacheTimestamp = 0;
    console.log('🗑️ 壁纸缓存已清除');
  }

  // 隐藏加载状态
  hideLoadingIndicator() {
    const loader = document.querySelector('.wallpaper-loading');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 300);
    }
  }

  // 设置壁纸标记
  setWallpaperState(loading) {
    if (loading) {
      document.documentElement.setAttribute('data-loading-wallpaper', 'true');
      document.body.setAttribute('data-loading-wallpaper', 'true');
    } else {
      document.documentElement.removeAttribute('data-loading-wallpaper');
      document.body.removeAttribute('data-loading-wallpaper');
    }
  }

  // 移除壁纸
  removeWallpaper() {
    return new Promise((resolve) => {
      document.body.style.transition = 'background-image 0.5s ease-out';
      document.body.style.backgroundImage = '';
      
      const existingOverlay = document.querySelector('.bg-wallpaper-overlay');
      if (existingOverlay) {
        existingOverlay.style.opacity = '0';
        setTimeout(() => {
          existingOverlay.remove();
          resolve();
        }, 500);
      } else {
        resolve();
      }
      
      this.setWallpaperState(false);
    });
  }

  // 创建遮罩层
  createOverlay() {
    let overlay = document.querySelector('.bg-wallpaper-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'bg-wallpaper-overlay';
      
      // 根据主题设置遮罩颜色
      const isLightTheme = document.body.classList.contains('light-theme');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        opacity: 0;
        transition: opacity 0.5s ease-in;
        background-color: ${isLightTheme ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.5)'};
      `;
      
      document.body.appendChild(overlay);
      
      // 淡入遮罩层
      setTimeout(() => {
        overlay.style.opacity = '1';
      }, 10);
    }
    return overlay;
  }

  // 应用壁纸
  async applyWallpaper(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        // 应用背景图片
        document.body.style.transition = 'background-image 0.8s ease-in';
        document.body.style.backgroundImage = `url(${imageUrl})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundAttachment = 'fixed';
        
        // 创建遮罩层
        this.createOverlay();
        
        // 移除加载状态
        this.setWallpaperState(false);
        this.hideLoadingIndicator();
        
        console.log('✅ 壁纸加载成功');
        resolve();
      };

      img.onerror = () => {
        console.error('❌ 壁纸加载失败');
        reject(new Error('图片加载失败'));
      };

      // 设置超时
      setTimeout(() => {
        reject(new Error('加载超时'));
      }, 15000); // 15秒超时

      img.src = imageUrl;
    });
  }

  // 获取壁纸URL
  async fetchWallpaperUrl() {
    // 检查缓存
    const now = Date.now();
    if (this.cache && (now - this.cacheTimestamp < this.cacheExpiry)) {
      console.log('🔄 使用缓存的壁纸');
      return this.cache;
    }

    // 尝试多个API端点
    const endpoints = [
      CONFIG.BING_WALLPAPER.ENDPOINT,
      ...(CONFIG.BING_WALLPAPER.FALLBACK_ENDPOINTS || [])
    ];

    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i];
      console.log(`🔍 尝试API端点 ${i + 1}/${endpoints.length}: ${endpoint}`);
      
      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        let imageUrl;
        
        // 判断响应类型
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          // JSON响应格式（如官方API）
          const data = await response.json();
          if (data.images && data.images[0]) {
            imageUrl = 'https://www.bing.com' + data.images[0].url;
          } else if (data.url) {
            imageUrl = data.url;
          } else {
            throw new Error('无效的JSON响应格式');
          }
        } else {
          // 直接重定向到图片（如biturl.top）
          imageUrl = response.url;
        }
        
        // 验证是否为有效的图片URL
        if (!imageUrl || (!imageUrl.includes('.jpg') && !imageUrl.includes('.jpeg') && !imageUrl.includes('.png') && !imageUrl.includes('.webp'))) {
          throw new Error('无效的图片URL');
        }
        
        // 更新缓存
        this.cache = imageUrl;
        this.cacheTimestamp = now;
        
        console.log('✅ 成功获取壁纸URL:', imageUrl);
        return imageUrl;
        
      } catch (error) {
        console.warn(`❌ API端点失败: ${endpoint} - ${error.message}`);
        if (i === endpoints.length - 1) {
          throw new Error(`所有API端点都失败了。最后一个错误: ${error.message}`);
        }
      }
    }
  }

  // 主函数：获取并应用壁纸
  async load() {
    if (this.loadingState) {
      console.log('⏳ 壁纸正在加载中，跳过');
      return;
    }

    try {
      if (!this.isEnabled()) {
        await this.removeWallpaper();
        return;
      }

      this.loadingState = true;
      this.setWallpaperState(true);
      this.showLoadingIndicator();

      const imageUrl = await this.fetchWallpaperUrl();
      await this.applyWallpaper(imageUrl);
      
      this.retryCount = 0; // 重置重试计数

    } catch (error) {
      console.error('壁纸加载错误:', error);
      
      this.setWallpaperState(false);
      
      // 重试逻辑
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`🔄 重试加载壁纸 (${this.retryCount}/${this.maxRetries})`);
        
        // 更新加载提示显示重试信息
        const loader = document.querySelector('.wallpaper-loading');
        if (loader) {
          loader.innerHTML = `<i class="fa fa-spin fa-circle-o-notch"></i> 重试中... (${this.retryCount}/${this.maxRetries})`;
        }
        
        setTimeout(() => this.load(), 2000 * this.retryCount); // 递增延迟
      } else {
        console.log('❌ 壁纸加载失败，使用默认背景');
        this.showErrorIndicator('所有API都失败了，点击重试');
        await this.removeWallpaper();
        this.retryCount = 0; // 重置重试次数
      }
    } finally {
      this.loadingState = false;
    }
  }

  // 更新遮罩层颜色（主题切换时调用）
  updateOverlay() {
    const overlay = document.querySelector('.bg-wallpaper-overlay');
    if (overlay) {
      const isLightTheme = document.body.classList.contains('light-theme');
      overlay.style.backgroundColor = isLightTheme ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.5)';
    }
  }

  // 强制刷新壁纸
  async refresh() {
    console.log('🔄 强制刷新壁纸');
    this.clearCache();
    this.retryCount = 0;
    
    // 清除所有错误提示
    const errorIndicators = document.querySelectorAll('.wallpaper-error');
    errorIndicators.forEach(indicator => indicator.remove());
    
    await this.load();
  }
}

// 创建全局壁纸管理器实例
window.wallpaperManager = new BingWallpaperManager();

// 兼容旧代码的函数
function getBingWallpaper() {
  return window.wallpaperManager.load();
}

// 注意：天气相关功能已移除，如需要可通过API管理器重新实现

// 一言功能 - 使用API管理器
async function getHitokoto() {
  try {
    const data = await apiManager.getHitokoto();
    
    document.getElementById('hitokoto-text').textContent = data.text;
    document.getElementById('hitokoto-from').textContent = data.from ? `——「${data.from}」` : '';
  } catch (error) {
    document.getElementById('hitokoto-text').textContent = '生活明朗，万物可爱。';
    document.getElementById('hitokoto-from').textContent = '';
    console.error('获取一言失败:', error);
  }
}

  // 禁用右键菜单
  document.oncontextmenu = function() {
  return false;
};

  // 禁用F12和其他开发者工具快捷键
  document.onkeydown = function(e) {
  if (e.keyCode === 123 || // F12
  (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
  (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
  (e.ctrlKey && e.keyCode === 85)) { // Ctrl+U
  return false;
}
};

  // 禁用开发者工具
  (function() {
  let devtools = function() {};
  devtools.toString = function() {
  if (window.console && window.console.clear) {
  window.console.clear();
}
  return '';
}
  window.devtools = devtools;
})();

// 初始化一言
getHitokoto();
// 每5分钟更新一次一言
setInterval(getHitokoto, CONFIG.HITOKOTO_UPDATE_INTERVAL);

// 初始化必应壁纸
getBingWallpaper();
// 每24小时更新一次壁纸
setInterval(getBingWallpaper, CONFIG.BING_WALLPAPER.UPDATE_INTERVAL);

// 注意：时间日期和天气功能已移除，如需要可使用API管理器重新实现

// 注意：主题切换功能已移至Settings类中统一管理

// 统一的页面初始化
document.addEventListener('DOMContentLoaded', function() {
  // 立即初始化壁纸，防止卡片闪烁
  getBingWallpaper();
  
  // 设置定时刷新壁纸
  setInterval(getBingWallpaper, CONFIG.BING_WALLPAPER.UPDATE_INTERVAL);
});

