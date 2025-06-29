// 快捷书签配置文件
// 在这里配置您的个人书签，按分类组织

const BookmarksConfig = {
  // 工作分类
  work: [
    {
      name: 'GitHub',
      url: 'https://github.com',
      icon: 'fa-github',
      description: '代码托管与版本控制'
    },
    {
      name: 'Stack Overflow',
      url: 'https://stackoverflow.com',
      icon: 'fa-stack-overflow',
      description: '程序员问答社区'
    },
    {
      name: 'VS Code',
      url: 'https://code.visualstudio.com',
      icon: 'fa-code',
      description: '轻量级代码编辑器'
    },
    {
      name: 'Docker Hub',
      url: 'https://hub.docker.com',
      icon: 'fa-cube',
      description: '容器镜像仓库'
    },
    {
      name: 'NPM',
      url: 'https://npmjs.com',
      icon: 'fa-cube',
      description: 'Node.js 包管理器'
    },
    {
      name: 'Vercel',
      url: 'https://vercel.com',
      icon: 'fa-rocket',
      description: '前端应用部署平台'
    }
  ],

  // 娱乐分类
  entertainment: [
    {
      name: 'YouTube',
      url: 'https://youtube.com',
      icon: 'fa-youtube',
      description: '视频分享平台'
    },
    {
      name: 'Netflix',
      url: 'https://netflix.com',
      icon: 'fa-film',
      description: '在线视频流媒体'
    },
    {
      name: 'Spotify',
      url: 'https://spotify.com',
      icon: 'fa-spotify',
      description: '音乐流媒体服务'
    },
    {
      name: 'Twitch',
      url: 'https://twitch.tv',
      icon: 'fa-twitch',
      description: '游戏直播平台'
    },
    {
      name: 'Reddit',
      url: 'https://reddit.com',
      icon: 'fa-reddit',
      description: '社交新闻聚合'
    },
    {
      name: 'Steam',
      url: 'https://steampowered.com',
      icon: 'fa-steam',
      description: '游戏购买平台'
    }
  ],

  // 学习分类
  study: [
    {
      name: 'MDN Web Docs',
      url: 'https://developer.mozilla.org',
      icon: 'fa-firefox',
      description: 'Web 开发文档'
    },
    {
      name: 'W3Schools',
      url: 'https://w3schools.com',
      icon: 'fa-graduation-cap',
      description: 'Web 技术教程'
    },
    {
      name: 'Coursera',
      url: 'https://coursera.org',
      icon: 'fa-university',
      description: '在线课程平台'
    },
    {
      name: 'Khan Academy',
      url: 'https://khanacademy.org',
      icon: 'fa-book',
      description: '免费在线教育'
    },
    {
      name: 'freeCodeCamp',
      url: 'https://freecodecamp.org',
      icon: 'fa-free-code-camp',
      description: '免费编程学习'
    },
    {
      name: 'LeetCode',
      url: 'https://leetcode.com',
      icon: 'fa-code',
      description: '算法练习平台'
    }
  ],

  // 工具分类
  tools: [
    {
      name: 'Google Drive',
      url: 'https://drive.google.com',
      icon: 'fa-google',
      description: '云端存储服务'
    },
    {
      name: 'Figma',
      url: 'https://figma.com',
      icon: 'fa-paint-brush',
      description: 'UI/UX 设计工具'
    },
    {
      name: 'Notion',
      url: 'https://notion.so',
      icon: 'fa-sticky-note',
      description: '全能笔记工具'
    },
    {
      name: 'Trello',
      url: 'https://trello.com',
      icon: 'fa-trello',
      description: '项目管理工具'
    },
    {
      name: 'CloudFlare',
      url: 'https://cloudflare.com',
      icon: 'fa-cloud',
      description: 'CDN 与安全服务'
    },
    {
      name: 'Canva',
      url: 'https://canva.com',
      icon: 'fa-image',
      description: '在线设计工具'
    }
  ]
};

// 配置说明：
// name: 书签显示名称
// url: 书签链接地址
// icon: FontAwesome 图标类名（不包含 fa- 前缀的部分）
// description: 书签描述（可选）

// 可用的 FontAwesome 图标示例：
// fa-github, fa-google, fa-twitter, fa-facebook, fa-linkedin
// fa-youtube, fa-instagram, fa-spotify, fa-twitch, fa-reddit
// fa-code, fa-terminal, fa-laptop, fa-desktop, fa-mobile
// fa-book, fa-graduation-cap, fa-university, fa-pencil
// fa-home, fa-user, fa-cog, fa-search, fa-heart
// fa-star, fa-bookmark, fa-calendar, fa-clock-o
// fa-envelope, fa-phone, fa-map-marker, fa-globe
// fa-shopping-cart, fa-credit-card, fa-money
// fa-film, fa-music, fa-camera, fa-image
// fa-cloud, fa-download, fa-upload, fa-database
// fa-rocket, fa-cube, fa-cogs, fa-wrench

// 导出配置
window.BookmarksConfig = BookmarksConfig; 