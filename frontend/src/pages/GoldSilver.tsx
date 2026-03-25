import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { 
  subscribeToMetalsUpdates, 
  MetalsData, 
  ChartData,
  calculateIndicators
} from '../services/metalsApi';
import { getStaticHistoricalData } from '../services/staticHistoricalData';
import { fetchMetalsSentiment, SentimentResponse, HeadlineData, MetalSentiment } from '../services/sentimentService';
import CorrelationChart from '../components/CorrelationChart';
import PriceTrendChart from '../components/PriceTrendChart';
import MetalsPredictionChart from '../components/MetalsPredictionChart';
import MonthlyPredictionTable from '../components/MonthlyPredictionTable';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const GoldSilverContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 0;
`;

const PageHeader = styled(motion.div)`
  margin-bottom: 4rem;
  
  h1 {
    font-size: 3.5rem;
    font-weight: 900;
    letter-spacing: -2px;
    margin-bottom: 1rem;
    background: ${props => props.theme.colors.accentPrimary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    color: ${props => props.theme.colors.textSecondary};
    font-size: 1.1rem;
    max-width: 600px;
  }
`;

const GlassCard = styled(motion.div)`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.borderRadius.large};
  border: 1px solid ${props => props.theme.colors.border};
  backdrop-filter: blur(12px);
  box-shadow: ${props => props.theme.shadows.card};
  position: relative;
  overflow: hidden;
`;

const LiveSection = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 4rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MetalCard = styled(GlassCard)<{ positive: boolean }>`
  padding: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, ${props => props.positive ? props.theme.colors.success : props.theme.colors.danger}08 0%, transparent 70%);
    z-index: -1;
  }
`;

const MetalIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.1));
`;

const MetalName = styled.h2`
  font-size: 1rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 4px;
  font-weight: 700;
`;

const PriceText = styled.div`
  font-size: 5rem;
  font-weight: 900;
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 1rem;
  letter-spacing: -3px;
  font-family: 'JetBrains Mono', monospace;
`;

const PriceChange = styled.div<{ positive: boolean }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.positive ? props.theme.colors.success : props.theme.colors.danger};
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.5rem 1.2rem;
  background: ${props => props.positive ? props.theme.colors.success : props.theme.colors.danger}15;
  border-radius: 12px;
  margin-bottom: 2rem;
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 2rem;
  margin-bottom: 4rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const PredictionTableContainer = styled(GlassCard)`
  padding: 3rem;
  margin-bottom: 4rem;
`;

const TableTitle = styled.h2`
  font-size: 1.8rem;
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 2.5rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px;
  
  th {
    padding: 1rem 1.5rem;
    text-align: left;
    color: ${props => props.theme.colors.textSecondary};
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 1.5px;
    font-weight: 700;
  }
  
  td {
    padding: 1.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: ${props => props.theme.colors.textPrimary};
    background: ${props => props.theme.colors.glass};
    
    &:first-child {
      border-radius: 12px 0 0 12px;
      border-left: 1px solid ${props => props.theme.colors.border};
    }
    
    &:last-child {
      border-radius: 0 12px 12px 0;
      border-right: 1px solid ${props => props.theme.colors.border};
    }
    
    border-top: 1px solid ${props => props.theme.colors.border};
    border-bottom: 1px solid ${props => props.theme.colors.border};
  }
  
  tr:hover td {
    background: rgba(255, 255, 255, 0.05);
    border-color: ${props => props.theme.colors.info}30;
  }
`;

/* ======================== Sentiment Styled Components ======================== */

const SectionTitle = styled(motion.h2)`
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: -1px;
  margin-bottom: 2rem;
  color: ${props => props.theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 1rem;

  span {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    padding: 0.4rem 1rem;
    background: linear-gradient(135deg, rgba(0, 242, 254, 0.15), rgba(79, 172, 254, 0.15));
    border: 1px solid rgba(0, 242, 254, 0.2);
    border-radius: 20px;
    color: #00f2fe;
    font-weight: 700;
  }
`;

