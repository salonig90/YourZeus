import React, { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
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
  height: 450px;
  margin-top: 2rem;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 2rem;
  border: 1px solid ${props => props.theme.colors.border};
`;

interface KMeansVisualizationProps {
  stocks: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
  }>;
}

const KMeansVisualization: React.FC<KMeansVisualizationProps> = ({ stocks }) => {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const data = useMemo(() => {
    return stocks.map((stock) => {
      // Volatility based on price change
      const volatility = Math.abs(stock.change) * 2 + Math.random() * 5;
      // Correlation based on price level
      const correlation = (stock.price / 100) * 0.5 + Math.random() * 0.3;
      
      // Simple clustering: assign to cluster based on volatility
      let cluster = 1;
      if (volatility > 8) cluster = 3;
      else if (volatility > 4) cluster = 2;

      return {
        symbol: stock.symbol,
        volatility: parseFloat(volatility.toFixed(2)),
        correlation: parseFloat(correlation.toFixed(3)),
        cluster,
        date: today,
      };
    });
  }, [stocks, today]);

  const cluster1 = data.filter((d) => d.cluster === 1);
  const cluster2 = data.filter((d) => d.cluster === 2);
  const cluster3 = data.filter((d) => d.cluster === 3);

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="volatility"
            type="number"
            name="Volatility (%)"
            stroke="#cccccc"
            label={{ value: 'Volatility (%)', position: 'insideBottomRight', offset: -5, fill: '#cccccc' }}
          />
          <YAxis
            dataKey="correlation"
            type="number"
            name="Correlation"
            stroke="#cccccc"
            label={{ value: 'Correlation', angle: -90, position: 'insideLeft', fill: '#cccccc' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid #4ecdc4',
              borderRadius: '8px',
              color: '#fff',
            }}
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }: any) => {
              if (active && payload && payload[0]) {
                const data = payload[0].payload;
                return (
                  <div style={{ padding: '8px 12px' }}>
                    <p style={{ margin: '0 0 4px 0' }}>
                      <strong>{data.symbol}</strong>
                    </p>
                    <p style={{ margin: '0 0 2px 0' }}>Volatility: {data.volatility}%</p>
                    <p style={{ margin: '0' }}>Correlation: {data.correlation}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend wrapperStyle={{ color: '#fff' }} />
          {cluster1.length > 0 && (
            <Scatter
              dataKey="correlation"
              data={cluster1}
              fill="#4ecdc4"
              name="Cluster 1 (Low Volatility)"
            />
          )}
          {cluster2.length > 0 && (
            <Scatter
              dataKey="correlation"
              data={cluster2}
              fill="#ffd93d"
              name="Cluster 2 (Medium Volatility)"
            />
          )}
          {cluster3.length > 0 && (
            <Scatter
              dataKey="correlation"
              data={cluster3}
              fill="#ff6b6b"
              name="Cluster 3 (High Volatility)"
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default KMeansVisualization;
