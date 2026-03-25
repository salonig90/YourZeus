import React from 'react';
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
import { PortfolioItem } from '../contexts/AuthContext';

const ChartContainer = styled.div`
  width: 100%;
  height: 450px;
  margin-top: 2rem;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 2rem;
  border: 1px solid ${props => props.theme.colors.border};
`;

const ChartTitle = styled.h3`
  margin: 0 0 2rem 0;
  color: ${props => props.theme.colors.textPrimary};
  font-size: 1.4rem;
  font-weight: 700;
  text-align: center;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 4rem;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.1rem;
`;

interface CombinedKMeansProps {
  portfolio: PortfolioItem[];
}

interface ClusterData {
  x: number; // Price
  y: number; // Change
  name: string;
  symbol: string;
  cluster: number;
}

const CombinedKMeansClustering: React.FC<CombinedKMeansProps> = ({ portfolio }) => {
  if (portfolio.length === 0) {
    return (
      <EmptyMessage>
        📊 Add stocks to your portfolio to see combined clustering analysis
      </EmptyMessage>
    );
  }

  // Generate clustering data for portfolio stocks
  const generatePortfolioClusterData = (): ClusterData[] => {
    // Convert portfolio items to data points with clustering
    const data: ClusterData[] = portfolio.map((stock, index) => {
      let cluster = 0;
      
      // Cluster based on change percentage
      if (stock.change > 5) {
        cluster = 0; // High growth
      } else if (stock.change < -2) {
        cluster = 2; // High decline
      } else {
        cluster = 1; // Stable
      }

      return {
        x: stock.price,
        y: stock.change,
        name: stock.name,
        symbol: stock.symbol,
        cluster,
      };
    });

    return data;
  };

  const clusterData = generatePortfolioClusterData();

  // Group by cluster
  const cluster0 = clusterData.filter(d => d.cluster === 0);
  const cluster1 = clusterData.filter(d => d.cluster === 1);
  const cluster2 = clusterData.filter(d => d.cluster === 2);

  const colors = ['#4caf50', '#ffc107', '#f44336'];
  const clusterLabels = ['High Growth', 'Stable', 'Declining'];

  return (
    <div>
      <ChartTitle>🎯 Portfolio Stock Clustering Analysis</ChartTitle>
      <div style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#cccccc' }}>
        Total Stocks: {portfolio.length} | Cluster Distribution: {cluster0.length} High Growth, {cluster1.length} Stable, {cluster2.length} Declining
      </div>
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            data={clusterData}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              type="number"
              dataKey="x"
              name="Stock Price (₹)"
              tick={{ fill: '#cccccc', fontSize: 12 }}
              stroke="#cccccc"
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Change %"
              tick={{ fill: '#cccccc', fontSize: 12 }}
              stroke="#cccccc"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                color: '#fff',
              }}
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ClusterData;
                  return (
                    <div style={{ padding: '10px' }}>
                      <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
                        {data.symbol} - {data.name}
                      </p>
                      <p style={{ margin: '0 0 5px 0' }}>
                        Price: ₹{data.x.toFixed(2)}
                      </p>
                      <p style={{ margin: '0' }}>
                        Change: {data.y.toFixed(2)}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ color: '#cccccc' }} />
            
            {/* Cluster 0: High Growth (Green) */}
            {cluster0.length > 0 && (
              <Scatter
                name={`${clusterLabels[0]} (${cluster0.length})`}
                data={cluster0}
                fill={colors[0]}
                fillOpacity={0.8}
              />
            )}
            
            {/* Cluster 1: Stable (Yellow) */}
            {cluster1.length > 0 && (
              <Scatter
                name={`${clusterLabels[1]} (${cluster1.length})`}
                data={cluster1}
                fill={colors[1]}
                fillOpacity={0.8}
              />
            )}
            
            {/* Cluster 2: Declining (Red) */}
            {cluster2.length > 0 && (
              <Scatter
                name={`${clusterLabels[2]} (${cluster2.length})`}
                data={cluster2}
                fill={colors[2]}
                fillOpacity={0.8}
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </ChartContainer>
      <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#cccccc', lineHeight: '1.6' }}>
        <strong>💡 Legend:</strong><br/>
        🟢 <strong>High Growth:</strong> Stocks with change &gt; 5%<br/>
        🟡 <strong>Stable:</strong> Stocks with change between -2% and 5%<br/>
        🔴 <strong>Declining:</strong> Stocks with change &lt; -2%
      </div>
    </div>
  );
};

export default CombinedKMeansClustering;
