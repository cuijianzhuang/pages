// 更新年份
document.getElementById('currentYear').textContent = new Date().getFullYear();

// 更新时间日期
function updateDateTime() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'long'
  }).replace(/\//g, '年').replace(/\//g, '月') + '日';
  
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
    const locationResponse = await fetch('https://restapi.amap.com/v3/ip?key=150e6476078b776d3536721bf74f0276');
    const locationData = await locationResponse.json();
    
    if (locationData.status === '1') {
      // 使用高德地图API获取城市编码
      const cityName = locationData.city;
      const geocodeResponse = await fetch(`https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(cityName)}&key=150e6476078b776d3536721bf74f0276`);
      const geocodeData = await geocodeResponse.json();
      
      if (geocodeData.status === '1' && geocodeData.geocodes.length > 0) {
        const location = geocodeData.geocodes[0].location; // 获取经纬度
        // 和风天气API需要经度在前，纬度在后，保持逗号分隔
        const [longitude, latitude] = location.split(',');
        
        // 使用和风天气API获取天气
        const weatherResponse = await fetch(`https://devapi.qweather.com/v7/weather/now?location=${longitude},${latitude}&key=a4b90c17754a42e89c6347dc57a940ec`);
        const weatherData = await weatherResponse.json();
        
        if (weatherData.code === '200') {
          weatherInfo.textContent = `${cityName} ${weatherData.now.temp}°C ${weatherData.now.text}`;
        } else {
          weatherInfo.textContent = '天气获取失败';
        }
      } else {
        weatherInfo.textContent = '位置获取失败';
      }
    } else {
      weatherInfo.textContent = '位置获取失败';
    }
  } catch (error) {
    document.getElementById('weather-info').textContent = '天气信息更新失败';
    console.error('Error:', error);
  }
}

// 在现有代码后添加一言功能
async function getHitokoto() {
  try {
    const response = await fetch('https://v1.hitokoto.cn?c=i');
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

// 初始化一言
getHitokoto();
// 每5分钟更新一次一言
setInterval(getHitokoto, 300000);

// 初始化
updateDateTime();
setInterval(updateDateTime, 1000);
getWeather();
// 每30分钟更新一次天气
setInterval(getWeather, 1800000);
