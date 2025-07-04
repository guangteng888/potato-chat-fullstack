const { 
  app, 
  BrowserWindow, 
  Menu, 
  Tray, 
  shell, 
  ipcMain, 
  dialog, 
  nativeTheme,
  globalShortcut,
  powerMonitor,
  screen
} = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

// 启用实时重载 (开发模式)
if (process.env.NODE_ENV === 'development') {
  try {
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
      hardResetMethod: 'exit'
    });
  } catch (e) {
    console.log('electron-reload not available');
  }
}

// 应用状态
let mainWindow;
let tray;
let isQuitting = false;
let windowState = {
  x: undefined,
  y: undefined,
  width: 1200,
  height: 800,
  isMaximized: false,
  isFullScreen: false
};

// 应用设置
let appSettings = {
  minimizeToTray: true,
  startMinimized: false,
  autoLaunch: false,
  hardwareAcceleration: true,
  notifications: true,
  theme: 'system' // 'light', 'dark', 'system'
};

// 应用配置
const APP_CONFIG = {
  name: 'Potato Chat',
  version: app.getVersion(),
  isDev: process.env.NODE_ENV === 'development',
  webUrl: 'https://6pnppxaui5.space.minimax.io',
  localWebPath: path.join(__dirname, '../../potato-chat-clone/dist/index.html'),
  userDataPath: app.getPath('userData'),
  settingsPath: path.join(app.getPath('userData'), 'settings.json')
};

// 防止多实例运行
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时，聚焦到主窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      mainWindow.show();
    }
  });
}

// 加载应用设置
function loadSettings() {
  try {
    if (fs.existsSync(APP_CONFIG.settingsPath)) {
      const data = fs.readFileSync(APP_CONFIG.settingsPath, 'utf8');
      const settings = JSON.parse(data);
      appSettings = { ...appSettings, ...settings };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

// 保存应用设置
function saveSettings() {
  try {
    fs.writeFileSync(APP_CONFIG.settingsPath, JSON.stringify(appSettings, null, 2));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

// 加载窗口状态
function loadWindowState() {
  const statePath = path.join(APP_CONFIG.userDataPath, 'window-state.json');
  try {
    if (fs.existsSync(statePath)) {
      const data = fs.readFileSync(statePath, 'utf8');
      const state = JSON.parse(data);
      
      // 验证显示器是否仍然存在
      const displays = screen.getAllDisplays();
      const validDisplay = displays.find(display => {
        return state.x >= display.bounds.x && 
               state.x < display.bounds.x + display.bounds.width &&
               state.y >= display.bounds.y && 
               state.y < display.bounds.y + display.bounds.height;
      });
      
      if (validDisplay) {
        windowState = { ...windowState, ...state };
      }
    }
  } catch (error) {
    console.error('Failed to load window state:', error);
  }
}

// 保存窗口状态
function saveWindowState() {
  if (!mainWindow) return;
  
  try {
    const bounds = mainWindow.getBounds();
    const state = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized: mainWindow.isMaximized(),
      isFullScreen: mainWindow.isFullScreen()
    };
    
    const statePath = path.join(APP_CONFIG.userDataPath, 'window-state.json');
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('Failed to save window state:', error);
  }
}

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

// 获取图标路径
function getIconPath() {
  const iconName = process.platform === 'win32' ? 'icon.ico' : 
                   process.platform === 'darwin' ? 'icon.icns' : 'icon.png';
  return path.join(__dirname, '../assets', iconName);
}

// 获取托盘图标路径
function getTrayIconPath() {
  if (process.platform === 'darwin') {
    return path.join(__dirname, '../assets/tray-icon-Template.png');
  }
  return path.join(__dirname, '../assets/tray-icon.png');
}

// 创建主窗口
function createMainWindow() {
  // 加载窗口状态
  loadWindowState();
  
  // 创建窗口
  mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    minWidth: 800,
    minHeight: 600,
    show: !appSettings.startMinimized,
    icon: getIconPath(),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !APP_CONFIG.isDev,
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    frame: true,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1a1a1a' : '#ffffff',
    vibrancy: process.platform === 'darwin' ? 'under-window' : undefined,
    transparent: false,
    resizable: true,
    maximizable: true,
    minimizable: true,
    closable: true,
    fullscreenable: true,
    autoHideMenuBar: false
  });

  // 恢复窗口状态
  if (windowState.isMaximized) {
    mainWindow.maximize();
  }
  
  if (windowState.isFullScreen) {
    mainWindow.setFullScreen(true);
  }

  // 加载应用
  const webUrl = getWebUrl();
  console.log(`Loading app from: ${webUrl}`);
  mainWindow.loadURL(webUrl);

  // 窗口事件处理
  mainWindow.once('ready-to-show', () => {
    if (!appSettings.startMinimized) {
      mainWindow.show();
    }
    
    if (APP_CONFIG.isDev) {
      mainWindow.webContents.openDevTools();
    }
    
    // 检查更新
    if (!APP_CONFIG.isDev) {
      setTimeout(() => {
        autoUpdater.checkForUpdatesAndNotify();
      }, 3000);
    }
  });

  // 窗口关闭事件
  mainWindow.on('close', (event) => {
    if (!isQuitting && appSettings.minimizeToTray) {
      event.preventDefault();
      mainWindow.hide();
      
      if (process.platform === 'darwin') {
        app.dock.hide();
      }
      
      // 显示托盘提示
      if (tray && appSettings.notifications) {
        tray.displayBalloon({
          iconType: 'info',
          title: 'Potato Chat',
          content: '应用已最小化到系统托盘'
        });
      }
    } else {
      // 保存窗口状态
      saveWindowState();
    }
  });

  // 窗口大小和位置变化
  mainWindow.on('resize', () => {
    setTimeout(saveWindowState, 500);
  });

  mainWindow.on('move', () => {
    setTimeout(saveWindowState, 500);
  });

  mainWindow.on('maximize', () => {
    windowState.isMaximized = true;
    saveWindowState();
  });

  mainWindow.on('unmaximize', () => {
    windowState.isMaximized = false;
    saveWindowState();
  });

  mainWindow.on('enter-full-screen', () => {
    windowState.isFullScreen = true;
    saveWindowState();
  });

  mainWindow.on('leave-full-screen', () => {
    windowState.isFullScreen = false;
    saveWindowState();
  });

  // 阻止导航到外部链接
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== new URL(webUrl).origin) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });

  // 新窗口处理
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Web内容加载完成
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Web content loaded');
    
    // 注入主题
    updateTheme();
  });

  // 错误处理
  mainWindow.webContents.on('crashed', () => {
    const options = {
      type: 'error',
      title: '渲染进程崩溃',
      message: '应用遇到了错误，需要重新启动。',
      buttons: ['重新启动', '退出']
    };
    
    dialog.showMessageBox(options).then((result) => {
      if (result.response === 0) {
        mainWindow.reload();
      } else {
        app.quit();
      }
    });
  });
}

