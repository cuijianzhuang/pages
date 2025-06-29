// 快捷书签管理器 - 右侧抽屉式设计
class BookmarksManager {
    constructor() {
        this.currentCategory = 'work';
        this.isOpen = false;
        this.autoCloseTimer = null;
        this.autoCloseDelay = 5000; // 5秒后自动收回
        this.hasShownTip = false; // 是否已显示过提示
        this.searchActive = false;
        
        this.initElements();
        this.initEventListeners();
        this.loadBookmarks();
        this.showInitialTip();
    }
    
    initElements() {
        this.edgeTrigger = document.querySelector('.bookmarks-edge-trigger');
        this.sidebar = document.querySelector('.bookmarks-sidebar');
        this.overlay = document.querySelector('.bookmarks-overlay');
        this.closeBtn = document.querySelector('.bookmarks-close');
        this.tabs = document.querySelectorAll('.bookmark-tab');
        this.categories = document.querySelectorAll('.bookmark-category');
        
        // 搜索相关元素
        this.searchInput = document.querySelector('#bookmarks-search-input');
        this.searchResults = document.querySelector('.search-results');
        this.resultsCount = document.querySelector('.results-count');
        this.resultsList = document.querySelector('.results-list');
        this.clearSearchBtn = document.querySelector('.clear-search');
    }
    
