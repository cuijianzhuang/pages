// 更新年份
document.getElementById('currentYear').textContent = new Date().getFullYear();

// 优化的必应壁纸功能
class BingWallpaperManager {
  constructor() {
    this.loadingState = false;
    this.retryCount = 0;
    this.maxRetries = CONFIG.BING_WALLPAPER.PERFORMANCE?.MAX_RETRIES || 2; // 减少重试次数
    this.cache = null;
    this.cacheTimestamp = 0;
    this.cacheExpiry = 3600000; // 1小时缓存
    this.fastMode = CONFIG.BING_WALLPAPER.PERFORMANCE?.PARALLEL_REQUESTS || false;
    this.preloadEnabled = CONFIG.BING_WALLPAPER.PERFORMANCE?.PRELOAD_ENABLED || false;
    
    // 启用快速模式
    if (this.fastMode && window.apiManager) {
      window.apiManager.setFastMode(true);
    }
  }

  // 预加载下一张壁纸
  async preloadNextWallpaper() {
    if (!this.preloadEnabled) return;
    
    console.log('🔮 开始预加载下一张壁纸...');
    try {
      // 预加载一个随机端点的图片
      const randomEndpoint = CONFIG.BING_WALLPAPER.FALLBACK_ENDPOINTS[0] + '&t=' + (Date.now() + 1000);
      await window.apiManager.requestImageFast(randomEndpoint);
      console.log('✅ 下一张壁纸预加载完成');
    } catch (error) {
      console.log('⚠️ 预加载失败，不影响主要功能:', error.message);
    }
  }

  // 检查壁纸是否启用
  isEnabled() {
    const cookies = document.cookie.split(';');
    const bingWallpaperCookie = cookies.find(cookie => cookie.trim().startsWith('bingWallpaper='));
    return !bingWallpaperCookie || bingWallpaperCookie.split('=')[1].trim() !== 'false';
  }

  // 显示加载状态（增强版，支持动画效果）
  showLoadingIndicator() {
    if (!document.querySelector('.wallpaper-loading')) {
      const loader = document.createElement('div');
      loader.className = 'wallpaper-loading';
      loader.innerHTML = `
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        <span class="loading-text">正在加载精美壁纸...</span>
      `;
      
      loader.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6));
        color: white;
        padding: 15px 20px;
        border-radius: 12px;
        font-size: 14px;
        z-index: 9999;
        opacity: 0;
        transform: translateY(-20px) scale(0.9);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 200px;
      `;
      
      // 添加加载动画样式
      if (!document.querySelector('#loading-animations')) {
        const style = document.createElement('style');
        style.id = 'loading-animations';
        style.textContent = `
          .loading-spinner {
            position: relative;
            width: 24px;
            height: 24px;
          }
          
          .spinner-ring {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 2px solid transparent;
            border-radius: 50%;
            animation: spin 1.5s linear infinite;
          }
          
          .spinner-ring:nth-child(1) {
            border-top-color: #4CAF50;
            animation-delay: 0s;
          }
          
          .spinner-ring:nth-child(2) {
            border-right-color: #2196F3;
            animation-delay: 0.5s;
          }
          