// 创建系统托盘
function createTray() {
  const iconPath = getTrayIconPath();
  
  if (!fs.existsSync(iconPath)) {
    console.warn('Tray icon not found:', iconPath);
    return;
  }
  
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
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
      label: '新建聊天',
      accelerator: 'CmdOrCtrl+N',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.send('menu-new-chat');
        }
      }
    },
    {
      label: '设置',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.send('menu-settings');
        }
      }
    },
    {
      type: 'separator'
    },
    {
      label: '关于',
      click: () => {
        showAboutDialog();
      }
    },
    {
      type: 'separator'
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
  
  // 托盘图标点击事件
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        if (process.platform === 'darwin') {
          app.dock.show();
        }
      }
    }
  });

  // 双击托盘图标
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
      if (process.platform === 'darwin') {
        app.dock.show();
      }
    }
  });
}

// 创建应用菜单
function createApplicationMenu() {
  const isMac = process.platform === 'darwin';
  
  const template = [
    // macOS应用菜单
    ...(isMac ? [{
      label: app.getName(),
      submenu: [
        { role: 'about', label: '关于 Potato Chat' },
        { type: 'separator' },
        { role: 'services', label: '服务' },
        { type: 'separator' },
        { role: 'hide', label: '隐藏 Potato Chat' },
        { role: 'hideothers', label: '隐藏其他' },
        { role: 'unhide', label: '显示全部' },
        { type: 'separator' },
        { role: 'quit', label: '退出 Potato Chat' }
      ]
    }] : []),
    
    // 文件菜单
    {
      label: '文件',
      submenu: [
        {
          label: '新建聊天',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-new-chat');
            }
          }
        },
        {
          label: '新建群聊',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-new-group');
            }
          }
        },
        { type: 'separator' },
        {
          label: '搜索',
          accelerator: 'CmdOrCtrl+F',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-search');
            }
          }
        },
        { type: 'separator' },
        {
          label: '设置',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-settings');
            }
          }
        },
        { type: 'separator' },
        ...(!isMac ? [
          {
            label: '退出',
            accelerator: 'Ctrl+Q',
            click: () => {
              isQuitting = true;
              app.quit();
            }
          }
        ] : [])
      ]
    },
    
    // 编辑菜单
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'pasteandmatchstyle', label: '粘贴并匹配样式' },
        { role: 'delete', label: '删除' },
        { role: 'selectall', label: '全选' }
      ]
    },
    
    // 视图菜单
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
        { role: 'togglefullscreen', label: '全屏' },
        { type: 'separator' },
        {
          label: '主题',
          submenu: [
            {
              label: '跟随系统',
              type: 'radio',
              checked: appSettings.theme === 'system',
              click: () => setTheme('system')
            },
            {
              label: '浅色模式',
              type: 'radio',
              checked: appSettings.theme === 'light',
              click: () => setTheme('light')
            },
            {
              label: '深色模式',
              type: 'radio',
              checked: appSettings.theme === 'dark',
              click: () => setTheme('dark')
            }
          ]
        }
      ]
    },
    
    // 窗口菜单
    {
      label: '窗口',
      submenu: [
        { role: 'minimize', label: '最小化' },
        { role: 'close', label: '关闭' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front', label: '全部置于顶层' }
        ] : [])
      ]
    },
    
    // 帮助菜单
    {
      label: '帮助',
      submenu: [
        {
          label: '在线帮助',
          click: () => {
            shell.openExternal('https://help.potato-chat.com');
          }
        },
        {
          label: '快捷键',
          click: () => {
            showShortcutsDialog();
          }
        },
        { type: 'separator' },
        {
          label: '反馈问题',
          click: () => {
            shell.openExternal('https://github.com/potato-chat/feedback/issues');
          }
        },
        { type: 'separator' },
        ...(!isMac ? [
          {
            label: '关于 Potato Chat',
            click: () => {
              showAboutDialog();
            }
          }
        ] : [])
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 注册全局快捷键
function registerGlobalShortcuts() {
  try {
    // 显示/隐藏主窗口
    globalShortcut.register('CmdOrCtrl+Shift+P', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });

    // 快速搜索
    globalShortcut.register('CmdOrCtrl+Shift+F', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('global-search');
      }
    });

    console.log('Global shortcuts registered');
  } catch (error) {
    console.error('Failed to register global shortcuts:', error);
  }
}

