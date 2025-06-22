# 个人主页项目

一个现代化的个人主页，支持动态壁纸、天气信息、音乐播放等功能。

## 🆕 最新更新 - 优化版BingWallpaperManager

### 新特性
- ✨ **兼容多种API格式**：支持直接图片、重定向、JSON三种响应格式
- 🚀 **智能API检测**：自动识别API类型并采用对应的处理策略
- 💾 **Blob URL管理**：自动创建和释放Blob URL，防止内存泄漏
- 🔄 **增强的重试机制**：使用API管理器的统一重试逻辑
- 📊 **详细的日志记录**：提供完整的调试信息

### 支持的API端点
1. **https://bing.img.run/rand.php** - 直接返回图片数据（新增）
2. **https://bing.biturl.top/** - 重定向到图片URL
3. **https://www.bing.com/HPImageArchive.aspx** - 官方JSON格式API

### 技术改进
- 🔧 **模块化设计**：分离API管理和壁纸管理逻辑
- 🛡️ **错误处理**：完善的异常捕获和用户反馈
- ⚡ **性能优化**：智能缓存和内存管理
- 🧪 **测试工具**：提供专门的测试页面验证功能

## 快速开始

### 测试优化版壁纸管理器
1. 打开 `api-quick-test.html` 进行功能测试
2. 点击"测试优化版壁纸管理器"按钮
3. 查看不同API端点的测试结果

### 配置说明
在 `js/config.js` 中可以配置：
```javascript
BING_WALLPAPER: {
    ENABLED: true,
    ENDPOINT: '主要API端点',
    FALLBACK_ENDPOINTS: ['备用API端点1', '备用API端点2'],
    ENDPOINT_TYPES: {
        'domain': 'api_type'  // 'direct_image', 'redirect', 'json'
    }
}
```

## 文件结构

```
pages/
├── index.html              # 主页面
├── api-quick-test.html     # API测试工具
├── js/
│   ├── api-manager.js      # API管理器（新增图片处理方法）
│   ├── main.js            # 主逻辑（优化版壁纸管理器）
│   ├── config.js          # 配置文件（新增API类型配置）
│   └── ...
└── ...
```

## 使用说明

### 壁纸功能
- 自动从必应获取每日壁纸
- 支持多个备用API确保可用性
- 智能检测API响应类型
- 提供加载状态和错误反馈

### API管理器
新增 `requestImage()` 方法专门处理图片API：
- 自动检测响应内容类型
- 创建和管理Blob URL
- 统一的重试和缓存策略

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 许可证

MIT License

---

## 开发者说明

### API类型说明
1. **direct_image**: 直接返回图片二进制数据
2. **redirect**: 重定向到图片URL
3. **json**: 返回包含图片信息的JSON

### 调试信息
打开浏览器开发者工具查看详细的API调用日志。

## 功能特性

- 🌓 自适应明暗主题切换
    - 基于地理位置的日出日落自动切换
    - 手动切换主题功能
    - 主题状态本地持久化

- 🌤️ 实时天气显示
    - 基于高德地图API的IP定位
    - 和风天气API提供天气数据
    - 显示温度、体感温度、风向、湿度等信息

- ⌚ 实时时间日期
    - 优雅的时间显示效果
  
- 💭 一言功能
    - 随机展示精选句子
    - 定时自动更新

- 🎵 音乐播放器
    - 支持网易云音乐
    - 迷你播放器模式
    - 自定义播放列表

- ❄️ 特效系统
    - 星星特效
    - 雪花特效(冬季自动开启)

- 🎨 优雅的界面设计
    - 响应式布局
    - 平滑过渡动画
    - 优雅的字体和配色

## 技术栈

- HTML5 + CSS3
- JavaScript (ES6+)
- Font Awesome 图标
- MetingJS 音乐播放器
- 高德地图 API
- 和风天气 API
- 一言 API

## 配置说明

主要配置文件位于 `js/config.js`：
```javascript
javascript
const CONFIG = {
// 高德地图API配置
AMAP: {
KEY: 'your_amap_key',
ENDPOINTS: {
IP_LOCATION: 'https://restapi.amap.com/v3/ip',
GEOCODE: 'https://restapi.amap.com/v3/geocode/geo'
}
},
// 和风天气API配置
QWEATHER: {
KEY: 'your_qweather_key',
ENDPOINTS: {
WEATHER: 'https://devapi.qweather.com/v7/weather/now',
SUN: 'https://devapi.qweather.com/v7/astronomy/sun'
}
},
// 更新间隔配置
WEATHER_UPDATE_INTERVAL: 1800000, // 30分钟
HITOKOTO_UPDATE_INTERVAL: 300000, // 5分钟
THEME_UPDATE_INTERVAL: 3600000 // 1小时
};
```

## 部署说明 

### 一键部署vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcuijianzhuang%2Fpages)

1. 克隆仓库

```bash
git clone https://github.com/cuijianzhuang/pages.git
```
2. 配置 API Keys
- 在 `js/config.js` 中替换相应的 API keys

3. 部署到服务器
- 支持任何静态网页托管服务
- 推荐使用 GitHub Pages 、Vercel 或 Cloudflare Pages

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge
- Opera

## 许可证

MIT License

## 鸣谢

- [Font Awesome](https://fontawesome.com/)
- [MetingJS](https://github.com/metowolf/MetingJS)
- [高德开放平台](https://lbs.amap.com/)
- [和风天气](https://dev.qweather.com/)
- [一言](https://hitokoto.cn/)

