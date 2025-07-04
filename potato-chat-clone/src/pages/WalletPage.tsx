import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Send, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  TrendingDown,
  Eye,
  EyeOff,
  Plus,
  Repeat,
  MoreHorizontal,
  QrCode,
  Copy,
  Shield,
  Users,
  Loader2,
  AlertCircle,
  DollarSign,
  RefreshCw
} from 'lucide-react';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';

import { useWalletStore } from '../store/walletStore';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const WalletPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const {
    isInitialized,
    isLoading,
    error,
    cryptocurrencies,
    transactions,
    totalBalance,
    selectedCurrency,
    contacts,
    initializeWallet,
    loadBalance,
    loadTransactionHistory,
    sendCrypto,
    refreshData,
    addContact,
    getContacts
  } = useWalletStore();

  const [showBalance, setShowBalance] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  
  // 发送对话框状态
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendForm, setSendForm] = useState({
    to: '',
    amount: '',
    currency: 'BTC',
    password: ''
  });
  const [isSending, setIsSending] = useState(false);

  // 接收对话框状态
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);

  // 添加联系人对话框状态
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    address: '',
    network: 'bitcoin'
  });

  // 初始化钱包
  useEffect(() => {
    if (!isInitialized) {
      initializeWallet();
    }
  }, [isInitialized, initializeWallet]);

  // 定期刷新数据
  useEffect(() => {
    if (isInitialized) {
      loadBalance();
      loadTransactionHistory();
      getContacts();
      
      // 每30秒刷新一次数据
      const interval = setInterval(() => {
        refreshData();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isInitialized, loadBalance, loadTransactionHistory, getContacts, refreshData]);

  // 显示错误提示
  useEffect(() => {
    if (error) {
      toast({
        title: "钱包错误",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatCrypto = (amount: number, symbol: string) => {
    return `${amount.toFixed(6)} ${symbol}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="text-red-500" size={16} />;
      case 'receive':
        return <ArrowDownLeft className="text-green-500" size={16} />;
      case 'swap':
        return <Repeat className="text-blue-500" size={16} />;
      case 'buy':
        return <Plus className="text-green-500" size={16} />;
      case 'sell':
        return <ArrowUpRight className="text-red-500" size={16} />;
      default:
        return <MoreHorizontal className="text-gray-500" size={16} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default" className="bg-green-500">已确认</Badge>;
      case 'pending':
        return <Badge variant="secondary">等待中</Badge>;
      case 'failed':
        return <Badge variant="destructive">失败</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  const handleSendCrypto = async () => {
    if (!sendForm.to || !sendForm.amount || !sendForm.currency || !sendForm.password) {
      toast({
        title: "发送失败",
        description: "请填写所有必填字段",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      await sendCrypto(
        sendForm.to,
        parseFloat(sendForm.amount),
        sendForm.currency,
        sendForm.password
      );
      
      toast({
        title: "发送成功",
        description: `成功发送 ${sendForm.amount} ${sendForm.currency}`,
      });
      
      setSendDialogOpen(false);
      setSendForm({ to: '', amount: '', currency: 'BTC', password: '' });
    } catch (err) {
      toast({
        title: "发送失败",
        description: err instanceof Error ? err.message : "发送失败",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleAddContact = async () => {
    if (!contactForm.name || !contactForm.address || !contactForm.network) {
      toast({
        title: "添加失败",
        description: "请填写所有必填字段",
        variant: "destructive",
      });
      return;
    }

    try {
      await addContact({
        id: Date.now().toString(),
        name: contactForm.name,
        address: contactForm.address,
        network: contactForm.network,
        tags: []
      });
      
      toast({
        title: "添加成功",
        description: `成功添加联系人 ${contactForm.name}`,
      });
      
      setContactDialogOpen(false);
      setContactForm({ name: '', address: '', network: 'bitcoin' });
    } catch (err) {
      toast({
        title: "添加失败",
        description: err instanceof Error ? err.message : "添加联系人失败",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "已复制",
      description: "地址已复制到剪贴板",
    });
  };

  // 如果未初始化，显示加载状态
  if (!isInitialized || isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">正在初始化钱包...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">数字钱包</h1>
            <p className="text-gray-600">管理您的加密货币资产</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refreshData()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
            
            <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Send className="w-4 h-4 mr-2" />
                  发送
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>发送加密货币</DialogTitle>
                  <DialogDescription>
                    输入接收方地址和金额
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="recipient">接收方地址</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="recipient"
                        placeholder="输入钱包地址或选择联系人"
                        value={sendForm.to}
                        onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })}
                      />
                      <Select onValueChange={(value) => setSendForm({ ...sendForm, to: value })}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="联系人" />
                        </SelectTrigger>
                        <SelectContent>
                          {contacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.address}>
                              {contact.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">金额</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={sendForm.amount}
                        onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="currency">货币</Label>
                      <Select 
                        value={sendForm.currency} 
                        onValueChange={(value) => setSendForm({ ...sendForm, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {cryptocurrencies.map((crypto) => (
                            <SelectItem key={crypto.id} value={crypto.symbol}>
                              {crypto.symbol} - {crypto.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="password">密码确认</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="输入钱包密码"
                      value={sendForm.password}
                      onChange={(e) => setSendForm({ ...sendForm, password: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleSendCrypto} disabled={isSending}>
                      {isSending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      发送
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Total Balance Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-medium text-gray-700">总资产</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className="h-6 w-6 p-0"
                  >
                    {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
                  </Button>
                </div>
                
                <div className="text-3xl font-bold text-gray-900">
                  {showBalance ? formatCurrency(totalBalance) : '****'}
                </div>
                
                <div className="flex items-center space-x-2 mt-2">
                  <TrendingUp className="text-green-500" size={16} />
                  <span className="text-sm text-green-600">+2.5% 今日</span>
                </div>
              </div>
              
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Wallet className="text-white" size={32} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="assets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assets">资产</TabsTrigger>
            <TabsTrigger value="transactions">交易</TabsTrigger>
            <TabsTrigger value="send">发送</TabsTrigger>
            <TabsTrigger value="receive">接收</TabsTrigger>
          </TabsList>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-4">
            <div className="grid gap-4">
              {cryptocurrencies.map((crypto) => (
                <Card key={crypto.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold">{crypto.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{crypto.name}</h4>
                          <p className="text-sm text-gray-500">{crypto.symbol}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {showBalance ? formatCrypto(crypto.balance, crypto.symbol) : '****'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {showBalance ? formatCurrency(crypto.usdValue) : '****'}
                        </div>
                        <div className={`text-xs flex items-center ${
                          crypto.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {crypto.change24h >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>交易历史</CardTitle>
                <CardDescription>查看您的所有交易记录</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign size={48} className="mx-auto mb-2" />
                      <p>暂无交易记录</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {transaction.type === 'send' ? '发送' : '接收'} {transaction.cryptocurrency}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {format(new Date(transaction.timestamp), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className={`font-medium ${
                              transaction.type === 'send' ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {transaction.type === 'send' ? '-' : '+'}{transaction.amount} {transaction.cryptocurrency}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatCurrency(transaction.usdValue)}
                            </div>
                            {getStatusBadge(transaction.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Send Tab */}
          <TabsContent value="send" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>发送加密货币</CardTitle>
                <CardDescription>向其他钱包发送您的数字资产</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="sendTo">接收方地址</Label>
                      <Input
                        id="sendTo"
                        placeholder="输入钱包地址"
                        value={sendForm.to}
                        onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sendAmount">金额</Label>
                        <Input
                          id="sendAmount"
                          type="number"
                          placeholder="0.00"
                          value={sendForm.amount}
                          onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="sendCurrency">货币</Label>
                        <Select 
                          value={sendForm.currency} 
                          onValueChange={(value) => setSendForm({ ...sendForm, currency: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {cryptocurrencies.map((crypto) => (
                              <SelectItem key={crypto.id} value={crypto.symbol}>
                                {crypto.symbol}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <Button onClick={handleSendCrypto} disabled={isSending} className="w-full">
                      {isSending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      发送
                    </Button>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">常用联系人</h4>
                      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            添加
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>添加联系人</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="contactName">联系人姓名</Label>
                              <Input
                                id="contactName"
                                placeholder="输入姓名"
                                value={contactForm.name}
                                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="contactAddress">钱包地址</Label>
                              <Input
                                id="contactAddress"
                                placeholder="输入钱包地址"
                                value={contactForm.address}
                                onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="contactNetwork">网络</Label>
                              <Select 
                                value={contactForm.network}
                                onValueChange={(value) => setContactForm({ ...contactForm, network: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="bitcoin">Bitcoin</SelectItem>
                                  <SelectItem value="ethereum">Ethereum</SelectItem>
                                  <SelectItem value="usdt">USDT</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
                                取消
                              </Button>
                              <Button onClick={handleAddContact}>
                                添加
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <ScrollArea className="h-48">
                      {contacts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Users size={32} className="mx-auto mb-2" />
                          <p className="text-sm">暂无联系人</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {contacts.map((contact) => (
                            <div
                              key={contact.id}
                              className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                              onClick={() => setSendForm({ ...sendForm, to: contact.address })}
                            >
                              <div>
                                <h5 className="font-medium text-sm">{contact.name}</h5>
                                <p className="text-xs text-gray-500 truncate w-32">
                                  {contact.address}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {contact.network}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Receive Tab */}
          <TabsContent value="receive" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>接收加密货币</CardTitle>
                <CardDescription>分享您的钱包地址以接收数字资产</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                    <QrCode size={64} className="text-gray-400" />
                  </div>
                  
                  <div>
                    <Label htmlFor="receiveAddress">您的钱包地址</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        id="receiveAddress"
                        value={user?.id ? `potato-wallet-${user.id}` : ''}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(user?.id ? `potato-wallet-${user.id}` : '')}
                      >
                        <Copy size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 max-w-md mx-auto">
                    <div className="flex items-center space-x-1 mb-2">
                      <Shield size={12} />
                      <span>安全提示</span>
                    </div>
                    <p>请确保发送方使用正确的网络发送资产。不同网络的资产不能互通，发送错误可能导致资产丢失。</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WalletPage;
