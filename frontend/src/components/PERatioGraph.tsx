import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import styled from 'styled-components';

const ChartContainer = styled.div`
  width: 100%;
  height: 350px;
  margin-top: 2rem;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 1.5rem;
  border: 1px solid ${props => props.theme.colors.border};
`;

const ChartTitle = styled.h4`
  margin: 0 0 1.5rem 0;
  color: ${props => props.theme.colors.textPrimary};
  font-size: 1.1rem;
  font-weight: 700;
`;

interface PERatioGraphProps {
  stockSymbol: string;
  stockPrice: number;
}

const PERatioGraph: React.FC<PERatioGraphProps> = ({ stockSymbol, stockPrice }) => {
  // Generate sample PE ratio data over time
  const generatePERatioData = () => {
    const data = [];
    const basePrice = stockPrice;
    let currentPrice = basePrice * 0.85;

    for (let i = 0; i < 12; i++) {
      const monthName = new Date(2025, i, 1).toLocaleString('en-US', { month: 'short' });
      // Simulate price fluctuation
      currentPrice = currentPrice * (0.95 + Math.random() * 0.1);
      
      // PE Ratio = Stock Price / EPS
      // Assuming EPS increases slightly and we calculate PE from it
      const eps = basePrice / 28.5 * (1 + i * 0.02);
      const peRatio = (currentPrice / eps).toFixed(2);

      data.push({
        month: monthName,
        peRatio: parseFloat(peRatio as string),
        price: parseFloat(currentPrice.toFixed(2)),
      });
    }

    return data;
  };

  const data = generatePERatioData();

  return (
    <div>
      <ChartTitle>📊 PE Ratio Trend (12 Months)</ChartTitle>
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#cccccc', fontSize: 12 }}
              stroke="#cccccc"
            />
            <YAxis 
              tick={{ fill: '#cccccc', fontSize: 12 }}
              stroke="#cccccc"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: any) => (typeof value === 'number' ? value.toFixed(2) : value)}
            />
            <Legend wrapperStyle={{ color: '#cccccc' }} />
            <Line
              type="monotone"
              dataKey="peRatio"
              stroke="#4ecdc4"
              dot={{ fill: '#4ecdc4', r: 4 }}
              activeDot={{ r: 6 }}
              strokeWidth={2}
              name="PE Ratio"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default PERatioGraph;
