import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  Wallet, 
  Grid3X3, 
  Settings, 
  User, 
  LogOut,
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';

import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';

import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { socketService } from '../../services/socketService';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { user, logout } = useAuthStore();
  const { isConnected, rooms } = useChatStore();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const totalUnreadCount = rooms.reduce((sum, room) => sum + room.unreadCount, 0);

  const handleLogout = async () => {
    try {
      socketService.disconnect();
      logout();
      toast({
        title: "已退出登录",
        description: "期待您的再次使用！",
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigationItems = [
    {
      name: '聊天',
      icon: MessageCircle,
      path: '/chat',
      badge: totalUnreadCount > 0 ? totalUnreadCount : null
    },
    {
      name: '钱包',
      icon: Wallet,
      path: '/wallet',
      badge: null
    },
    {
      name: '小程序',
      icon: Grid3X3,
      path: '/miniapps',
      badge: null
    },
    {
      name: '个人资料',
      icon: User,
      path: '/profile',
      badge: null
    },
    {
      name: '设置',
      icon: Settings,
      path: '/settings',
      badge: null
    }
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200`}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              🥔
            </div>
            <h1 className="font-bold text-lg text-gray-800">Potato Chat</h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatar} alt={user?.username} />
              <AvatarFallback>
                {user?.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.username}
              </p>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <p className="text-xs text-gray-500">
                  {isConnected ? '在线' : '离线'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActivePath(item.path)
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon size={18} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <Badge variant="default" className="bg-red-500 text-white">
                  {item.badge > 99 ? '99+' : item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={18} className="mr-3" />
            退出登录
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md flex items-center justify-center text-white text-xs font-bold">
              🥔
            </div>
            <h1 className="font-semibold text-gray-800">Potato Chat</h1>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-md hover:bg-gray-100 relative">
              <Bell size={20} />
              {totalUnreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center">
                  {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                </Badge>
              )}
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;