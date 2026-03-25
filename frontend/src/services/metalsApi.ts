// Metals API Service using Backend API (yfinance)
// Backend handles fetching from yfinance

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface MetalPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

export interface MetalsData {
  gold: MetalPrice;
  silver: MetalPrice;
  timestamp: number;
}

export interface HistoricalDataPoint {
  date: string;
  price: number;
  volume?: number;
  ma20?: number; // 20-day Moving Average
  rsi?: number; // Relative Strength Index
}

export interface CorrelationData {
  goldPrices: number[];
  silverPrices: number[];
  dates: string[];
  correlation: number;
  rSquared: number;
  regressionSlope: number;
  regressionIntercept: number;
}

export interface ChartData {
  goldHistory: HistoricalDataPoint[];
  silverHistory: HistoricalDataPoint[];
  correlation: CorrelationData;
  lastUpdated: string;
}

// Fallback mock data in case API fails or for development
export const mockMetalsData: MetalsData = {
  gold: {
    symbol: 'XAU/USD',
    price: 2150.75,
    change: 52.25,
    changePercent: 2.49,
    lastUpdated: new Date().toISOString()
  },
  silver: {
    symbol: 'XAG/USD',
    price: 25.80,
    change: 0.31,
    changePercent: 1.22,
    lastUpdated: new Date().toISOString()
  },
  timestamp: Date.now()
};

