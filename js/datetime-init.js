/**
 * 日期时间初始化脚本
 */

// 等待页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('开始初始化日期时间功能...');
    
    // 确保农历类已加载
    if (typeof DateTimeDisplay !== 'undefined') {
        try {
            window.dateTimeDisplay = new DateTimeDisplay();
            console.log('✅ 日期时间功能初始化成功');
        } catch (error) {
            console.error('❌ 日期时间功能初始化失败:', error);
        }
    } else {
        console.warn('⚠️ DateTimeDisplay 类未找到，稍后重试...');
        
        // 延迟重试
        setTimeout(() => {
            if (typeof DateTimeDisplay !== 'undefined') {
                try {
                    window.dateTimeDisplay = new DateTimeDisplay();
                    console.log('✅ 日期时间功能延迟初始化成功');
                } catch (error) {
                    console.error('❌ 日期时间功能延迟初始化失败:', error);
                }
            } else {
                console.error('❌ DateTimeDisplay 类仍未加载');
            }
        }, 1000);
    }
});

// 确保在页面刷新时正确清理定时器
window.addEventListener('beforeunload', function() {
    if (window.dateTimeDisplay && typeof window.dateTimeDisplay.destroy === 'function') {
        window.dateTimeDisplay.destroy();
    }
}); 