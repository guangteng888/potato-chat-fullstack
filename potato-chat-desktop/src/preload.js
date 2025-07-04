const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 应用信息
  getAppVersion: () => ipcRenderer.invoke('app-version'),
  getAppPlatform: () => ipcRenderer.invoke('app-platform'),
  getAppTheme: () => ipcRenderer.invoke('app-theme'),
  getAppConfig: () => ipcRenderer.invoke('app-config'),
  
  // 窗口控制
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  
  // 通知
  showNotification: (title, body, options = {}) => {
    if (Notification.permission === 'granted') {
      return new Notification(title, { body, ...options });
    }
  },
  
  // 菜单事件监听
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-new-chat', callback);
    ipcRenderer.on('menu-settings', callback);
  },
  
  // 移除事件监听
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// 暴露系统信息
contextBridge.exposeInMainWorld('systemInfo', {
  platform: process.platform,
  arch: process.arch,
  version: process.version,
  isElectron: true
});

// 注入平台特定的样式类
document.addEventListener('DOMContentLoaded', () => {
  const platform = process.platform;
  document.body.classList.add(`platform-${platform}`);
  
  if (platform === 'darwin') {
    document.body.classList.add('is-macos');
  } else if (platform === 'win32') {
    document.body.classList.add('is-windows');
  } else {
    document.body.classList.add('is-linux');
  }
});

// 阻止拖拽文件到窗口
document.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
});

document.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
});

// 键盘快捷键处理
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + R 刷新页面
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
    e.preventDefault();
    location.reload();
  }
  
  // F11 全屏切换 (Windows/Linux)
  if (e.key === 'F11' && process.platform !== 'darwin') {
    e.preventDefault();
    ipcRenderer.send('toggle-fullscreen');
  }
  
  // Ctrl/Cmd + Shift + I 开发者工具
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
    e.preventDefault();
    ipcRenderer.send('toggle-devtools');
  }
});

console.log('Potato Chat Desktop preload script loaded');
