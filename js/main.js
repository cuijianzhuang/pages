// 更新年份
document.getElementById('currentYear').textContent = new Date().getFullYear();

// 更新时间日期
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
          // 获取天气图标
          const weatherIcon = getWeatherIcon(weatherData.now.text);
          weatherInfo.innerHTML = `<i class="fa ${weatherIcon}" aria-hidden="true"></i> ${cityName} ${weatherData.now.temp}°C ${weatherData.now.text} ${weatherData.now.windDir}`;
        } else {
          weatherInfo.innerHTML = '<i class="fa fa-question-circle-o" aria-hidden="true"></i> 天气获取失败';
        }
      } else {
        weatherInfo.innerHTML = '<i class="fa fa-question-circle-o" aria-hidden="true"></i> 位置获取失败';
      }
    } else {
      weatherInfo.innerHTML = '<i class="fa fa-question-circle-o" aria-hidden="true"></i> 位置获取失败';
    }
  } catch (error) {
    document.getElementById('weather-info').innerHTML = '<i class="fa fa-question-circle-o" aria-hidden="true"></i> 天气信息更新失败';
    console.error('Error:', error);
  }
}

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
updateDateTime();
setInterval(updateDateTime, 1000);
getWeather();
// 每30分钟更新一次天气
setInterval(getWeather, CONFIG.WEATHER_UPDATE_INTERVAL);

// 更新天气信息
function updateWeather() {
    fetch('https://api.vvhan.com/api/weather')
        .then(response => response.json())
        .then(data => {
            const weatherInfo = data.info;
            const weatherText = `${weatherInfo.city} ${weatherInfo.type} ${weatherInfo.high}/${weatherInfo.low}`;
            
            // 根据天气类型选择对应的图标
            const weatherIcon = getWeatherIcon(weatherInfo.type);
            
            document.getElementById('weather-info').innerHTML = 
                `<i class="fa ${weatherIcon}" aria-hidden="true"></i> ${weatherText}`;
        })
        .catch(error => {
            console.error('获取天气信息失败:', error);
            document.getElementById('weather-info').textContent = '获取天气失败';
        });
}

// 根据天气类型返回对应的 Font Awesome 图标类名
function getWeatherIcon(weatherType) {
    const weatherIcons = {
        '晴': 'fa-sun-o',
        '多云': 'fa-cloud',
        '阴': 'fa-cloud',
        '小雨': 'fa-umbrella',
        '中雨': 'fa-umbrella',
        '大雨': 'fa-umbrella',
        '暴雨': 'fa-umbrella',
        '雷阵雨': 'fa-bolt',
        '小雪': 'fa-snowflake-o',
        '中雪': 'fa-snowflake-o',
        '大雪': 'fa-snowflake-o',
        '暴雪': 'fa-snowflake-o',
        '雾': 'fa-align-justify',
        '霾': 'fa-align-justify',
        '扬沙': 'fa-align-justify',
        // 添加更多和风天气API可能返回的天气类型
        '晴间多云': 'fa-cloud',
        '阵雨': 'fa-umbrella',
        '雷阵雨伴有冰雹': 'fa-bolt',
        '雨夹雪': 'fa-snowflake-o',
        '浮尘': 'fa-align-justify',
        '轻度雾霾': 'fa-align-justify',
        '中度雾霾': 'fa-align-justify',
        '重度雾霾': 'fa-align-justify',
        '强浮尘': 'fa-align-justify'
    };

    return weatherIcons[weatherType] || 'fa-question-circle-o';
}

// 主题切换功能
function initThemeToggle() {
  const body = document.body;
  const themeToggle = document.querySelector('.theme-toggle');
  const themeIcon = themeToggle.querySelector('i');
  const aplayer = document.querySelector('.aplayer');
  
  // 检查本地存储中的主题设置
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    body.classList.add(savedTheme);
    if (aplayer) {
      aplayer.classList.add(savedTheme);
    }
    updateThemeIcon(savedTheme === 'light-theme');
  }

  // 获取日出日落时间并自动设置主题
  async function autoSetTheme() {
    try {
      if (!localStorage.getItem('theme')) {
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
            
            const sunResponse = await fetch(
              `${CONFIG.QWEATHER.ENDPOINTS.SUN}?location=${longitude},${latitude}&key=${CONFIG.QWEATHER.KEY}`
            );
            const sunData = await sunResponse.json();
            
            if (sunData.code === '200') {
              const now = new Date();
              const sunrise = new Date(sunData.sunrise);
              const sunset = new Date(sunData.sunset);
              
              // 如果在日出和日落之间，使用日间主题
              if (now >= sunrise && now <= sunset) {
                setTheme('light-theme');
              } else {
                setTheme('dark-theme');
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('获取日出日落时间失败:', error);
      // 如果API调用失败，使用默认的时间判断
      const hour = new Date().getHours();
      const isDay = hour >= 6 && hour < 18;
      if (!localStorage.getItem('theme')) {
        setTheme(isDay ? 'light-theme' : 'dark-theme');
      }
    }
  }

  // 设置主题
  function setTheme(theme) {
    body.classList.remove('light-theme', 'dark-theme');
    body.classList.add(theme);
    if (aplayer) {
      aplayer.classList.remove('light-theme', 'dark-theme');
      aplayer.classList.add(theme);
    }
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme === 'light-theme');
  }

  // 更新主题图标
  function updateThemeIcon(isLight) {
    themeIcon.classList.remove('fa-sun-o', 'fa-moon-o');
    themeIcon.classList.add(isLight ? 'fa-moon-o' : 'fa-sun-o');
  }

  // 手动切换主题
  themeToggle.addEventListener('click', () => {
    const currentTheme = body.classList.contains('light-theme') ? 'dark-theme' : 'light-theme';
    setTheme(currentTheme);
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
});
