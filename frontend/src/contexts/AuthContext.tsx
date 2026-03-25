import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, AuthResponse, RegisterData, LoginData } from '../services/authService';

export interface PortfolioItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  addedAt: string;
  sector?: string;  // Sector from which the stock was added
}

interface AuthContextType {
  user: any | null;
  loading: boolean;
  portfolio: PortfolioItem[];
  portfolioBySector: { [key: string]: PortfolioItem[] };
  register: (data: RegisterData) => Promise<any>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  addToPortfolio: (item: PortfolioItem) => void;
  removeFromPortfolio: (symbol: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

  // Computed portfolio by sector
  const portfolioBySector = portfolio.reduce((acc, item) => {
    const sector = item.sector || 'uncategorized';
    if (!acc[sector]) {
      acc[sector] = [];
    }
    acc[sector].push(item);
    return acc;
  }, {} as { [key: string]: PortfolioItem[] });

  // attempt to load user from token on mount
  useEffect(() => {
    const init = async () => {
      try {
        const res = await authService.getCurrentUser();
        if (res && res.user) setUser(res.user);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Load portfolio from localStorage
  useEffect(() => {
    const savedPortfolio = localStorage.getItem('portfolio');
    if (savedPortfolio) {
      try {
        setPortfolio(JSON.parse(savedPortfolio));
      } catch (e) {
        console.error('Failed to load portfolio:', e);
      }
    }
  }, []);

  // Save portfolio to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  const register = async (data: RegisterData) => {
    return await authService.register(data);
  };

  const login = async (data: LoginData) => {
    const res: AuthResponse = await authService.login(data);
    setUser(res.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setPortfolio([]);
    localStorage.removeItem('portfolio');
  };

  const addToPortfolio = (item: PortfolioItem) => {
    // Check if item already exists
    if (!portfolio.find(p => p.symbol === item.symbol)) {
      setPortfolio([...portfolio, { ...item, addedAt: new Date().toISOString() }]);
    }
  };

  const removeFromPortfolio = (symbol: string) => {
    setPortfolio(portfolio.filter(item => item.symbol !== symbol));
  };

  return (
    <AuthContext.Provider value={{ user, loading, portfolio, portfolioBySector, register, login, logout, addToPortfolio, removeFromPortfolio }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
