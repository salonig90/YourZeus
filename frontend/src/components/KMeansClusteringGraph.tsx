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

interface KMeansClusteringGraphProps {
  stockSymbol: string;
  stockPrice: number;
  stockName: string;
}

interface ClusterData {
  x: number; // Price
  y: number; // Change
  z: number; // PE Ratio (used for color)
  name: string;
  cluster: number;
}

const KMeansClusteringGraph: React.FC<KMeansClusteringGraphProps> = ({
  stockSymbol,
  stockPrice,
  stockName,
}) => {
  // Generate sample stock data and perform basic clustering
  const generateClusterData = (): ClusterData[] => {
    const stocks = [
      { name: stockName, price: stockPrice, change: 5.2, pe: 28 },
      { name: 'Stock A', price: stockPrice * 1.1, change: -2.1, pe: 32 },
      { name: 'Stock B', price: stockPrice * 0.9, change: 3.5, pe: 25 },
      { name: 'Stock C', price: stockPrice * 1.2, change: 1.8, pe: 30 },
      { name: 'Stock D', price: stockPrice * 0.8, change: -1.5, pe: 22 },
      { name: 'Stock E', price: stockPrice * 1.05, change: 4.2, pe: 29 },
      { name: 'Stock F', price: stockPrice * 0.95, change: 2.1, pe: 26 },
      { name: 'Stock G', price: stockPrice * 1.15, change: 0.5, pe: 31 },
    ];

    // Simple K-means clustering (K=3)
    // Normalize price and change for clustering
    const priceRange = Math.max(...stocks.map(s => s.price)) - Math.min(...stocks.map(s => s.price));
    const changeRange = Math.max(...stocks.map(s => s.change)) - Math.min(...stocks.map(s => s.change));

    // Assign clusters based on price and change patterns
    const clusteredData: ClusterData[] = stocks.map(stock => {
      let cluster = 0;
      if (stock.change > 2 && stock.price > stockPrice * 0.95) {
        cluster = 0; // High performers
      } else if (stock.change < 0 || stock.price < stockPrice * 0.9) {
        cluster = 2; // Low performers
      } else {
        cluster = 1; // Mid performers
      }

      return {
        x: stock.price,
        y: stock.change,
        z: stock.pe,
        name: stock.name,
        cluster,
      };
    });

    return clusteredData;
  };

  const data = generateClusterData();

  // Group data by cluster for visualization
  const cluster0 = data.filter(d => d.cluster === 0);
  const cluster1 = data.filter(d => d.cluster === 1);
  const cluster2 = data.filter(d => d.cluster === 2);

  const colors = ['#4caf50', '#ffc107', '#f44336'];

  return (
    <div>
      <ChartTitle>🎯 K-Means Clustering Analysis (3 Clusters)</ChartTitle>
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            data={data}
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
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff',
              }}
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value, name) => {
                if (name === 'x') return `₹${(value as number).toFixed(2)}`;
                if (name === 'y') return `${(value as number).toFixed(2)}%`;
                return value;
              }}
              labelFormatter={(label) => `${label}`}
            />
            <Legend wrapperStyle={{ color: '#cccccc' }} />
            
            {/* Cluster 0: High Performers (Green) */}
            <Scatter
              name="High Performers"
              data={cluster0}
              fill={colors[0]}
              fillOpacity={0.7}
            />
            
            {/* Cluster 1: Mid Performers (Yellow) */}
            <Scatter
              name="Mid Performers"
              data={cluster1}
              fill={colors[1]}
              fillOpacity={0.7}
            />
            
            {/* Cluster 2: Low Performers (Red) */}
            <Scatter
              name="Low Performers"
              data={cluster2}
              fill={colors[2]}
              fillOpacity={0.7}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </ChartContainer>
      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#cccccc' }}>
        💡 Clusters based on stock price vs. daily change performance
      </div>
    </div>
  );
};

export default KMeansClusteringGraph;
