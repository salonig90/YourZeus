import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { yfinanceService, StockData } from '../services/yfinanceService';
import { useAuth } from '../contexts/AuthContext';
import { fetchSectorStockSentiment, SectorSentimentResponse, StockSentimentItem, StockHeadlineData } from '../services/stockSentimentService';

/* ─── pulse animation ─── */
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const SectorStocksContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 80vh;
`;

const PageHeader = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SectorTitle = styled(motion.h1)`
  font-size: 3rem;
  background: ${props => props.theme.colors.accentPrimary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  font-weight: 800;
  letter-spacing: -1.5px;
`;

const BackButton = styled(motion.button)`
  background: transparent;
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.textPrimary};
  padding: 0.8rem 1.5rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  cursor: pointer;
  font-weight: 600;
  transition: ${props => props.theme.transitions.default};
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const RefreshButton = styled(motion.button)<{ isLoading?: boolean }>`
  background: ${props => props.theme.colors.accentPrimary};
  border: none;
  color: #000;
  padding: 0.8rem 1.5rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  cursor: ${props => props.isLoading ? 'not-allowed' : 'pointer'};
  font-weight: 700;
  transition: ${props => props.theme.transitions.default};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: ${props => props.isLoading ? 0.7 : 1};
  
  &:hover {
    transform: ${props => props.isLoading ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.theme.shadows.glow};
  }
`;

const SearchContainer = styled(motion.div)`
  background: ${props => props.theme.colors.cardBackground};
  backdrop-filter: blur(12px);
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 2rem;
  margin-bottom: 3rem;
  border: 1px solid ${props => props.theme.colors.border};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1.2rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.textPrimary};
  font-size: 1rem;
  transition: ${props => props.theme.transitions.default};
  
  &:focus {
    outline: none;
    border-color: #4facfe;
    box-shadow: ${props => props.theme.shadows.glow};
  }
`;

const ResultsContainer = styled(motion.div)`
  background: ${props => props.theme.colors.cardBackground};
  backdrop-filter: blur(12px);
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 2rem;
  border: 1px solid ${props => props.theme.colors.border};
  overflow-x: auto;
`;

const StockTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: ${props => props.theme.colors.textPrimary};
  
  th, td {
    padding: 1.2rem;
    text-align: left;
    border-bottom: 1px solid ${props => props.theme.colors.border};
  }
  
  th {
    font-weight: 700;
    color: ${props => props.theme.colors.textSecondary};
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 1px;
    background: rgba(255, 255, 255, 0.02);
  }
  
  tr:hover {
    background: rgba(255, 255, 255, 0.03);
  }
`;

const AddButton = styled.button<{ isAdded?: boolean }>`
  background: ${props => props.isAdded 
    ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)' 
    : 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)'};
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: ${props => props.isAdded ? 'default' : 'pointer'};
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    ${props => !props.isAdded && 'transform: translateY(-1px); box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);'}
  }
`;

const LoadingState = styled(motion.div)`
  text-align: center;
  padding: 3rem;
  color: #cccccc;
`;

const ErrorState = styled(motion.div)`
  text-align: center;
  padding: 2rem;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(255, 107, 107, 0.2);
`;

/* ======================== Sentiment Styled Components ======================== */

const SentimentSection = styled(motion.div)`
  margin-top: 4rem;
