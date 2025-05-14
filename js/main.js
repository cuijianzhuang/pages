// 更新年份
document.getElementById('currentYear').textContent = new Date().getFullYear();

// 添加必应壁纸功能
function getBingWallpaper() {
  // 检查是否启用必应壁纸，默认启用
  const cookies = document.cookie.split(';');
  const bingWallpaperCookie = cookies.find(cookie => cookie.trim().startsWith('bingWallpaper='));
  // 只有明确设置为false时才禁用，否则默认启用
  const enabled = !bingWallpaperCookie || bingWallpaperCookie.split('=')[1].trim() !== 'false';
  
  // 在开始加载壁纸前，先应用临时样式，避免闪烁
  if (enabled) {
    document.documentElement.setAttribute('data-loading-wallpaper', 'true');
    document.body.setAttribute('data-loading-wallpaper', 'true');
  } else {
    document.documentElement.removeAttribute('data-loading-wallpaper');
    document.body.removeAttribute('data-loading-wallpaper');
  }
  
  if (!enabled) {
    // 如果禁用，移除已有的背景
    document.body.style.transition = 'background-image 0.5s ease-out';
    document.body.style.backgroundImage = '';
    
    // 移除遮罩层
    const existingOverlay = document.querySelector('.bg-wallpaper-overlay');
    if (existingOverlay) {
      existingOverlay.style.opacity = '0';
      setTimeout(() => {
        existingOverlay.remove();
      }, 500);
    }
    return;
  }
  
  // 使用配置中的必应壁纸API
  const bingUrl = CONFIG.BING_WALLPAPER.ENDPOINT;
  
  // 创建图片对象预加载
  const img = new Image();
  
  // 图片加载成功后设置背景
  img.onload = function() {
    // 平滑过渡
    document.body.style.transition = 'background-image 0.8s ease-in';
    document.body.style.backgroundImage = `url(${img.src})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed'; // 固定背景
    document.documentElement.removeAttribute('data-loading-wallpaper');
    document.body.removeAttribute('data-loading-wallpaper');
    
    // 添加暗色遮罩层以确保文字可见
    let overlay = document.querySelector('.bg-wallpaper-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'bg-wallpaper-overlay';
      overlay.style.opacity = '0';
      
      // 根据当前主题设置正确的遮罩颜色
      const isLightTheme = document.body.classList.contains('light-theme');
      overlay.style.backgroundColor = isLightTheme ? 
        'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.5)';
      
      document.body.appendChild(overlay);
      // 淡入遮罩层
      setTimeout(() => {
        overlay.style.transition = 'opacity 0.5s ease-in';
        overlay.style.opacity = '1';
      }, 10);
    }
  };
  
  // 图片加载错误处理
  img.onerror = function() {
    console.error('必应壁纸加载失败，使用默认背景');
    document.body.style.backgroundImage = '';
    document.documentElement.removeAttribute('data-loading-wallpaper');
    document.body.removeAttribute('data-loading-wallpaper');
  };
  
  // 开始加载图片
  img.src = bingUrl;
}

// 更新时间日期
/*
function updateDateTime() {
  const now = new Date();
  
  // 修改日期格式化
  const dateStr = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'long'
  })
  .replace(/\//g, '年')  // 第一个斜杠替换为年
  .replace(/\//g, '月')  // 第二个斜杠替换为月
  .replace(/日星期/g, '日 星期'); // 在日和星期之间添加空格，避免重复

  const timeStr = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  document.getElementById('date').textContent = dateStr;
  document.getElementById('time').textContent = timeStr;
}

// 获取位置和天气信息
async function getWeather() {
  try {
    const weatherInfo = document.getElementById('weather-info');
    weatherInfo.innerHTML = '<i class="fa fa-refresh fa-spin"></i> 获取天气中...';

    // 先获取IP定位
    const locationResponse = await fetch(`${CONFIG.AMAP.ENDPOINTS.IP_LOCATION}?key=${CONFIG.AMAP.KEY}`);
    const locationData = await locationResponse.json();

    if (locationData.status === '1') {
      const cityName = locationData.city;
      const geocodeResponse = await fetch(
        `${CONFIG.AMAP.ENDPOINTS.GEOCODE}?address=${encodeURIComponent(cityName)}&key=${CONFIG.AMAP.KEY}`
      );
      const geocodeData = await geocodeResponse.json();

      if (geocodeData.status === '1' && geocodeData.geocodes.length > 0) {
        const location = geocodeData.geocodes[0].location;
        const [longitude, latitude] = location.split(',');

        // 使用和风天气API获取天气
        const weatherResponse = await fetch(
          `${CONFIG.QWEATHER.ENDPOINTS.WEATHER}?location=${longitude},${latitude}&key=${CONFIG.QWEATHER.KEY}`
        );
        const weatherData = await weatherResponse.json();

        if (weatherData.code === '200') {
          const weather = weatherData.now;
          // 获取天气图标和额外的天气信息
          const weatherIcon = getWeatherIcon(weather.text);
          const extraInfo = getExtraWeatherInfo(weather);
          
          // 组装天气信息HTML
          weatherInfo.innerHTML = `
            <i class="fa ${weatherIcon}" aria-hidden="true"></i>
            <span class="weather-location">${cityName}</span>
            <span class="weather-temp">${weather.temp}°C</span>
            <span class="weather-text">${weather.text}</span>
            ${extraInfo}
          `;
        } else {
          weatherInfo.innerHTML = '<i class="fa fa-exclamation-circle"></i> 天气数据获取失败';
        }
      } else {
        weatherInfo.innerHTML = '<i class="fa fa-exclamation-circle"></i> 位置解析失败';
      }
    } else {
      weatherInfo.innerHTML = '<i class="fa fa-exclamation-circle"></i> 定位失败';
    }
  } catch (error) {
    console.error('Weather Error:', error);
    document.getElementById('weather-info').innerHTML = 
      '<i class="fa fa-exclamation-circle"></i> 天气信息更新失败';
  }
}

// 根据天气状况返回额外的天气信息
function getExtraWeatherInfo(weather) {
  const extraInfo = [];
  
  // 添加体感温度（如果与实际温度差异较大）
  if (Math.abs(weather.feelsLike - weather.temp) >= 2) {
    extraInfo.push(`体感 ${weather.feelsLike}°C`);
  }
  
  // 添加风向和风速信息
  if (weather.windDir && weather.windScale) {
    extraInfo.push(`${weather.windDir} ${weather.windScale}级`);
  }
  
  // 添加相对湿度（如果湿度较高或较低）
  if (weather.humidity < 30 || weather.humidity > 70) {
    extraInfo.push(`湿度 ${weather.humidity}%`);
  }
  
  return extraInfo.length ? 
    `<span class="weather-extra">${extraInfo.join(' / ')}</span>` : '';
}

// 优化天气图标映射
function getWeatherIcon(weatherText) {
  const iconMap = {
    // 晴天相关
    '晴': 'fa-sun-o',
    '晴间多云': 'fa-cloud',
    
    // 多云相关
    '多云': 'fa-cloud',
    '阴': 'fa-cloud',
    
    // 雨相关
    '小雨': 'fa-umbrella',
    '中雨': 'fa-umbrella',
    '大雨': 'fa-umbrella',
    '暴雨': 'fa-umbrella',
    '雷阵雨': 'fa-bolt',
    '阵雨': 'fa-umbrella',
    
    // 雪相关
    '小雪': 'fa-snowflake-o',
    '中雪': 'fa-snowflake-o',
    '大雪': 'fa-snowflake-o',
    '暴雪': 'fa-snowflake-o',
    '雨夹雪': 'fa-snowflake-o',
    
    // 特殊天气
    '雾': 'fa-align-justify',
    '霾': 'fa-align-justify',
    '扬沙': 'fa-align-justify',
    '浮尘': 'fa-align-justify',
    '轻度雾霾': 'fa-align-justify',
    '中度雾霾': 'fa-align-justify',
    '重度雾霾': 'fa-align-justify',
    '强浮尘': 'fa-align-justify'
  };

  return iconMap[weatherText] || 'fa-question-circle-o';
}
*/

// 在现有代码后添加一言功能
async function getHitokoto() {
  try {
    const response = await fetch(
      `${CONFIG.HITOKOTO.ENDPOINT}?c=${CONFIG.HITOKOTO.DEFAULT_PARAMS.c}`
    );
    const data = await response.json();

    document.getElementById('hitokoto-text').textContent = data.hitokoto;
    if (data.from_who) {
      document.getElementById('hitokoto-from').textContent = `——${data.from_who}「${data.from}」`;
    } else {
      document.getElementById('hitokoto-from').textContent = `——「${data.from}」`;
    }
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

// 初始化
/*
updateDateTime();
setInterval(updateDateTime, 1000);
getWeather();
// 每30分钟更新一次天气
setInterval(getWeather, CONFIG.WEATHER_UPDATE_INTERVAL);
*/

// 主题切换功能
function initThemeToggle() {
  try {
    const body = document.body;
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) {
      console.error('无法找到主题切换按钮');
      return;
    }
    
    const themeIcon = themeToggle.querySelector('i');
    if (!themeIcon) {
      console.error('无法找到主题切换图标');
      return;
    }
    
    // 确保初始图标状态正确
    const initialTheme = body.classList.contains('light-theme');
    themeIcon.classList.remove('fa-sun-o', 'fa-moon-o');
    themeIcon.classList.add(initialTheme ? 'fa-moon-o' : 'fa-sun-o');
    console.log('初始主题图标设置为:', initialTheme ? '月亮(深色模式)' : '太阳(亮色模式)');
    
    const aplayer = document.querySelector('.aplayer');
    
    // 从 Cookie 中获取主题设置
    const savedTheme = getCookie('theme');
    if (savedTheme) {
      body.classList.remove('light-theme', 'dark-theme'); // 先清除所有主题类
      body.classList.add(savedTheme);
      if (aplayer) {
        aplayer.classList.remove('light-theme', 'dark-theme');
        aplayer.classList.add(savedTheme);
      }
      updateThemeIcon(savedTheme === 'light-theme');
      console.log('从Cookie加载主题: ' + savedTheme);
    }

    // 设置主题
    function setTheme(theme) {
      console.log('准备设置主题: ' + theme);
      
      // 清除现有主题类并添加新主题类
      body.classList.remove('light-theme', 'dark-theme');
      body.classList.add(theme);
      
      // 应用到音乐播放器
      if (aplayer) {
        aplayer.classList.remove('light-theme', 'dark-theme');
        aplayer.classList.add(theme);
      }
      
      // 设置会话级别的 Cookie
      document.cookie = `theme=${theme};path=/`;
      
      // 更新主题图标
      updateThemeIcon(theme === 'light-theme');
      
      // 检查是否有壁纸背景
      const hasBingWallpaper = body.style.backgroundImage && body.style.backgroundImage !== '';
      
      // 如果有壁纸背景，需要更新壁纸遮罩的颜色
      if (hasBingWallpaper) {
        const overlay = document.querySelector('.bg-wallpaper-overlay');
        if (overlay) {
          // 根据主题调整遮罩透明度
          const overlayColor = theme === 'light-theme' ? 
            'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.5)';
          overlay.style.backgroundColor = overlayColor;
          console.log('更新壁纸遮罩颜色为: ' + overlayColor);
        } else {
          console.log('未找到壁纸遮罩层');
        }
      }
      
      console.log(`主题已切换为: ${theme}`);
    }

    // 获取 Cookie 值的辅助函数
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    }

    // 更新主题图标
    function updateThemeIcon(isLight) {
      if (!themeIcon) {
        console.error('无法更新主题图标：未找到图标元素');
        return;
      }
      
      // 确保图标元素始终是最新的
      const latestThemeIcon = document.querySelector('.theme-toggle i');
      if (latestThemeIcon) {
        latestThemeIcon.classList.remove('fa-sun-o', 'fa-moon-o');
        latestThemeIcon.classList.add(isLight ? 'fa-moon-o' : 'fa-sun-o');
        console.log('图标已更新为: ' + (isLight ? '月亮(深色模式)' : '太阳(亮色模式)'));
      } else {
        // 使用原始引用的备选方案
        themeIcon.classList.remove('fa-sun-o', 'fa-moon-o');
        themeIcon.classList.add(isLight ? 'fa-moon-o' : 'fa-sun-o');
        console.log('使用原始引用更新图标为: ' + (isLight ? '月亮(深色模式)' : '太阳(亮色模式)'));
      }
    }

    // 手动切换主题
    // 移除旧的事件监听器
    const newThemeToggle = themeToggle.cloneNode(true);
    themeToggle.parentNode.replaceChild(newThemeToggle, themeToggle);
    
    // 获取新的DOM引用
    const updatedThemeToggle = document.querySelector('.theme-toggle');
    const updatedThemeIcon = updatedThemeToggle.querySelector('i');
    
    updatedThemeToggle.addEventListener('click', (event) => {
      // 防止事件冒泡
      event.stopPropagation();
      console.log('主题切换按钮被点击');
      
      // 添加旋转动画
      updatedThemeToggle.classList.add('rotating');
      
      // 切换主题
      const currentTheme = body.classList.contains('light-theme') ? 'dark-theme' : 'light-theme';
      setTheme(currentTheme);
      
      // 动画结束后移除类
      setTimeout(() => {
        updatedThemeToggle.classList.remove('rotating');
      }, 600);
    });

    // 初始化默认主题（如果没有设置）
    if (!savedTheme) {
      const hour = new Date().getHours();
      const isDay = hour >= 6 && hour < 18;
      setTheme(isDay ? 'light-theme' : 'dark-theme');
    }
    
    console.log('主题切换功能初始化完成');
  } catch (error) {
    console.error('主题切换初始化失败:', error);
  }
}

// 在初始化代码中添加主题切换初始化
document.addEventListener('DOMContentLoaded', () => {
  // ... existing code ...
  initThemeToggle();
  // 初始化粒子特效
  new ParticleEffect();
});

// 页面加载时初始化功能
document.addEventListener('DOMContentLoaded', function() {
  // 最高优先级：立即初始化壁纸，防止卡片闪烁
  getBingWallpaper();
  
  // 其他初始化逻辑
  initThemeToggle();
  new ParticleEffect();
  
  // 设置定时刷新壁纸
  setInterval(getBingWallpaper, CONFIG.BING_WALLPAPER.UPDATE_INTERVAL);
});

