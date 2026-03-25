// yFinance Service for Indian Stock Data (NSE/BSE)
// Now uses backend APIs to fetch data from yfinance

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface StockData {
  symbol: string;
  name: string;
  currentPrice?: number;
  previousClose?: number;
  change?: number;
  changePercent?: number;
  dayLow?: number;
  dayHigh?: number;
  peRatio?: number;
  marketCap?: number;
  eps?: number;
  volume?: number;
  sector?: string;
  industry?: string;
  price?: number;
  min?: number;
  max?: number;
  pe?: number;
  mcv?: number;
  opportunity?: string;
}

export interface MutualFundData {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  category: string;
  rating: number;
  aum: number;
}

export interface NewsItem {
  title: string;
  content: string;
  url: string;
  date: string;
  category: string;
  source: string;
}

export const yfinanceService = {
  async getSectorStocks(sector: string): Promise<StockData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/stocks/sector/${sector.toLowerCase()}/`);
      if (!response.ok) throw new Error(`Failed to fetch ${sector} sector data`);
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (err) {
      console.error(`Error fetching ${sector} stocks:`, err);
      return [];
    }
  },

  async getMutualFunds(): Promise<MutualFundData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/mutual-funds/`);
      if (!response.ok) throw new Error('Failed to fetch mutual funds');
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (err) {
      console.error('Error fetching mutual funds:', err);
      return [];
    }
  },

  async getAllStocks(): Promise<StockData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/stocks/`);
      if (!response.ok) throw new Error('Failed to fetch all stocks');
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (err) {
      console.error('Error fetching all stocks:', err);
      return [];
    }
  },

  async addStock(stock: { symbol: string; name: string; sector: string; current_price: number }): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/stocks/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stock),
      });
      const result = await response.json();
      return result.success;
    } catch (err) {
      console.error('Error adding stock:', err);
      return false;
    }
  },

  async removeStock(symbol: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/stocks/${symbol}/`, {
        method: 'DELETE',
      });
      const result = await response.json();
      return result.success;
    } catch (err) {
      console.error('Error removing stock:', err);
      return false;
    }
  },

  async getNews(): Promise<NewsItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/news/`);
      if (!response.ok) throw new Error('Failed to fetch news');
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (err) {
      console.error('Error fetching news:', err);
      return [];
    }
  }
};

const formatIndianCurrency = (value: number): string => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
  return `₹${value.toLocaleString('en-IN')}`;
};

const formatLargeNumber = (num: number): string => {
  if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
  return num.toString();
};

export { formatIndianCurrency, formatLargeNumber };