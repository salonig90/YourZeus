// yFinance Service for Indian Stock Data (NSE/BSE)
// Now uses backend APIs to fetch data from yfinance

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface StockData {
  symbol: string;
  name: string;
  // canonical fields (may be absent for mock data)
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

  // UI-friendly aliases used across components (optional)
  price?: number;
  min?: number;
  max?: number;
  pe?: number;
  mcv?: number; // market cap in Crores (approx)
  opportunity?: string;
}

export interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

// Common Indian stock symbols by sector (NIFTY 200)
const indianSectorSymbols: { [key: string]: string[] } = {
  automobile: [
    'BAJAJ-AUTO.NS', 'BHARATFORG.NS', 'BOSCHLTD.NS', 'EICHERMOT.NS', 'EXIDEIND.NS',
    'HEROMOTOCO.NS', 'HYUNDAI.NS', 'MRF.NS', 'M&M.NS', 'MARUTI.NS',
    'MOTHERSON.NS', 'SONACOMS.NS', 'TVSMOTOR.NS', 'TATAMOTORS.NS', 'TIINDIA.NS'
  ],
  banking: [
    'SBIN.NS', 'HDFCBANK.NS', 'ICICIBANK.NS', 'AXISBANK.NS', 'KOTAKBANK.NS',
    'INDUSINDBK.NS', 'YESBANK.NS', 'BANKBARODA.NS', 'PNB.NS', 'CANBK.NS',
    'UNIONBANK.NS', 'IDFCFIRSTB.NS', 'FEDERALBNK.NS', 'BANKINDIA.NS', 'INDIANB.NS'
  ],
  finance: [
    'BAJFINANCE.NS', 'BAJAJFINSV.NS', 'JIOFIN.NS', 'MUTHOOTFIN.NS', 'SHRIRAMFIN.NS',
    'LICHSGFIN.NS', 'PFC.NS', 'RECLTD.NS', 'MOTILALOFS.NS', 'CHOLAFIN.NS',
    'HDFCAMC.NS', 'HDFCLIFE.NS', 'SBILIFE.NS', 'ICICIGI.NS', 'PAYTM.NS',
    'POLICYBZR.NS', 'IRFC.NS', 'IREDA.NS', 'HUDCO.NS', 'L&TFH.NS',
    'M&MFIN.NS', 'BAJAJHFL.NS', 'MAXFSL.NS', 'SBICARD.NS', 'BSE.NS', '360ONE.NS'
  ],
  energy: [
    'RELIANCE.NS', 'NTPC.NS', 'POWERGRID.NS', 'TATAPOWER.NS', 'ADANIPOWER.NS',
    'ADANIGREEN.NS', 'ADANIENSOL.NS', 'ONGC.NS', 'IOC.NS', 'BPCL.NS',
    'HPCL.NS', 'GAIL.NS', 'COALINDIA.NS', 'OIL.NS', 'IGL.NS',
    'ATGL.NS', 'NTPCGREEN.NS', 'TORNTPOWER.NS', 'JSWENERGY.NS'
  ],
  pharma: [
    'SUNPHARMA.NS', 'DRREDDY.NS', 'CIPLA.NS', 'DIVISLAB.NS', 'LUPIN.NS',
    'AUROPHARMA.NS', 'BIOCON.NS', 'ZYDUSLIFE.NS', 'APOLLOHOSP.NS', 'FORTIS.NS',
    'MAXHEALTH.NS', 'GLENMARK.NS', 'ALKEM.NS', 'MANKIND.NS', 'TORNTPHARM.NS'
  ],
  fmcg: [
    'HINDUNILVR.NS', 'ITC.NS', 'NESTLEIND.NS', 'BRITANNIA.NS', 'DABUR.NS',
    'MARICO.NS', 'COLPAL.NS', 'GODREJCP.NS', 'TATACONSUM.NS', 'VBL.NS',
    'PATANJALI.NS', 'UNITDSPR.NS'
  ],
  metals: [
    'TATASTEEL.NS', 'JSWSTEEL.NS', 'HINDALCO.NS', 'VEDL.NS', 'SAIL.NS',
    'NMDC.NS', 'NATIONALUM.NS', 'HINDZINC.NS', 'JINDALSTEL.NS'
  ],
  realty: [
    'DLF.NS', 'GODREJPROP.NS', 'OBEROIREAL.NS', 'PRESTIGE.NS', 'PHOENIXLTD.NS', 'LODHA.NS'
  ],
  it: [
    'TCS.NS', 'INFY.NS', 'WIPRO.NS', 'HCLTECH.NS', 'TECHM.NS',
    'LTIM.NS', 'PERSISTENT.NS', 'MPHASIS.NS', 'COFORGE.NS', 'OFSS.NS',
    'KPITTECH.NS', 'TATAELXSI.NS', 'TATATECH.NS'
  ],
  capital_goods: [
    'ABB.NS', 'SIEMENS.NS', 'LT.NS', 'CUMMINSIND.NS', 'HAVELLS.NS',
    'POLYCAB.NS', 'CGPOWER.NS', 'BEL.NS', 'BHEL.NS', 'HAL.NS',
    'MAZDOCK.NS', 'KEI.NS', 'APLAPOLLO.NS', 'ASTRAL.NS', 'PREMIERENE.NS',
    'WAREEENER.NS', 'ENRIN.NS'
  ],
  telecom: [
    'BHARTIARTL.NS', 'IDEA.NS', 'INDUSTOWER.NS', 'TATACOMM.NS', 'BHARTIHEXA.NS'
  ],
  chemicals: [
    'UPL.NS', 'SRF.NS', 'PIIND.NS', 'PIDILITIND.NS', 'COROMANDEL.NS', 'SOLARINDS.NS'
  ],
  consumer_durables: [
    'TITAN.NS', 'VOLTAS.NS', 'HAVELLS.NS', 'DIXON.NS', 'BLUESTARCO.NS', 'KALYANKJIL.NS'
  ],
  construction: [
    'ULTRACEMCO.NS', 'GRASIM.NS', 'AMBUJACEM.NS', 'ACC.NS', 'IRB.NS', 'RVNL.NS'
  ],
  hospitality: [
    'INDHOTEL.NS', 'ITCHOTELS.NS', 'IRCTC.NS', 'JUBLFOOD.NS', 'DMART.NS',
    'TRENT.NS', 'SWIGGY.NS', 'NYKAA.NS', 'ZOMATO.NS'
  ],
  us_stocks: [
    'NVDA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'GOOG', 'META', 'BRCM', 'TSLA', 'BRK-B', 'WMT', 'LLY', 'JPM', 'XOM', 'V', 'JNJ', 'MU', 'MA', 'COST', 'ORCL', 'CVX', 'NFLX', 'ABBV', 'PLTR', 'BAC', 'PG', 'AMD', 'KO', 'HD', 'CAT', 'CSCO', 'GE', 'LRCX', 'AMAT', 'MRK', 'RTX', 'MS', 'PM', 'UNH', 'GS', 'WFC', 'TMUS', 'GEV', 'IBM', 'LIN', 'MCD', 'INTC', 'VZ', 'PEP', 'AXP', 'T', 'KLAC', 'C', 'AMGN', 'NEE', 'ABT', 'CRM', 'DIS', 'TMO', 'TJX', 'TXN', 'GILD', 'ISRG', 'SCHW', 'ANET', 'APH', 'COP', 'PFE', 'BA', 'UBER', 'DE', 'ADI', 'APP', 'BLK', 'LMT', 'HON', 'UNP', 'QCOM', 'ETN', 'BKNG', 'WELL', 'DHR', 'PANW', 'SYK', 'SPGI', 'LOW', 'INTU', 'CB', 'ACN', 'PGR', 'PLD', 'BMY', 'NOW', 'VRTX', 'PH', 'COF', 'MDT', 'HCA', 'CME', 'MCK', 'MO', 'GLW', 'SBUX', 'SNDK', 'SO', 'CMCSA', 'NEM', 'CRWD', 'BSX', 'CEG', 'DELL', 'ADBE', 'NOC', 'WDC', 'DUK', 'EQIX', 'GD', 'WM', 'HWM', 'STX', 'CVS', 'TT', 'ICE', 'WMB', 'BX', 'MMC', 'MAR', 'FDX', 'ADP', 'PWR', 'AMT', 'UPS', 'PNC', 'SNPS', 'KKR', 'USB', 'JCI', 'BK', 'CDNS', 'NKE', 'REGN', 'MCO', 'ABNB', 'SHW', 'MSI', 'FCX', 'EOG', 'MMM', 'ITW', 'CMI', 'ORLY', 'KMI', 'ECL', 'MNST', 'MDLZ', 'EMR', 'CTAS', 'VLO', 'RCL', 'CSX', 'PSX', 'SLB', 'AON', 'CI', 'MPC', 'ROST', 'CL', 'DASH', 'WBD', 'AEP', 'RSG', 'CRH', 'HLT', 'TDG', 'LHX', 'GM', 'APO', 'ELV', 'TRV', 'HOOD', 'COR', 'NSC', 'APD', 'FTNT', 'SPG', 'SRE', 'OXY', 'BKR', 'DLR', 'PCAR', 'TEL', 'O', 'OKE', 'AJG', 'AFL', 'TFC', 'CIEN', 'AZO', 'FANG', 'ALL'
  ]
};

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

