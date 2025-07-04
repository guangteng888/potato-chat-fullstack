const { app, BrowserWindow, Menu, Tray, shell, ipcMain, dialog, nativeTheme } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

// 启用实时重载 (开发模式)
if (process.env.NODE_ENV === 'development') {
  try {
    require('electron-reload')(__dirname);
  } catch (e) {
    console.log('electron-reload not available');
  }
}

// 应用配置
let mainWindow;
let tray;
let isQuitting = false;
let appSettings = {
  minimizeToTray: true
};

// 应用配置
const APP_CONFIG = {
  name: 'Potato Chat',
  version: app.getVersion(),
  isDev: process.env.NODE_ENV === 'development',
  webUrl: 'https://6pnppxaui5.space.minimax.io',
  localWebPath: path.join(__dirname, '../../potato-chat-clone/dist/index.html')
};

// 检查本地Web文件是否存在
function hasLocalWeb() {
  return fs.existsSync(APP_CONFIG.localWebPath);
}

// 获取Web URL
function getWebUrl() {
  if (APP_CONFIG.isDev) {
    return 'http://localhost:5173'; // Vite开发服务器
  }
  
  if (hasLocalWeb()) {
    return `file://${APP_CONFIG.localWebPath}`;
  }
  
  return APP_CONFIG.webUrl; // 在线版本
}

// 创建主窗口
function createMainWindow() {
  // 创建窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    icon: getIconPath(),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !APP_CONFIG.isDev
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    frame: true,
    backgroundColor: '#ffffff',
    vibrancy: 'under-window', // macOS 毛玻璃效果
    transparent: false
  });

  // 加载应用
  const webUrl = getWebUrl();
  console.log(`Loading app from: ${webUrl}`);
  mainWindow.loadURL(webUrl);

  // 窗口事件处理
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (APP_CONFIG.isDev) {
      mainWindow.webContents.openDevTools();
    }
    
    // 检查更新
    if (!APP_CONFIG.isDev) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting && appSettings.minimizeToTray) {
      event.preventDefault();
      mainWindow.hide();
      
      if (process.platform === 'darwin') {
        app.dock.hide();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 处理外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // 网页导航拦截
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    // 允许的域名
    const allowedDomains = [
      '6pnppxaui5.space.minimax.io',
      'localhost'
    ];
    
    if (!allowedDomains.some(domain => parsedUrl.hostname.includes(domain))) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });

  return mainWindow;
}

// 获取图标路径
function getIconPath() {
  const iconName = {
    win32: 'icon.ico',
    darwin: 'icon.icns',
    linux: 'icon.png'
  }[process.platform] || 'icon.png';
  
  return path.join(__dirname, '../assets', iconName);
}

// 创建系统托盘
function createTray() {
  const trayIcon = process.platform === 'darwin' 
    ? path.join(__dirname, '../assets/tray-icon-Template.png')
    : getIconPath();
    
  tray = new Tray(trayIcon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示 Potato Chat',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          if (process.platform === 'darwin') {
            app.dock.show();
          }
        }
      }
    },
    {
      type: 'separator'
    },
    {
      label: '开机自启动',
      type: 'checkbox',
      checked: app.getLoginItemSettings().openAtLogin,
      click: (item) => {
        app.setLoginItemSettings({
          openAtLogin: item.checked
        });
      }
    },
    {
      label: '最小化到托盘',
      type: 'checkbox',
      checked: appSettings.minimizeToTray,
      click: (item) => {
        appSettings.minimizeToTray = item.checked;
      }
    },
    {
      type: 'separator'
    },
    {
      label: '关于',
      click: () => {
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: '关于 Potato Chat',
          message: `${APP_CONFIG.name} v${APP_CONFIG.version}`,
          detail: '一个现代化的即时通讯应用，集成聊天、钱包和小程序功能。',
          buttons: ['确定']
        });
      }
    },
    {
      label: '退出',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
  tray.setToolTip('Potato Chat');
  
  // 双击托盘图标显示窗口
  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    }
  });
}

// 创建应用菜单
function createApplicationMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建聊天',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-chat');
          }
        },
        {
          type: 'separator'
        },
        {
          label: '设置',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('menu-settings');
          }
        },
        {
          type: 'separator'
        },
        {
          label: process.platform === 'darwin' ? '退出 Potato Chat' : '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            isQuitting = true;
            app.quit();
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectall', label: '全选' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '重新加载' },
        { role: 'forceReload', label: '强制重新加载' },
        { role: 'toggleDevTools', label: '开发者工具' },
        { type: 'separator' },
        { role: 'resetZoom', label: '实际大小' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' }
      ]
    },
    {
      label: '窗口',
      submenu: [
        { role: 'minimize', label: '最小化' },
        { role: 'close', label: '关闭' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于 Potato Chat',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于 Potato Chat',
              message: `${APP_CONFIG.name} v${APP_CONFIG.version}`,
              detail: '一个现代化的即时通讯应用，集成聊天、钱包和小程序功能。\n\n基于 Electron 构建，提供原生桌面体验。',
              buttons: ['确定']
            });
          }
        },
        {
          label: '检查更新',
          click: () => {
            autoUpdater.checkForUpdatesAndNotify();
          }
        }
      ]
    }
  ];

  // macOS 特定菜单调整
  if (process.platform === 'darwin') {
    template.unshift({
      label: APP_CONFIG.name,
      submenu: [
        { role: 'about', label: `关于 ${APP_CONFIG.name}` },
        { type: 'separator' },
        { role: 'services', label: '服务', submenu: [] },
        { type: 'separator' },
        { role: 'hide', label: `隐藏 ${APP_CONFIG.name}` },
        { role: 'hideothers', label: '隐藏其他' },
        { role: 'unhide', label: '显示全部' },
        { type: 'separator' },
        { role: 'quit', label: `退出 ${APP_CONFIG.name}` }
      ]
    });

    // 窗口菜单
    template[4].submenu = [
      { role: 'close', label: '关闭' },
      { role: 'minimize', label: '最小化' },
      { role: 'zoom', label: '缩放' },
      { type: 'separator' },
      { role: 'front', label: '前置全部窗口' }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC 消息处理
ipcMain.handle('app-version', () => {
  return APP_CONFIG.version;
});

ipcMain.handle('app-platform', () => {
  return process.platform;
});

ipcMain.handle('app-theme', () => {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
});

ipcMain.handle('app-config', () => {
  return {
    version: APP_CONFIG.version,
    platform: process.platform,
    theme: nativeTheme.shouldUseDarkColors ? 'dark' : 'light',
    isDev: APP_CONFIG.isDev
  };
});

// 自动更新事件
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available.');
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available.');
});

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded');
  autoUpdater.quitAndInstall();
});

// 应用事件处理
app.whenReady().then(() => {
  createMainWindow();
  createApplicationMenu();
  createTray();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

// 设置应用用户模型ID (Windows)
if (process.platform === 'win32') {
  app.setAppUserModelId(APP_CONFIG.name);
}

// 确保单例应用
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

console.log(`${APP_CONFIG.name} v${APP_CONFIG.version} starting...`);