    initEventListeners() {
        // 右边缘鼠标进入触发
        if (this.edgeTrigger) {
            this.edgeTrigger.addEventListener('mouseenter', () => {
                if (!this.isOpen) {
                    this.openSidebar();
                }
            });
        }
        
        // 关闭按钮点击
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.closeSidebar();
            });
        }
        
        // 遮罩层点击
        if (this.overlay) {
            this.overlay.addEventListener('click', () => {
                this.closeSidebar();
            });
        }
        
        // 分类标签切换
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const category = tab.dataset.category;
                this.switchCategory(category);
                this.resetAutoCloseTimer();
            });
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeSidebar();
            }
            // Ctrl + B 快捷键开关书签栏  
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                if (this.isOpen) {
                    this.closeSidebar();
                } else {
                    this.openSidebar();
                }
            }
        });
        
        // 侧边栏鼠标进入/离开事件
        if (this.sidebar) {
            this.sidebar.addEventListener('mouseenter', () => {
                this.clearAutoCloseTimer();
            });
            
            this.sidebar.addEventListener('mouseleave', () => {
                this.resetAutoCloseTimer();
            });
            
            // 阻止点击书签项时关闭侧边栏
            this.sidebar.addEventListener('click', (e) => {
                if (e.target.closest('.bookmark-item')) {
                    // 点击书签后短暂延迟关闭
                    setTimeout(() => {
                        this.closeSidebar();
                    }, 300);
                }
            });
        }

        // 搜索相关事件
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => {
                this.handleSearch();
            });
            
            // Ctrl + F 快捷键
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'f' && this.isOpen) {
                    e.preventDefault();
                    this.searchInput.focus();
                }
            });
        }
        
        if (this.clearSearchBtn) {
            this.clearSearchBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }
    }
    
    openSidebar() {
        this.isOpen = true;
        if (this.sidebar) this.sidebar.classList.add('active');
        if (this.overlay) this.overlay.classList.add('active');
        if (this.edgeTrigger) this.edgeTrigger.classList.add('hidden');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
        
        // 设置自动关闭定时器
        this.resetAutoCloseTimer();
    }
    
    closeSidebar() {
        this.isOpen = false;
        if (this.sidebar) this.sidebar.classList.remove('active');
        if (this.overlay) this.overlay.classList.remove('active');
        if (this.edgeTrigger) this.edgeTrigger.classList.remove('hidden');
        document.body.style.overflow = ''; // 恢复背景滚动
        
        // 清除自动关闭定时器
        this.clearAutoCloseTimer();
    }
    
    resetAutoCloseTimer() {
        this.clearAutoCloseTimer();
        this.autoCloseTimer = setTimeout(() => {
            if (this.isOpen) {
                this.closeSidebar();
            }
        }, this.autoCloseDelay);
    }
    
    clearAutoCloseTimer() {
        if (this.autoCloseTimer) {
            clearTimeout(this.autoCloseTimer);
            this.autoCloseTimer = null;
        }
    }
    
    switchCategory(category) {
        this.currentCategory = category;
        
        // 更新标签状态
        this.tabs.forEach(tab => {
            if (tab.dataset.category === category) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // 更新内容区域
        this.categories.forEach(categoryEl => {
            if (categoryEl.dataset.category === category) {
                categoryEl.classList.add('active');
                // 添加一个小延迟以确保过渡效果正常显示
                setTimeout(() => {
                    categoryEl.style.display = 'block';
                }, 50);
            } else {
                categoryEl.classList.remove('active');
                // 添加过渡效果后隐藏
                setTimeout(() => {
                    if (!categoryEl.classList.contains('active')) {
                        categoryEl.style.display = 'none';
                    }
                }, 300);
            }
        });

        // 如果在搜索状态，清除搜索
        if (this.searchActive) {
            this.clearSearch();
        }
    }
    
    loadBookmarks() {
        // 从配置文件加载书签
        if (window.BookmarksConfig) {
            Object.keys(window.BookmarksConfig).forEach(category => {
                this.renderBookmarks(category, window.BookmarksConfig[category]);
            });
        } else {
            console.error('BookmarksConfig not found. Please ensure bookmarks-config.js is loaded.');
        }
    }
    
    renderBookmarks(category, bookmarks) {
        const container = document.querySelector(`#${category}-bookmarks`);
        if (!container) return;
        
        if (bookmarks.length === 0) {
            container.innerHTML = `
                <div class="empty-bookmarks">
                    <i class="fa fa-bookmark-o"></i>
                    <p>暂无${this.getCategoryName(category)}书签</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = bookmarks.map(bookmark => 
            this.createBookmarkHTML(bookmark)
        ).join('');
    }
    
    createBookmarkHTML(bookmark) {
        const { name, url, icon = 'fa-globe', description = '' } = bookmark;
        
        return `
            <div class="bookmark-item" onclick="window.open('${url}', '_blank')" title="${name}${description ? ' - ' + description : ''}">
                <div class="bookmark-icon">
                    <i class="fa ${icon}"></i>
                </div>
                <div class="bookmark-info">
                    <div class="bookmark-name">${name}</div>
                    ${description ? `<div class="bookmark-description">${description}</div>` : ''}
                </div>
                <div class="bookmark-external">
                    <i class="fa fa-external-link"></i>
                </div>
            </div>
        `;
    }

    // 显示初次访问提示
    showInitialTip() {
        // 检查是否已经显示过提示
        const hasSeenTip = localStorage.getItem('bookmarks-tip-shown');
        if (hasSeenTip) return;

        // 延迟3秒显示提示，给页面加载时间
        setTimeout(() => {
            if (!this.isOpen && !this.hasShownTip) {
                this.createTipElement();
                this.hasShownTip = true;
                localStorage.setItem('bookmarks-tip-shown', 'true');
            }
        }, 3000);
    }

    // 创建提示元素
    createTipElement() {
        const tip = document.createElement('div');
        tip.className = 'bookmarks-tip';
        tip.innerHTML = `
            <div class="tip-content">
                <i class="fa fa-bookmark"></i>
                <span>将鼠标移至右边缘可打开快捷书签</span>
                <button class="tip-close">×</button>
            </div>
        `;

        // 添加样式
        tip.style.cssText = `
            position: fixed;
            top: 50%;
            right: 20px;
            transform: translateY(-50%);
            z-index: 1000;
            animation: tipSlideIn 0.5s ease;
        `;

        document.body.appendChild(tip);

        // 关闭按钮事件
        const closeBtn = tip.querySelector('.tip-close');
        closeBtn.addEventListener('click', () => {
            tip.style.animation = 'tipSlideOut 0.3s ease forwards';
            setTimeout(() => tip.remove(), 300);
        });

        // 3秒后自动消失
        setTimeout(() => {
            if (tip.parentNode) {
                tip.style.animation = 'tipSlideOut 0.3s ease forwards';
                setTimeout(() => tip.remove(), 300);
            }
        }, 3000);
    }

    getCategoryName(category) {
        const categoryMap = {
            'work': '工作',
            'entertainment': '娱乐',
            'study': '学习',
            'tools': '工具'
        };
        return categoryMap[category] || category;
    }
    
    // 公共方法：重新加载书签（用于配置更新后）
    reloadBookmarks() {
        this.loadBookmarks();
    }
    
    // 公共方法：切换到指定分类
    showCategory(category) {
        if (window.BookmarksConfig && window.BookmarksConfig[category]) {
            this.switchCategory(category);
            if (!this.isOpen) {
                this.openSidebar();
            }
        }
    }
    
    // 搜索功能实现
    handleSearch() {
        const query = this.searchInput.value.trim().toLowerCase();
        if (!query) {
            this.clearSearch();
            return;
        }

        this.searchActive = true;
        this.searchResults.style.display = 'block';
        
        // 隐藏常规分类视图
        this.categories.forEach(category => {
            category.style.display = 'none';
        });
        
        const results = this.searchBookmarks(query);
        this.displaySearchResults(results, query);
    }
    
    searchBookmarks(query) {
        const results = [];
        
        Object.keys(window.BookmarksConfig).forEach(category => {
            window.BookmarksConfig[category].forEach(bookmark => {
                const nameMatch = bookmark.name.toLowerCase().includes(query);
                const descMatch = bookmark.description && bookmark.description.toLowerCase().includes(query);
                const urlMatch = bookmark.url.toLowerCase().includes(query);
                
                if (nameMatch || descMatch || urlMatch) {
                    results.push({
                        ...bookmark,
                        category: this.getCategoryName(category)
                    });
                }
            });
        });
        
        return results;
    }
    
    displaySearchResults(results, query) {
        this.resultsCount.textContent = `找到 ${results.length} 个结果`;
        
        const highlightText = (text, query) => {
            if (!text) return '';
            const regex = new RegExp(`(${query})`, 'gi');
            return text.replace(regex, '<span class="highlight">$1</span>');
        };
        
        this.resultsList.innerHTML = results.map(result => `
            <div class="search-result-item" onclick="window.open('${result.url}', '_blank')">
                <div class="result-category">
                    <i class="fa ${result.icon || 'fa-globe'}"></i>
                    ${result.category}
                </div>
                <div class="result-title">
                    ${highlightText(result.name, query)}
                </div>
                ${result.description ? `
                    <div class="result-description">
                        ${highlightText(result.description, query)}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }
    
    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        if (this.searchResults) {
            this.searchResults.style.display = 'none';
        }
        this.searchActive = false;
        
        // 恢复常规分类视图
        this.categories.forEach(category => {
            category.style.display = category.dataset.category === this.currentCategory ? 'block' : 'none';
        });
    }
}

// 工具函数：检查是否为移动设备
function isMobileDevice() {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// 初始化书签管理器
let bookmarksManager;

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，确保配置文件已加载
    setTimeout(() => {
        bookmarksManager = new BookmarksManager();
        
        // 在移动设备上调整自动关闭时间
        if (isMobileDevice()) {
            bookmarksManager.autoCloseDelay = 3000; // 移动设备3秒自动关闭
        }
        
        console.log('快捷书签管理器已初始化 - 鼠标接触右边缘可弹出书签栏');
    }, 100);
});

// 全局方法：供外部调用
window.openBookmarks = function(category = null) {
    if (bookmarksManager) {
        if (category) {
            bookmarksManager.showCategory(category);
        } else {
            bookmarksManager.openSidebar();
        }
    }
};

window.closeBookmarks = function() {
    if (bookmarksManager) {
        bookmarksManager.closeSidebar();
    }
};

window.reloadBookmarks = function() {
    if (bookmarksManager) {
        bookmarksManager.reloadBookmarks();
    }
};

// 响应式处理
window.addEventListener('resize', () => {
    if (bookmarksManager && bookmarksManager.isOpen && window.innerWidth > 480) {
        // 在大屏幕上确保侧边栏宽度正确
        const sidebar = document.querySelector('.bookmarks-sidebar');
        if (sidebar) {
            sidebar.style.width = window.innerWidth > 768 ? '350px' : '300px';
        }
    }
});

// 主题切换时更新样式
document.addEventListener('themeChanged', () => {
    // 主题切换时可以在这里添加特定逻辑
    console.log('书签栏适配主题切换');
});

// 错误处理
window.addEventListener('error', (e) => {
    if (e.filename && e.filename.includes('bookmarks')) {
        console.error('书签管理器错误:', e.message);
    }
}); 