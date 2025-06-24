/**
 * API管理器 - 统一处理API请求和错误处理
 */
class ApiManager {
  constructor() {
    this.retryCount = 3;
    this.retryDelay = 1000; // 1秒
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.fastMode = false; // 快速模式标志
  }

  /**
   * 设置快速模式
   * @param {boolean} enabled - 是否启用快速模式
   */
  setFastMode(enabled) {
    this.fastMode = enabled;
    if (enabled) {
      this.retryCount = CONFIG.BING_WALLPAPER.PERFORMANCE?.MAX_RETRIES || 2;
      this.retryDelay = CONFIG.BING_WALLPAPER.PERFORMANCE?.RETRY_DELAY || 500;
      console.log('⚡ API管理器已切换到快速模式');
    } else {
      this.retryCount = 3;
      this.retryDelay = 1000;
      console.log('🔄 API管理器已切换到标准模式');
    }
  }

  /**
   * 快速图片请求方法（优化超时处理）
   * @param {string} url - 图片URL
   * @param {Object} options - 请求选项
   * @returns {Promise<string>} 图片URL或Blob URL
   */
  async requestImageFast(url, options = {}) {
    // 增加超时时间，给网络更多时间
    const timeout = this.fastMode ? 
      (CONFIG.BING_WALLPAPER.PERFORMANCE?.FAST_TIMEOUT || 12000) : 
      25000; // 增加超时时间
    
    // console.log(`⚡ 快速图片请求: ${url} (超时: ${timeout}ms)`);
    
    // 首先尝试使用Image元素直接加载（避免CORS问题）
    return new Promise((resolve, reject) => {
      const img = new Image();
      let isCompleted = false; // 添加完成标志
      
      const timeoutId = setTimeout(() => {
        if (!isCompleted) {
          isCompleted = true;
          img.src = ''; // 停止加载
          console.log(`⏰ 图片加载超时，尝试备用方法...`);
          
          // 超时后尝试备用方法而不是直接失败
          this.requestImageWithProxy(url, options, timeout)
            .then(resolve)
            .catch((error) => {
              // 如果备用方法也失败，抛出错误让上层尝试其他端点
              console.log(`❌ 备用方法超时失败: ${error.message}`);
              reject(new Error(`图片加载超时失败: ${error.message}`));
            });
        }
      }, timeout);
      
      // 不设置crossOrigin，避免CORS检查
      img.onload = () => {
        if (!isCompleted) {
          isCompleted = true;
          clearTimeout(timeoutId);
          console.log(`⚡ 快速图片加载成功: ${img.naturalWidth}x${img.naturalHeight}`);
          resolve(url); // 直接返回原URL，因为图片已经可以使用
        }
      };
      
      img.onerror = () => {
        if (!isCompleted) {
          isCompleted = true;
          clearTimeout(timeoutId);
          console.log(`⚠️ Image元素加载失败，尝试代理方法`);
          
          // 如果Image加载失败，尝试使用代理服务
          this.requestImageWithProxy(url, options, timeout)
            .then(resolve)
            .catch((error) => {
              // 如果代理方法也失败，抛出错误让上层尝试其他端点
              console.log(`❌ 代理方法也失败: ${error.message}`);
              reject(new Error(`图片加载失败: ${error.message}`));
            });
        }
      };
      
      // 添加延迟设置src，给浏览器更多准备时间
      setTimeout(() => {
        if (!isCompleted) {
          img.src = url;
        }
      }, 10);
    });
  }

