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
} from 'recharts';
import styled from 'styled-components';

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
  margin-top: 2rem;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 1.5rem;
  border: 1px solid ${props => props.theme.colors.border};
`;

interface PERatioTrendGraphProps {
  stocks: Array<{
    symbol: string;
    name: string;
    price: number;
  }>;
}

const PERatioTrendGraph: React.FC<PERatioTrendGraphProps> = ({ stocks }) => {
  const data = useMemo(() => {
    const monthData = [];
    const today = new Date();
    
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - (11 - month), 1);
      const monthName = monthDate.toLocaleDateString('en-US', { year: '2-digit', month: 'short' });
      
      const dataPoint: any = {
        month: monthName,
        date: monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' }),
      };

      stocks.forEach((stock) => {
        const basePrice = stock.price;
        let currentPrice = basePrice * (0.9 + Math.random() * 0.2);
        const eps = basePrice / 20;
        const peRatio = parseFloat((currentPrice / eps).toFixed(2));
        dataPoint[stock.symbol] = peRatio;
      });

      monthData.push(dataPoint);
    }
    return monthData;
  }, [stocks]);

  const colors = ['#4ecdc4', '#ff6b6b', '#ffd93d', '#6bcf7f', '#a78bfa', '#fb7185'];

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="month" stroke="#cccccc" />
          <YAxis stroke="#cccccc" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid #4ecdc4',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: any) => value.toFixed(2)}
          />
          <Legend wrapperStyle={{ color: '#fff' }} />
          {stocks.map((stock, idx) => (
            <Line
              key={stock.symbol}
              type="monotone"
              dataKey={stock.symbol}
              stroke={colors[idx % colors.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name={`${stock.symbol} (P/E)`}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default PERatioTrendGraph;
