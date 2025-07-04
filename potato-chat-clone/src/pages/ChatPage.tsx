import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreHorizontal,
  Search,
  Plus,
  Hash,
  Users,
  MessageCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { useToast } from '../hooks/use-toast';

import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { socketService } from '../services/socketService';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const ChatPage: React.FC = () => {
  const { roomId } = useParams();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { 
    rooms, 
    messages, 
    activeRoom, 
    setActiveRoom, 
    isConnected,
    onlineUsers,
    isTyping,
    isLoading,
    error,
    loadRooms,
    sendMessage,
    startTyping,
    stopTyping
  } = useChatStore();
  
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTypingActive, setIsTypingActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const currentRoom = rooms.find(room => room.id === activeRoom);
  const currentMessages = activeRoom ? messages[activeRoom] || [] : [];
  const typingUsers = activeRoom ? isTyping[activeRoom] || [] : [];

  // 初始化：加载聊天室列表
  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // 处理URL参数中的roomId
  useEffect(() => {
    if (roomId && roomId !== activeRoom) {
      setActiveRoom(roomId);
    }
  }, [roomId, activeRoom, setActiveRoom]);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  // 显示错误提示
  useEffect(() => {
    if (error) {
      toast({
        title: "错误",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeRoom || !isConnected) {
      toast({
        title: "发送失败",
        description: "请检查网络连接或输入内容",
        variant: "destructive",
      });
      return;
    }

    const success = sendMessage(activeRoom, messageInput.trim());
    if (success) {
      setMessageInput('');
      inputRef.current?.focus();
      
      // 停止打字状态
      if (isTypingActive) {
        stopTyping(activeRoom);
        setIsTypingActive(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageInput(value);

    // 处理打字状态
    if (activeRoom && value.trim()) {
      if (!isTypingActive) {
        startTyping(activeRoom);
        setIsTypingActive(true);
      }

      // 重置打字超时
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (isTypingActive && activeRoom) {
          stopTyping(activeRoom);
          setIsTypingActive(false);
        }
      }, 2000);
    } else if (isTypingActive && activeRoom) {
      stopTyping(activeRoom);
      setIsTypingActive(false);
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatMessageTime = (timestamp: Date) => {
    return format(timestamp, 'HH:mm', { locale: zhCN });
  };

  const formatLastActivity = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return format(timestamp, 'HH:mm', { locale: zhCN });
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return format(timestamp, 'EEEE', { locale: zhCN });
    } else {
      return format(timestamp, 'MM/dd', { locale: zhCN });
    }
  };

  const handleRoomSelect = (room: any) => {
    setActiveRoom(room.id);
  };

  const renderMessage = (message: any, index: number) => {
    const isOwn = message.senderId === user?.id;
    const senderInfo = onlineUsers.find(u => u.id === message.senderId);
    
    return (
      <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        {!isOwn && (
          <Avatar className="w-8 h-8 mr-2">
            <AvatarImage src={senderInfo?.avatar} />
            <AvatarFallback>{senderInfo?.username?.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwn 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          <div className="text-sm">{message.content}</div>
          <div className={`text-xs mt-1 ${
            isOwn ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {formatMessageTime(message.timestamp)}
            {message.edited && <span className="ml-1">(已编辑)</span>}
          </div>
        </div>
      </div>
    );
  };

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;
    
    const typingUserNames = typingUsers
      .map(userId => onlineUsers.find(u => u.id === userId)?.username)
      .filter(Boolean);
    
    if (typingUserNames.length === 0) return null;
    
    return (
      <div className="flex items-center space-x-2 text-gray-500 text-sm mb-2">
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span>
          {typingUserNames.length === 1 
            ? `${typingUserNames[0]} 正在输入...`
            : `${typingUserNames.slice(0, 2).join(', ')} ${typingUserNames.length > 2 ? '等人' : ''} 正在输入...`
          }
        </span>
      </div>
    );
  };

  return (
    <div className="h-full flex">
      {/* Chat List Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">聊天</h2>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Plus size={16} />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="搜索聊天..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Rooms List */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">加载中...</span>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
              <MessageCircle size={48} className="mb-2" />
              <p>暂无聊天</p>
            </div>
          ) : (
            filteredRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => handleRoomSelect(room)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  activeRoom === room.id ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={room.avatar} />
                      <AvatarFallback>
                        {room.type === 'group' ? <Users size={20} /> : room.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {room.type === 'group' && (
                      <Badge className="absolute -bottom-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {room.members.length}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">{room.name}</h3>
                      {room.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatLastActivity(new Date(room.lastMessage.timestamp))}
                        </span>
                      )}
                    </div>
                    
                    {room.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">
                        {room.lastMessage.content}
                      </p>
                    )}
                    
                    {room.unreadCount > 0 && (
                      <Badge className="mt-1">
                        {room.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeRoom && currentRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={currentRoom.avatar} />
                  <AvatarFallback>
                    {currentRoom.type === 'group' ? <Users size={20} /> : currentRoom.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-gray-900">{currentRoom.name}</h3>
                  <p className="text-sm text-gray-500">
                    {currentRoom.type === 'group' 
                      ? `${currentRoom.members.length} 成员` 
                      : isConnected ? '在线' : '离线'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="ghost">
                  <Phone size={16} />
                </Button>
                <Button size="sm" variant="ghost">
                  <Video size={16} />
                </Button>
                <Button size="sm" variant="ghost">
                  <MoreHorizontal size={16} />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              {currentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageCircle size={48} className="mb-2" />
                  <p>还没有消息，开始聊天吧！</p>
                </div>
              ) : (
                <>
                  {currentMessages.map((message, index) => renderMessage(message, index))}
                  {renderTypingIndicator()}
                  <div ref={messagesEndRef} />
                </>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              {!isConnected && (
                <div className="flex items-center space-x-2 text-amber-600 text-sm mb-2">
                  <AlertCircle size={16} />
                  <span>连接已断开，正在重连...</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Paperclip size={16} />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder={isConnected ? "输入消息..." : "连接断开..."}
                    disabled={!isConnected}
                    className="pr-10"
                  />
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <Smile size={14} />
                  </Button>
                </div>
                
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || !isConnected}
                  size="sm"
                  className="h-8"
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <MessageCircle size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">选择一个聊天开始对话</h3>
              <p>从左侧选择一个聊天室或创建新的聊天</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