// 主题管理
function setTheme(theme) {
  appSettings.theme = theme;
  saveSettings();
  updateTheme();
  
  // 重建菜单以更新选中状态
  createApplicationMenu();
}

function updateTheme() {
  if (!mainWindow) return;
  
  let shouldUseDarkColors;
  
  switch (appSettings.theme) {
    case 'light':
      shouldUseDarkColors = false;
      break;
    case 'dark':
      shouldUseDarkColors = true;
      break;
    case 'system':
    default:
      shouldUseDarkColors = nativeTheme.shouldUseDarkColors;
      break;
  }
  
  // 设置原生主题
  nativeTheme.themeSource = appSettings.theme;
  
  // 向渲染进程发送主题更新
  mainWindow.webContents.send('theme-changed', {
    shouldUseDarkColors,
    theme: appSettings.theme
  });
}

// 显示关于对话框
function showAboutDialog() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: '关于 Potato Chat',
    message: 'Potato Chat',
    detail: `版本: ${APP_CONFIG.version}\n基于 Electron 的跨平台即时通讯应用\n\n© 2025 Potato Chat Team`,
    icon: getIconPath(),
    buttons: ['确定']
  });
}

// 显示快捷键对话框
function showShortcutsDialog() {
  const shortcuts = [
    'Ctrl/Cmd + N - 新建聊天',
    'Ctrl/Cmd + Shift + N - 新建群聊',
    'Ctrl/Cmd + F - 搜索',
    'Ctrl/Cmd + , - 设置',
    'Ctrl/Cmd + Shift + P - 显示/隐藏窗口',
    'Ctrl/Cmd + Shift + F - 全局搜索',
    'F11 - 全屏切换 (Windows/Linux)',
    'Ctrl/Cmd + R - 刷新',
    'Ctrl/Cmd + Shift + I - 开发者工具'
  ];
  
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: '快捷键',
    message: '键盘快捷键',
    detail: shortcuts.join('\n'),
    buttons: ['确定']
  });
}