          .spinner-ring:nth-child(3) {
            border-bottom-color: #FF9800;
            animation-delay: 1s;
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .loading-text {
            font-weight: 500;
            background: linear-gradient(45deg, #fff, #ccc);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: text-shimmer 2s ease-in-out infinite;
          }
          
          @keyframes text-shimmer {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          .wallpaper-loading:hover {
            transform: translateY(-22px) scale(1.02);
            box-shadow: 0 12px 40px rgba(0,0,0,0.4);
          }
        `;
        document.head.appendChild(style);
      }
      
      // 添加点击重试功能
      loader.addEventListener('click', () => {
        console.log('🔄 用户手动重试壁纸加载');
        this.addClickEffect(loader);
        this.clearCache();
        this.load();
      });
      
      loader.title = '点击重试加载';
      document.body.appendChild(loader);
      
      // 延迟显示动画
      setTimeout(() => {
        loader.style.opacity = '1';
        loader.style.transform = 'translateY(0) scale(1)';
      }, 10);
    }
  }

  // 添加点击效果
  addClickEffect(element) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255,255,255,0.3);
      transform: translate(-50%, -50%);
      animation: click-ripple 0.6s ease-out;
      pointer-events: none;
    `;
    
    if (!document.querySelector('#click-animations')) {
      const style = document.createElement('style');
      style.id = 'click-animations';
      style.textContent = `
        @keyframes click-ripple {
          to {
            width: 100px;
            height: 100px;
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.remove();
      }
    }, 600);
  }

  // 显示错误状态（增强版，支持动画和重试）
  showErrorIndicator(message = '壁纸加载失败') {
    this.hideLoadingIndicator();
    
    if (!document.querySelector('.wallpaper-error')) {
      const error = document.createElement('div');
      error.className = 'wallpaper-error';
      error.innerHTML = `
        <div class="error-icon">
          <div class="error-symbol">⚠️</div>
        </div>
        <div class="error-content">
          <div class="error-title">加载失败</div>
          <div class="error-message">${message}</div>
          <div class="error-action">点击重试</div>
        </div>
      `;
      
      error.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, rgba(220,53,69,0.95), rgba(176,42,55,0.95));
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        font-size: 14px;
        z-index: 9999;
        opacity: 0;
        transform: translateX(100%) scale(0.8);
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
        box-shadow: 0 8px 32px rgba(220,53,69,0.3);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 250px;
        max-width: 350px;
      `;
      
      // 添加错误动画样式
      if (!document.querySelector('#error-animations')) {
        const style = document.createElement('style');
        style.id = 'error-animations';
        style.textContent = `
          .error-icon {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .error-symbol {
            font-size: 24px;
            animation: error-bounce 2s infinite;
          }
          
          @keyframes error-bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-6px); }
            60% { transform: translateY(-3px); }
          }
          
          .error-content {
            flex: 1;
          }
          
          .error-title {
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 4px;
          }
          
          .error-message {
            font-size: 12px;
            opacity: 0.9;
            margin-bottom: 6px;
            line-height: 1.3;
          }
          
          .error-action {
            font-size: 11px;
            color: rgba(255,255,255,0.8);
            font-style: italic;
            animation: error-pulse 1.5s ease-in-out infinite;
          }
          
          @keyframes error-pulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
          }
          
          .wallpaper-error:hover {
            transform: translateX(0) scale(1.02);
            box-shadow: 0 12px 40px rgba(220,53,69,0.4);
          }
          
          .wallpaper-error:active {
            transform: translateX(0) scale(0.98);
          }
        `;
        document.head.appendChild(style);
      }
      
      // 添加点击重试功能
      error.addEventListener('click', () => {
        console.log('🔄 用户点击错误提示重试');
        this.addClickEffect(error);
        
        // 添加退出动画
        error.style.transform = 'translateX(100%) scale(0.8)';
        error.style.opacity = '0';
        
        setTimeout(() => {
          if (error.parentNode) {
            error.remove();
          }
        }, 500);
        
        this.clearCache();
        this.load();
      });
      
      error.title = '点击重试加载壁纸';
      document.body.appendChild(error);
      
      // 入场动画
      setTimeout(() => {
        error.style.opacity = '1';
        error.style.transform = 'translateX(0) scale(1)';
      }, 100);
      
      // 8秒后自动消失
      setTimeout(() => {
        if (error.parentNode && document.contains(error)) {
          console.log('⏰ 错误提示自动消失');
          error.style.transform = 'translateX(100%) scale(0.8)';
          error.style.opacity = '0';
          
          setTimeout(() => {
            if (error.parentNode) {
              error.remove();
            }
            
            // 清理错误动画样式
            const errorStyle = document.querySelector('#error-animations');
            if (errorStyle && errorStyle.parentNode) {
              errorStyle.remove();
            }
          }, 500);
        }
      }, 8000);
    }
  }

  // 清除缓存
  clearCache() {
    this.cache = null;
    this.cacheTimestamp = 0;
    console.log('🗑️ 壁纸缓存已清除');
  }

  // 隐藏加载状态（增强版，支持动画退出）
  hideLoadingIndicator() {
    const loader = document.querySelector('.wallpaper-loading');
    if (loader) {
      console.log('✨ 隐藏加载指示器，应用退出动画');
      
      // 更新为成功状态
      const loadingText = loader.querySelector('.loading-text');
      if (loadingText) {
        loadingText.textContent = '加载完成！';
        loadingText.style.color = '#4CAF50';
      }
      
      // 添加成功动画
      loader.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      loader.style.transform = 'translateY(-30px) scale(0.95)';
      loader.style.opacity = '0.8';
      
      // 短暂显示成功状态
      setTimeout(() => {
        loader.style.transform = 'translateY(-50px) scale(0.8)';
        loader.style.opacity = '0';
        
        setTimeout(() => {
          if (loader.parentNode) {
            loader.remove();
          }
          
          // 清理加载相关的样式
          const stylesToClean = ['#loading-animations', '#click-animations'];
          stylesToClean.forEach(id => {
            const style = document.querySelector(id);
            if (style && style.parentNode) {
              style.remove();
            }
          });
        }, 500);
      }, 800);
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

  // 移除壁纸（增强版，支持优雅退出动画）
  removeWallpaper() {
    return new Promise((resolve) => {
      console.log('🌫️ 开始移除壁纸，执行退出动画...');
      
      // 创建退出动画
      this.performExitAnimation().then(() => {
        
        // 清理背景
        document.body.style.backgroundImage = '';
        
        // 移除遮罩层
        const existingOverlay = document.querySelector('.bg-wallpaper-overlay');
        if (existingOverlay) {
          existingOverlay.style.opacity = '0';
          setTimeout(() => {
            if (existingOverlay.parentNode) {
              existingOverlay.remove();
            }
          }, 500);
        }
        
        // 清理过渡相关元素
        this.cleanupTransitionElements();
        
        this.setWallpaperState(false);
        console.log('🧹 壁纸移除完成');
        resolve();
      });
    });
  }

  // 执行退出动画
  async performExitAnimation() {
    return new Promise((resolve) => {
      const currentBg = document.body.style.backgroundImage;
      
      if (currentBg && currentBg !== 'none' && currentBg !== '') {
        console.log('🌪️ 执行壁纸消散动画...');
        
        // 创建消散效果
        const fadeOut = document.createElement('div');
        fadeOut.className = 'wallpaper-fadeout';
        fadeOut.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 15;
          background: linear-gradient(45deg, 
            rgba(0,0,0,0) 0%, 
            rgba(0,0,0,0.1) 30%, 
            rgba(0,0,0,0.3) 70%, 
            rgba(0,0,0,0.8) 100%);
          opacity: 0;
          animation: wallpaper-dissolve 1s ease-out forwards;
        `;
        
        // 添加消散动画样式
        if (!document.querySelector('#wallpaper-exit-animations')) {
          const style = document.createElement('style');
          style.id = 'wallpaper-exit-animations';
          style.textContent = `
            @keyframes wallpaper-dissolve {
              0% {
                opacity: 0;
                transform: scale(1);
              }
              50% {
                opacity: 0.6;
                transform: scale(1.05);
              }
              100% {
                opacity: 1;
                transform: scale(1.1);
              }
            }
            
            @keyframes wallpaper-pixelate {
              0% { filter: blur(0px) grayscale(0%); }
              50% { filter: blur(2px) grayscale(50%); }
              100% { filter: blur(8px) grayscale(100%); }
            }
          `;
          document.head.appendChild(style);
        }
        
        document.body.appendChild(fadeOut);
        
        // 对当前背景应用像素化效果
        document.body.style.transition = 'filter 1s ease-out, opacity 1s ease-out';
        document.body.style.animation = 'wallpaper-pixelate 1s ease-out forwards';
        
        setTimeout(() => {
          // 移除消散效果
          if (fadeOut.parentNode) {
            fadeOut.remove();
          }
          
          // 重置body样式
          document.body.style.filter = '';
          document.body.style.animation = '';
          document.body.style.transition = '';
          
          resolve();
        }, 1000);
        
      } else {
        console.log('🆓 没有背景需要移除');
        resolve();
      }
    });
  }

  // 清理过渡相关元素
  cleanupTransitionElements() {
    const elementsToClean = [
      '.wallpaper-transition',
      '.wallpaper-ripple', 
      '.wallpaper-shimmer',
      '.wallpaper-fadeout'
    ];
    
    elementsToClean.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el.parentNode) {
          el.remove();
        }
      });
    });
    
    // 清理动画样式
    const styleElements = document.querySelectorAll('#wallpaper-animations, #wallpaper-exit-animations');
    styleElements.forEach(style => {
      if (style.parentNode) {
        style.remove();
      }
    });
  }

  // 创建遮罩层（增强版，支持智能动画）
  createOverlay() {
    let overlay = document.querySelector('.bg-wallpaper-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'bg-wallpaper-overlay';
      
      // 根据主题设置遮罩颜色
      const isLightTheme = document.body.classList.contains('light-theme');
      const overlayColor = isLightTheme ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.45)';
      
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        opacity: 0;
        transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        background: linear-gradient(135deg, 
          ${overlayColor} 0%, 
          ${overlayColor.replace('0.25', '0.15').replace('0.45', '0.35')} 50%,
          ${overlayColor} 100%);
        backdrop-filter: blur(0px);
      `;
      
      document.body.appendChild(overlay);
      console.log('🎭 创建智能遮罩层');
      
      // 分阶段淡入遮罩层
      setTimeout(() => {
        overlay.style.opacity = '0.3';
        overlay.style.backdropFilter = 'blur(1px)';
      }, 200);
      
      setTimeout(() => {
        overlay.style.opacity = '0.7';
        overlay.style.backdropFilter = 'blur(2px)';
      }, 600);
      
      setTimeout(() => {
        overlay.style.opacity = '1';
        overlay.style.backdropFilter = 'blur(3px)';
        console.log('✨ 遮罩层动画完成');
      }, 1000);
      
    } else {
      // 更新现有遮罩层以适应新主题
      this.updateOverlayForTheme(overlay);
    }
    return overlay;
  }

  // 更新遮罩层主题
  updateOverlayForTheme(overlay) {
    const isLightTheme = document.body.classList.contains('light-theme');
    const overlayColor = isLightTheme ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.45)';
    
    overlay.style.background = `linear-gradient(135deg, 
      ${overlayColor} 0%, 
      ${overlayColor.replace('0.25', '0.15').replace('0.45', '0.35')} 50%,
      ${overlayColor} 100%)`;
    
    console.log('🎨 更新遮罩层主题');
  }

  // 应用壁纸（增强版，支持平滑过渡动画）
  async applyWallpaper(imageUrl) {
    return new Promise((resolve, reject) => {
      console.log('🎨 开始应用壁纸，准备动画效果...');
      
      const img = new Image();
      
      img.onload = async () => {
        try {
          console.log(`📸 图片预加载成功: ${img.naturalWidth}x${img.naturalHeight}`);
          
          // 开始平滑过渡动画
          await this.performSmoothTransition(imageUrl);
          
          // 移除加载状态
          this.setWallpaperState(false);
          this.hideLoadingIndicator();
          
          console.log('✨ 壁纸过渡动画完成');
          resolve();
        } catch (error) {
          console.error('❌ 壁纸过渡失败:', error);
          reject(error);
        }
      };

      img.onerror = () => {
        console.error('❌ 壁纸图片加载失败');
        reject(new Error('图片加载失败'));
      };

      // 设置超时（减少到10秒）
      setTimeout(() => {
        reject(new Error('图片加载超时'));
      }, 10000);

      img.src = imageUrl;
    });
  }

  // 执行平滑过渡动画
  async performSmoothTransition(imageUrl) {
    return new Promise((resolve) => {
      console.log('🌟 开始执行平滑过渡动画...');
      
      // 创建过渡层
      const transitionLayer = this.createTransitionLayer();
      
      // 阶段1：淡出当前背景（如果有的话）
      this.fadeOutCurrentBackground().then(() => {
        
        // 阶段2：预设新背景（透明状态）
        this.prepareNewBackground(imageUrl);
        
        // 阶段3：淡入新背景
        setTimeout(() => {
          this.fadeInNewBackground(transitionLayer, resolve);
        }, 100); // 短暂延迟确保样式应用
      });
    });
  }

  // 创建过渡层
  createTransitionLayer() {
    let transitionLayer = document.querySelector('.wallpaper-transition');
    if (!transitionLayer) {
      transitionLayer = document.createElement('div');
      transitionLayer.className = 'wallpaper-transition';
      transitionLayer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        opacity: 0;
        transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-attachment: fixed;
      `;
      document.body.appendChild(transitionLayer);
    }
    return transitionLayer;
  }

  // 淡出当前背景
  async fadeOutCurrentBackground() {
    return new Promise((resolve) => {
      const currentBg = document.body.style.backgroundImage;
      
      if (currentBg && currentBg !== 'none' && currentBg !== '') {
        console.log('🌙 淡出当前背景...');
        
        // 添加淡出过渡
        document.body.style.transition = 'opacity 0.6s ease-out, filter 0.6s ease-out';
        document.body.style.opacity = '0.7';
        document.body.style.filter = 'blur(3px) brightness(0.8)';
        
        setTimeout(resolve, 600);
      } else {
        console.log('🆕 没有当前背景，跳过淡出');
        resolve();
      }
    });
  }

  // 预设新背景
  prepareNewBackground(imageUrl) {
    console.log('🎯 预设新背景...');
    
    // 重置body样式
    document.body.style.opacity = '1';
    document.body.style.filter = 'none';
    document.body.style.transition = 'background-image 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // 设置新背景（初始透明）
    document.body.style.backgroundImage = `url(${imageUrl})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';
  }

  // 淡入新背景
  fadeInNewBackground(transitionLayer, resolve) {
    console.log('🌅 淡入新背景...');
    
    // 创建渐进效果
    this.createProgressiveReveal().then(() => {
      
      // 更新遮罩层
      this.createOverlay();
      
      // 清理过渡层
      setTimeout(() => {
        if (transitionLayer.parentNode) {
          transitionLayer.style.opacity = '0';
          setTimeout(() => {
            if (transitionLayer.parentNode) {
              transitionLayer.remove();
            }
          }, 500);
        }
      }, 1000);
      
      console.log('✨ 背景淡入完成');
      resolve();
    });
  }

  // 创建渐进显示效果
  async createProgressiveReveal() {
    return new Promise((resolve) => {
      // 添加波纹展开效果
      const ripple = document.createElement('div');
      ripple.className = 'wallpaper-ripple';
      ripple.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: radial-gradient(circle, transparent 0%, rgba(255,255,255,0.1) 70%, transparent 100%);
        pointer-events: none;
        z-index: 10;
        transform: translate(-50%, -50%);
        animation: wallpaper-reveal 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      `;
      
      // 添加动画样式
      if (!document.querySelector('#wallpaper-animations')) {
        const style = document.createElement('style');
        style.id = 'wallpaper-animations';
        style.textContent = `
          @keyframes wallpaper-reveal {
            0% {
              width: 0;
              height: 0;
              opacity: 0.8;
            }
            70% {
              width: 150vmax;
              height: 150vmax;
              opacity: 0.3;
            }
            100% {
              width: 200vmax;
              height: 200vmax;
              opacity: 0;
            }
          }
          
          @keyframes wallpaper-shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          
          .wallpaper-shimmer {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, 
              transparent 0%, 
              rgba(255, 255, 255, 0.1) 50%, 
              transparent 100%);
            pointer-events: none;
            z-index: 5;
            animation: wallpaper-shimmer 2s ease-in-out;
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(ripple);
      
      // 添加微光效果
      setTimeout(() => {
        const shimmer = document.createElement('div');
        shimmer.className = 'wallpaper-shimmer';
        document.body.appendChild(shimmer);
        
        setTimeout(() => {
          if (shimmer.parentNode) shimmer.remove();
        }, 2000);
      }, 300);
      
      // 清理波纹效果
      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.remove();
        }
        resolve();
      }, 1500);
    });
  }

  // 获取壁纸URL（优化版本，支持并发请求）
  async fetchWallpaperUrl() {
    // 检查缓存
    const now = Date.now();
    if (this.cache && (now - this.cacheTimestamp < this.cacheExpiry)) {
      console.log('⚡ 使用缓存的壁纸');
      return this.cache;
    }

    const endpoints = [
      CONFIG.BING_WALLPAPER.ENDPOINT,
      ...(CONFIG.BING_WALLPAPER.FALLBACK_ENDPOINTS || [])
    ];

    // 添加时间戳防止缓存
    const timestampedEndpoints = endpoints.map(endpoint => 
      `${endpoint}${endpoint.includes('?') ? '&' : '?'}t=${now}`
    );

    let imageUrl;

    if (this.fastMode && timestampedEndpoints.length > 1) {
      // 并发模式：同时请求多个API，使用最快的响应
      console.log('🏁 启用并发竞速模式');
      try {
        imageUrl = await window.apiManager.raceRequests(timestampedEndpoints);
        console.log('⚡ 并发请求获得结果');
      } catch (error) {
        console.warn('⚠️ 并发模式失败，回退到串行模式:', error.message);
        // 回退到串行模式
        imageUrl = await this.fetchWallpaperSequential(timestampedEndpoints);
      }
    } else {
      // 串行模式：逐个尝试API（优化版）
      imageUrl = await this.fetchWallpaperSequential(timestampedEndpoints);
    }

    if (imageUrl) {
      // 更新缓存
      this.cache = imageUrl;
      this.cacheTimestamp = now;
      
      // 异步预加载下一张
      if (this.preloadEnabled) {
        setTimeout(() => this.preloadNextWallpaper(), 2000);
      }
    }

    return imageUrl;
  }

  // 串行获取壁纸（优化版，减少延迟）
  async fetchWallpaperSequential(endpoints) {
    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i];
      console.log(`⚡ 快速尝试API端点 ${i + 1}/${endpoints.length}: ${endpoint.substring(0, 50)}...`);
      
      try {
        let imageUrl;
        const apiType = this.detectApiType(endpoint);
        
        if (apiType === 'direct_image') {
          try {
            imageUrl = await window.apiManager.requestImageFast(endpoint);
          } catch (corsError) {
            console.warn('⚠️ 快速方法失败，尝试备用方法:', corsError.message);
            imageUrl = await this.tryDirectImageLoad(endpoint);
          }
        } else if (apiType === 'json') {
          // 对JSON API也使用快速模式
          const controller = new AbortController();
          setTimeout(() => controller.abort(), 8000); // 8秒超时
          
          const response = await fetch(endpoint, { 
            signal: controller.signal,
            cache: 'default'
          });
          const data = await response.json();
          
          if (data.images && data.images[0]) {
            imageUrl = 'https://www.bing.com' + data.images[0].url;
          } else if (data.url) {
            imageUrl = data.url;
          }
        } else {
          imageUrl = await window.apiManager.requestImageFast(endpoint);
        }

        if (imageUrl) {
          console.log('⚡ 快速获取成功:', imageUrl.substring(0, 50) + '...');
          return imageUrl;
        }
        
      } catch (error) {
        console.warn(`❌ 快速API端点失败: ${error.message}`);
        // 不等待，立即尝试下一个
        continue;
      }
    }

    throw new Error('所有快速API端点都失败了');
  }

  // 直接图片加载方法（优化版，减少超时）
  async tryDirectImageLoad(url) {
    return new Promise((resolve, reject) => {
      console.log('⚡ 快速直接Image加载...');
      
      const img = new Image();
      const timeoutId = setTimeout(() => {
        reject(new Error('快速图片加载超时'));
      }, 8000); // 减少到8秒
      
      img.onload = () => {
        clearTimeout(timeoutId);
        console.log(`⚡ 快速图片加载成功: ${img.naturalWidth}x${img.naturalHeight}`);
        resolve(url);
      };
      
      img.onerror = (error) => {
        clearTimeout(timeoutId);
        reject(new Error('快速图片加载失败'));
      };
      
      img.src = url;
    });
  }

  // 检测API类型
  detectApiType(url) {
    for (const [domain, type] of Object.entries(CONFIG.BING_WALLPAPER.ENDPOINT_TYPES)) {
      if (url.includes(domain)) {
        return type;
      }
    }
    // 默认为重定向类型
    return 'redirect';
  }

  // 主函数：获取并应用壁纸（优化版，快速重试）
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

      console.log('⚡ 开始快速壁纸加载...');
      const startTime = performance.now();
      
      const imageUrl = await this.fetchWallpaperUrl();
      await this.applyWallpaper(imageUrl);
      
      const loadTime = Math.round(performance.now() - startTime);
      console.log(`✅ 壁纸加载成功，耗时: ${loadTime}ms`);
      
      this.retryCount = 0; // 重置重试计数

    } catch (error) {
      console.error('壁纸加载错误:', error);
      
      this.setWallpaperState(false);
      
      // 快速重试逻辑（减少延迟）
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`⚡ 快速重试 (${this.retryCount}/${this.maxRetries})`);
        
        // 更新加载提示
        const loader = document.querySelector('.wallpaper-loading');
        if (loader) {
          loader.innerHTML = `<i class="fa fa-spin fa-circle-o-notch"></i> 快速重试... (${this.retryCount}/${this.maxRetries})`;
        }
        
        // 减少重试延迟（从2秒递增改为固定0.5秒）
        const retryDelay = CONFIG.BING_WALLPAPER.PERFORMANCE?.RETRY_DELAY || 500;
        setTimeout(() => this.load(), retryDelay);
      } else {
        console.log('❌ 所有快速重试都失败了');
        this.showErrorIndicator('加载失败，点击重试');
        await this.removeWallpaper();
        this.retryCount = 0;
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
  
  // 初始化日期时间显示
  if (typeof DateTimeDisplay !== 'undefined') {
    window.dateTimeDisplay = new DateTimeDisplay();
  }
  
  // 设置定时刷新壁纸
  setInterval(getBingWallpaper, CONFIG.BING_WALLPAPER.UPDATE_INTERVAL);
});

