import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService, type Transaction, type WalletBalance } from '../services/apiService';

interface Contact {
  id: string;
  name: string;
  address: string;
  avatar?: string;
  network: string;
  tags: string[];
}

interface WalletState {
  // ======================== 基础状态 ========================
  isSetup: boolean;
  isLocked: boolean;
  balances: WalletBalance[];
  transactions: Transaction[];
  contacts: Contact[];
  totalBalance: number;
  selectedCurrency: string;
  exchangeRates: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  
  // ======================== 安全设置 ========================
  biometricsEnabled: boolean;
  autoLockTime: number; // 分钟
  
  // ======================== 钱包管理 ========================
  initializeWallet: () => Promise<void>;
  loadBalances: () => Promise<void>;
  loadTransactions: () => Promise<void>;
  sendCrypto: (to: string, amount: number, currency: string, password: string) => Promise<boolean>;
  
  // ======================== 联系人管理 ========================
  addContact: (contact: Omit<Contact, 'id'>) => void;
  removeContact: (contactId: string) => void;
  updateContact: (contactId: string, updates: Partial<Contact>) => void;
  
  // ======================== 设置管理 ========================
  setSelectedCurrency: (currency: string) => void;
  setExchangeRates: (rates: Record<string, number>) => void;
  enableBiometrics: (enabled: boolean) => void;
  setAutoLockTime: (minutes: number) => void;
  
  // ======================== 内部状态管理 ========================
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  calculateTotalBalance: () => void;
  lockWallet: () => void;
  unlockWallet: (password: string) => boolean;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // ======================== 初始状态 ========================
      isSetup: false,
      isLocked: true,
      balances: [],
      transactions: [],
      contacts: [],
      totalBalance: 0,
      selectedCurrency: 'USD',
      exchangeRates: {},
      isLoading: false,
      error: null,
      biometricsEnabled: false,
      autoLockTime: 15,

      // ======================== 钱包管理 ========================
      initializeWallet: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // 并行加载余额和交易记录
          await Promise.all([
            get().loadBalances(),
            get().loadTransactions()
          ]);
          
          set({
            isSetup: true,
            isLocked: false,
            isLoading: false,
            error: null
          });
        } catch (error) {
          console.error('Initialize wallet error:', error);
          set({
            isLoading: false,
            error: '钱包初始化失败'
          });
        }
      },

      loadBalances: async () => {
        try {
          const response = await apiService.getWalletBalance();
          
          if (response.success && response.data) {
            const balances = response.data.balances.map(balance => ({
              ...balance,
              updatedAt: new Date(balance.updatedAt)
            }));
            
            set({ balances });
            get().calculateTotalBalance();
          } else {
            set({ error: response.error || '加载余额失败' });
          }
        } catch (error) {
          console.error('Load balances error:', error);
          set({ error: '网络错误，请稍后重试' });
        }
      },

      loadTransactions: async () => {
        try {
          const response = await apiService.getTransactionHistory();
          
          if (response.success && response.data) {
            const transactions = response.data.transactions.map(transaction => ({
              ...transaction,
              timestamp: new Date(transaction.timestamp),
              updatedAt: transaction.updatedAt ? new Date(transaction.updatedAt) : undefined
            }));
            
            // 按时间倒序排列
            transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            
            set({ transactions });
          } else {
            set({ error: response.error || '加载交易记录失败' });
          }
        } catch (error) {
          console.error('Load transactions error:', error);
          set({ error: '网络错误，请稍后重试' });
        }
      },

      sendCrypto: async (to: string, amount: number, currency: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.sendCrypto({
            to,
            amount,
            currency,
            password
          });
          
          if (response.success && response.data) {
            // 创建临时交易记录（乐观更新）
            const tempTransaction: Transaction = {
              id: response.data.transactionId,
              type: 'send',
              currency,
              amount: -amount, // 发送为负数
              to,
              from: 'current_user', // 临时值，实际会从服务器获取
              status: 'pending',
              timestamp: new Date(),
              fee: 0 // 临时值
            };
            
            // 添加到交易列表
            set((state) => ({
              transactions: [tempTransaction, ...state.transactions],
              isLoading: false,
              error: null
            }));
            
            // 重新加载余额和交易记录以获取最新状态
            setTimeout(() => {
              get().loadBalances();
              get().loadTransactions();
            }, 1000);
            
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error || '发送失败'
            });
            return false;
          }
        } catch (error) {
          console.error('Send crypto error:', error);
          set({
            isLoading: false,
            error: '网络错误，请稍后重试'
          });
          return false;
        }
      },

      // ======================== 联系人管理 ========================
      addContact: (contact) => {
        const newContact: Contact = {
          ...contact,
          id: `contact_${Date.now()}`
        };
        
        set((state) => ({
          contacts: [...state.contacts, newContact]
        }));
      },

      removeContact: (contactId) => {
        set((state) => ({
          contacts: state.contacts.filter(contact => contact.id !== contactId)
        }));
      },

      updateContact: (contactId, updates) => {
        set((state) => ({
          contacts: state.contacts.map(contact =>
            contact.id === contactId ? { ...contact, ...updates } : contact
          )
        }));
      },

      // ======================== 设置管理 ========================
      setSelectedCurrency: (currency) => {
        set({ selectedCurrency: currency });
        get().calculateTotalBalance();
      },

      setExchangeRates: (rates) => {
        set({ exchangeRates: rates });
        get().calculateTotalBalance();
      },

      enableBiometrics: (enabled) => {
        set({ biometricsEnabled: enabled });
      },

      setAutoLockTime: (minutes) => {
        set({ autoLockTime: minutes });
      },

      // ======================== 内部状态管理 ========================
      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      calculateTotalBalance: () => {
        const { balances, exchangeRates, selectedCurrency } = get();
        
        let total = 0;
        
        balances.forEach(balance => {
          if (balance.currency === selectedCurrency) {
            total += balance.amount;
          } else {
            // 通过汇率转换
            const rate = exchangeRates[`${balance.currency}_${selectedCurrency}`];
            if (rate) {
              total += balance.amount * rate;
            }
          }
        });
        
        set({ totalBalance: total });
      },

      lockWallet: () => {
        set({ isLocked: true });
      },

      unlockWallet: (password: string) => {
        // 简单的密码验证逻辑
        // 在实际应用中，这应该与服务器进行验证
        if (password && password.length >= 6) {
          set({ isLocked: false, error: null });
          return true;
        } else {
          set({ error: '密码错误' });
          return false;
        }
      },
    }),
    {
      name: 'potato-chat-wallet',
      partialize: (state) => ({
        isSetup: state.isSetup,
        contacts: state.contacts,
        selectedCurrency: state.selectedCurrency,
        biometricsEnabled: state.biometricsEnabled,
        autoLockTime: state.autoLockTime,
        // 不持久化敏感数据如余额和交易记录
      }),
    }
  )
);

// 导出类型定义
export type { Transaction as WalletTransaction, WalletBalance, Contact as WalletContact };