const SentimentDashboard = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 4rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const SentimentPanel = styled(GlassCard)<{ prediction: string }>`
  padding: 2.5rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => {
      if (props.prediction === 'Bullish') return 'linear-gradient(90deg, #00ffa3, #10b981)';
      if (props.prediction === 'Bearish') return 'linear-gradient(90deg, #ff2e63, #ef4444)';
      return 'linear-gradient(90deg, #ffc107, #f59e0b)';
    }};
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const PanelTitle = styled.h3`
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: ${props => props.theme.colors.textSecondary};
  font-weight: 700;
`;

const PredictionBadge = styled.div<{ type: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  background: ${props => {
    if (props.type === 'Bullish') return 'rgba(0, 255, 163, 0.15)';
    if (props.type === 'Bearish') return 'rgba(255, 46, 99, 0.15)';
    return 'rgba(255, 193, 7, 0.15)';
  }};
  color: ${props => {
    if (props.type === 'Bullish') return '#00ffa3';
    if (props.type === 'Bearish') return '#ff2e63';
    return '#ffc107';
  }};
  border: 1px solid ${props => {
    if (props.type === 'Bullish') return 'rgba(0, 255, 163, 0.3)';
    if (props.type === 'Bearish') return 'rgba(255, 46, 99, 0.3)';
    return 'rgba(255, 193, 7, 0.3)';
  }};
`;

const ScoreDisplay = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const ScoreValue = styled.div<{ sentiment: string }>`
  font-size: 3.5rem;
  font-weight: 900;
  letter-spacing: -2px;
  font-family: 'JetBrains Mono', monospace;
  color: ${props => {
    if (props.sentiment.includes('Bullish')) return '#00ffa3';
    if (props.sentiment.includes('Bearish')) return '#ff2e63';
    return '#ffc107';
  }};
`;

const ScoreLabel = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  margin-top: 0.5rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ConfidenceBar = styled.div`
  margin: 1.5rem 0;
`;

const ConfidenceLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${props => props.theme.colors.textSecondary};
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const ConfidenceTrack = styled.div`
  height: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  overflow: hidden;
`;

const ConfidenceFill = styled(motion.div)<{ confidence: number; color: string }>`
  height: 100%;
  width: ${props => props.confidence}%;
  background: ${props => props.color};
  border-radius: 4px;
  background-size: 200% 100%;
`;

const SentimentBreakdown = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
`;

const BreakdownItem = styled.div<{ type: string }>`
  background: rgba(255, 255, 255, 0.03);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;

  .count {
    font-size: 1.8rem;
    font-weight: 900;
    font-family: 'JetBrains Mono', monospace;
    color: ${props => {
      if (props.type === 'positive') return '#00ffa3';
      if (props.type === 'negative') return '#ff2e63';
      return '#ffc107';
    }};
  }

  .label {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: ${props => props.theme.colors.textSecondary};
    font-weight: 700;
    margin-top: 0.3rem;
  }
`;

const SentimentBarChart = styled.div`
  display: flex;
  height: 12px;
  border-radius: 6px;
  overflow: hidden;
  margin: 1.5rem 0 0.5rem;
  gap: 2px;
`;

const BarSegment = styled.div<{ width: number; color: string }>`
  width: ${props => props.width}%;
  background: ${props => props.color};
  min-width: ${props => props.width > 0 ? '4px' : '0'};
  transition: width 0.8s ease;
`;

/* ======================== Headlines Section ======================== */

const HeadlinesSection = styled.div`
  margin-bottom: 4rem;
`;

const HeadlinesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const HeadlinesPanel = styled(GlassCard)`
  padding: 2rem;
  max-height: 500px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
`;

const HeadlinesPanelTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: ${props => props.theme.colors.textPrimary};
`;

const HeadlineItem = styled(motion.div)<{ sentiment: string }>`
  padding: 1rem 1.2rem;
  margin-bottom: 0.8rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-left: 3px solid ${props => {
    if (props.sentiment === 'positive') return '#00ffa3';
    if (props.sentiment === 'negative') return '#ff2e63';
    return '#ffc107';
  }};
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateX(4px);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const HeadlineText = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  line-height: 1.5;
  margin-bottom: 0.5rem;
`;

const HeadlineMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.7rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ScorePill = styled.span<{ type: string }>`
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.65rem;
  font-family: 'JetBrains Mono', monospace;
  background: ${props => {
    if (props.type === 'positive') return 'rgba(0, 255, 163, 0.15)';
    if (props.type === 'negative') return 'rgba(255, 46, 99, 0.15)';
    return 'rgba(255, 193, 7, 0.15)';
  }};
  color: ${props => {
    if (props.type === 'positive') return '#00ffa3';
    if (props.type === 'negative') return '#ff2e63';
    return '#ffc107';
  }};
`;

const MethodBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  font-size: 0.7rem;
  color: ${props => props.theme.colors.textSecondary};
  font-weight: 600;
  margin-top: 1rem;
`;

const LoadingPulse = styled.div`
  animation: ${pulse} 1.5s ease-in-out infinite;
  text-align: center;
  padding: 3rem;
  color: ${props => props.theme.colors.textSecondary};
`;

/* ======================== Component ======================== */

const GoldSilver: React.FC = () => {
  const [metalsData, setMetalsData] = useState<MetalsData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [sentimentData, setSentimentData] = useState<SentimentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sentimentLoading, setSentimentLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const unsubscribe = subscribeToMetalsUpdates(
      (data) => {
        setMetalsData(data);
        setLoading(false);
        setLastUpdate(new Date());
      },
      30000
    );

    const loadCharts = () => {
      const data = getStaticHistoricalData();
      data.goldHistory = calculateIndicators(data.goldHistory);
      data.silverHistory = calculateIndicators(data.silverHistory);
      setChartData(data);
    };

    const loadSentiment = async () => {
      setSentimentLoading(true);
      try {
        const data = await fetchMetalsSentiment();
        setSentimentData(data);
      } catch (err) {
        console.error('Failed to load sentiment:', err);
      } finally {
        setSentimentLoading(false);
      }
    };

    loadCharts();
    loadSentiment();
    return unsubscribe;
  }, []);

  const formatCurrency = (val: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(val);
  };

  const getPredictionData = (history: any[]) => {
    if (!history || history.length < 5) return { price: 0, change: 0, direction: 'up' };
    const last = history[history.length - 1].price;
    const prev = history[history.length - 5].price;
    const predicted = last + (last - prev) / 2;
    return {
      price: predicted,
      change: ((predicted - last) / last) * 100,
      direction: predicted >= last ? 'up' : 'down'
    };
  };

  const goldPred = getPredictionData(chartData?.goldHistory || []);
  const silverPred = getPredictionData(chartData?.silverHistory || []);

  const renderSentimentPanel = (
    metalName: string, 
    icon: string, 
    sentiment: MetalSentiment
  ) => {
    const total = sentiment.total_headlines || 1;
    const posPercent = (sentiment.positive_count / total) * 100;
    const negPercent = (sentiment.negative_count / total) * 100;
    const neuPercent = (sentiment.neutral_count / total) * 100;
    
    const confColor = sentiment.prediction === 'Bullish' ? '#00ffa3' : 
                       sentiment.prediction === 'Bearish' ? '#ff2e63' : '#ffc107';

    return (
      <SentimentPanel 
        prediction={sentiment.prediction}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <PanelHeader>
          <PanelTitle>{icon} {metalName} Sentiment</PanelTitle>
          <PredictionBadge type={sentiment.prediction}>
            {sentiment.prediction === 'Bullish' ? '📈' : sentiment.prediction === 'Bearish' ? '📉' : '➡️'}
            {sentiment.prediction}
          </PredictionBadge>
        </PanelHeader>

        <ScoreDisplay>
          <ScoreValue sentiment={sentiment.classification}>
            {sentiment.classification}
          </ScoreValue>
          <ScoreLabel>
            Score: {(sentiment.overall_score * 100).toFixed(1)}%
          </ScoreLabel>
        </ScoreDisplay>

        <ConfidenceBar>
          <ConfidenceLabel>
            <span>Confidence</span>
            <span>{sentiment.confidence}%</span>
          </ConfidenceLabel>
          <ConfidenceTrack>
            <ConfidenceFill 
              confidence={sentiment.confidence} 
              color={confColor}
              initial={{ width: 0 }}
              animate={{ width: `${sentiment.confidence}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </ConfidenceTrack>
        </ConfidenceBar>

        <SentimentBarChart>
          <BarSegment width={posPercent} color="#00ffa3" />
          <BarSegment width={neuPercent} color="#ffc107" />
          <BarSegment width={negPercent} color="#ff2e63" />
        </SentimentBarChart>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem' }}>
          <span>Positive</span>
          <span>Neutral</span>
          <span>Negative</span>
        </div>

        <SentimentBreakdown>
          <BreakdownItem type="positive">
            <div className="count">{sentiment.positive_count}</div>
            <div className="label">Positive</div>
          </BreakdownItem>
          <BreakdownItem type="neutral">
            <div className="count">{sentiment.neutral_count}</div>
            <div className="label">Neutral</div>
          </BreakdownItem>
          <BreakdownItem type="negative">
            <div className="count">{sentiment.negative_count}</div>
            <div className="label">Negative</div>
          </BreakdownItem>
        </SentimentBreakdown>
      </SentimentPanel>
    );
  };

  const renderHeadlines = (headlines: HeadlineData[], metalName: string, icon: string) => {
    return (
      <HeadlinesPanel>
        <HeadlinesPanelTitle>
          {icon} {metalName} Headlines
          <span style={{ 
            fontSize: '0.7rem', 
            color: 'rgba(255,255,255,0.4)', 
            fontWeight: 500,
            marginLeft: 'auto'
          }}>
            {headlines.length} articles
          </span>
        </HeadlinesPanelTitle>
        {headlines.map((h, i) => (
          <HeadlineItem
            key={i}
            sentiment={h.classification}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <HeadlineText>{h.headline}</HeadlineText>
            <HeadlineMeta>
              <span>{h.source}</span>
              <ScorePill type={h.classification}>
                {h.combined_score > 0 ? '+' : ''}{(h.combined_score * 100).toFixed(0)}%
              </ScorePill>
            </HeadlineMeta>
          </HeadlineItem>
        ))}
      </HeadlinesPanel>
    );
  };

  return (
    <GoldSilverContainer>
      <PageHeader
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1>Commodity Intelligence</h1>
        <p>Real-time precious metals tracking, sentiment analysis, and advanced predictive analytics powered by Zeus's market engine.</p>
      </PageHeader>

      {/* Live Prices Section */}
      <LiveSection>
        {loading ? (
          <GlassCard style={{ padding: '4rem', gridColumn: 'span 2', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📡</div>
            <p style={{ color: '#94a3b8' }}>Establishing secure connection to market data feeds...</p>
          </GlassCard>
        ) : metalsData && (
          <>
            <MetalCard 
              positive={metalsData.gold.change >= 0}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '0.8rem', fontWeight: 800 }}>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}
                />
                LIVE
              </div>
              <MetalIcon>💰</MetalIcon>
              <MetalName>Gold Spot (XAU/USD)</MetalName>
              <PriceText>{formatCurrency(metalsData.gold.price)}</PriceText>
              <PriceChange positive={metalsData.gold.change >= 0}>
                {metalsData.gold.change >= 0 ? '▲' : '▼'} 
                {Math.abs(metalsData.gold.changePercent).toFixed(2)}%
              </PriceChange>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>
                Last updated at {lastUpdate.toLocaleTimeString()}
              </div>
            </MetalCard>

            <MetalCard 
              positive={metalsData.silver.change >= 0}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '0.8rem', fontWeight: 800 }}>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}
                />
                LIVE
              </div>
              <MetalIcon>🥈</MetalIcon>
              <MetalName>Silver Spot (XAG/USD)</MetalName>
              <PriceText>{formatCurrency(metalsData.silver.price, 4)}</PriceText>
              <PriceChange positive={metalsData.silver.change >= 0}>
                {metalsData.silver.change >= 0 ? '▲' : '▼'} 
                {Math.abs(metalsData.silver.changePercent).toFixed(2)}%
              </PriceChange>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>
                Last updated at {lastUpdate.toLocaleTimeString()}
              </div>
            </MetalCard>
          </>
        )}
      </LiveSection>

      {/* ======================== Sentiment Analysis Section ======================== */}
      <SectionTitle
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        🧠 Sentiment Analysis <span>VADER + Rule-Based</span>
      </SectionTitle>

      {sentimentLoading ? (
        <GlassCard style={{ padding: '4rem', textAlign: 'center', marginBottom: '4rem' }}>
          <LoadingPulse>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
            <p>Scraping financial news & analyzing sentiment...</p>
            <MethodBadge style={{ display: 'inline-flex', marginTop: '1rem' }}>
              ⚡ Sources: Moneycontrol · Economic Times · LiveMint
            </MethodBadge>
          </LoadingPulse>
        </GlassCard>
      ) : sentimentData && (
        <>
          {/* Sentiment Dashboard */}
          <SentimentDashboard>
            {renderSentimentPanel('Gold', '💰', sentimentData.gold.sentiment)}
            {renderSentimentPanel('Silver', '🥈', sentimentData.silver.sentiment)}
          </SentimentDashboard>

          {/* Headlines Section */}
          <HeadlinesSection>
            <SectionTitle
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              📰 Live Scraped Headlines <span>Sentiment Scored</span>
            </SectionTitle>
            <HeadlinesGrid>
              {renderHeadlines(sentimentData.gold.headlines, 'Gold', '💰')}
              {renderHeadlines(sentimentData.silver.headlines, 'Silver', '🥈')}
            </HeadlinesGrid>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
              <MethodBadge>
                🔬 Method: {sentimentData.metadata.method} · {sentimentData.metadata.total_analyzed} headlines analyzed · Sources: {sentimentData.metadata.sources_used.length}
              </MethodBadge>
            </div>
          </HeadlinesSection>
        </>
      )}

      {/* Technical Analysis */}
      <AnalyticsGrid>
        <PriceTrendChart data={chartData?.goldHistory || []} title="Gold Technical Analysis" color="#38bdf8" icon="📈" />
        {chartData && <CorrelationChart data={chartData.correlation} />}
      </AnalyticsGrid>

      {/* Predictions Table */}
      <PredictionTableContainer>
        <TableTitle>
          Predictive Modeling <span>AI Forecasts</span>
        </TableTitle>
        <StyledTable>
          <thead>
            <tr>
              <th>Metal</th>
              <th>Current Price</th>
              <th>Target Price</th>
              <th>Expected ROI</th>
              <th>Confidence Score</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Gold Spot</td>
              <td>{formatCurrency(metalsData?.gold.price || 0)}</td>
              <td>{formatCurrency(goldPred.price)}</td>
              <td style={{ color: '#10b981' }}>+{goldPred.change.toFixed(2)}%</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '85%', height: '100%', background: '#10b981' }} />
                  </div>
                  <span>85%</span>
                </div>
              </td>
            </tr>
            <tr>
              <td>Silver Spot</td>
              <td>{formatCurrency(metalsData?.silver.price || 0, 4)}</td>
              <td>{formatCurrency(silverPred.price, 4)}</td>
              <td style={{ color: '#10b981' }}>+{silverPred.change.toFixed(2)}%</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '72%', height: '100%', background: '#f59e0b' }} />
                  </div>
                  <span>72%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </StyledTable>
      </PredictionTableContainer>

      <AnalyticsGrid>
        <MetalsPredictionChart 
          data={chartData?.goldHistory || []} 
          title="Gold Price Forecast" 
          color="#38bdf8" 
          icon="⚡" 
        />
        <MonthlyPredictionTable />
      </AnalyticsGrid>
    </GoldSilverContainer>
  );
};

export default GoldSilver;