export const fetchLiveMetalsPrices = async (): Promise<MetalsData> => {
  try {
    // Call backend API to fetch live prices from yfinance
    const response = await fetch(`${API_BASE_URL}/auth/metals/prices/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch metals data from backend');
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('Invalid response format');
    }
    
    const { gold, silver } = result.data;

    return {
      gold: {
        symbol: gold.symbol,
        price: gold.price,
        change: gold.change,
        changePercent: gold.changePercent,
        lastUpdated: gold.lastUpdated
      },
      silver: {
        symbol: silver.symbol,
        price: silver.price,
        change: silver.change,
        changePercent: silver.changePercent,
        lastUpdated: silver.lastUpdated
      },
      timestamp: Date.now()
    };

  } catch (error) {
    console.error('Error fetching metals prices from backend:', error);
    
    // Return mock data with slight random variations for demo
    const mockData = { ...mockMetalsData };
    mockData.gold.price += (Math.random() - 0.5) * 10;
    mockData.gold.change = mockData.gold.price - 2150.75;
    mockData.silver.price += (Math.random() - 0.5) * 0.5;
    mockData.silver.change = mockData.silver.price - 25.80;
    mockData.timestamp = Date.now();
    
    return mockData;
  }
};

// Calculate indicators for better analysis
export const calculateIndicators = (data: HistoricalDataPoint[]): HistoricalDataPoint[] => {
  // Create deep copies of the objects to avoid "Object is not extensible" errors
  // This happens when the input objects are frozen (e.g., from static data)
  const result = data.map(point => ({ ...point }));
  
  // 1. Calculate 20-day Simple Moving Average (SMA)
  for (let i = 0; i < result.length; i++) {
    if (i >= 19) {
      const sum = result.slice(i - 19, i + 1).reduce((acc, point) => acc + point.price, 0);
      result[i].ma20 = sum / 20;
    }
  }
  
  // 2. Calculate 14-day RSI (Relative Strength Index)
  const rsiPeriod = 14;
  if (result.length > rsiPeriod) {
    let gains = 0;
    let losses = 0;
    
    // Initial avg gain/loss
    for (let i = 1; i <= rsiPeriod; i++) {
      const diff = result[i].price - result[i - 1].price;
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    
    let avgGain = gains / rsiPeriod;
    let avgLoss = losses / rsiPeriod;
    
    for (let i = rsiPeriod + 1; i < result.length; i++) {
      const diff = result[i].price - result[i - 1].price;
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? -diff : 0;
      
      avgGain = (avgGain * (rsiPeriod - 1) + gain) / rsiPeriod;
      avgLoss = (avgLoss * (rsiPeriod - 1) + loss) / rsiPeriod;
      
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      result[i].rsi = 100 - (100 / (1 + rs));
    }
  }
  
  return result;
};

// Calculate linear regression and correlation
export const calculateCorrelation = (goldPrices: number[], silverPrices: number[]): CorrelationData => {
  const n = goldPrices.length;
  
  // Handle cases where we don't have enough data
  if (n < 2) {
    return {
      goldPrices,
      silverPrices,
      dates: [],
      correlation: 0,
      rSquared: 0,
      regressionSlope: 0,
      regressionIntercept: 0
    };
  }
  
  // Calculate means
  const goldMean = goldPrices.reduce((sum, price) => sum + price, 0) / n;
  const silverMean = silverPrices.reduce((sum, price) => sum + price, 0) / n;
  
  // Calculate covariance and variances
  let covariance = 0;
  let goldVariance = 0;
  let silverVariance = 0;
  
  for (let i = 0; i < n; i++) {
    covariance += (goldPrices[i] - goldMean) * (silverPrices[i] - silverMean);
    goldVariance += Math.pow(goldPrices[i] - goldMean, 2);
    silverVariance += Math.pow(silverPrices[i] - silverMean, 2);
  }
  
  covariance /= n;
  goldVariance /= n;
  silverVariance /= n;
  
  // Calculate correlation (handle division by zero)
  const correlation = goldVariance * silverVariance === 0 ? 0 : covariance / Math.sqrt(goldVariance * silverVariance);
  
  // Calculate regression line (y = mx + b)
  const regressionSlope = goldVariance === 0 ? 0 : covariance / goldVariance;
  const regressionIntercept = silverMean - regressionSlope * goldMean;
  
  // Calculate R-squared
  const rSquared = Math.pow(correlation, 2);
  
  return {
    goldPrices,
    silverPrices,
    dates: [],
    correlation,
    rSquared,
    regressionSlope,
    regressionIntercept
  };
};

// Fetch historical data for charts
export const fetchHistoricalData = async (): Promise<ChartData> => {
  try {
    // Generate mock historical data for demo
    const mockData = generateMockHistoricalData();
    console.log('Mock data generated:', {
      goldPoints: mockData.goldHistory.length,
      silverPoints: mockData.silverHistory.length,
      correlation: mockData.correlation.correlation,
      sampleSize: mockData.correlation.goldPrices.length
    });
    return mockData;
  } catch (error) {
    console.error('Error generating historical data:', error);
    
    // Fallback to mock data
    return generateMockHistoricalData();
  }
};

// Generate mock historical data for demo purposes
const generateMockHistoricalData = (): ChartData => {
  const dates: string[] = [];
  const goldHistory: HistoricalDataPoint[] = [];
  const silverHistory: HistoricalDataPoint[] = [];
  const goldPrices: number[] = [];
  const silverPrices: number[] = [];

  const today = new Date();
  const baseGoldPrice = 1800 + Math.random() * 400;
  const baseSilverPrice = 20 + Math.random() * 10;

  // Generate 252 days of data (1 year of trading days)
  for (let i = 252; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
      const dateStr = date.toISOString().split('T')[0];
      
      // Simulate price movements with some correlation
      const goldPrice = baseGoldPrice + (Math.random() - 0.5) * 100 + i * 0.5;
      const silverPrice = baseSilverPrice + (Math.random() - 0.5) * 2 + i * 0.05;
      
      dates.push(dateStr);
      goldHistory.push({ date: dateStr, price: goldPrice });
      silverHistory.push({ date: dateStr, price: silverPrice });
      goldPrices.push(goldPrice);
      silverPrices.push(silverPrice);
    }
  }

  const correlationData = calculateCorrelation(goldPrices, silverPrices);
  correlationData.dates = dates;

  return {
    goldHistory,
    silverHistory,
    correlation: correlationData,
    lastUpdated: new Date().toISOString()
  };
};

export const subscribeToMetalsUpdates = (
  callback: (data: MetalsData) => void,
  interval: number = 30000 // 30 seconds
): (() => void) => {
  let isSubscribed = true;

  const fetchAndUpdate = async () => {
    if (!isSubscribed) return;
    
    try {
      const data = await fetchLiveMetalsPrices();
      if (isSubscribed) {
        callback(data);
      }
    } catch (error) {
      console.error('Error in metals subscription:', error);
    }
  };

  // Initial fetch
  fetchAndUpdate();

  // Set up interval
  const intervalId = setInterval(fetchAndUpdate, interval);

  // Cleanup function
  return () => {
    isSubscribed = false;
    clearInterval(intervalId);
  };
};