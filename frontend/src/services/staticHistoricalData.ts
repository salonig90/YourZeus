import { ChartData, CorrelationData } from './metalsApi';
import { goldHistoricalData } from '../data/goldHistoricalData';
import { silverHistoricalData } from '../data/silverHistoricalData';
import { calculateCorrelation } from './metalsApi';

// Get static historical data for charts
export const getStaticHistoricalData = (): ChartData => {
  // Target prices as requested by the user
  const TARGET_GOLD = 5173.73;
  const TARGET_SILVER = 85.3735;
  
  // Calculate scaling factors based on the last data points
  const lastGoldPrice = goldHistoricalData[goldHistoricalData.length - 1].price;
  const lastSilverPrice = silverHistoricalData[silverHistoricalData.length - 1].price;
  
  const goldScale = TARGET_GOLD / lastGoldPrice;
  const silverScale = TARGET_SILVER / lastSilverPrice;

  // Apply scaling to historical data to ensure smooth transition to live data
  const scaledGold = goldHistoricalData.map(item => ({
    ...item,
    price: parseFloat((item.price * goldScale).toFixed(2))
  }));
  
  const scaledSilver = silverHistoricalData.map(item => ({
    ...item,
    price: parseFloat((item.price * silverScale).toFixed(4))
  }));

  // Extract prices for correlation calculation
  const goldPrices = scaledGold.map(item => item.price);
  const silverPrices = scaledSilver.map(item => item.price);
  const dates = scaledGold.map(item => item.date);
  
  // Calculate correlation and regression
  const correlationData = calculateCorrelation(goldPrices, silverPrices);
  correlationData.dates = dates;
  
  return {
    goldHistory: scaledGold,
    silverHistory: scaledSilver,
    correlation: correlationData,
    lastUpdated: new Date().toISOString()
  };
};

// Calculate statistics for display
export const getHistoricalStats = () => {
  const data = getStaticHistoricalData();
  
  return {
    goldPrices: data.correlation.goldPrices,
    silverPrices: data.correlation.silverPrices,
    correlation: data.correlation.correlation,
    rSquared: data.correlation.rSquared,
    regressionSlope: data.correlation.regressionSlope,
    regressionIntercept: data.correlation.regressionIntercept,
    sampleSize: data.correlation.goldPrices.length
  };
};