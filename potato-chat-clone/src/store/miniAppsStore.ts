import { create } from 'zustand';
import { apiService, type MiniApp } from '../services/apiService';

interface RunningApp {
  id: string;
  name: string;
  icon: string;
  isMinimized: boolean;
  lastActivity: Date;
  state?: any; // App-specific state
}

interface DeveloperAPI {
  messaging: {
    sendMessage: (content: string, roomId?: string) => void;
    onMessage: (callback: (message: any) => void) => void;
  };
  storage: {
    get: (key: string) => any;
    set: (key: string, value: any) => void;
    remove: (key: string) => void;
  };
  user: {
    getProfile: () => any;
    getContacts: () => any[];
  };
  wallet: {
    getBalance: (currency?: string) => number;
    requestPayment: (amount: number, currency: string, description: string) => void;
  };
  ui: {
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    showDialog: (title: string, content: string, buttons: string[]) => void;
  };
}

interface MiniAppsState {
  // ======================== 基础状态 ========================
  availableApps: MiniApp[];
  installedApps: MiniApp[];
  runningApps: RunningApp[];
  activeApp: string | null;
  isStoreOpen: boolean;
  searchQuery: string;
  selectedCategory: MiniApp['category'] | 'all';
  isLoading: boolean;
  error: string | null;
  
  // ======================== 开发者平台 ========================
  developerMode: boolean;
  apiKeys: Record<string, string>;
  
  // ======================== 小程序管理 ========================
  loadAvailableApps: () => Promise<void>;
  loadInstalledApps: () => Promise<void>;
  installApp: (appId: string) => Promise<boolean>;
  uninstallApp: (appId: string) => Promise<boolean>;
  launchApp: (appId: string) => void;
  closeApp: (appId: string) => void;
  minimizeApp: (appId: string) => void;
  restoreApp: (appId: string) => void;
  
