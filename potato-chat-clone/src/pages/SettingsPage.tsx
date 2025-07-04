import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Shield, 
  Download, 
  Trash2,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Palette,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Key,
  RefreshCw,
  CheckCircle
} from 'lucide-react';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { useToast } from '../hooks/use-toast';

import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/apiService';

interface SettingsData {
  // 通知设置
  notifications: {
    desktop: boolean;
    sound: boolean;
    vibration: boolean;
    messagePreview: boolean;
    groupMessages: boolean;
    calls: boolean;
  };
  // 外观设置
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
  };
  // 隐私设置
  privacy: {
    onlineStatus: boolean;
    lastSeen: boolean;
    readReceipts: boolean;
    typing: boolean;
    profilePhoto: 'everyone' | 'contacts' | 'nobody';
  };
  // 聊天设置
  chat: {
    autoDownload: 'always' | 'wifi' | 'never';
    saveToGallery: boolean;
    enterToSend: boolean;
    linkPreviews: boolean;
  };
  // 数据设置
  data: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    includeVideos: boolean;
    lowDataMode: boolean;
  };
  // 安全设置
  security: {
    twoFactorAuth: boolean;
    autoLock: boolean;
    autoLockTime: number; // 分钟
    biometrics: boolean;
  };
}

const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const { user, token } = useAuthStore();
  
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      desktop: true,
      sound: true,
      vibration: true,
      messagePreview: true,
      groupMessages: true,
      calls: true
    },
    appearance: {
      theme: 'system',
      language: 'zh-CN',
      fontSize: 'medium',
      compactMode: false
    },
    privacy: {
      onlineStatus: true,
      lastSeen: true,
      readReceipts: true,
      typing: true,
      profilePhoto: 'everyone'
    },
    chat: {
      autoDownload: 'wifi',
      saveToGallery: true,
      enterToSend: true,
      linkPreviews: true
    },
    data: {
      autoBackup: true,
      backupFrequency: 'daily',
      includeVideos: false,
      lowDataMode: false
    },
    security: {
      twoFactorAuth: false,
      autoLock: false,
      autoLockTime: 5,
      biometrics: false
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 加载用户设置
  useEffect(() => {
    const loadSettings = async () => {
      if (!token) return;
      
      setIsLoading(true);
      try {
        const response = await apiService.getSettings();
        if (response.success && response.data) {
          setSettings(prev => ({ ...prev, ...response.data.settings }));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast({
          title: "加载设置失败",
          description: "无法加载您的设置，请稍后重试",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [token, toast]);

  const updateSetting = (category: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    if (!token) return;
    
    setIsSaving(true);
    try {
      const response = await apiService.updateSettings(settings);
      if (response.success) {
        setHasChanges(false);
        toast({
          title: "设置已保存",
          description: "您的设置已成功保存",
        });
      } else {
        throw new Error(response.error || '保存失败');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "保存失败",
        description: error instanceof Error ? error.message : "保存设置失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    setSettings({
      notifications: {
        desktop: true,
        sound: true,
        vibration: true,
        messagePreview: true,
        groupMessages: true,
        calls: true
      },
      appearance: {
        theme: 'system',
        language: 'zh-CN',
        fontSize: 'medium',
        compactMode: false
      },
      privacy: {
        onlineStatus: true,
        lastSeen: true,
        readReceipts: true,
        typing: true,
        profilePhoto: 'everyone'
      },
      chat: {
        autoDownload: 'wifi',
        saveToGallery: true,
        enterToSend: true,
        linkPreviews: true
      },
      data: {
        autoBackup: true,
        backupFrequency: 'daily',
        includeVideos: false,
        lowDataMode: false
      },
      security: {
        twoFactorAuth: false,
        autoLock: false,
        autoLockTime: 5,
        biometrics: false
      }
    });
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载设置中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">设置</h1>
            <p className="text-gray-600">管理您的应用偏好设置</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <div className="flex items-center space-x-2 text-sm text-amber-600">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>有未保存的更改</span>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetSettings}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重置
            </Button>
            
            <Button
              onClick={handleSaveSettings}
              disabled={!hasChanges || isSaving}
              size="sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  保存设置
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="notifications">通知</TabsTrigger>
            <TabsTrigger value="appearance">外观</TabsTrigger>
            <TabsTrigger value="privacy">隐私</TabsTrigger>
            <TabsTrigger value="chat">聊天</TabsTrigger>
            <TabsTrigger value="data">数据</TabsTrigger>
            <TabsTrigger value="security">安全</TabsTrigger>
          </TabsList>

          {/* 通知设置 */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2" size={20} />
                  通知设置
                </CardTitle>
                <CardDescription>
                  管理您希望接收哪些通知
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">桌面通知</Label>
                    <p className="text-sm text-gray-500">在桌面显示新消息通知</p>
                  </div>
                  <Switch
                    checked={settings.notifications.desktop}
                    onCheckedChange={(checked) => updateSetting('notifications', 'desktop', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">通知声音</Label>
                    <p className="text-sm text-gray-500">播放新消息提示音</p>
                  </div>
                  <Switch
                    checked={settings.notifications.sound}
                    onCheckedChange={(checked) => updateSetting('notifications', 'sound', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">震动提醒</Label>
                    <p className="text-sm text-gray-500">收到消息时设备震动</p>
                  </div>
                  <Switch
                    checked={settings.notifications.vibration}
                    onCheckedChange={(checked) => updateSetting('notifications', 'vibration', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">消息预览</Label>
                    <p className="text-sm text-gray-500">在通知中显示消息内容</p>
                  </div>
                  <Switch
                    checked={settings.notifications.messagePreview}
                    onCheckedChange={(checked) => updateSetting('notifications', 'messagePreview', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">群聊消息</Label>
                    <p className="text-sm text-gray-500">接收群聊消息通知</p>
                  </div>
                  <Switch
                    checked={settings.notifications.groupMessages}
                    onCheckedChange={(checked) => updateSetting('notifications', 'groupMessages', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">通话提醒</Label>
                    <p className="text-sm text-gray-500">接收语音和视频通话通知</p>
                  </div>
                  <Switch
                    checked={settings.notifications.calls}
                    onCheckedChange={(checked) => updateSetting('notifications', 'calls', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 外观设置 */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="mr-2" size={20} />
                  外观设置
                </CardTitle>
                <CardDescription>
                  自定义应用的外观和主题
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">主题</Label>
                    <p className="text-sm text-gray-500">选择应用主题</p>
                  </div>
                  <Select
                    value={settings.appearance.theme}
                    onValueChange={(value) => updateSetting('appearance', 'theme', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center space-x-2">
                          <Sun size={14} />
                          <span>浅色</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center space-x-2">
                          <Moon size={14} />
                          <span>深色</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center space-x-2">
                          <Monitor size={14} />
                          <span>跟随系统</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">语言</Label>
                    <p className="text-sm text-gray-500">选择应用语言</p>
                  </div>
                  <Select
                    value={settings.appearance.language}
                    onValueChange={(value) => updateSetting('appearance', 'language', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh-CN">简体中文</SelectItem>
                      <SelectItem value="en-US">English</SelectItem>
                      <SelectItem value="ja-JP">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">字体大小</Label>
                    <p className="text-sm text-gray-500">调整界面文字大小</p>
                  </div>
                  <Select
                    value={settings.appearance.fontSize}
                    onValueChange={(value) => updateSetting('appearance', 'fontSize', value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">小</SelectItem>
                      <SelectItem value="medium">中</SelectItem>
                      <SelectItem value="large">大</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">紧凑模式</Label>
                    <p className="text-sm text-gray-500">减少界面间距，显示更多内容</p>
                  </div>
                  <Switch
                    checked={settings.appearance.compactMode}
                    onCheckedChange={(checked) => updateSetting('appearance', 'compactMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 隐私设置 */}
          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2" size={20} />
                  隐私设置
                </CardTitle>
                <CardDescription>
                  控制您的个人信息可见性
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">在线状态</Label>
                    <p className="text-sm text-gray-500">允许其他人看到您的在线状态</p>
                  </div>
                  <Switch
                    checked={settings.privacy.onlineStatus}
                    onCheckedChange={(checked) => updateSetting('privacy', 'onlineStatus', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">最后在线时间</Label>
                    <p className="text-sm text-gray-500">显示您最后在线的时间</p>
                  </div>
                  <Switch
                    checked={settings.privacy.lastSeen}
                    onCheckedChange={(checked) => updateSetting('privacy', 'lastSeen', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">已读回执</Label>
                    <p className="text-sm text-gray-500">发送和接收已读状态</p>
                  </div>
                  <Switch
                    checked={settings.privacy.readReceipts}
                    onCheckedChange={(checked) => updateSetting('privacy', 'readReceipts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">输入状态</Label>
                    <p className="text-sm text-gray-500">显示正在输入的状态</p>
                  </div>
                  <Switch
                    checked={settings.privacy.typing}
                    onCheckedChange={(checked) => updateSetting('privacy', 'typing', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">头像可见性</Label>
                    <p className="text-sm text-gray-500">谁可以看到您的头像</p>
                  </div>
                  <Select
                    value={settings.privacy.profilePhoto}
                    onValueChange={(value) => updateSetting('privacy', 'profilePhoto', value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">所有人</SelectItem>
                      <SelectItem value="contacts">联系人</SelectItem>
                      <SelectItem value="nobody">仅自己</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 聊天设置 */}
          <TabsContent value="chat" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2" size={20} />
                  聊天设置
                </CardTitle>
                <CardDescription>
                  自定义聊天行为和功能
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">自动下载</Label>
                    <p className="text-sm text-gray-500">自动下载媒体文件</p>
                  </div>
                  <Select
                    value={settings.chat.autoDownload}
                    onValueChange={(value) => updateSetting('chat', 'autoDownload', value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">总是</SelectItem>
                      <SelectItem value="wifi">仅WiFi</SelectItem>
                      <SelectItem value="never">从不</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">保存到相册</Label>
                    <p className="text-sm text-gray-500">自动保存收到的图片和视频</p>
                  </div>
                  <Switch
                    checked={settings.chat.saveToGallery}
                    onCheckedChange={(checked) => updateSetting('chat', 'saveToGallery', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">回车发送</Label>
                    <p className="text-sm text-gray-500">按回车键发送消息</p>
                  </div>
                  <Switch
                    checked={settings.chat.enterToSend}
                    onCheckedChange={(checked) => updateSetting('chat', 'enterToSend', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">链接预览</Label>
                    <p className="text-sm text-gray-500">显示链接的预览内容</p>
                  </div>
                  <Switch
                    checked={settings.chat.linkPreviews}
                    onCheckedChange={(checked) => updateSetting('chat', 'linkPreviews', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 数据设置 */}
          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="mr-2" size={20} />
                  数据和存储
                </CardTitle>
                <CardDescription>
                  管理数据备份和存储选项
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">自动备份</Label>
                    <p className="text-sm text-gray-500">定期备份聊天记录和设置</p>
                  </div>
                  <Switch
                    checked={settings.data.autoBackup}
                    onCheckedChange={(checked) => updateSetting('data', 'autoBackup', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">备份频率</Label>
                    <p className="text-sm text-gray-500">自动备份的频率</p>
                  </div>
                  <Select
                    value={settings.data.backupFrequency}
                    onValueChange={(value) => updateSetting('data', 'backupFrequency', value)}
                    disabled={!settings.data.autoBackup}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">每天</SelectItem>
                      <SelectItem value="weekly">每周</SelectItem>
                      <SelectItem value="monthly">每月</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">包含视频</Label>
                    <p className="text-sm text-gray-500">备份时包含视频文件</p>
                  </div>
                  <Switch
                    checked={settings.data.includeVideos}
                    onCheckedChange={(checked) => updateSetting('data', 'includeVideos', checked)}
                    disabled={!settings.data.autoBackup}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">省流量模式</Label>
                    <p className="text-sm text-gray-500">减少数据使用量</p>
                  </div>
                  <Switch
                    checked={settings.data.lowDataMode}
                    onCheckedChange={(checked) => updateSetting('data', 'lowDataMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 安全设置 */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2" size={20} />
                  安全设置
                </CardTitle>
                <CardDescription>
                  保护您的账户安全
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">双重认证</Label>
                    <p className="text-sm text-gray-500">为账户添加额外的安全保护</p>
                  </div>
                  <Switch
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">自动锁定</Label>
                    <p className="text-sm text-gray-500">空闲时自动锁定应用</p>
                  </div>
                  <Switch
                    checked={settings.security.autoLock}
                    onCheckedChange={(checked) => updateSetting('security', 'autoLock', checked)}
                  />
                </div>
                
                {settings.security.autoLock && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">锁定时间</Label>
                      <span className="text-sm text-gray-500">{settings.security.autoLockTime} 分钟</span>
                    </div>
                    <Slider
                      value={[settings.security.autoLockTime]}
                      onValueChange={(value) => updateSetting('security', 'autoLockTime', value[0])}
                      min={1}
                      max={60}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">生物识别</Label>
                    <p className="text-sm text-gray-500">使用指纹或面部识别解锁</p>
                  </div>
                  <Switch
                    checked={settings.security.biometrics}
                    onCheckedChange={(checked) => updateSetting('security', 'biometrics', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