`;

const SentimentSectionTitle = styled(motion.h2)`
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: -1px;
  margin-bottom: 2rem;
  color: ${props => props.theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;

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

const GlassCard = styled(motion.div)`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.borderRadius.large};
  border: 1px solid ${props => props.theme.colors.border};
  backdrop-filter: blur(12px);
  box-shadow: ${props => props.theme.shadows.card};
  position: relative;
  overflow: hidden;
`;

const SentimentTableContainer = styled(GlassCard)`
  padding: 2rem;
  margin-bottom: 3rem;
  overflow-x: auto;
`;

const SentimentTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
  color: ${props => props.theme.colors.textPrimary};

  th {
    padding: 1rem 1.2rem;
    text-align: left;
    color: ${props => props.theme.colors.textSecondary};
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 1.5px;
    font-weight: 700;
  }

  td {
    padding: 1rem 1.2rem;
    font-size: 0.95rem;
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
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(0, 242, 254, 0.15);
  }
`;

const PredictionBadge = styled.div<{ type: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.8rem;
  border-radius: 16px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  white-space: nowrap;
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

const ScorePill = styled.span<{ type: string }>`
  padding: 0.25rem 0.6rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.75rem;
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

const ConfidenceMiniBar = styled.div`
  width: 80px;
  height: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  overflow: hidden;
  display: inline-block;
  margin-left: 0.5rem;
  vertical-align: middle;
`;

const ConfidenceMiniBarFill = styled.div<{ width: number; color: string }>`
  height: 100%;
  width: ${props => props.width}%;
  background: ${props => props.color};
  border-radius: 3px;
  transition: width 0.8s ease;
`;

const CountBadge = styled.span<{ type: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
  background: ${props => {
    if (props.type === 'positive') return 'rgba(0, 255, 163, 0.12)';
    if (props.type === 'negative') return 'rgba(255, 46, 99, 0.12)';
    return 'rgba(255, 193, 7, 0.12)';
  }};
  color: ${props => {
    if (props.type === 'positive') return '#00ffa3';
    if (props.type === 'negative') return '#ff2e63';
    return '#ffc107';
  }};
`;

/* ─── Headlines Section ─── */

const HeadlinesContainer = styled(GlassCard)`
  padding: 2rem;
  margin-bottom: 3rem;
  max-height: 500px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
`;

const HeadlinesTitle = styled.h3`
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

  &:last-child { margin-bottom: 0; }
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

const SectorStocks: React.FC = () => {
  const { sector } = useParams<{ sector: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToPortfolio, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [addedStocks, setAddedStocks] = useState<Set<string>>(new Set());

  // Sentiment state
  const [sentimentData, setSentimentData] = useState<SectorSentimentResponse | null>(null);
  const [sentimentLoading, setSentimentLoading] = useState(true);

  const fetchSectorStocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching stocks for sector: ${sector}`);
      const response = await yfinanceService.getSectorStocks(sector!);
      console.log('Received stocks:', response);
      setStocks(response);
    } catch (err) {
      console.error('Error fetching sector stocks:', err);
      setError('Failed to fetch stock data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [sector]);

  useEffect(() => {
    if (sector) {
      fetchSectorStocks();

      // Fetch sentiment data
      const loadSentiment = async () => {
        setSentimentLoading(true);
        try {
          const data = await fetchSectorStockSentiment(sector);
          setSentimentData(data);
        } catch (err) {
          console.error('Failed to load stock sentiment:', err);
        } finally {
          setSentimentLoading(false);
        }
      };
      loadSentiment();
    }
  }, [sector, fetchSectorStocks]);

  const handleRefreshPrices = async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8000/api/auth/stocks/sector/${sector}/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh prices');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const updatedStocks = data.stocks.map((stock: any) => ({
          symbol: stock.symbol,
          name: stock.name,
          currentPrice: stock.current_price,
          change: stock.change,
          changePercent: stock.change_percent,
          dayHigh: stock.day_high,
          dayLow: stock.day_low,
          peRatio: stock.pe_ratio,
          marketCap: stock.market_cap,
          volume: stock.volume
        }));
        setStocks(updatedStocks);
        alert('Stock prices refreshed and saved successfully!');
      } else {
        setError('Failed to refresh prices');
      }
    } catch (err) {
      console.error('Error refreshing prices:', err);
      setError('Failed to refresh prices. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredStocks = stocks.filter(stock =>
    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToPortfolio = (stock: StockData) => {
    if (!user) {
      alert('Please Sign Up or Login to add stocks to your portfolio.');
      navigate('/signup', { state: { from: location } });
      return;
    }

    addToPortfolio({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.currentPrice ?? 0,
      change: stock.change ?? 0,
      addedAt: new Date().toISOString(),
      sector: sector
    });
    setAddedStocks(new Set(addedStocks).add(stock.symbol));
  };

  if (!sector) {
    return <div>Invalid sector</div>;
  }

  const isUS = sector === 'us_stocks';
  const sectorName = sector.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: isUS ? 'USD' : 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  const formatLargeNumber = (val: number) => {
    if (isUS) {
      if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
      if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
      if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
      return `$${val.toLocaleString()}`;
    } else {
      // Indian numbering system (Lakhs/Crores)
      if (val >= 1e7) return `₹${(val / 1e7).toFixed(2)}Cr`;
      if (val >= 1e5) return `₹${(val / 1e5).toFixed(2)}L`;
      return `₹${val.toLocaleString('en-IN')}`;
    }
  };

  const getScoreType = (score: number): string => {
    if (score >= 0.05) return 'positive';
    if (score <= -0.05) return 'negative';
    return 'neutral';
  };

  const getConfColor = (prediction: string) => {
    if (prediction === 'Bullish') return '#00ffa3';
    if (prediction === 'Bearish') return '#ff2e63';
    return '#ffc107';
  };

  const renderSentimentTable = () => {
    if (!sentimentData) return null;

    const stockEntries = Object.entries(sentimentData.stocks);
    if (stockEntries.length === 0) return null;

    return (
      <SentimentTableContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <SentimentTable>
          <thead>
            <tr>
              <th>Stock</th>
              <th>Sentiment</th>
              <th>Score</th>
              <th>Prediction</th>
              <th>Confidence</th>
              <th style={{ textAlign: 'center' }}>👍</th>
              <th style={{ textAlign: 'center' }}>😐</th>
              <th style={{ textAlign: 'center' }}>👎</th>
              <th>Headlines</th>
            </tr>
          </thead>
          <tbody>
            {stockEntries.map(([symbol, sent]: [string, StockSentimentItem], idx: number) => {
              const scoreType = getScoreType(sent.overall_score);
              const confColor = getConfColor(sent.prediction);

              return (
                <tr key={symbol}>
                  <td style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                    {symbol.replace('.NS', '')}
                  </td>
                  <td>
                    <ScorePill type={scoreType}>
                      {sent.classification}
                    </ScorePill>
                  </td>
                  <td>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      color: scoreType === 'positive' ? '#00ffa3' : scoreType === 'negative' ? '#ff2e63' : '#ffc107'
                    }}>
                      {sent.overall_score > 0 ? '+' : ''}{(sent.overall_score * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td>
                    <PredictionBadge type={sent.prediction}>
                      {sent.prediction === 'Bullish' ? '📈' : sent.prediction === 'Bearish' ? '📉' : '➡️'}
                      {sent.prediction}
                    </PredictionBadge>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{sent.confidence}%</span>
                    <ConfidenceMiniBar>
                      <ConfidenceMiniBarFill width={sent.confidence} color={confColor} />
                    </ConfidenceMiniBar>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <CountBadge type="positive">{sent.positive_count}</CountBadge>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <CountBadge type="neutral">{sent.neutral_count}</CountBadge>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <CountBadge type="negative">{sent.negative_count}</CountBadge>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                      {sent.total_headlines} analyzed
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </SentimentTable>
      </SentimentTableContainer>
    );
  };

  const renderHeadlines = () => {
    if (!sentimentData || sentimentData.headlines.length === 0) return null;

    return (
      <HeadlinesContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <HeadlinesTitle>
          📰 Top Headlines
          <span style={{
            fontSize: '0.7rem',
            color: 'rgba(255,255,255,0.4)',
            fontWeight: 500,
            marginLeft: 'auto'
          }}>
            {sentimentData.headlines.length} articles analyzed
          </span>
        </HeadlinesTitle>
        {sentimentData.headlines.map((h: StockHeadlineData, i: number) => (
          <HeadlineItem
            key={i}
            sentiment={h.classification}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
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
      </HeadlinesContainer>
    );
  };

  return (
    <SectorStocksContainer>
      <PageHeader
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SectorTitle>{sectorName} STOCKS</SectorTitle>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <RefreshButton
            onClick={handleRefreshPrices}
            isLoading={refreshing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={refreshing}
          >
            {refreshing ? '⏳' : '🔄'} Refresh Prices
          </RefreshButton>
          <BackButton
            onClick={() => navigate('/stocks')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Back to Sectors
          </BackButton>
        </div>
      </PageHeader>

      <SearchContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <SearchInput
          type="text"
          placeholder={`Search ${isUS ? 'US' : 'Indian'} ${sectorName} companies (e.g., ${isUS ? 'NVDA, AAPL, MSFT' : (sector === 'it' ? 'HCL' : 'TATA')})`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchContainer>

      {loading && (
        <LoadingState
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading {sectorName} stocks data...</p>
        </LoadingState>
      )}

      {error && (
        <ErrorState
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <p>{error}</p>
          <button 
            onClick={fetchSectorStocks}
            style={{ 
              marginTop: '1rem', 
              padding: '0.5rem 1rem', 
              background: '#ff6b6b', 
              border: 'none', 
              borderRadius: '5px', 
              color: 'white', 
              cursor: 'pointer' 
            }}
          >
            Retry
          </button>
        </ErrorState>
      )}

      {!loading && !error && (
        <ResultsContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {filteredStocks.length > 0 ? (
            <StockTable>
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Symbol</th>
                  <th>Current Price</th>
                  <th>Today's Change</th>
                  <th>Change %</th>
                  <th>Day High</th>
                  <th>Day Low</th>
                  <th>P/E Ratio</th>
                  <th>Market Cap</th>
                  <th>Volume</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map((stock, index) => (
                  <tr key={index}>
                    <td>{stock.name}</td>
                    <td>{stock.symbol}</td>
                    <td>{formatCurrency(stock.currentPrice ?? 0)}</td>
                    <td style={{ color: (stock.change ?? 0) >= 0 ? '#4caf50' : '#f44336' }}>
                      {(stock.change ?? 0) >= 0 ? '+' : ''}{formatCurrency(stock.change ?? 0)}
                    </td>
                    <td style={{ color: (stock.changePercent ?? 0) >= 0 ? '#4caf50' : '#f44336' }}>
                      {(stock.changePercent ?? 0) >= 0 ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%
                    </td>
                    <td>{formatCurrency(stock.dayHigh ?? 0)}</td>
                    <td>{formatCurrency(stock.dayLow ?? 0)}</td>
                    <td>{(stock.peRatio ?? 0).toFixed(2)}</td>
                    <td>{formatLargeNumber(stock.marketCap ?? 0)}</td>
                    <td>{(stock.volume ?? 0).toLocaleString('en-US')}</td>
                    <td>
                      <AddButton 
                        isAdded={addedStocks.has(stock.symbol)}
                        onClick={() => !addedStocks.has(stock.symbol) && handleAddToPortfolio(stock)}
                        disabled={addedStocks.has(stock.symbol)}
                      >
                        {addedStocks.has(stock.symbol) ? '✓ Added' : 'Add'}
                      </AddButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </StockTable>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#cccccc' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <p>No stocks found matching your search criteria.</p>
            </div>
          )}
        </ResultsContainer>
      )}

      {/* ======================== Sentiment Analysis Section ======================== */}
      <SentimentSection
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <SentimentSectionTitle>
          🧠 Stock Sentiment Analysis <span>VADER + Rule-Based</span>
        </SentimentSectionTitle>

        {sentimentLoading ? (
          <GlassCard style={{ padding: '4rem', textAlign: 'center', marginBottom: '3rem' }}>
            <LoadingPulse>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
              <p>Scraping financial news &amp; analyzing sentiment for {sectorName} stocks...</p>
              <MethodBadge style={{ display: 'inline-flex', marginTop: '1rem' }}>
                ⚡ Sources: Moneycontrol · Economic Times · Financial News
              </MethodBadge>
            </LoadingPulse>
          </GlassCard>
        ) : sentimentData && (
          <>
            {renderSentimentTable()}
            {renderHeadlines()}

            {/* Metadata footer */}
            <div style={{
              display: 'flex',
              gap: '2rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              padding: '1rem 0',
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.3)',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              <span>📊 {sentimentData.metadata.stocks_analyzed} stocks analyzed</span>
              <span>📰 {sentimentData.metadata.total_analyzed} headlines processed</span>
              <span>🕐 {new Date(sentimentData.metadata.analysis_timestamp).toLocaleTimeString()}</span>
              <span>⚙️ {sentimentData.metadata.method}</span>
            </div>
          </>
        )}
      </SentimentSection>
    </SectorStocksContainer>
  );
};


export default SectorStocks;