// 自动更新处理
function setupAutoUpdater() {
  if (APP_CONFIG.isDev) return;
  
  autoUpdater.checkForUpdatesAndNotify();
  
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...');
  });
  
  autoUpdater.on('update-available', (info) => {
    console.log('Update available.');
    
    if (appSettings.notifications && tray) {
      tray.displayBalloon({
        iconType: 'info',
        title: 'Potato Chat',
        content: '发现新版本，正在下载...'
      });
    }
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
    
    const options = {
      type: 'question',
      buttons: ['立即重启', '稍后重启'],
      defaultId: 0,
      title: '更新下载完成',
      message: '新版本已下载完成，是否立即重启应用以应用更新？'
    };
    
    dialog.showMessageBox(mainWindow, options).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });
}

// 电源管理
function setupPowerMonitor() {
  powerMonitor.on('suspend', () => {
    console.log('System is going to sleep');
    // 系统休眠时的处理
    if (mainWindow) {
      mainWindow.webContents.send('system-suspend');
    }
  });

  powerMonitor.on('resume', () => {
    console.log('System resumed');
    // 系统恢复时的处理
    if (mainWindow) {
      mainWindow.webContents.send('system-resume');
    }
  });

  powerMonitor.on('on-ac', () => {
    console.log('System plugged in');
  });

  powerMonitor.on('on-battery', () => {
    console.log('System on battery');
  });
}

// IPC处理
function setupIPC() {
  // 获取应用版本
  ipcMain.handle('app-version', () => {
    return APP_CONFIG.version;
  });

  // 获取应用平台
  ipcMain.handle('app-platform', () => {
    return process.platform;
  });

  // 获取应用主题
  ipcMain.handle('app-theme', () => {
    return {
      shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
      theme: appSettings.theme
    };
  });

  // 获取应用配置
  ipcMain.handle('app-config', () => {
    return {
      ...APP_CONFIG,
      settings: appSettings
    };
  });

  // 窗口控制
  ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on('window-maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on('window-close', () => {
    if (mainWindow) mainWindow.close();
  });

  // 全屏切换
  ipcMain.on('toggle-fullscreen', () => {
    if (mainWindow) {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

  // 开发者工具切换
  ipcMain.on('toggle-devtools', () => {
    if (mainWindow) {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools();
      }
    }
  });

  // 设置更新
  ipcMain.handle('update-settings', (event, newSettings) => {
    appSettings = { ...appSettings, ...newSettings };
    saveSettings();
    return appSettings;
  });

  // 获取设置
  ipcMain.handle('get-settings', () => {
    return appSettings;
  });
}

// 应用事件处理
app.whenReady().then(async () => {
  // 加载设置
  loadSettings();
  
  // 设置硬件加速
  if (!appSettings.hardwareAcceleration) {
    app.disableHardwareAcceleration();
  }
  
  // 创建窗口和界面
  createMainWindow();
  createTray();
  createApplicationMenu();
  
  // 设置功能
  setupIPC();
  setupAutoUpdater();
  setupPowerMonitor();
  registerGlobalShortcuts();
  
  // 主题更新监听
  nativeTheme.on('updated', () => {
    updateTheme();
  });
  
  console.log('Potato Chat Desktop started successfully');
});

// 所有窗口关闭
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 应用激活
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  } else if (mainWindow) {
    mainWindow.show();
  }
});

// 应用退出前
app.on('before-quit', () => {
  isQuitting = true;
  
  // 注销全局快捷键
  globalShortcut.unregisterAll();
  
  // 保存设置和状态
  saveSettings();
  saveWindowState();
});

// 证书错误处理 (仅开发模式)
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (APP_CONFIG.isDev) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});

// 处理协议
app.setAsDefaultProtocolClient('potato-chat');

// 处理深度链接 (Windows/Linux)
app.on('open-url', (event, url) => {
  event.preventDefault();
  console.log('Deep link:', url);
  
  if (mainWindow) {
    mainWindow.show();
    mainWindow.webContents.send('deep-link', url);
  }
});

console.log('Potato Chat Desktop main process initialized');
