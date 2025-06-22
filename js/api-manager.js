/**
 * API管理器 - 统一处理API请求和错误处理
 */
class ApiManager {
  constructor() {
    this.retryCount = 3;
    this.retryDelay = 1000; // 1秒
    this.cache = new Map();
    this.cacheExpiry = new Map();
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