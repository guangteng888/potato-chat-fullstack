import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Eye, 
  EyeOff, 
  UserPlus, 
  Loader2, 
  Mail, 
  Shield, 
  MessageCircle,
  Wallet,
  Gamepad2,
  CheckCircle
} from 'lucide-react';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';

import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/apiService';
import { socketService } from '../services/socketService';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser, setToken, setLoading, isAuthenticated, user } = useAuthStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // 检查用户是否已登录，如果已登录则重定向
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/chat', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    if (!agreeTerms) {
      toast({
        title: "请同意服务条款",
        description: "请勾选同意服务条款和隐私政策",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = data;
      const response = await apiService.register(registerData);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Update auth store
        setUser(user);
        setToken(token);
        
        // Connect to socket
        socketService.connect(token);
        
        toast({
          title: "注册成功",
          description: `欢迎加入 Potato Chat，${user.username}！`,
        });
        
        // Navigate to main app
        navigate('/chat');
      } else {
        toast({
          title: "注册失败",
          description: response.error || "注册过程中出现错误",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "注册失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  // 如果用户已登录，不显示注册表单
  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* 左侧：注册表单 */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">创建账户</CardTitle>
            <CardDescription className="text-gray-600">
              加入 Potato Chat 开始安全聊天之旅
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">用户名</Label>
          <Input
            id="username"
            type="text"
            placeholder="选择一个用户名"
            {...register('username', {
              required: '请输入用户名',
              minLength: {
                value: 3,
                message: '用户名至少需要3个字符'
              },
              maxLength: {
                value: 20,
                message: '用户名不能超过20个字符'
              },
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: '用户名只能包含字母、数字和下划线'
              }
            })}
            className={errors.username ? 'border-red-500' : ''}
          />
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">邮箱地址</Label>
          <Input
            id="email"
            type="email"
            placeholder="输入邮箱地址"
            {...register('email', {
              required: '请输入邮箱地址',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: '请输入有效的邮箱地址'
              }
            })}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">密码</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="创建密码"
              {...register('password', {
                required: '请输入密码',
                minLength: {
                  value: 6,
                  message: '密码至少需要6个字符'
                },
                pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/,
                  message: '密码必须包含至少一个字母和一个数字'
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">确认密码</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="再次输入密码"
              {...register('confirmPassword', {
                required: '请确认密码',
                validate: value => value === password || '两次输入的密码不一致'
              })}
              className={`pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            id="agree-terms"
            name="agree-terms"
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
            我同意{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-500">
              服务条款
            </Link>{' '}
            和{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
              隐私政策
            </Link>
          </label>
        </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !agreeTerms}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    注册中...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    创建账户
                  </>
                )}
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                已有账户？{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  立即登录
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 右侧：功能亮点 */}
        <div className="hidden lg:block space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              为什么选择 Potato Chat？
            </h3>
            <p className="text-gray-600 mb-8">
              体验下一代即时通讯平台的强大功能
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-start space-x-4 p-4 rounded-lg bg-white shadow-sm">
              <div className="flex-shrink-0">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  安全聊天
                </h4>
                <p className="text-gray-600">
                  端到端加密保护您的隐私，安全可靠的消息传递
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-lg bg-white shadow-sm">
              <div className="flex-shrink-0">
                <Wallet className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  数字钱包
                </h4>
                <p className="text-gray-600">
                  内置数字钱包，支持多种加密货币的存储和交易
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-lg bg-white shadow-sm">
              <div className="flex-shrink-0">
                <Gamepad2 className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  小程序平台
                </h4>
                <p className="text-gray-600">
                  丰富的小程序生态，游戏、工具、娱乐应有尽有
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-lg bg-white shadow-sm">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  隐私保护
                </h4>
                <p className="text-gray-600">
                  严格的隐私保护政策，您的数据完全由您掌控
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 mr-2" />
              <span className="font-semibold">立即加入</span>
            </div>
            <p className="text-sm opacity-90">
              完全免费注册，立即开始您的 Potato Chat 体验之旅
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;