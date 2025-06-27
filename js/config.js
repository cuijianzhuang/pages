const CONFIG = {
    // 高德地图API配置
    AMAP: {
        KEY: '',
        ENDPOINTS: {
            IP_LOCATION: 'https://restapi.amap.com/v3/ip',
            GEOCODE: 'https://restapi.amap.com/v3/geocode/geo'
        }
    },
    
    // 和风天气API配置
    QWEATHER: {
        KEY: '',
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
    THEME_UPDATE_INTERVAL: 3600000,     // 1小时

    // 必应壁纸API
    BING_WALLPAPER: {
        ENABLED: true,
        ENDPOINT: 'https://bing.img.run/rand.php',
        FALLBACK_ENDPOINTS: [
            'https://bing.biturl.top/?resolution=1920&format=image&index=0&mkt=zh-CN',
            'https://bing.biturl.top/?resolution=1920&format=image&index=random&mkt=zh-CN',
            'https://bingw.jasonzeng.dev/?resolution=1920x1080&index=0',
            'https://bingw.jasonzeng.dev/?resolution=1920x1080&index=random',
            // 移除必应官方API，因为CORS限制无法在浏览器中直接访问
            // 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN'
        ],
        UPDATE_INTERVAL: 86400000, // 24小时
        ENDPOINT_TYPES: {
            'bing.img.run': 'direct_image',
            'bing.biturl.top': 'direct_image',
            'bingw.jasonzeng.dev': 'direct_image',
            'source.unsplash.com': 'direct_image',
            // 'www.bing.com': 'json', // 已移除，无法跨域访问
        },
        // 性能优化配置
        PERFORMANCE: {
            FAST_TIMEOUT: 12000,       // 增加快速超时（12秒）
            MAX_RETRIES: 2,            // 减少重试次数
            RETRY_DELAY: 500,          // 减少重试延迟（0.5秒）
            PARALLEL_REQUESTS: true,  // 禁用并发请求，使用顺序请求
            PRELOAD_ENABLED: false,     // 启用预加载
            CACHE_AGGRESSIVE: true     // 积极缓存策略
        }
    }
};

// 鼠标点击特效配置
CONFIG.EFFECTS = {

    MOUSE_STARS: {
        ENABLED: false,
        MIN_DISTANCE: 15
    },
    // 点击特效开关
    CLICK_EFFECTS: {
        // 是否启用粒子特效
        PARTICLES: true,
    },
    sakanaConfig:{
        //是否默认开启看板娘
        ENABLED: true
    },
    // 粒子特效配置
    PARTICLES: {
        COUNT: 15,          // 每次点击产生的粒子数量
        MIN_SIZE: 2,        // 最小粒子尺寸
        MAX_SIZE: 5,        // 最大粒子尺寸
        MIN_SPEED: -3,      // 最小速度
        MAX_SPEED: 3,       // 最大速度
        LIFE_DECREASE: 0.02 // 生命值递减速度
    }
};

// 生日彩蛋配置
CONFIG.BIRTHDAY = {
    ENABLED: true,
    // 公历生日日期配置（月-日格式，支持多个生日）
    SOLAR_DATES: [
        '07-16'  // 示例公历生日
    ],
    // 农历生日日期配置（月-日格式，支持多个生日）
    LUNAR_DATES: [
        '06-04'  // 示例农历生日（农历五月十五）
    ],
    // 自动检测间隔（毫秒）
    CHECK_INTERVAL: 3600000, // 1小时检查一次
    // CHECK_INTERVAL: 1000, // 1s检查一次
    // 彩蛋效果配置
    EFFECTS: {
        FIREWORKS: true,        // 烟花效果
        BIRTHDAY_MESSAGE: true, // 生日祝福消息
        CONFETTI: true,         // 彩纸飘落
        SPECIAL_THEME: true,    // 特殊主题
        BIRTHDAY_MUSIC: true    // 生日音乐（本地文件或MIDI版本）
    },
    
    // 本地音频文件配置（可选）
    // 取消注释并设置文件路径来使用本地音频文件
    BIRTHDAY_AUDIO_FILE: './audio/sound-effect-longer-happy-birthday-music-box.mp3',  // 本地音频文件路径
    BIRTHDAY_VOLUME: 0.6,  // 音量 (0.0 - 1.0)
    
    // 支持的音频格式：MP3, WAV, OGG, M4A, FLAC
    // 文件应放在项目目录下，例如：./audio/birthday.mp3
    // 祝福消息列表
    MESSAGES: [
        '🎉 生日快乐！愿你每天都充满快乐！',
        '🎂 今天是特别的日子，祝你生日快乐！',
        '🌟 又长大了一岁，祝愿你前程似锦！',
        '🎁 生日快乐！愿你的每个愿望都能实现！',
        '🎈 在这个特殊的日子里，送上最真挚的祝福！',
        '🌙 农历生日快乐！传统的祝福送给特别的你！',
        '🏮 按照老历法，今天是你的大日子，生日快乐！'
    ],
    // 效果持续时间
    DURATION: {
        FIREWORKS: 10000,      // 烟花持续10秒
        MESSAGE: 8000,         // 消息显示8秒
        CONFETTI: 6000         // 彩纸持续6秒
    }
};

// MetingApi配置（用于解析网易云音乐黑胶歌曲）
var meting_api='https://v.iarc.top/api?server=:server&type=:type&id=:id&auth=:auth&r=:r';

// Sakana Widget Configuration
const sakanaConfig = {
    enabled: true,
    rightWidget: {
        character: 'chisato',
        controls: false,
        autoFit: false,
        size: 200
    },
    leftWidget: {
        character: 'takina',
        controls: false,
        autoFit: false,
        size: 200
    }
}; 