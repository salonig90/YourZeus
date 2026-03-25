import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import styled from 'styled-components';

const ChartContainer = styled.div`
  width: 100%;
  height: 450px;
  margin-top: 2rem;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 2rem;
  border: 1px solid ${props => props.theme.colors.border};
`;

interface PricePredictionGraphProps {
  stocks: Array<{
    symbol: string;
    name: string;
    price: number;
  }>;
}

// Simple Linear Regression for prediction
const linearRegression = (prices: number[]) => {
  const n = prices.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = prices;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};

const generatePriceHistory = (basePrice: number) => {
  const history = [];
  let price = basePrice * 0.95;

  for (let i = 0; i < 30; i++) {
    price = price * (0.98 + Math.random() * 0.04);
    history.push(price);
  }

  return history;
};

const PricePredictionGraph: React.FC<PricePredictionGraphProps> = ({ stocks }) => {
  const data = useMemo(() => {
    const chartData = [];
    const today = new Date();

    // Historical data (30 days)
    for (let day = -30; day < 0; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() + day);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dataPoint: any = {
        day: dateStr,
        fullDate: date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        daysFromNow: day,
      };

      stocks.forEach((stock) => {
        const history = generatePriceHistory(stock.price);
        const historyIndex = day + 30;
        if (historyIndex >= 0 && historyIndex < history.length) {
          dataPoint[`${stock.symbol}_actual`] = parseFloat(history[historyIndex].toFixed(2));
        }
      });

      chartData.push(dataPoint);
    }

    // Today
    const todayStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const todayDataPoint: any = {
      day: `📅 ${todayStr} (Today)`,
      fullDate: today.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      daysFromNow: 0,
      isToday: true,
    };

    stocks.forEach((stock) => {
      todayDataPoint[`${stock.symbol}_actual`] = stock.price;
    });

    chartData.push(todayDataPoint);

    // Predicted data (15 days into future)
    for (let day = 1; day <= 15; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() + day);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dataPoint: any = {
        day: dateStr,
        fullDate: date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        daysFromNow: day,
      };

      stocks.forEach((stock) => {
        const history = generatePriceHistory(stock.price);
        const { slope, intercept } = linearRegression(history);
        const predictedPrice = intercept + slope * (30 + day);
        dataPoint[`${stock.symbol}_predicted`] = parseFloat(Math.max(predictedPrice, stock.price * 0.5).toFixed(2));
      });

      chartData.push(dataPoint);
    }

    return chartData;
  }, [stocks]);

  const colors = ['#4ecdc4', '#ff6b6b', '#ffd93d', '#6bcf7f', '#a78bfa', '#fb7185'];

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="day"
            stroke="#cccccc"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis stroke="#cccccc" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid #4ecdc4',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: any) => `₹${value.toFixed(2)}`}
            labelFormatter={(label: any) => {
              const dataItem = data.find((d) => d.day === label);
              return dataItem ? `${label}\n${dataItem.fullDate}` : label;
            }}
          />
          <Legend wrapperStyle={{ color: '#fff' }} />
          <ReferenceLine
            x="📅 Mar 5 (Today)"
            stroke="#4ecdc4"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{ value: 'TODAY', position: 'top', fill: '#4ecdc4', fontSize: 12, fontWeight: 'bold' }}
          />

          {stocks.map((stock, idx) => (
            <React.Fragment key={stock.symbol}>
              <Line
                type="monotone"
                dataKey={`${stock.symbol}_actual`}
                stroke={colors[idx % colors.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name={`${stock.symbol} (Actual)`}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey={`${stock.symbol}_predicted`}
                stroke={colors[idx % colors.length]}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name={`${stock.symbol} (Predicted)`}
                isAnimationActive={false}
              />
            </React.Fragment>
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default PricePredictionGraph;
