# Personal Homepage

一个优雅的个人主页，具有动态天气、一言、音乐播放器等功能。

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
    - 
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

1. 克隆仓库

```bash
git clone https://github.com/yourusername/homepage.git
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

