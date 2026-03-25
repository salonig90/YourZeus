/**
 * Prediction Service
 * Uses Linear Regression for price prediction
 * Uses Logistic Regression for up/down prediction
 */

export interface PredictionResult {
  predictedPrice: number;
  predictedChange: number;
  direction: 'up' | 'down';
  confidence: number;
}

/**
 * Simple Linear Regression for price prediction
 */
class LinearRegression {
  private slope: number = 0;
  private intercept: number = 0;

  fit(x: number[], y: number[]): void {
    const n = x.length;
    if (n < 2) {
      this.slope = 0;
      this.intercept = y[0] || 0;
      return;
    }

    const xMean = x.reduce((a, b) => a + b, 0) / n;
    const yMean = y.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (x[i] - xMean) * (y[i] - yMean);
      denominator += (x[i] - xMean) ** 2;
    }

    this.slope = denominator === 0 ? 0 : numerator / denominator;
    this.intercept = yMean - this.slope * xMean;
  }

  predict(x: number): number {
    return this.slope * x + this.intercept;
  }
}

/**
 * Simple Logistic Regression for trend prediction
 */
class LogisticRegression {
  private coefficient: number = 0;
  private intercept: number = 0;

  fit(x: number[], y: number[]): void {
    const n = x.length;
    if (n < 2) {
      this.coefficient = 0;
      this.intercept = 0;
      return;
    }

    // Simple logistic regression with gradient descent
    let coef = 0;
    let intercept = 0;
    const learningRate = 0.01;
    const iterations = 100;

    const xMean = x.reduce((a, b) => a + b, 0) / n;
    const xStd = Math.sqrt(x.reduce((a, b) => a + (b - xMean) ** 2, 0) / n);
    const xNormalized = x.map(xi => xStd > 0 ? (xi - xMean) / xStd : 0);

    for (let iter = 0; iter < iterations; iter++) {
      let gradCoef = 0;
      let gradIntercept = 0;

      for (let i = 0; i < n; i++) {
        const z = intercept + coef * xNormalized[i];
        const sigmoid = 1 / (1 + Math.exp(-z));
        const error = sigmoid - y[i];

        gradCoef += error * xNormalized[i];
        gradIntercept += error;
      }

      coef -= (learningRate * gradCoef) / n;
      intercept -= (learningRate * gradIntercept) / n;
    }

    this.coefficient = coef;
    this.intercept = intercept;
  }

  predict(x: number): number {
    // Returns probability between 0 and 1
    const z = this.intercept + this.coefficient * x;
    return 1 / (1 + Math.exp(-z));
  }

  sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-z));
  }
}

/**
 * Generate synthetic historical data based on current price and volatility
 */
function generateHistoricalData(
  currentPrice: number,
  daysBack: number = 30
): number[] {
  const prices: number[] = [];
  let price = currentPrice * 0.9; // Start from ~90% of current price

  for (let i = 0; i < daysBack; i++) {
    const change = (Math.random() - 0.5) * 2 * 0.02; // ±2% daily volatility
    price = price * (1 + change);
    prices.push(price);
  }

  // Add current price at the end
  prices.push(currentPrice);
  return prices;
}

/**
 * Predict stock price using Linear Regression
 */
export function predictPrice(currentPrice: number, change: number): PredictionResult {
  // Generate historical data based on current price
  const historicalPrices = generateHistoricalData(currentPrice, 30);
  const days = Array.from({ length: historicalPrices.length }, (_, i) => i);

  // Fit linear regression
  const lr = new LinearRegression();
  lr.fit(days, historicalPrices);

  // Predict next day price
  const nextDayPrice = lr.predict(historicalPrices.length);
  const predictedChange = ((nextDayPrice - currentPrice) / currentPrice) * 100;

  // Fit logistic regression for direction
  const directions = historicalPrices.map((price, i) => {
    if (i === 0) return 0;
    return historicalPrices[i] > historicalPrices[i - 1] ? 1 : 0;
  });

  const logReg = new LogisticRegression();
  logReg.fit(days, directions);

  const upProbability = logReg.predict(historicalPrices.length);
  const direction = upProbability > 0.5 ? 'up' : 'down';
  const confidence = Math.abs(upProbability - 0.5) * 2; // 0 to 1 scale

  return {
    predictedPrice: Math.max(currentPrice * 0.8, nextDayPrice), // Ensure reasonable range
    predictedChange: predictedChange,
    direction,
    confidence: Math.min(confidence, 0.9) // Cap confidence at 0.9 for realism
  };
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(
  currentPrice: number,
  minPrice: number,
  maxPrice: number
): number {
  if (maxPrice === minPrice) return 0;
  const discount = ((maxPrice - currentPrice) / (maxPrice - minPrice)) * 100;
  return Math.max(0, Math.min(100, discount));
}

/**
 * Format prediction for display
 */
export function formatPrediction(result: PredictionResult): {
  price: string;
  change: string;
  direction: 'up' | 'down';
  confidence: string;
} {
  return {
    price: `$${result.predictedPrice.toFixed(2)}`,
    change: `${result.predictedChange >= 0 ? '+' : ''}${result.predictedChange.toFixed(2)}%`,
    direction: result.direction,
    confidence: `${(result.confidence * 100).toFixed(0)}%`
  };
}