  // ======================== 界面状态管理 ========================
  setStoreOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: MiniApp['category'] | 'all') => void;
  setActiveApp: (appId: string | null) => void;
  updateAppState: (appId: string, state: any) => void;
  
  // ======================== 开发者功能 ========================
  enableDeveloperMode: (enabled: boolean) => void;
  addApiKey: (appId: string, key: string) => void;
  
  // ======================== 工具函数 ========================
  getFilteredApps: () => MiniApp[];
  
  // ======================== 内部状态管理 ========================
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMiniAppsStore = create<MiniAppsState>()((set, get) => ({
  // ======================== 初始状态 ========================
  availableApps: [],
  installedApps: [],
  runningApps: [],
  activeApp: null,
  isStoreOpen: false,
  searchQuery: '',
  selectedCategory: 'all',
  isLoading: false,
  error: null,
  developerMode: false,
  apiKeys: {},

  // ======================== 小程序管理 ========================
  loadAvailableApps: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiService.getMiniApps();
      
      if (response.success && response.data) {
        const apps = response.data.apps.map(app => ({
          ...app,
          lastUsed: app.lastUsed ? new Date(app.lastUsed) : undefined,
          createdAt: new Date(app.createdAt),
          updatedAt: new Date(app.updatedAt)
        }));
        
        set({
          availableApps: apps,
          isLoading: false,
          error: null
        });
      } else {
        set({
          isLoading: false,
          error: response.error || '加载小程序列表失败'
        });
      }
    } catch (error) {
      console.error('Load available apps error:', error);
      set({
        isLoading: false,
        error: '网络错误，请稍后重试'
      });
    }
  },

  loadInstalledApps: async () => {
    // 从可用应用中筛选已安装的应用
    const { availableApps } = get();
    const installedApps = availableApps.filter(app => app.isInstalled);
    set({ installedApps });
  },

  installApp: async (appId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiService.installMiniApp(appId);
      
      if (response.success) {
        // 更新应用的安装状态
        set((state) => {
          const updatedAvailableApps = state.availableApps.map(app =>
            app.id === appId ? { ...app, isInstalled: true, lastUsed: new Date() } : app
          );
          
          const installedApps = updatedAvailableApps.filter(app => app.isInstalled);
          
          return {
            availableApps: updatedAvailableApps,
            installedApps,
            isLoading: false,
            error: null
          };
        });
        
        return true;
      } else {
        set({
          isLoading: false,
          error: response.error || '安装失败'
        });
        return false;
      }
    } catch (error) {
      console.error('Install app error:', error);
      set({
        isLoading: false,
        error: '网络错误，请稍后重试'
      });
      return false;
    }
  },

  uninstallApp: async (appId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiService.uninstallMiniApp(appId);
      
      if (response.success) {
        // 更新应用的安装状态
        set((state) => {
          const updatedAvailableApps = state.availableApps.map(app =>
            app.id === appId ? { ...app, isInstalled: false } : app
          );
          
          const installedApps = updatedAvailableApps.filter(app => app.isInstalled);
          
          // 如果应用正在运行，关闭它
          const runningApps = state.runningApps.filter(app => app.id !== appId);
          const activeApp = state.activeApp === appId ? null : state.activeApp;
          
          return {
            availableApps: updatedAvailableApps,
            installedApps,
            runningApps,
            activeApp,
            isLoading: false,
            error: null
          };
        });
        
        return true;
      } else {
        set({
          isLoading: false,
          error: response.error || '卸载失败'
        });
        return false;
      }
    } catch (error) {
      console.error('Uninstall app error:', error);
      set({
        isLoading: false,
        error: '网络错误，请稍后重试'
      });
      return false;
    }
  },

  launchApp: (appId: string) => {
    const { installedApps, runningApps } = get();
    const app = installedApps.find(a => a.id === appId);
    
    if (!app) {
      set({ error: '应用不存在或未安装' });
      return;
    }
    
    // 检查应用是否已在运行
    const isRunning = runningApps.some(runningApp => runningApp.id === appId);
    
    if (!isRunning) {
      // 添加到运行列表
      const runningApp: RunningApp = {
        id: appId,
        name: app.name,
        icon: app.icon,
        isMinimized: false,
        lastActivity: new Date(),
        state: {}
      };
      
      set((state) => ({
        runningApps: [...state.runningApps, runningApp],
        activeApp: appId
      }));
      
      // 更新应用的最后使用时间
      set((state) => ({
        availableApps: state.availableApps.map(a =>
          a.id === appId ? { ...a, lastUsed: new Date() } : a
        ),
        installedApps: state.installedApps.map(a =>
          a.id === appId ? { ...a, lastUsed: new Date() } : a
        )
      }));
    } else {
      // 如果已在运行，恢复并激活
      get().restoreApp(appId);
    }
  },

  closeApp: (appId: string) => {
    set((state) => ({
      runningApps: state.runningApps.filter(app => app.id !== appId),
      activeApp: state.activeApp === appId ? null : state.activeApp
    }));
  },

  minimizeApp: (appId: string) => {
    set((state) => ({
      runningApps: state.runningApps.map(app =>
        app.id === appId ? { ...app, isMinimized: true } : app
      ),
      activeApp: state.activeApp === appId ? null : state.activeApp
    }));
  },

  restoreApp: (appId: string) => {
    set((state) => ({
      runningApps: state.runningApps.map(app =>
        app.id === appId ? { ...app, isMinimized: false, lastActivity: new Date() } : app
      ),
      activeApp: appId
    }));
  },

  // ======================== 界面状态管理 ========================
  setStoreOpen: (isStoreOpen) => set({ isStoreOpen }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

  setActiveApp: (activeApp) => set({ activeApp }),

  updateAppState: (appId: string, state: any) => {
    set((currentState) => ({
      runningApps: currentState.runningApps.map(app =>
        app.id === appId ? { ...app, state, lastActivity: new Date() } : app
      )
    }));
  },

  // ======================== 开发者功能 ========================
  enableDeveloperMode: (enabled) => {
    set({ developerMode: enabled });
  },

  addApiKey: (appId: string, key: string) => {
    set((state) => ({
      apiKeys: { ...state.apiKeys, [appId]: key }
    }));
  },

  // ======================== 工具函数 ========================
  getFilteredApps: () => {
    const { availableApps, searchQuery, selectedCategory } = get();
    
    let filtered = availableApps;
    
    // 按分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(app => app.category === selectedCategory);
    }
    
    // 按搜索查询筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app =>
        app.name.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query) ||
        app.developer.name.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  },

  // ======================== 内部状态管理 ========================
  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}));

// 导出类型定义
export type { MiniApp, RunningApp, DeveloperAPI };
