import React, { useState, useEffect } from 'react';
import { 
  Grid3X3, 
  Search, 
  Star, 
  Download, 
  Play, 
  Pause, 
  X, 
  Minimize2,
  Maximize2,
  MoreHorizontal,
  Filter,
  Zap,
  Gamepad2,
  DollarSign,
  Users,
  Briefcase,
  Music,
  Loader2,
  AlertCircle,
  ExternalLink,
  Settings,
  Trash2,
  RefreshCw
} from 'lucide-react';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';

import { useMiniAppsStore } from '../store/miniAppsStore';
import { useAuthStore } from '../store/authStore';

const MiniAppsPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const {
    availableApps,
    installedApps,
    runningApps,
    activeApp,
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    loadAvailableApps,
    loadInstalledApps,
    setSearchQuery,
    setSelectedCategory,
    installApp,
    uninstallApp,
    launchApp,
    closeApp,
    minimizeApp,
    restoreApp,
    getFilteredApps
  } = useMiniAppsStore();

  const [view, setView] = useState<'installed' | 'store'>('installed');
  const [appDetailDialog, setAppDetailDialog] = useState<string | null>(null);
  const [isInstalling, setIsInstalling] = useState<string | null>(null);

  const filteredApps = getFilteredApps();

  // 初始化：加载小程序数据
  useEffect(() => {
    loadAvailableApps();
    loadInstalledApps();
  }, [loadAvailableApps, loadInstalledApps]);

  // 显示错误提示
  useEffect(() => {
    if (error) {
      toast({
        title: "小程序错误",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const categories = [
    { id: 'all', name: '全部', icon: Grid3X3 },
    { id: 'productivity', name: '效率', icon: Briefcase },
    { id: 'games', name: '游戏', icon: Gamepad2 },
    { id: 'finance', name: '金融', icon: DollarSign },
    { id: 'social', name: '社交', icon: Users },
    { id: 'utilities', name: '工具', icon: Zap },
    { id: 'entertainment', name: '娱乐', icon: Music },
  ];

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : Grid3X3;
  };

  const formatFileSize = (sizeInKB: number) => {
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`;
    } else {
      return `${(sizeInKB / 1024).toFixed(1)} MB`;
    }
  };

  const formatDownloads = (downloads: number) => {
    if (downloads < 1000) {
      return downloads.toString();
    } else if (downloads < 1000000) {
      return `${(downloads / 1000).toFixed(1)}K`;
    } else {
      return `${(downloads / 1000000).toFixed(1)}M`;
    }
  };

  const handleInstallApp = async (appId: string) => {
    setIsInstalling(appId);
    try {
      await installApp(appId);
      toast({
        title: "安装成功",
        description: "小程序已成功安装",
      });
    } catch (err) {
      toast({
        title: "安装失败",
        description: err instanceof Error ? err.message : "安装失败",
        variant: "destructive",
      });
    } finally {
      setIsInstalling(null);
    }
  };

  const handleUninstallApp = async (appId: string) => {
    try {
      await uninstallApp(appId);
      toast({
        title: "卸载成功",
        description: "小程序已成功卸载",
      });
    } catch (err) {
      toast({
        title: "卸载失败",
        description: err instanceof Error ? err.message : "卸载失败",
        variant: "destructive",
      });
    }
  };

  const handleLaunchApp = async (appId: string) => {
    try {
      await launchApp(appId);
      toast({
        title: "启动成功",
        description: "小程序正在启动",
      });
    } catch (err) {
      toast({
        title: "启动失败",
        description: err instanceof Error ? err.message : "启动失败",
        variant: "destructive",
      });
    }
  };

  const handleCloseApp = async (appId: string) => {
    try {
      await closeApp(appId);
    } catch (err) {
      toast({
        title: "关闭失败",
        description: err instanceof Error ? err.message : "关闭失败",
        variant: "destructive",
      });
    }
  };

  const renderAppCard = (app: any, isInstalled = false) => {
    const CategoryIcon = getCategoryIcon(app.category);
    const isCurrentlyInstalling = isInstalling === app.id;
    const isRunning = runningApps.some(ra => ra.id === app.id);
    
    return (
      <Card key={app.id} className="cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                {app.icon}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 truncate">{app.name}</h4>
                <p className="text-sm text-gray-500 flex items-center">
                  {app.developer.name}
                  {app.developer.verified && (
                    <Star className="w-3 h-3 ml-1 text-blue-500" />
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <CategoryIcon size={16} className="text-gray-400" />
              <Badge variant="outline" className="text-xs">
                {categories.find(c => c.id === app.category)?.name}
              </Badge>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{app.description}</p>
          
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Star size={12} className="text-yellow-500" />
                <span>{app.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Download size={12} />
                <span>{formatDownloads(app.downloads)}</span>
              </div>
              <span>{formatFileSize(app.size)}</span>
            </div>
            <span>v{app.version}</span>
          </div>
          
          <div className="flex items-center justify-between">
            {isInstalled ? (
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant={isRunning ? "destructive" : "default"}
                  onClick={() => isRunning ? handleCloseApp(app.id) : handleLaunchApp(app.id)}
                  className="flex-1"
                >
                  {isRunning ? (
                    <>
                      <Pause size={14} className="mr-1" />
                      关闭
                    </>
                  ) : (
                    <>
                      <Play size={14} className="mr-1" />
                      启动
                    </>
                  )}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUninstallApp(app.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => handleInstallApp(app.id)}
                disabled={isCurrentlyInstalling}
                className="w-full"
              >
                {isCurrentlyInstalling ? (
                  <>
                    <Loader2 size={14} className="mr-1 animate-spin" />
                    安装中...
                  </>
                ) : (
                  <>
                    <Download size={14} className="mr-1" />
                    安装
                  </>
                )}
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAppDetailDialog(app.id)}
              className="ml-2"
            >
              <MoreHorizontal size={14} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRunningAppWindow = (runningApp: any) => {
    const app = availableApps.find(a => a.id === runningApp.id) || installedApps.find(a => a.id === runningApp.id);
    if (!app) return null;
    
    return (
      <div
        key={runningApp.id}
        className={`fixed bg-white border border-gray-300 rounded-lg shadow-lg transition-all duration-200 ${
          runningApp.isMinimized ? 'w-64 h-16' : 'w-96 h-80'
        }`}
        style={{
          top: runningApp.isMinimized ? 'auto' : '10%',
          left: runningApp.isMinimized ? '10px' : '20%',
          bottom: runningApp.isMinimized ? '10px' : 'auto',
          zIndex: activeApp === runningApp.id ? 1000 : 999
        }}
      >
        {/* Window Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{app.icon}</span>
            <span className="font-medium text-sm">{app.name}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => runningApp.isMinimized ? restoreApp(runningApp.id) : minimizeApp(runningApp.id)}
              className="h-6 w-6 p-0"
            >
              {runningApp.isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCloseApp(runningApp.id)}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            >
              <X size={12} />
            </Button>
          </div>
        </div>
        
        {/* Window Content */}
        {!runningApp.isMinimized && (
          <div className="p-4 h-full overflow-hidden">
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <span className="text-4xl mb-2 block">{app.icon}</span>
                <p className="text-sm">小程序正在运行</p>
                <p className="text-xs text-gray-400 mt-1">这是 {app.name} 的模拟界面</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-gray-50 flex relative">
      {/* Running Apps Windows */}
      {runningApps.map(runningApp => renderRunningAppWindow(runningApp))}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">小程序</h1>
              <p className="text-gray-600">发现和管理您的小程序</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  loadAvailableApps();
                  loadInstalledApps();
                }}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
            </div>
          </div>
          
          {/* Navigation */}
          <Tabs value={view} onValueChange={(value) => setView(value as 'installed' | 'store')}>
            <TabsList>
              <TabsTrigger value="installed">已安装</TabsTrigger>
              <TabsTrigger value="store">小程序商店</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Search and Filter */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="搜索小程序..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => {
                  const Icon = category.icon;
                  return (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <Icon size={14} />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">加载中...</p>
                </div>
              </div>
            ) : (
              <>
                {view === 'installed' ? (
                  <div>
                    {installedApps.length === 0 ? (
                      <div className="text-center py-12">
                        <Grid3X3 size={64} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无已安装的小程序</h3>
                        <p className="text-gray-600 mb-4">去小程序商店发现更多应用</p>
                        <Button onClick={() => setView('store')}>
                          浏览商店
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {installedApps.map(app => renderAppCard(app, true))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {filteredApps.length === 0 ? (
                      <div className="text-center py-12">
                        <Search size={64} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关小程序</h3>
                        <p className="text-gray-600">尝试调整搜索条件或类别筛选</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredApps.map(app => renderAppCard(app, false))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Running Apps Taskbar */}
        {runningApps.length > 0 && (
          <div className="bg-white border-t border-gray-200 p-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 mr-2">运行中:</span>
              {runningApps.map((runningApp) => {
                const app = availableApps.find(a => a.id === runningApp.id) || installedApps.find(a => a.id === runningApp.id);
                if (!app) return null;
                
                return (
                  <Button
                    key={runningApp.id}
                    variant={activeApp === runningApp.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => runningApp.isMinimized ? restoreApp(runningApp.id) : minimizeApp(runningApp.id)}
                    className="flex items-center space-x-1"
                  >
                    <span>{app.icon}</span>
                    <span className="text-xs">{app.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* App Detail Dialog */}
      {appDetailDialog && (
        <Dialog open={!!appDetailDialog} onOpenChange={() => setAppDetailDialog(null)}>
          <DialogContent className="max-w-2xl">
            {(() => {
              const app = availableApps.find(a => a.id === appDetailDialog) || installedApps.find(a => a.id === appDetailDialog);
              if (!app) return null;
              
              return (
                <>
                  <DialogHeader>
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{app.icon}</span>
                      <div>
                        <DialogTitle>{app.name}</DialogTitle>
                        <DialogDescription>
                          {app.developer.name} • v{app.version}
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">应用描述</h4>
                      <p className="text-sm text-gray-600">{app.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold">{app.rating.toFixed(1)}</div>
                        <div className="text-xs text-gray-500">评分</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{formatDownloads(app.downloads)}</div>
                        <div className="text-xs text-gray-500">下载量</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{formatFileSize(app.size)}</div>
                        <div className="text-xs text-gray-500">大小</div>
                      </div>
                    </div>
                    
                    {app.permissions && app.permissions.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">权限</h4>
                        <div className="space-y-1">
                          {app.permissions.map((permission, index) => (
                            <div key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              <span>{permission}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MiniAppsPage;
