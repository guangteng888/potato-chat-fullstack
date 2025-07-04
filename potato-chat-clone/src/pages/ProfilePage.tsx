import React, { useState, useRef } from 'react';
import { 
  User, 
  Camera, 
  Edit3, 
  Shield, 
  Clock, 
  Globe,
  Smartphone,
  Mail,
  Calendar,
  MapPin,
  Save,
  X,
  Loader2,
  Check,
  Upload,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Phone,
  Hash
} from 'lucide-react';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useToast } from '../hooks/use-toast';

import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/apiService';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface EditForm {
  username: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  phone: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const { toast } = useToast();
  const { user, updateUser, token } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [editForm, setEditForm] = useState<EditForm>({
    username: user?.username || '',
    email: user?.email || '',
    bio: '',
    location: '',
    website: '',
    phone: ''
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSave = async () => {
    if (!token || !user) return;
    
    setSaving(true);
    try {
      const response = await apiService.updateUserProfile({
        username: editForm.username,
        email: editForm.email,
        bio: editForm.bio,
        location: editForm.location,
        website: editForm.website,
        phone: editForm.phone
      });
      
      if (response.success && response.data) {
        updateUser(response.data.user);
        setIsEditing(false);
        toast({
          title: "资料已更新",
          description: "您的个人资料已成功更新",
        });
      } else {
        throw new Error(response.error || '更新失败');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "更新失败",
        description: error instanceof Error ? error.message : "更新个人资料失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      username: user?.username || '',
      email: user?.email || '',
      bio: '',
      location: '',
      website: '',
      phone: ''
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    // 检查文件大小 (最大 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "文件太大",
        description: "头像文件大小不能超过 5MB",
        variant: "destructive",
      });
      return;
    }

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast({
        title: "文件格式错误",
        description: "请选择图片文件",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const response = await apiService.uploadAvatar(file);
      if (response.success && response.data) {
        updateUser({ ...user!, avatar: response.data.avatarUrl });
        toast({
          title: "头像已更新",
          description: "您的头像已成功更新",
        });
      } else {
        throw new Error(response.error || '上传失败');
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast({
        title: "上传失败",
        description: error instanceof Error ? error.message : "上传头像失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePasswordChange = async () => {
    if (!token || !passwordForm.currentPassword || !passwordForm.newPassword) {
      toast({
        title: "请填写完整",
        description: "请填写所有密码字段",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "密码不一致",
        description: "新密码和确认密码不一致",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "密码太短",
        description: "新密码至少需要6个字符",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await apiService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      if (response.success) {
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        toast({
          title: "密码已更改",
          description: "您的密码已成功更改",
        });
      } else {
        throw new Error(response.error || '密码更改失败');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      toast({
        title: "更改失败",
        description: error instanceof Error ? error.message : "密码更改失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">请先登录</p>
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
            <h1 className="text-2xl font-bold text-gray-900">个人资料</h1>
            <p className="text-gray-600">管理您的个人信息和设置</p>
          </div>
          <Button
            variant={isEditing ? "outline" : "default"}
            onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
            disabled={isSaving}
          >
            {isEditing ? (
              <>
                <X className="mr-2" size={16} />
                取消
              </>
            ) : (
              <>
                <Edit3 className="mr-2" size={16} />
                编辑资料
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback className="text-2xl">
                      {user.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 w-8 h-8 p-0 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Camera size={14} />
                    )}
                  </Button>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {user.username}
                </h2>
                <p className="text-gray-600 mb-2">{user.email}</p>
                
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className={`w-2 h-2 rounded-full ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-600 capitalize">{user.status}</span>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex items-center justify-center space-x-1">
                    <Calendar size={12} />
                    <span>加入于 {format(new Date(user.createdAt), 'yyyy年MM月', { locale: zhCN })}</span>
                  </div>
                  {user.lastSeen && (
                    <div className="flex items-center justify-center space-x-1">
                      <Clock size={12} />
                      <span>最后活跃 {format(new Date(user.lastSeen), 'MM月dd日 HH:mm', { locale: zhCN })}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList>
                <TabsTrigger value="profile">基本信息</TabsTrigger>
                <TabsTrigger value="security">安全设置</TabsTrigger>
              </TabsList>

              {/* 基本信息 */}
              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>基本信息</CardTitle>
                    <CardDescription>
                      管理您的个人基本信息
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">用户名</Label>
                        <Input
                          id="username"
                          value={isEditing ? editForm.username : user.username}
                          onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                          disabled={!isEditing}
                          placeholder="输入用户名"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">邮箱</Label>
                        <Input
                          id="email"
                          type="email"
                          value={isEditing ? editForm.email : user.email}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!isEditing}
                          placeholder="输入邮箱地址"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">个人简介</Label>
                      <Textarea
                        id="bio"
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="介绍一下自己..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">所在地</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <Input
                            id="location"
                            value={editForm.location}
                            onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                            disabled={!isEditing}
                            placeholder="北京, 中国"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">手机号</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <Input
                            id="phone"
                            value={editForm.phone}
                            onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                            disabled={!isEditing}
                            placeholder="+86 138 0013 8000"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">个人网站</Label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                          id="website"
                          value={editForm.website}
                          onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                          disabled={!isEditing}
                          placeholder="https://example.com"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    {isEditing && (
                      <div className="flex items-center space-x-2 pt-4">
                        <Button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="flex-1"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2" size={16} className="animate-spin" />
                              保存中...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2" size={16} />
                              保存更改
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 安全设置 */}
              <TabsContent value="security" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>更改密码</CardTitle>
                    <CardDescription>
                      定期更改密码以保护账户安全
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">当前密码</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder="输入当前密码"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">新密码</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="输入新密码 (至少6个字符)"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">确认新密码</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="再次输入新密码"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </div>
                    
                    <Button
                      onClick={handlePasswordChange}
                      disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                      className="w-full"
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="mr-2" size={16} className="animate-spin" />
                          更改中...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2" size={16} />
                          更改密码
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>账户信息</CardTitle>
                    <CardDescription>
                      您的账户统计信息
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">
                          {user.id?.slice(-6).toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-500">用户ID</div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">
                          {format(new Date(user.createdAt), 'yyyy-MM-dd')}
                        </div>
                        <div className="text-sm text-gray-500">注册日期</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