// Utility function to determine if a stock is Indian
const isIndianStock = (symbol: string): boolean => {
  return !!(symbol && (symbol.endsWith('.NS') || symbol.endsWith('.BO')));
};

// Utility function to format stock prices based on their market
const formatStockPrice = (price: number, symbol: string): string => {
  if (isIndianStock(symbol)) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(price);
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(price);
  }
};

export const yfinanceService = {
  // Get sector stocks with full data
  async getSectorStocks(sector: string): Promise<StockData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/stocks/sector/${sector.toLowerCase()}/`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${sector} sector data`);
      }
      
      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error('Invalid response format');
      }
      
      return result.data;
    } catch (err) {
      console.error(`Error fetching ${sector} stocks:`, err);
      return [];
    }
  },

  // Get mutual funds
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

  // Admin Stock Management
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
        headers: {
          'Content-Type': 'application/json',
        },
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

  // Formatting Utilities
  isIndianStock,
  formatStockPrice
};

// Helper function to determine opportunity rating
const getOpportunityRating = (stock: any): string => {
  const pe = stock.peRatio || stock.pe;
  const growthPotential = stock.changePercent ?? 0;

  if (pe && pe < 15 && growthPotential > 2) return 'Buy';
  if (pe && pe > 30 && growthPotential < 0) return 'Sell';
  if (pe && pe > 25 && growthPotential < 1) return 'Sell';
  if (pe && pe < 20 && growthPotential > 1) return 'Buy';

  return 'Hold';
};

// Utility function to format currency
const formatIndianCurrency = (value: number): string => {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else {
    return `$${value.toLocaleString('en-US')}`;
  }
};

// Utility function to format large numbers
const formatLargeNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K';
  }
  return num.toString();
};

export { isIndianStock, formatStockPrice, formatIndianCurrency, formatLargeNumber };