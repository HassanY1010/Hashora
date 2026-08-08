import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  referralCode: string;
}

export interface Wallet {
  availableBalance: number;
  miningBalance: number;
  pendingBalance: number;
}

interface AuthContextType {
  user: User | null;
  wallet: Wallet | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, referralCode?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('cloud_mining_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      if (!token) {
        setIsLoading(false);
        return;
      }
      const profileRes = await apiClient.get('/api/users/profile');
      setUser({
        id: profileRes.data.id,
        fullName: profileRes.data.fullName,
        email: profileRes.data.email,
        role: profileRes.data.role,
        referralCode: profileRes.data.referralCode,
      });

      if (profileRes.data.wallet) {
        setWallet({
          availableBalance: Number(profileRes.data.wallet.availableBalance),
          miningBalance: Number(profileRes.data.wallet.miningBalance),
          pendingBalance: Number(profileRes.data.wallet.pendingBalance),
        });
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    const res = await apiClient.post('/api/auth/login', { email, password, rememberMe });
    const newToken = res.data.token;
    localStorage.setItem('cloud_mining_token', newToken);
    setToken(newToken);
    setUser(res.data.user);
    if (res.data.user.wallet) {
      setWallet({
        availableBalance: Number(res.data.user.wallet.availableBalance),
        miningBalance: Number(res.data.user.wallet.miningBalance),
        pendingBalance: 0,
      });
    }
  };

  const adminLogin = async (email: string, password: string) => {
    const res = await apiClient.post('/api/auth/admin/login', { email, password });
    const newToken = res.data.token;
    localStorage.setItem('cloud_mining_token', newToken);
    setToken(newToken);
    setUser(res.data.user);
  };

  const register = async (fullName: string, email: string, password: string, referralCode?: string) => {
    const res = await apiClient.post('/api/auth/register', { fullName, email, password, referralCode });
    const newToken = res.data.token;
    localStorage.setItem('cloud_mining_token', newToken);
    setToken(newToken);
    setUser(res.data.user);
    if (res.data.user.wallet) {
      setWallet({
        availableBalance: Number(res.data.user.wallet.availableBalance),
        miningBalance: Number(res.data.user.wallet.miningBalance),
        pendingBalance: 0,
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('cloud_mining_token');
    setToken(null);
    setUser(null);
    setWallet(null);
  };

  const refreshUser = async () => {
    await fetchProfile();
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        adminLogin,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
