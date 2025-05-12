// 更新年份
document.getElementById('currentYear').textContent = new Date().getFullYear();

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
  const body = document.body;
  const themeToggle = document.querySelector('.theme-toggle');
  const themeIcon = themeToggle.querySelector('i');
  const aplayer = document.querySelector('.aplayer');
  
  // 从 Cookie 中获取主题设置
  const savedTheme = getCookie('theme');
  if (savedTheme) {
    body.classList.add(savedTheme);
    if (aplayer) {
      aplayer.classList.add(savedTheme);
    }
    updateThemeIcon(savedTheme === 'light-theme');
  }

  // 设置主题
  function setTheme(theme) {
    body.classList.remove('light-theme', 'dark-theme');
    body.classList.add(theme);
    if (aplayer) {
      aplayer.classList.remove('light-theme', 'dark-theme');
      aplayer.classList.add(theme);
    }
    // 设置会话级别的 Cookie
    document.cookie = `theme=${theme};path=/`;
    updateThemeIcon(theme === 'light-theme');
  }

  // 获取 Cookie 值的辅助函数
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  // 自动设置主题的函数保持不变，但使用 Cookie 替代 sessionStorage
  async function autoSetTheme() {
    try {
      if (!getCookie('theme')) {
        const locationResponse = await fetch(
          `${CONFIG.AMAP.ENDPOINTS.IP_LOCATION}?key=${CONFIG.AMAP.KEY}`
        );
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
            
            const date = new Date();
            const formattedDate = date.toISOString().split('T')[0].replace(/-/g, '');
            
            const sunResponse = await fetch(
              `${CONFIG.QWEATHER.ENDPOINTS.SUN}?location=${longitude},${latitude}&date=${formattedDate}&key=${CONFIG.QWEATHER.KEY}`
            );
            const sunData = await sunResponse.json();
            
            if (sunData.code === '200') {
              const now = new Date();
              const sunrise = new Date(sunData.sunrise);
              const sunset = new Date(sunData.sunset);
              
              // 直接比较 Date 对象
              if (now >= sunrise && now <= sunset) {
                setTheme('light-theme');
              } else {
                setTheme('dark-theme');
              }
            } else {
              // 如果API调用失败，使用默认的时间判断
              const hour = new Date().getHours();
              const isDay = hour >= 6 && hour < 18;
              setTheme(isDay ? 'light-theme' : 'dark-theme');
            }
          }
        }
      }
    } catch (error) {
      console.error('获取日出日落时间失败:', error);
      // 如果API调用失败，使用默认的时间判断
      const hour = new Date().getHours();
      const isDay = hour >= 6 && hour < 18;
      if (!getCookie('theme')) {
        setTheme(isDay ? 'light-theme' : 'dark-theme');
      }
    }
  }

  // 更新主题图标
  function updateThemeIcon(isLight) {
    themeIcon.classList.remove('fa-sun-o', 'fa-moon-o');
    themeIcon.classList.add(isLight ? 'fa-moon-o' : 'fa-sun-o');
  }

  // 手动切换主题
  themeToggle.addEventListener('click', () => {
    // 添加旋转动画
    themeToggle.classList.add('rotating');
    
    // 切换主题
    const currentTheme = body.classList.contains('light-theme') ? 'dark-theme' : 'light-theme';
    setTheme(currentTheme);
    
    // 动画结束后移除类
    setTimeout(() => {
      themeToggle.classList.remove('rotating');
    }, 600);
  });

  // 初始化自动主题
  autoSetTheme();
  // 每小时检查一次是否需要切换主题
  setInterval(autoSetTheme, CONFIG.THEME_UPDATE_INTERVAL);
}

// 在初始化代码中添加主题切换初始化
document.addEventListener('DOMContentLoaded', () => {
  // ... existing code ...
  initThemeToggle();
  // 初始化粒子特效
  new ParticleEffect();
});

