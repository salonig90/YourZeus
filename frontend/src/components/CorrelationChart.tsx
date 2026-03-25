import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Label
} from 'recharts';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { CorrelationData } from '../services/metalsApi';

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
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatLabel = styled.div`
  color: #888;
  font-size: 0.8rem;
  margin-bottom: 0.3rem;
`;

const StatValue = styled.div`
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 600;
`;

interface CorrelationChartProps {
  data: CorrelationData;
}

const CorrelationChart: React.FC<CorrelationChartProps> = ({ data }) => {
  const { goldPrices, silverPrices, correlation, rSquared, regressionSlope, regressionIntercept } = data;
  
  // Prepare scatter plot data
  const scatterData = goldPrices.map((goldPrice, index) => ({
    gold: goldPrice,
    silver: silverPrices[index],
    size: 50
  }));

  // Calculate regression line endpoints with safeguards
  const minGold = goldPrices.length > 0 ? Math.min(...goldPrices) : 0;
  const maxGold = goldPrices.length > 0 ? Math.max(...goldPrices) : 100;
  const regressionLine = [
    { x: minGold, y: regressionSlope * minGold + regressionIntercept },
    { x: maxGold, y: regressionSlope * maxGold + regressionIntercept }
  ] as const;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '10px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '5px',
          color: '#fff'
        }}>
          <p>Gold: ${payload[0].value.toFixed(2)}</p>
          <p>Silver: ${payload[1].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ChartTitle>📊 Gold vs Silver Correlation</ChartTitle>
      
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart
          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          
          <XAxis 
            type="number" 
            dataKey="gold" 
            name="Gold Price"
            domain={['dataMin - 50', 'dataMax + 50']}
            tick={{ fill: '#fff', fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
          />
          
          <YAxis 
            type="number" 
            dataKey="silver" 
            name="Silver Price"
            domain={['dataMin - 2', 'dataMax + 2']}
            tick={{ fill: '#fff', fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
          />
          
          <ZAxis type="number" dataKey="size" range={[50, 300]} />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Scatter
            name="Price Points"
            data={scatterData}
            fill="#8884d8"
            opacity={0.6}
          />
          
          <ReferenceLine
            segment={regressionLine}
            stroke="#00b894"
            strokeWidth={2}
            label={{
              position: 'top',
              value: 'Regression Line',
              fill: '#00b894',
              fontSize: 12
            }}
          />
          
          <Legend 
            verticalAlign="top" 
            height={36}
            wrapperStyle={{ color: '#fff' }}
          />
        </ScatterChart>
      </ResponsiveContainer>

      <StatsContainer>
        <StatItem>
          <StatLabel>Correlation</StatLabel>
          <StatValue style={{ color: correlation >= 0 ? '#00b894' : '#ff6b6b' }}>
            {correlation.toFixed(3)}
          </StatValue>
        </StatItem>
        
        <StatItem>
          <StatLabel>R² Value</StatLabel>
          <StatValue>
            {rSquared.toFixed(3)}
          </StatValue>
        </StatItem>
        
        <StatItem>
          <StatLabel>Regression Slope</StatLabel>
          <StatValue>
            {regressionSlope.toFixed(4)}
          </StatValue>
        </StatItem>
        
        <StatItem>
          <StatLabel>Sample Size</StatLabel>
          <StatValue>
            {goldPrices.length} days
          </StatValue>
        </StatItem>
      </StatsContainer>
    </ChartContainer>
  );
};

export default CorrelationChart;