import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { HistoricalDataPoint } from '../services/metalsApi';

const PredictionContainer = styled(motion.div)`
  background: ${props => props.theme.colors.cardBackground};
  backdrop-filter: blur(12px);
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 2.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  margin-top: 2rem;
`;

const Title = styled.h3`
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const PredictionMeta = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.2rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  .label { font-size: 0.75rem; color: #888; text-transform: uppercase; margin-bottom: 0.3rem; }
  .value { font-size: 1.1rem; font-weight: 700; color: #fff; }
  .up { color: #00e676; }
  .down { color: #ff1744; }
`;

interface MetalsPredictionChartProps {
  data: HistoricalDataPoint[];
  title: string;
  color: string;
  icon: string;
}

const MetalsPredictionChart: React.FC<MetalsPredictionChartProps> = ({ data, title, color, icon }) => {
  if (!data || data.length < 10) return null;

  // Simple Linear Regression for the next 15 days
  const n = data.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = data.map(p => p.price);

  const xMean = x.reduce((a, b) => a + b, 0) / n;
  const yMean = y.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - xMean) * (y[i] - yMean);
    den += (x[i] - xMean) ** 2;
  }

  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;

  // Generate 15 days prediction
  const lastPrice = y[n - 1];
  const lastDate = new Date(data[n - 1].date);
  
  const combinedData = data.map(p => ({
    ...p,
    type: 'historical'
  }));

  const predictionDays = 15;
  for (let i = 1; i <= predictionDays; i++) {
    const predDate = new Date(lastDate);
    predDate.setDate(lastDate.getDate() + i);
    
    combinedData.push({
      date: predDate.toISOString().split('T')[0],
      price: slope * (n - 1 + i) + intercept,
      type: 'prediction'
    } as any);
  }

  const predictedPrice = combinedData[combinedData.length - 1].price;
  const priceChange = predictedPrice - lastPrice;
  const changePercent = (priceChange / lastPrice) * 100;
  const isUp = priceChange >= 0;

  return (
    <PredictionContainer
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Title>{icon} {title} Price Prediction (15 Days)</Title>
      
      <PredictionMeta>
        <MetaItem>
          <span className="label">Current Price</span>
          <span className="value">${lastPrice.toFixed(2)}</span>
        </MetaItem>
        <MetaItem>
          <span className="label">Predicted Price</span>
          <span className="value">${predictedPrice.toFixed(2)}</span>
        </MetaItem>
        <MetaItem>
          <span className="label">Estimated Trend</span>
          <span className={`value ${isUp ? 'up' : 'down'}`}>
            {isUp ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}%
          </span>
        </MetaItem>
        <MetaItem>
          <span className="label">Model Confidence</span>
          <span className="value">Moderate (Linear)</span>
        </MetaItem>
      </PredictionMeta>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={combinedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="date" 
            hide={true}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            tick={{ fill: '#888', fontSize: 11 }}
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip 
            contentStyle={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend />
          <ReferenceLine x={data[n-1].date} stroke="#666" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: '#666', fontSize: 10 }} />
          
          <Line
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={3}
            dot={false}
            name="Historical"
            data={combinedData.filter(d => d.type === 'historical')}
          />
          
          <Line
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Prediction"
            data={combinedData.filter(d => d.type === 'prediction' || d.date === data[n-1].date)}
          />
        </LineChart>
      </ResponsiveContainer>
    </PredictionContainer>
  );
};

export default MetalsPredictionChart;
