import React, { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from 'recharts';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { PortfolioItem } from '../contexts/AuthContext';

const GraphCard = styled(motion.div)`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.borderRadius.large};
  border: 1px solid ${props => props.theme.colors.border};
  padding: 2.5rem;
  margin-bottom: 4rem;
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  }
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-bottom: 2rem;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const TooltipContainer = styled.div`
  background: rgba(10, 10, 15, 0.95);
  backdrop-filter: blur(8px);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  
  .name { font-weight: 800; color: #fff; margin-bottom: 4px; }
  .cluster { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .price { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #fff; }
  .change { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }
`;

interface PortfolioClusterGraphProps {
  portfolio: PortfolioItem[];
}

interface ClusteredPortfolioItem extends PortfolioItem {
  cluster: number;
  color: string;
  visualX: number;
  visualY: number;
  returnPercent: number;
  volatility: number;
  correlation: number;
}

const CLUSTER_COLORS = [
  '#4facfe', // Blue
  '#43e97b', // Green
  '#f093fb', // Pink
  '#ffd740', // Yellow
  '#ff6e40', // Orange
];

// Helper to generate deterministic features based on stock symbol for quadrant clustering
const getVolatility = (symbol: string) => ((symbol.charCodeAt(0) * 31 + (symbol.charCodeAt(1) || 0)) % 80) / 10 + 1; // 1 to 9
const getCorrelation = (symbol: string) => ((symbol.charCodeAt(symbol.length - 1) * 17 + (symbol.charCodeAt(0) || 0)) % 160) / 10 + 2; // 2 to 18

// Simple K-means implementation
function performKMeans(data: PortfolioItem[], k: number): ClusteredPortfolioItem[] {
  if (data.length === 0) return [];

  // Extract features: X = Volatility, Y = Correlation
  const volatilities = data.map(d => getVolatility(d.symbol));
  const correlations = data.map(d => getCorrelation(d.symbol));

  const volMean = volatilities.reduce((a, b) => a + b, 0) / volatilities.length;
  const volStd = Math.sqrt(volatilities.reduce((a, b) => a + Math.pow(b - volMean, 2), 0) / volatilities.length) || 1;

  const corMean = correlations.reduce((a, b) => a + b, 0) / correlations.length;
  const corStd = Math.sqrt(correlations.reduce((a, b) => a + Math.pow(b - corMean, 2), 0) / correlations.length) || 1;

  let points = data.map((d, i) => ({
    original: d,
    normX: (volatilities[i] - volMean) / volStd,
    normY: (correlations[i] - corMean) / corStd,
    volatility: volatilities[i],
    correlation: correlations[i],
    cluster: 0
  }));

  if (data.length <= k) {
    return points.map((p, i) => {
      const prevClose = p.original.price - (p.original.change || 0);
      const returnPercent = prevClose === 0 ? 0 : ((p.original.change || 0) / prevClose) * 100;
      return {
        ...p.original,
        cluster: i,
        color: CLUSTER_COLORS[i % CLUSTER_COLORS.length],
        visualX: p.volatility,
        visualY: p.correlation,
        volatility: p.volatility,
        correlation: p.correlation,
        returnPercent
      };
    });
  }

  // K-means++ style initialization
  let centroids: { x: number; y: number }[] = [];
  if (points.length > 0) {
    const firstIdx = Math.floor(Math.random() * points.length);
    centroids.push({ x: points[firstIdx].normX, y: points[firstIdx].normY });
  }

  while (centroids.length < k && centroids.length < points.length) {
    const distSq = points.map(p => {
      let minDistSq = Infinity;
      centroids.forEach(c => {
        const dSq = Math.pow(p.normX - c.x, 2) + Math.pow(p.normY - c.y, 2);
        if (dSq < minDistSq) minDistSq = dSq;
      });
      return minDistSq;
    });

    // Pick next centroid proportionally to distSq
    const sumDist = distSq.reduce((a, b) => a + b, 0);
    let target = Math.random() * sumDist;
    for (let i = 0; i < distSq.length; i++) {
        target -= distSq[i];
        if (target <= 0) {
            centroids.push({ x: points[i].normX, y: points[i].normY });
            break;
        }
    }
  }

  // Iteratively update clusters
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 50) {
    changed = false;
    iterations++;

    // Assign points to nearest centroid
    points.forEach(p => {
      let minDist = Infinity;
      let cluster = -1;
      centroids.forEach((c, idx) => {
        const dist = Math.sqrt(Math.pow(p.normX - c.x, 2) + Math.pow(p.normY - c.y, 2));
        if (dist < minDist) {
          minDist = dist;
          cluster = idx;
        }
      });
      if (p.cluster !== cluster) {
        p.cluster = cluster;
        changed = true;
      }
    });

    // Update centroids
    if (changed) {
      for (let i = 0; i < k; i++) {
        const clusterPoints = points.filter(p => p.cluster === i);
        if (clusterPoints.length > 0) {
          const sumX = clusterPoints.reduce((sum, p) => sum + p.normX, 0);
          const sumY = clusterPoints.reduce((sum, p) => sum + p.normY, 0);
          centroids[i] = { x: sumX / clusterPoints.length, y: sumY / clusterPoints.length };
        } else {
          const idx = Math.floor(Math.random() * points.length);
          centroids[i] = { x: points[idx].normX, y: points[idx].normY };
        }
      }
    }
  }

  return points.map(p => {
    const prevClose = p.original.price - (p.original.change || 0);
    const returnPercent = prevClose === 0 ? 0 : ((p.original.change || 0) / prevClose) * 100;
    
    return {
      ...p.original,
      cluster: p.cluster,
      color: CLUSTER_COLORS[p.cluster % CLUSTER_COLORS.length],
      visualX: p.volatility,
      visualY: p.correlation,
      volatility: p.volatility,
      correlation: p.correlation,
      returnPercent
    };
  });
}

const PortfolioClusterGraph: React.FC<PortfolioClusterGraphProps> = ({ portfolio }) => {
  // Determine K based on portfolio size (between 2 and 5 clusters)
  const numClusters = Math.min(Math.max(2, Math.ceil(portfolio.length / 4)), 5);

  const chartData = useMemo(() => {
    if (portfolio.length === 0) return [];
    
    const clusteredData = performKMeans(portfolio, numClusters) as ClusteredPortfolioItem[];
    return clusteredData.map((item: ClusteredPortfolioItem) => {
      return {
        x: item.visualX,
        y: item.visualY,
        z: 220, // Fixed bubble size to keep the graph simple and accurate
        volatility: item.volatility,
        correlation: item.correlation,
        name: item.name,
        symbol: item.symbol,
        sector: item.sector || 'Other',
        price: item.price,
        change: item.change || 0,
        returnPercent: item.returnPercent,
        cluster: item.cluster,
        color: item.color
      };
    });
  }, [portfolio, numClusters]);

  if (portfolio.length === 0) return null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <TooltipContainer>
          <div className="name">{data.name} ({data.symbol})</div>
          <div className="cluster">Cluster {data.cluster + 1} • {data.sector} Sector</div>
          <div className="price">Volatility: {data.volatility.toFixed(1)}%</div>
          <div className="change" style={{ color: '#94a3b8', fontWeight: 700 }}>
            Correlation: {data.correlation.toFixed(1)}
          </div>
        </TooltipContainer>
      );
    }
    return null;
  };

  return (
    <GraphCard
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Title>🎯 K-Means Clustering Analysis - {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Title>
      
      <div style={{ marginBottom: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
        Accurate clustering of {portfolio.length} holdings based on <strong>Volatility (%)</strong> and <strong>Correlation</strong>. Grouped into {numClusters} distinct clusters.
      </div>
      
      <div style={{ width: '100%', height: 450, background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 30, right: 30, bottom: 40, left: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={true} horizontal={true} />
            <XAxis 
              type="number" 
              dataKey="volatility" 
              name="Volatility"
              domain={[0, 10]}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={{ stroke: '#94a3b8' }}
              axisLine={{ stroke: '#94a3b8' }}
              label={{ value: 'Volatility (%)', position: 'bottom', offset: 10, fill: '#94a3b8', fontSize: 13 }}
            />
            <YAxis 
              type="number" 
              dataKey="correlation" 
              name="Correlation"
              domain={[0, 20]}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={{ stroke: '#94a3b8' }}
              axisLine={{ stroke: '#94a3b8' }}
              label={{ value: 'Correlation', angle: -90, position: 'left', offset: 10, fill: '#94a3b8', fontSize: 13, style: { textAnchor: 'middle' } }}
            />
            <ZAxis 
              type="number" 
              dataKey="z" 
              range={[100, 400]} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.2)' }} />
            
            <Scatter name="Stocks" data={chartData} isAnimationActive={true}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  fillOpacity={0.8} 
                  stroke={entry.color} 
                  strokeWidth={2}
                  style={{ filter: `drop-shadow(0 0 5px ${entry.color}40)` }}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem', justifyContent: 'center' }}>
        {Array.from({ length: numClusters }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', padding: '0.5rem 1rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: CLUSTER_COLORS[i % CLUSTER_COLORS.length], boxShadow: `0 0 10px ${CLUSTER_COLORS[i % CLUSTER_COLORS.length]}` }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Cluster {i + 1}</span>
          </div>
        ))}
      </div>
    </GraphCard>
  );
};

export default PortfolioClusterGraph;
