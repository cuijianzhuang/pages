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

// 鼠标点击特效配置
CONFIG.EFFECTS = {
    // 点击特效开关
    CLICK_EFFECTS: {
        // 是否启用粒子特效
        PARTICLES: true,
        // 是否启用星星爆炸效果
        STARS: false
    },
    // 粒子特效配置
    PARTICLES: {
        COUNT: 15,          // 每次点击产生的粒子数量
        MIN_SIZE: 2,        // 最小粒子尺寸
        MAX_SIZE: 5,        // 最大粒子尺寸
        MIN_SPEED: -3,      // 最小速度
        MAX_SPEED: 3,       // 最大速度
        LIFE_DECREASE: 0.02 // 生命值递减速度
    },
    // 星星爆炸效果配置
    STARS: {
        COUNT: {
            MIN: 6,           // 最少产生的星星数量
            MAX: 12           // 最多产生的星星数量
        },
        DISTANCE: {
            MIN: 20,          // 最小扩散距离
            MAX: 50           // 最大扩散距离
        },
        DELAY: {
            MIN: 30,          // 最小延迟时间(ms)
            MAX: 70           // 最大延迟时间(ms)
        },
        LIFE: {
            MIN: 600,         // 最短生命周期(ms)
            MAX: 1000         // 最长生命周期(ms)
        },
        ROTATION: {
            MIN: -180,        // 最小旋转角度
            MAX: 180          // 最大旋转角度
        },
        SIZE: {
            MIN: 10,          // 最小尺寸
            MAX: 20           // 最大尺寸
        }
    }
};

// MetingApi配置（用于解析网易云音乐黑胶歌曲）
var meting_api='https://v.iarc.top/api?server=:server&type=:type&id=:id&auth=:auth&r=:r'; 