const CONFIG = {
    // 高德地图API配置
    AMAP: {
        KEY: '150e6476078b776d3536721bf74f0276',
        ENDPOINTS: {
            IP_LOCATION: 'https://restapi.amap.com/v3/ip',
            GEOCODE: 'https://restapi.amap.com/v3/geocode/geo'
        }
    },
    
    // 和风天气API配置
    QWEATHER: {
        KEY: 'a4b90c17754a42e89c6347dc57a940ec',
        ENDPOINTS: {
            WEATHER: 'https://devapi.qweather.com/v7/weather/now',
            SUN: 'https://devapi.qweather.com/v7/astronomy/sun'
        }
    },
    
    // 一言API配置
    HITOKOTO: {
        ENDPOINT: 'https://v1.hitokoto.cn',
        DEFAULT_PARAMS: { c: 'i' }
    },
    
    // 天气更新间隔 (毫秒)
    WEATHER_UPDATE_INTERVAL: 1800000,  // 30分钟
    
    // 一言更新间隔 (毫秒)
    HITOKOTO_UPDATE_INTERVAL: 300000,  // 5分钟
    
    // 主题自动更新间隔 (毫秒)
    THEME_UPDATE_INTERVAL: 3600000     // 1小时
}; 