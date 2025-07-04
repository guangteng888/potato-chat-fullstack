// Potato Chat Mobile - 原生功能集成模块
// 提供移动端特有的原生功能支持

import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Device } from '@capacitor/device';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Geolocation } from '@capacitor/geolocation';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Keyboard } from '@capacitor/keyboard';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import { PushNotifications } from '@capacitor/push-notifications';
import { Share } from '@capacitor/share';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

class NativeFeatures {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.platform = Capacitor.getPlatform();
    this.initialized = false;
  }

  // 初始化所有原生功能
  async initialize() {
    if (!this.isNative) {
      console.log('Running in web mode, native features disabled');
      return;
    }

    try {
      console.log('Initializing native features...');
      
      // 初始化设备信息
      await this.initializeDevice();
      
      // 初始化状态栏
      await this.initializeStatusBar();
      
      // 初始化启动画面
      await this.initializeSplashScreen();
      
      // 初始化推送通知
      await this.initializePushNotifications();
      
      // 初始化本地通知
      await this.initializeLocalNotifications();
      
      // 初始化键盘监听
      await this.initializeKeyboard();
      
      // 初始化网络监听
      await this.initializeNetwork();
      
      // 初始化应用状态监听
      await this.initializeAppState();

      this.initialized = true;
      console.log('Native features initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize native features:', error);
    }
  }

  // 设备信息初始化
  async initializeDevice() {
    try {
      const info = await Device.getInfo();
      console.log('Device info:', info);
      
      // 存储设备信息到本地
      await this.setPreference('device_info', JSON.stringify(info));
      
      return info;
    } catch (error) {
      console.error('Device initialization failed:', error);
    }
  }

  // 状态栏初始化
  async initializeStatusBar() {
    if (this.platform === 'ios' || this.platform === 'android') {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#4f46e5' });
        console.log('Status bar configured');
      } catch (error) {
        console.error('Status bar configuration failed:', error);
      }
    }
  }

  // 启动画面管理
  async initializeSplashScreen() {
    try {
      // 延迟隐藏启动画面，确保应用完全加载
      setTimeout(async () => {
        await SplashScreen.hide({
          fadeOutDuration: 300
        });
      }, 2000);
    } catch (error) {
      console.error('Splash screen management failed:', error);
    }
  }

  // 推送通知初始化
  async initializePushNotifications() {
    try {
      // 请求权限
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive === 'granted') {
        await PushNotifications.register();
        
        // 监听注册成功
        PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success, token: ' + token.value);
          this.setPreference('push_token', token.value);
        });

        // 监听注册失败
        PushNotifications.addListener('registrationError', (error) => {
          console.error('Push registration failed: ' + JSON.stringify(error));
        });

        // 监听接收通知
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push notification received: ', notification);
          this.handlePushNotification(notification);
        });

        // 监听通知点击
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push notification action performed', notification);
          this.handlePushNotificationAction(notification);
        });
      }
    } catch (error) {
      console.error('Push notifications initialization failed:', error);
    }
  }

  // 本地通知初始化
  async initializeLocalNotifications() {
    try {
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display === 'granted') {
        console.log('Local notifications permission granted');
      }
    } catch (error) {
      console.error('Local notifications initialization failed:', error);
    }
  }

  // 键盘事件监听
  async initializeKeyboard() {
    try {
      Keyboard.addListener('keyboardWillShow', info => {
        console.log('Keyboard will show with height:', info.keyboardHeight);
        document.body.classList.add('keyboard-open');
      });

      Keyboard.addListener('keyboardDidShow', info => {
        console.log('Keyboard did show');
      });

      Keyboard.addListener('keyboardWillHide', () => {
        console.log('Keyboard will hide');
        document.body.classList.remove('keyboard-open');
      });

      Keyboard.addListener('keyboardDidHide', () => {
        console.log('Keyboard did hide');
      });
    } catch (error) {
      console.error('Keyboard listeners initialization failed:', error);
    }
  }

  // 网络状态监听
  async initializeNetwork() {
    try {
      // 获取当前网络状态
      const status = await Network.getStatus();
      console.log('Network status:', status);

      // 监听网络状态变化
      Network.addListener('networkStatusChange', status => {
        console.log('Network status changed', status);
        this.handleNetworkChange(status);
      });
    } catch (error) {
      console.error('Network monitoring initialization failed:', error);
    }
  }

  // 应用状态监听
  async initializeAppState() {
    try {
      App.addListener('appStateChange', (state) => {
        console.log('App state changed:', state);
        this.handleAppStateChange(state);
      });

      App.addListener('backButton', () => {
        console.log('Hardware back button pressed');
        this.handleBackButton();
      });

      App.addListener('pause', () => {
        console.log('App paused');
        this.handleAppPause();
      });

      App.addListener('resume', () => {
        console.log('App resumed');
        this.handleAppResume();
      });
    } catch (error) {
      console.error('App state listeners initialization failed:', error);
    }
  }

  // 相机功能
  async takePicture(options = {}) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        ...options
      });

      return image;
    } catch (error) {
      console.error('Camera capture failed:', error);
      throw error;
    }
  }

  // 选择图片
  async selectImage(options = {}) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        ...options
      });

      return image;
    } catch (error) {
      console.error('Image selection failed:', error);
      throw error;
    }
  }

  // 地理定位
  async getCurrentPosition() {
    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      return coordinates;
    } catch (error) {
      console.error('Geolocation failed:', error);
      throw error;
    }
  }

  // 触觉反馈
  async hapticFeedback(style = ImpactStyle.Light) {
    try {
      if (this.isNative) {
        await Haptics.impact({ style });
      }
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  }

  // 分享功能
  async share(options) {
    try {
      await Share.share(options);
    } catch (error) {
      console.error('Share failed:', error);
      throw error;
    }
  }

  // 本地存储
  async setPreference(key, value) {
    try {
      await Preferences.set({ key, value });
    } catch (error) {
      console.error('Set preference failed:', error);
    }
  }

  async getPreference(key) {
    try {
      const result = await Preferences.get({ key });
      return result.value;
    } catch (error) {
      console.error('Get preference failed:', error);
      return null;
    }
  }

  // 文件系统操作
  async writeFile(filename, data, directory = Directory.Data) {
    try {
      await Filesystem.writeFile({
        path: filename,
        data: data,
        directory: directory,
        encoding: Encoding.UTF8
      });
    } catch (error) {
      console.error('Write file failed:', error);
      throw error;
    }
  }

  async readFile(filename, directory = Directory.Data) {
    try {
      const contents = await Filesystem.readFile({
        path: filename,
        directory: directory,
        encoding: Encoding.UTF8
      });
      return contents.data;
    } catch (error) {
      console.error('Read file failed:', error);
      throw error;
    }
  }

  // 显示本地通知
  async showLocalNotification(title, body, options = {}) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'default',
            ...options
          }
        ]
      });
    } catch (error) {
      console.error('Show local notification failed:', error);
    }
  }

  // 事件处理函数
  handlePushNotification(notification) {
    // 处理推送通知接收
    console.log('Handling push notification:', notification);
    
    // 如果应用在前台，显示应用内通知
    if (notification.data?.showInApp) {
      this.showInAppNotification(notification.title, notification.body);
    }
  }

  handlePushNotificationAction(notification) {
    // 处理推送通知点击
    console.log('Handling push notification action:', notification);
    
    // 根据通知数据跳转到相应页面
    if (notification.notification?.data?.route) {
      this.navigateToRoute(notification.notification.data.route);
    }
  }

  handleNetworkChange(status) {
    // 处理网络状态变化
    if (!status.connected) {
      this.showInAppNotification('网络连接', '网络连接已断开，请检查网络设置');
    } else {
      console.log('Network reconnected');
    }
  }

  handleAppStateChange(state) {
    // 处理应用状态变化
    if (state.isActive) {
      console.log('App became active');
      // 应用激活时的处理逻辑
    } else {
      console.log('App became inactive');
      // 应用非激活时的处理逻辑
    }
  }

  handleBackButton() {
    // 处理返回按钮
    // 这里可以根据当前路由决定行为
    const currentRoute = window.location.hash;
    
    if (currentRoute === '#/' || currentRoute === '') {
      // 在主页时询问是否退出应用
      this.confirmExit();
    } else {
      // 否则返回上一页
      window.history.back();
    }
  }

  handleAppPause() {
    // 应用暂停时保存状态
    this.saveAppState();
  }

  handleAppResume() {
    // 应用恢复时恢复状态
    this.restoreAppState();
  }

  // 辅助函数
  showInAppNotification(title, message) {
    // 显示应用内通知的逻辑
    console.log(`In-app notification: ${title} - ${message}`);
    
    // 这里可以集成到应用的通知系统
    if (window.showToast) {
      window.showToast({ title, message });
    }
  }

  navigateToRoute(route) {
    // 路由导航逻辑
    console.log(`Navigating to route: ${route}`);
    
    // 这里可以集成到应用的路由系统
    if (window.router) {
      window.router.push(route);
    }
  }

  async confirmExit() {
    // 确认退出应用
    try {
      // 这里可以显示确认对话框
      const shouldExit = confirm('确定要退出Potato Chat吗？');
      if (shouldExit) {
        App.exitApp();
      }
    } catch (error) {
      console.error('Exit confirmation failed:', error);
    }
  }

  saveAppState() {
    // 保存应用状态
    const state = {
      timestamp: Date.now(),
      route: window.location.hash,
      // 其他需要保存的状态
    };
    
    this.setPreference('app_state', JSON.stringify(state));
  }

  async restoreAppState() {
    // 恢复应用状态
    try {
      const stateStr = await this.getPreference('app_state');
      if (stateStr) {
        const state = JSON.parse(stateStr);
        console.log('Restoring app state:', state);
        
        // 恢复路由等状态
        if (state.route && window.router) {
          window.router.push(state.route);
        }
      }
    } catch (error) {
      console.error('Restore app state failed:', error);
    }
  }

  // 获取平台信息
  getPlatformInfo() {
    return {
      isNative: this.isNative,
      platform: this.platform,
      initialized: this.initialized
    };
  }
}

// 创建全局实例
const nativeFeatures = new NativeFeatures();

// 导出单例
export default nativeFeatures;

// 在应用启动时自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    nativeFeatures.initialize();
  });
} else {
  nativeFeatures.initialize();
}