  /**
   * 使用代理服务请求图片
   * @param {string} url - 图片URL
   * @param {Object} options - 请求选项
   * @param {number} timeout - 超时时间
   * @returns {Promise<string>} 图片URL或Blob URL
   */
  async requestImageWithProxy(url, options = {}, timeout = 15000) {
    console.log(`🔄 使用代理方法请求图片: ${url}`);
    
    // 对于bing.img.run，尝试更宽松的加载策略
    if (url.includes('bing.img.run')) {
      console.log(`🎯 检测到bing.img.run，使用优化策略`);
      
      return new Promise((resolve) => {
        // 给bing.img.run更多时间，并且不会失败
        const img = new Image();
        let isCompleted = false;
        
        // 延长超时时间到30秒
        const extendedTimeout = Math.max(timeout, 30000);
        const timeoutId = setTimeout(() => {
          if (!isCompleted) {
            isCompleted = true;
            console.log(`❌ bing.img.run加载超时`);
            reject(new Error('bing.img.run图片加载超时'));
          }
        }, extendedTimeout);
        
        img.onload = () => {
          if (!isCompleted) {
            isCompleted = true;
            clearTimeout(timeoutId);
            console.log(`✅ bing.img.run加载成功: ${img.naturalWidth}x${img.naturalHeight}`);
            resolve(url);
          }
        };
        
        img.onerror = () => {
          if (!isCompleted) {
            isCompleted = true;
            clearTimeout(timeoutId);
            console.log(`❌ bing.img.run加载失败`);
            reject(new Error('bing.img.run图片加载失败'));
          }
        };
        
        setTimeout(() => {
          if (!isCompleted) {
            img.src = url;
          }
        }, 100); // 给更多准备时间
      });
    }
    
    // 对于其他URL，尝试使用备用方法
    return this.requestImageFallback(url, options, timeout);
  }

