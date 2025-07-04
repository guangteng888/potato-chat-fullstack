import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, LogIn, Loader2, User, Mail, Shield, Zap } from 'lucide-react';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';

import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/apiService';
import { socketService } from '../services/socketService';

interface LoginFormData {
  identifier: string;
  password: string;
  rememberMe?: boolean;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser, setToken, setLoading, isAuthenticated, user } = useAuthStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 如果已经登录，重定向到聊天页面
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/chat', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoading(true);

    try {
      const response = await apiService.login({
        identifier: data.identifier.trim(),
        password: data.password
      });
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Update auth store
        setUser(user);
        setToken(token);
        
        // 如果选择了记住我，保存到本地存储
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('lastUsername', data.identifier.trim());
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('lastUsername');
        }
        
        // Connect to socket
        socketService.connect(token);
        
        toast({
          title: "登录成功",
          description: `欢迎回来，${user.username}！`,
        });
        
        // Navigate to main app
        navigate('/chat', { replace: true });
      } else {
        toast({
          title: "登录失败",
          description: response.error || "用户名或密码错误",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "登录失败",
        description: "网络连接错误，请检查网络后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  // 快速登录演示账户
  const quickLogin = async (username: string, password: string) => {
    setIsLoading(true);
    setLoading(true);

    try {
      const response = await apiService.login({
        identifier: username,
        password: password
      });
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        setUser(user);
        setToken(token);
        socketService.connect(token);
        
        toast({
          title: "登录成功",
          description: `欢迎使用演示账户 ${user.username}！`,
        });
        
        navigate('/chat', { replace: true });
      } else {
        toast({
          title: "演示账户登录失败",
          description: response.error || "演示账户不可用",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Quick login error:', error);
      toast({
        title: "登录失败",
        description: "网络连接错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  // 加载记住的用户名
  useEffect(() => {
    const remembered = localStorage.getItem('rememberMe');
    const lastUsername = localStorage.getItem('lastUsername');
    
    if (remembered === 'true' && lastUsername) {
      setRememberMe(true);
      // 设置表单默认值
      setValue('identifier', lastUsername);
    }
  }, []);

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">正在重定向到聊天界面...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="text-white" size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">欢迎回来</h2>
        <p className="text-gray-600 mt-2">登录到你的 Potato Chat 账户</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="identifier">用户名或邮箱</Label>
          <Input
            id="identifier"
            type="text"
            placeholder="输入用户名或邮箱"
            {...register('identifier', {
              required: '请输入用户名或邮箱',
              minLength: {
                value: 3,
                message: '用户名至少需要3个字符'
              }
            })}
            className={errors.identifier ? 'border-red-500' : ''}
          />
          {errors.identifier && (
            <p className="text-sm text-red-500">{errors.identifier.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">密码</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="输入密码"
              {...register('password', {
                required: '请输入密码',
                minLength: {
                  value: 6,
                  message: '密码至少需要6个字符'
                }
              })}
              className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              记住我
            </label>
          </div>
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            忘记密码？
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              登录中...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              登录
            </>
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          还没有账户？{' '}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            立即注册
          </Link>
        </p>
      </div>

      {/* Demo accounts */}
      <Card className="mt-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Zap className="mr-2 text-amber-500" size={20} />
            快速体验
          </CardTitle>
          <CardDescription>
            使用演示账户快速体验 Potato Chat 的功能
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => quickLogin('demo1', '123456')}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2"
            >
              <User size={16} />
              <span>Demo 用户 1</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => quickLogin('demo2', '123456')}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2"
            >
              <User size={16} />
              <span>Demo 用户 2</span>
            </Button>
          </div>
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>• 演示账户包含预设的聊天记录和联系人</p>
            <p>• 所有功能都可以正常使用和测试</p>
          </div>
        </CardContent>
      </Card>

      {/* Features highlight */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-blue-50 rounded-lg">
          <Mail className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-900">实时聊天</h4>
          <p className="text-sm text-gray-600 mt-1">支持私聊和群聊</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-900">数字钱包</h4>
          <p className="text-sm text-gray-600 mt-1">安全的加密货币管理</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-900">小程序平台</h4>
          <p className="text-sm text-gray-600 mt-1">丰富的应用生态</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;