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
  Area,
  AreaChart
} from 'recharts';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { HistoricalDataPoint } from '../services/metalsApi';

const ChartContainer = styled(motion.div)`
  background: ${props => props.theme.colors.cardBackground};
  backdrop-filter: blur(12px);
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 2.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 3rem;
`;

const ChartTitle = styled.h3`
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 2rem;
  font-size: 1.4rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: -0.5px;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const MetalIcon = styled.div`
  font-size: 1.5rem;
  margin-right: 0.5rem;
`;

interface PriceTrendChartProps {
  data: HistoricalDataPoint[];
  title: string;
  icon: string;
  color: string;
  height?: number;
}

const PriceTrendChart: React.FC<PriceTrendChartProps> = ({ 
  data, 
  title, 
  icon, 
  color, 
  height = 300 
}) => {
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTooltipDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ 
          background: 'rgba(5, 5, 5, 0.9)', 
          padding: '1rem', 
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 700, color: '#fff' }}>{formatTooltipDate(label)}</p>
          <p style={{ margin: '0 0 0.3rem 0', color: '#fff', fontSize: '0.9rem' }}>
            Price: <span style={{ fontWeight: 700 }}>${data.price.toFixed(2)}</span>
          </p>
          {data.ma20 && (
            <p style={{ margin: '0 0 0.3rem 0', color: '#4facfe', fontSize: '0.9rem' }}>
              MA20: <span style={{ fontWeight: 700 }}>${data.ma20.toFixed(2)}</span>
            </p>
          )}
          {data.rsi && (
            <p style={{ margin: '0', color: data.rsi > 70 ? '#ff1744' : data.rsi < 30 ? '#00e676' : '#a0a0a0', fontSize: '0.9rem' }}>
              RSI: <span style={{ fontWeight: 700 }}>{data.rsi.toFixed(2)}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Simplify data for better performance (show every 5th point)
  const simplifiedData = data.filter((_, index) => index % 5 === 0);

  return (
    <ChartContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ChartHeader>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <MetalIcon>{icon}</MetalIcon>
          <ChartTitle>{title} Price Trend (1 Year)</ChartTitle>
        </div>
      </ChartHeader>
      
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={simplifiedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id={`color${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255, 255, 255, 0.1)" 
          />
          
          <XAxis 
            dataKey="date"
            tick={{ fill: '#fff', fontSize: 10 }}
            tickFormatter={formatDate}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          
          <YAxis 
            tick={{ fill: '#fff', fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
            domain={['dataMin - 50', 'dataMax + 50']}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            fillOpacity={1}
            fill={`url(#color${title})`}
            strokeWidth={3}
            name="Price"
          />
          
          <Line
            type="monotone"
            dataKey="ma20"
            stroke="#4facfe"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="20-Day MA"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div style={{ 
        textAlign: 'center', 
        color: '#888', 
        fontSize: '0.8rem',
        marginTop: '0.5rem'
      }}>
        {data.length} trading days | Last update: {new Date().toLocaleDateString()}
      </div>
    </ChartContainer>
  );
};

export default PriceTrendChart;