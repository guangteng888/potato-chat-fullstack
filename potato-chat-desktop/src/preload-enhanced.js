// Potato Chat Desktop - 增强版预加载脚本
// 为渲染进程提供安全的API接口

const { contextBridge, ipcRenderer } = require('electron');

// 验证来源
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'file://',
  'https://6pnppxaui5.space.minimax.io'
];

// 验证消息来源
function isValidOrigin(origin) {
  return ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
}

// Desktop API 接口
const desktopAPI = {
  // 应用信息
  app: {
    getVersion: () => ipcRenderer.invoke('app-version'),
    getPlatform: () => ipcRenderer.invoke('app-platform'),
    getTheme: () => ipcRenderer.invoke('app-theme'),
    getConfig: () => ipcRenderer.invoke('app-config'),
  },

  // 窗口控制
  window: {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),
    toggleDevTools: () => ipcRenderer.send('toggle-devtools'),
  },

  // 设置管理
  settings: {
    get: () => ipcRenderer.invoke('get-settings'),
    update: (settings) => ipcRenderer.invoke('update-settings', settings),
  },

  // 菜单事件监听
  menu: {
    onNewChat: (callback) => {
      const listener = () => callback();
      ipcRenderer.on('menu-new-chat', listener);
      return () => ipcRenderer.removeListener('menu-new-chat', listener);
    },
    onNewGroup: (callback) => {
      const listener = () => callback();
      ipcRenderer.on('menu-new-group', listener);
      return () => ipcRenderer.removeListener('menu-new-group', listener);
    },
    onSearch: (callback) => {
      const listener = () => callback();
      ipcRenderer.on('menu-search', listener);
      return () => ipcRenderer.removeListener('menu-search', listener);
    },
    onSettings: (callback) => {
      const listener = () => callback();
      ipcRenderer.on('menu-settings', listener);
      return () => ipcRenderer.removeListener('menu-settings', listener);
    },
    onGlobalSearch: (callback) => {
      const listener = () => callback();
      ipcRenderer.on('global-search', listener);
      return () => ipcRenderer.removeListener('global-search', listener);
    },
  },

  // 主题管理
  theme: {
    onChange: (callback) => {
      const listener = (event, themeData) => callback(themeData);
      ipcRenderer.on('theme-changed', listener);
      return () => ipcRenderer.removeListener('theme-changed', listener);
    },
    getCurrent: () => ipcRenderer.invoke('app-theme'),
  },

  // 系统事件
  system: {
    onSuspend: (callback) => {
      const listener = () => callback();
      ipcRenderer.on('system-suspend', listener);
      return () => ipcRenderer.removeListener('system-suspend', listener);
    },
    onResume: (callback) => {
      const listener = () => callback();
      ipcRenderer.on('system-resume', listener);
      return () => ipcRenderer.removeListener('system-resume', listener);
    },
  },

  // 深度链接
  deepLink: {
    onReceive: (callback) => {
      const listener = (event, url) => callback(url);
      ipcRenderer.on('deep-link', listener);
      return () => ipcRenderer.removeListener('deep-link', listener);
    },
  },

  // 通知
  notifications: {
    show: (title, body, options = {}) => {
      if (Notification && Notification.permission === 'granted') {
        return new Notification(title, { body, ...options });
      }
      return null;
    },
    requestPermission: async () => {
      if (Notification) {
        return await Notification.requestPermission();
      }
      return 'denied';
    },
  },

  // 环境检测
  environment: {
    isDesktop: () => true,
    isElectron: () => true,
    isMobile: () => false,
    isWeb: () => false,
    platform: process.platform,
  },

  // 日志记录 (开发模式)
  log: {
    info: (...args) => console.log('[Desktop]', ...args),
    warn: (...args) => console.warn('[Desktop]', ...args),
    error: (...args) => console.error('[Desktop]', ...args),
    debug: (...args) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug('[Desktop]', ...args);
      }
    },
  },
};

// 安全地暴露 API 到渲染进程
try {
  contextBridge.exposeInMainWorld('desktopAPI', desktopAPI);
  contextBridge.exposeInMainWorld('electronAPI', {
    // 向后兼容
    isElectron: true,
    platform: process.platform,
    versions: process.versions,
  });
  
  console.log('Desktop API exposed successfully');
} catch (error) {
  console.error('Failed to expose desktop API:', error);
}

// 页面加载完成后的初始化
window.addEventListener('DOMContentLoaded', () => {
  console.log('Desktop preload script initialized');
  
  // 注入桌面端标识样式
  const style = document.createElement('style');
  style.textContent = `
    body {
      --is-desktop: 1;
      --platform: '${process.platform}';
    }
    
    /* 桌面端特有样式 */
    .desktop-only {
      display: block !important;
    }
    
    .mobile-only,
    .web-only {
      display: none !important;
    }
    
    /* 窗口控制按钮区域 */
    .window-controls {
      -webkit-app-region: no-drag;
      position: fixed;
      top: 0;
      right: 0;
      z-index: 10000;
      display: flex;
      height: 30px;
    }
    
    /* 拖拽区域 */
    .titlebar {
      -webkit-app-region: drag;
      height: 30px;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      pointer-events: none;
    }
    
    /* macOS 样式调整 */
    ${process.platform === 'darwin' ? `
      .titlebar {
        height: 22px;
      }
      
      .window-controls {
        left: 0;
        right: auto;
        padding-left: 70px;
      }
    ` : ''}
  `;
  
  document.head.appendChild(style);
  
  // 如果应用支持，发送桌面端就绪事件
  if (window.electronAPI && typeof window.dispatchEvent === 'function') {
    const readyEvent = new CustomEvent('desktop-ready', {
      detail: {
        platform: process.platform,
        versions: process.versions,
        isElectron: true
      }
    });
    window.dispatchEvent(readyEvent);
  }
});

// 页面可见性变化处理
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.log('Desktop app became visible');
  } else {
    console.log('Desktop app became hidden');
  }
});

// 错误处理
window.addEventListener('error', (event) => {
  console.error('Desktop renderer error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Desktop unhandled promise rejection:', event.reason);
});

// 导出类型定义 (用于 TypeScript)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DesktopAPI: desktopAPI,
  };
}