# 🎵 生日音乐本地文件使用说明

## 📁 目录说明

将您的生日音乐文件放在这个 `audio` 目录下，然后在配置中指定文件路径。

## 🎶 支持的音频格式

- **MP3** (推荐) - 最广泛支持
- **WAV** - 无损音质
- **OGG** - 开源格式
- **M4A** - Apple格式
- **FLAC** - 无损压缩

## ⚙️ 配置方法

### 方法1：通过配置文件

编辑 `js/config.js` 文件，取消注释并设置：

```javascript
// 本地音频文件配置（可选）
BIRTHDAY_AUDIO_FILE: './audio/birthday.mp3',  // 本地音频文件路径
BIRTHDAY_VOLUME: 0.7,  // 音量 (0.0 - 1.0)
```

### 方法2：通过浏览器控制台

打开浏览器控制台（F12），使用以下命令：

```javascript
// 设置音频文件路径
setBirthdayAudioFile('./audio/your-birthday-song.mp3');

// 或者通过文件选择器选择
selectBirthdayAudioFile();

// 测试播放
testBirthdayMusic();

// 停止播放
stopBirthdayMusic();

// 查看当前配置
getBirthdayAudioInfo();

// 清除设置，恢复MIDI版本
clearBirthdayAudioFile();
```

## 📝 文件命名建议

- `birthday.mp3` - 默认生日歌
- `happy-birthday-chinese.mp3` - 中文生日歌
- `birthday-music-custom.wav` - 自定义生日音乐

## 🎯 使用示例

1. **将音频文件放入此目录**
   ```
   audio/
   ├── birthday.mp3
   ├── lunar-birthday.mp3
   └── README.md
   ```

2. **在配置中设置路径**
   ```javascript
   BIRTHDAY_AUDIO_FILE: './audio/birthday.mp3'
   ```

3. **测试播放**
   - 按 F12 打开控制台
   - 输入：`testBirthdayMusic()`
   - 按回车键播放

## ⚡ 快速开始

1. 将您的生日音乐文件复制到此文件夹
2. 在浏览器中按 F12 打开控制台
3. 输入：`selectBirthdayAudioFile()` 然后选择文件
4. 输入：`testBirthdayMusic()` 测试播放
5. 如果满意，生日当天将自动播放您的音乐！

## 🔧 故障排除

**音频不播放？**
- 检查文件路径是否正确
- 确认文件格式受支持
- 检查浏览器是否允许自动播放
- 查看控制台错误信息

**想恢复默认MIDI音乐？**
```javascript
clearBirthdayAudioFile();
```

**音量太大或太小？**
```javascript
CONFIG.BIRTHDAY.BIRTHDAY_VOLUME = 0.5; // 调整到合适音量
```

## 💡 小贴士

- MP3格式兼容性最好
- 文件大小建议在10MB以内
- 音乐时长建议15-60秒
- 可以设置不同的公历和农历生日音乐 