  /**
   * 图片请求的备用方法
   * @param {string} url - 图片URL
   * @param {Object} options - 请求选项
   * @param {number} timeout - 超时时间
   * @returns {Promise<string>} 图片URL或Blob URL
   */
  async requestImageFallback(url, options = {}, timeout = 15000) {
    console.log(`🔄 使用备用方法请求图片: ${url}`);
    
    // 创建AbortController来处理超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        credentials: 'omit',
        signal: controller.signal,
        headers: {
          'Accept': 'image/*,*/*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        ...options
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      let imageUrl;

      // 判断响应类型并处理
      if (contentType && contentType.startsWith('image/')) {
        // 直接返回图片数据
        const blob = await response.blob();
        if (blob.size === 0) {
          throw new Error('接收到空的图片数据');
        }
        
        imageUrl = URL.createObjectURL(blob);
        console.log(`💾 备用方法Blob创建: ${blob.size} bytes`);

        // 定时释放Blob URL
        setTimeout(() => URL.revokeObjectURL(imageUrl), 3600000);

      } else if (contentType && contentType.includes('application/json')) {
        // JSON响应格式（必应官方API）
        const data = await response.json();
        console.log('📄 备用方法收到JSON响应:', data);
        
        if (data.images && data.images.length > 0) {
          const imageInfo = data.images[0];
          let rawUrl = imageInfo.url || imageInfo.urlbase;
          
          if (!rawUrl) {
            throw new Error('JSON响应中未找到图片URL');
          }
          
          // 确保是完整的HTTP URL
          if (rawUrl.startsWith('/')) {
            imageUrl = 'https://www.bing.com' + rawUrl;
          } else if (!rawUrl.startsWith('http')) {
            imageUrl = 'https://www.bing.com/' + rawUrl;
          } else {
            imageUrl = rawUrl;
          }
          
          // 添加高质量参数
          if (imageUrl.includes('bing.com')) {
            const urlObj = new URL(imageUrl);
            urlObj.searchParams.set('w', '1920');
            urlObj.searchParams.set('h', '1080');
            urlObj.searchParams.set('c', '7');
            imageUrl = urlObj.toString();
          }
          
          console.log('✅ JSON图片URL处理完成:', imageUrl);
        } else if (data.url) {
          imageUrl = data.url;
        } else {
          throw new Error('无效的JSON响应格式');
        }
      } else {
        // 重定向URL
        imageUrl = response.url;
      }

      if (!imageUrl) {
        throw new Error('无法获取有效的图片URL');
      }

      return imageUrl;

    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`备用方法请求超时 (${timeout}ms)`);
      }
      throw error;
    }
  }

  /**
   * 通用API请求方法
   * @param {string} url - 请求URL
   * @param {Object} options - 请求选项
   * @param {number} cacheTime - 缓存时间（毫秒），0表示不缓存
   * @returns {Promise} API响应
   */
  async request(url, options = {}, cacheTime = 0) {
    // 检查缓存
    if (cacheTime > 0 && this.isValidCache(url)) {
      console.log('使用缓存数据:', url);
      return this.cache.get(url);
    }

    let lastError;
    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        console.log(`API请求 (尝试 ${attempt}/${this.retryCount}):`, url);
        
        const response = await fetch(url, {
          timeout: 10000, // 10秒超时
          ...options
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // 缓存成功的响应
        if (cacheTime > 0) {
          this.setCache(url, data, cacheTime);
        }

        return data;

      } catch (error) {
        lastError = error;
        console.warn(`API请求失败 (尝试 ${attempt}/${this.retryCount}):`, error.message);
        
        if (attempt < this.retryCount) {
          await this.delay(this.retryDelay * attempt); // 递增延迟
        }
      }
    }

    throw new Error(`API请求最终失败: ${lastError.message}`);
  }

  /**
   * 专门用于图片请求的方法
   * @param {string} url - 图片URL
   * @param {Object} options - 请求选项
   * @param {number} cacheTime - 缓存时间（毫秒），0表示不缓存
   * @returns {Promise<string>} 图片URL或Blob URL
   */
  async requestImage(url, options = {}, cacheTime = 0) {
    // 检查缓存
    if (cacheTime > 0 && this.isValidCache(url)) {
      console.log('使用缓存的图片数据:', url);
      return this.cache.get(url);
    }

    let lastError;
    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        console.log(`图片API请求 (尝试 ${attempt}/${this.retryCount}):`, url);
        
        // 创建一个AbortController来处理超时
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'omit',
          signal: controller.signal,
          headers: {
            'Accept': 'image/*,*/*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          ...options
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        console.log('🔍 响应内容类型:', contentType);

        let imageUrl;

        // 判断响应类型并处理
        if (contentType && contentType.startsWith('image/')) {
          // 直接返回图片数据的API（如 bing.img.run）
          console.log('📸 检测到直接图片响应，创建Blob URL');
          const blob = await response.blob();
          console.log(`💾 Blob创建成功: ${blob.size} bytes, 类型: ${blob.type}`);
          
          if (blob.size === 0) {
            throw new Error('接收到空的图片数据');
          }
          
          imageUrl = URL.createObjectURL(blob);
          console.log('🔗 Blob URL创建:', imageUrl.substring(0, 50) + '...');

          // 定时释放Blob URL（1小时后）
          setTimeout(() => {
            URL.revokeObjectURL(imageUrl);
            console.log('🗑️ Blob URL已自动释放');
          }, 3600000);

        } else if (contentType && contentType.includes('application/json')) {
          // JSON响应格式（必应官方API）
          const data = await response.json();
          console.log('📄 图片API收到JSON响应:', data);
          
          if (data.images && data.images.length > 0) {
            const imageInfo = data.images[0];
            let rawUrl = imageInfo.url || imageInfo.urlbase;
            
            if (!rawUrl) {
              throw new Error('JSON响应中未找到图片URL');
            }
            
            // 确保是完整的HTTP URL
            if (rawUrl.startsWith('/')) {
              imageUrl = 'https://www.bing.com' + rawUrl;
            } else if (!rawUrl.startsWith('http')) {
              imageUrl = 'https://www.bing.com/' + rawUrl;
            } else {
              imageUrl = rawUrl;
            }
            
            // 添加高质量参数
            if (imageUrl.includes('bing.com')) {
              const urlObj = new URL(imageUrl);
              urlObj.searchParams.set('w', '1920');
              urlObj.searchParams.set('h', '1080');
              urlObj.searchParams.set('c', '7');
              imageUrl = urlObj.toString();
            }
            
            console.log('✅ JSON图片URL处理完成:', imageUrl);
          } else if (data.url) {
            imageUrl = data.url;
          } else {
            throw new Error('无效的JSON响应格式');
          }
        } else if (contentType && contentType.includes('text/html')) {
          // 可能是错误页面或重定向页面
          throw new Error('服务器返回HTML页面，可能是错误或重定向');
        } else {
          // 重定向到图片URL（如biturl.top）
          console.log('🔄 检测到重定向或其他响应类型，使用response.url');
          imageUrl = response.url;
        }

        if (!imageUrl) {
          throw new Error('无法获取有效的图片URL');
        }
        
        // 缓存成功的响应
        if (cacheTime > 0) {
          this.setCache(url, imageUrl, cacheTime);
        }

        console.log('✅ 图片URL获取成功:', imageUrl.substring(0, 100) + '...');
        return imageUrl;

      } catch (error) {
        lastError = error;
        console.warn(`图片API请求失败 (尝试 ${attempt}/${this.retryCount}):`, error.message);
        
        // 如果是CORS错误，尝试不同的策略
        if (error.message.includes('cors') || error.message.includes('CORS')) {
          console.warn('🌐 检测到CORS问题，将在下次尝试中使用不同策略');
        }
        
        if (attempt < this.retryCount) {
          await this.delay(this.retryDelay * attempt); // 递增延迟
        }
      }
    }

    throw new Error(`图片API请求最终失败: ${lastError.message}`);
  }

  /**
   * 获取天气信息
   * @returns {Promise<Object>} 天气数据
   */
  async getWeather() {
    try {
      // 先获取IP定位
      const locationData = await this.request(
        `${CONFIG.AMAP.ENDPOINTS.IP_LOCATION}?key=${CONFIG.AMAP.KEY}`,
        {},
        300000 // 5分钟缓存
      );

      if (locationData.status !== '1') {
        throw new Error('定位失败');
      }

      const cityName = locationData.city;
      
      // 获取城市坐标
      const geocodeData = await this.request(
        `${CONFIG.AMAP.ENDPOINTS.GEOCODE}?address=${encodeURIComponent(cityName)}&key=${CONFIG.AMAP.KEY}`,
        {},
        3600000 // 1小时缓存
      );

      if (geocodeData.status !== '1' || !geocodeData.geocodes.length) {
        throw new Error('地理编码失败');
      }

      const location = geocodeData.geocodes[0].location;
      const [longitude, latitude] = location.split(',');

      // 获取天气数据
      const weatherData = await this.request(
        `${CONFIG.QWEATHER.ENDPOINTS.WEATHER}?location=${longitude},${latitude}&key=${CONFIG.QWEATHER.KEY}`,
        {},
        1800000 // 30分钟缓存
      );

      if (weatherData.code !== '200') {
        throw new Error('天气数据获取失败');
      }

      return {
        city: cityName,
        weather: weatherData.now
      };

    } catch (error) {
      console.error('天气API错误:', error);
      throw error;
    }
  }

  /**
   * 获取一言
   * @returns {Promise<Object>} 一言数据
   */
  async getHitokoto() {
    try {
      const params = new URLSearchParams(CONFIG.HITOKOTO.DEFAULT_PARAMS);
      const data = await this.request(
        `${CONFIG.HITOKOTO.ENDPOINT}?${params}`,
        {},
        300000 // 5分钟缓存
      );

      return {
        text: this.sanitizeText(data.hitokoto),
        from: this.sanitizeText(data.from || '未知')
      };

    } catch (error) {
      console.error('一言API错误:', error);
      return {
        text: '今天也是充满希望的一天',
        from: '默认语录'
      };
    }
  }

  /**
   * 文本清理 - 防止XSS
   * @param {string} text - 原始文本
   * @returns {string} 清理后的文本
   */
  sanitizeText(text) {
    if (typeof text !== 'string') return '';
    
    return text
      .replace(/[<>'"&]/g, (char) => {
        const entities = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
          '&': '&amp;'
        };
        return entities[char] || char;
      })
      .trim();
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {*} data - 缓存数据
   * @param {number} expiry - 过期时间（毫秒）
   */
  setCache(key, data, expiry) {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + expiry);
  }

  /**
   * 检查缓存是否有效
   * @param {string} key - 缓存键
   * @returns {boolean} 是否有效
   */
  isValidCache(key) {
    if (!this.cache.has(key) || !this.cacheExpiry.has(key)) {
      return false;
    }
    
    const expiry = this.cacheExpiry.get(key);
    const isValid = Date.now() < expiry;
    
    if (!isValid) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    }
    
    return isValid;
  }

  /**
   * 延迟函数
   * @param {number} ms - 延迟毫秒数
   * @returns {Promise}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 清空缓存
   */
  clearCache() {
    this.cache.clear();
    this.cacheExpiry.clear();
    console.log('API缓存已清空');
  }
}

// 创建全局API管理器实例
window.apiManager = new ApiManager(); 