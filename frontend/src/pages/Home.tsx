import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import PriceTrendChart from '../components/PriceTrendChart';
<<<<<<< HEAD
import MutualFunds from '../components/MutualFunds';
import MarketIndices from '../components/MarketIndices';
import { fetchLiveMetalsPrices, MetalsData } from '../services/metalsApi';
import { yfinanceService, StockData, NewsItem } from '../services/yfinanceService';
=======
import { fetchLiveMetalsPrices, MetalsData } from '../services/metalsApi';
import { yfinanceService, StockData } from '../services/yfinanceService';
>>>>>>> 7bc85fc (Resolved merge)
import { getStaticHistoricalData } from '../services/staticHistoricalData';

/* ─── keyframe animations ─── */
const float = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.05); }
`;
<<<<<<< HEAD
//frontend-css
=======

>>>>>>> 7bc85fc (Resolved merge)
const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
`;

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const scanLine = keyframes`
  0% { top: -10%; }
  100% { top: 110%; }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

/* ─── layout ─── */
const HomeContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 8rem 2rem 4rem;
  position: relative;
`;

const NeuralBackground = styled.div`
  position: fixed;
  inset: 0;
  z-index: -1;
  background: radial-gradient(circle at 20% 20%, rgba(0, 242, 254, 0.05) 0%, transparent 40%),
              radial-gradient(circle at 80% 80%, rgba(112, 40, 228, 0.05) 0%, transparent 40%);
  pointer-events: none;
`;

/* ─── hero ─── */
const HeroSection = styled(motion.section)`
  text-align: center;
  margin-bottom: 8rem;
  position: relative;
  min-height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const OrbField = styled.div`
  position: absolute;
  inset: -60px;
  pointer-events: none;
  overflow: hidden;
`;

const Orb = styled.div<{ size: number; x: number; y: number; delay: number; color: string }>`
  position: absolute;
  width: ${p => p.size}px;
  height: ${p => p.size}px;
  left: ${p => p.x}%;
  top: ${p => p.y}%;
  border-radius: 50%;
  background: ${p => p.color};
  filter: blur(${p => p.size * 0.6}px);
  animation: ${float} ${p => 4 + p.delay}s ease-in-out infinite;
  animation-delay: ${p => p.delay}s;
  opacity: 0.5;
`;

const RingOrbit = styled.div`
  position: absolute;
  width: 500px;
  height: 500px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(0, 242, 254, 0.08);
  border-radius: 50%;
  animation: ${rotate} 30s linear infinite;
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    background: #00f2fe;
    border-radius: 50%;
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
    box-shadow: 0 0 20px #00f2fe, 0 0 60px rgba(0,242,254,0.3);
  }
`;

const RingOrbit2 = styled(RingOrbit)`
  width: 340px;
  height: 340px;
  border-color: rgba(112, 40, 228, 0.1);
  animation-duration: 22s;
  animation-direction: reverse;

  &::after {
    background: #7028e4;
    box-shadow: 0 0 20px #7028e4, 0 0 60px rgba(112,40,228,0.3);
  }
`;

const HeroTitle = styled(motion.h1)`
  font-size: clamp(3rem, 10vw, 7rem);
  font-weight: 950;
  line-height: 0.95;
  letter-spacing: -4px;
  text-transform: uppercase;
  position: relative;
  z-index: 2;
  background: linear-gradient(
    90deg,
    #00f2fe 0%,
    #4facfe 25%,
    #fff 50%,
    #4facfe 75%,
    #00f2fe 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 6s linear infinite;
`;

const HeroSubLine = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  z-index: 2;
`;

const StatusDot = styled.span<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${p => p.color};
  box-shadow: 0 0 12px ${p => p.color};
  animation: ${pulse} 2s ease-in-out infinite;
`;

const StatusText = styled.span`
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
`;

const HeroDivider = styled(motion.div)`
  width: 80px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,242,254,0.6), transparent);
  margin: 2rem auto;
  z-index: 2;
`;

const HeroMetrics = styled(motion.div)`
  display: flex;
  gap: 3rem;
  margin-top: 0.5rem;
  z-index: 2;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const MetricItem = styled.div`
  text-align: center;

  .value {
    font-size: 1.6rem;
    font-weight: 900;
    font-family: 'JetBrains Mono', monospace;
    background: linear-gradient(135deg, #fff, rgba(255,255,255,0.7));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .label {
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    margin-top: 4px;
  }
`;

/* ─── grid / cards (unchanged) ─── */
const GridContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 2rem;
  margin-bottom: 4rem;
`;

const BaseCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 40px;
  padding: 2.5rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%);
    pointer-events: none;
  }
`;

<<<<<<< HEAD
const MarketCard = styled(BaseCard) <{ positive: boolean }>`
=======
const MarketCard = styled(BaseCard)<{ positive: boolean }>`
>>>>>>> 7bc85fc (Resolved merge)
  grid-column: span 3;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (max-width: 1024px) { grid-column: span 6; }
  @media (max-width: 640px) { grid-column: span 12; }

  .label {
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 2px;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
  }

  .price {
    font-size: 2rem;
    font-weight: 900;
    font-family: 'JetBrains Mono', monospace;
    color: #fff;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.9rem;
    font-weight: 800;
    color: ${props => props.positive ? '#00ffa3' : '#ff2e63'};
    
    &::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 10px currentColor;
    }
  }
`;

const ChartCard = styled(BaseCard)`
  grid-column: span 8;
  @media (max-width: 1024px) { grid-column: span 12; }
`;

const ListCard = styled(BaseCard)`
  grid-column: span 4;
  @media (max-width: 1024px) { grid-column: span 12; }
`;

const MatrixCard = styled(BaseCard)`
  grid-column: span 2;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;

  .icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    filter: grayscale(100%);
    opacity: 0.5;
    transition: all 0.3s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    color: #fff;
    transform: translateY(-5px);
    border-color: rgba(0, 242, 254, 0.3);

    .icon {
      filter: grayscale(0%);
      opacity: 1;
      color: #00f2fe;
    }
  }

  @media (max-width: 1024px) { grid-column: span 3; }
  @media (max-width: 768px) { grid-column: span 4; }
  @media (max-width: 480px) { grid-column: span 6; }
`;

const IndicesCarousel = styled(motion.div)`
  grid-column: span 12;
  display: flex;
  gap: 2rem;
  overflow-x: auto;
  padding-bottom: 2rem;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const IndexCard = styled(motion.div)`
  flex: 0 0 280px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 30px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .name {
    font-size: 1rem;
    font-weight: 800;
    color: #fff;
  }

  .value {
    font-size: 1.8rem;
    font-weight: 900;
    font-family: 'JetBrains Mono', monospace;
  }

  .change {
    font-size: 1rem;
    font-weight: 700;
  }
`;

/* ─── sector spotlight (existing) ─── */
const SectorSpotlight = styled(BaseCard)`
  grid-column: span 12;
  display: grid;
  grid-template-columns: 1fr 2fr;
  align-items: center;
  gap: 4rem;

  .icon {
    font-size: 6rem;
    text-align: center;
  }

  .title {
    font-size: 2rem;
    font-weight: 900;
    margin-bottom: 1rem;
  }

  .description {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 2rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    .icon { font-size: 4rem; }
  }
`;

/* ─── NEW: sections below sector spotlight ─── */
const InsightsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 3rem;

  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px)  { grid-template-columns: 1fr; }
`;

const InsightCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 30px;
  padding: 2.5rem;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  &::after {
    content: '';
    position: absolute;
    top: -10%;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(0,242,254,0.4), transparent);
    animation: ${scanLine} 4s linear infinite;
  }

  &:hover {
    transform: translateY(-8px);
    border-color: rgba(0, 242, 254, 0.2);
    background: rgba(255, 255, 255, 0.04);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  }

  .insight-icon {
    font-size: 2.5rem;
    margin-bottom: 1.2rem;
  }

  .insight-title {
    font-size: 1.1rem;
    font-weight: 900;
    letter-spacing: -0.5px;
    margin-bottom: 0.8rem;
    color: #fff;
  }

  .insight-desc {
    font-size: 0.85rem;
    color: rgba(255,255,255,0.45);
    line-height: 1.7;
  }

  .insight-tag {
    display: inline-block;
    margin-top: 1.2rem;
    padding: 0.3rem 0.9rem;
    border-radius: 100px;
    font-size: 0.6rem;
    font-weight: 900;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
`;

const GlowBanner = styled(motion.div)`
  margin-top: 4rem;
  padding: 3.5rem;
  border-radius: 40px;
  background: linear-gradient(135deg, rgba(0,242,254,0.08) 0%, rgba(112,40,228,0.08) 100%);
  border: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(0,242,254,0.05) 0%, transparent 50%, rgba(112,40,228,0.05) 100%);
    background-size: 200% 100%;
    animation: ${gradientShift} 6s ease infinite;
    pointer-events: none;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const BannerText = styled.div`
  position: relative;
  z-index: 1;

  h3 {
    font-size: 1.6rem;
    font-weight: 950;
    letter-spacing: -1px;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.9rem;
    color: rgba(255,255,255,0.5);
    max-width: 480px;
    line-height: 1.6;
  }
`;

const BannerButton = styled(motion.button)`
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 100px;
  font-weight: 900;
  font-size: 0.8rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  color: #000;
  white-space: nowrap;
`;

const QuickStatsRow = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-top: 3rem;

  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px)  { grid-template-columns: 1fr; }
`;

const StatBox = styled(motion.div)`
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 24px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(0,242,254,0.2);
    transform: translateY(-4px);
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 950;
    font-family: 'JetBrains Mono', monospace;
    background: linear-gradient(135deg, #00f2fe, #4facfe);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .stat-label {
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    margin-top: 0.5rem;
  }
`;

<<<<<<< HEAD
const NewsListCard = styled(BaseCard)`
  grid-column: span 8;
  @media (max-width: 1024px) { grid-column: span 12; }
`;

const NewsItemRow = styled(motion.div)`
  padding: 1.2rem;
  background: rgba(255,255,255,0.02);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255,255,255,0.05);
    border-color: rgba(0, 242, 254, 0.2);
    transform: translateX(10px);
  }
`;

=======
>>>>>>> 7bc85fc (Resolved merge)

/* ─── component ─── */
const Home: React.FC = () => {
  const navigate = useNavigate();
  const [metals, setMetals] = useState<MetalsData | null>(null);
  const [trending, setTrending] = useState<StockData[]>([]);
<<<<<<< HEAD
  const [news, setNews] = useState<NewsItem[]>([]);
=======
>>>>>>> 7bc85fc (Resolved merge)
  const historicalData = getStaticHistoricalData();

  useEffect(() => {
    const loadData = async () => {
      try {
        const metalsData = await fetchLiveMetalsPrices();
        setMetals(metalsData);
        if (trending.length === 0) {
<<<<<<< HEAD
          const itStocks = await yfinanceService.getSectorStocks('information technology');
          setTrending(itStocks.slice(0, 5));
        }

        // Load latest news
        const newsData = await yfinanceService.getNews();
        setNews(newsData.slice(0, 5));
=======
          const itStocks = await yfinanceService.getSectorStocks('it');
          setTrending(itStocks.slice(0, 5));
        }
>>>>>>> 7bc85fc (Resolved merge)
      } catch (err) {
        console.error('Error loading home data:', err);
      }
    };
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [trending.length]);

  return (
    <HomeContainer>
      <NeuralBackground />

      {/* ───── HERO ───── */}
      <HeroSection
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <OrbField>
          <Orb size={120} x={10} y={20} delay={0} color="rgba(0,242,254,0.25)" />
<<<<<<< HEAD
          <Orb size={80} x={75} y={10} delay={1.5} color="rgba(112,40,228,0.3)" />
          <Orb size={60} x={85} y={70} delay={0.8} color="rgba(0,242,254,0.2)" />
          <Orb size={100} x={20} y={75} delay={2} color="rgba(79,172,254,0.2)" />
          <Orb size={40} x={50} y={5} delay={1} color="rgba(0,255,163,0.15)" />
          <Orb size={50} x={60} y={80} delay={2.5} color="rgba(255,46,99,0.15)" />
=======
          <Orb size={80}  x={75} y={10} delay={1.5} color="rgba(112,40,228,0.3)" />
          <Orb size={60}  x={85} y={70} delay={0.8} color="rgba(0,242,254,0.2)" />
          <Orb size={100} x={20} y={75} delay={2} color="rgba(79,172,254,0.2)" />
          <Orb size={40}  x={50} y={5}  delay={1} color="rgba(0,255,163,0.15)" />
          <Orb size={50}  x={60} y={80} delay={2.5} color="rgba(255,46,99,0.15)" />
>>>>>>> 7bc85fc (Resolved merge)
          <RingOrbit />
          <RingOrbit2 />
        </OrbField>

        <HeroSubLine
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <StatusDot color="#00ffa3" />
          <StatusText>Systems Online • All Markets Active</StatusText>
        </HeroSubLine>

        <HeroTitle
          initial={{ y: 50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, type: 'spring', stiffness: 80 }}
        >
          Zeus
        </HeroTitle>

        <HeroDivider
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        />

        <HeroMetrics
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <MetricItem>
            <div className="value">24/7</div>
            <div className="label">Market Watch</div>
          </MetricItem>
          <MetricItem>
            <div className="value">6+</div>
            <div className="label">Sectors Tracked</div>
          </MetricItem>
          <MetricItem>
            <div className="value">Real-Time</div>
            <div className="label">Price Feeds</div>
          </MetricItem>
          <MetricItem>
            <div className="value">AI</div>
            <div className="label">Powered Insights</div>
          </MetricItem>
        </HeroMetrics>
      </HeroSection>

      {/* ───── MARKET CARDS ───── */}
      <GridContainer
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        {metals ? (
          <>
<<<<<<< HEAD
            <MarketCard
=======
            <MarketCard 
>>>>>>> 7bc85fc (Resolved merge)
              positive={metals.gold.change >= 0}
              whileHover={{ y: -10, background: 'rgba(255, 255, 255, 0.04)' }}
            >
              <div className="label">XAU Protocol</div>
              <div className="price">${metals.gold.price.toLocaleString()}</div>
              <div className="status">
                {metals.gold.changePercent.toFixed(2)}% VECTOR
              </div>
            </MarketCard>
<<<<<<< HEAD
            <MarketCard
=======
            <MarketCard 
>>>>>>> 7bc85fc (Resolved merge)
              positive={metals.silver.change >= 0}
              whileHover={{ y: -10, background: 'rgba(255, 255, 255, 0.04)' }}
            >
              <div className="label">XAG Protocol</div>
              <div className="price">${metals.silver.price.toLocaleString()}</div>
              <div className="status">
                {metals.silver.changePercent.toFixed(2)}% VECTOR
              </div>
            </MarketCard>
          </>
        ) : (
          <div style={{ gridColumn: 'span 6', height: '200px', background: 'rgba(255,255,255,0.02)', borderRadius: '40px' }} />
        )}
<<<<<<< HEAD

=======
        
>>>>>>> 7bc85fc (Resolved merge)
        <MarketCard positive={true} whileHover={{ y: -10, background: 'rgba(255, 255, 255, 0.04)' }}>
          <div className="label">SPX Stream</div>
          <div className="price">5,137.08</div>
          <div className="status">0.80% UPLINK</div>
        </MarketCard>
<<<<<<< HEAD

=======
        
>>>>>>> 7bc85fc (Resolved merge)
        <MarketCard positive={false} whileHover={{ y: -10, background: 'rgba(255, 255, 255, 0.04)' }}>
          <div className="label">IXIC Stream</div>
          <div className="price">16,274.94</div>
          <div className="status">-0.12% DOWNLINK</div>
        </MarketCard>

<<<<<<< HEAD
=======
        <ChartCard>
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>
              Technical Analysis <span>Neural Stream</span>
            </h2>
          </div>
          <PriceTrendChart 
            data={historicalData.goldHistory} 
            title="" 
            color="#00f2fe" 
            icon=""
          />
        </ChartCard>

>>>>>>> 7bc85fc (Resolved merge)
        <ListCard>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2rem' }}>
            Active Entities
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {trending.map((stock, idx) => (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + idx * 0.1 }}
<<<<<<< HEAD
                onClick={() => navigate(`/vectors/${stock.symbol}`)}
=======
                onClick={() => navigate(`/stocks/${stock.sector || 'it'}`)}
>>>>>>> 7bc85fc (Resolved merge)
                style={{
                  padding: '1.2rem',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  border: '1px solid transparent'
                }}
                whileHover={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(0, 242, 254, 0.2)', x: 10 }}
              >
                <div>
                  <div style={{ fontWeight: 900, color: '#fff' }}>{stock.symbol}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{stock.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
<<<<<<< HEAD
                  <div style={{ fontWeight: 900, fontFamily: 'JetBrains Mono, monospace' }}>${(stock.currentPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
=======
                  <div style={{ fontWeight: 800, fontFamily: 'JetBrains Mono' }}>{yfinanceService.formatStockPrice(stock.currentPrice || 0, stock.symbol)}</div>
>>>>>>> 7bc85fc (Resolved merge)
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: (stock.change || 0) >= 0 ? '#00ffa3' : '#ff2e63' }}>
                    {(stock.change || 0) >= 0 ? '+' : ''}{(stock.changePercent || 0).toFixed(2)}%
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ListCard>
<<<<<<< HEAD

        <NewsListCard>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Intelligence Stream
            <Link to="/news" style={{ fontSize: '0.65rem', color: '#00f2fe', textDecoration: 'none', borderBottom: '1px solid currentColor' }}>Full Log →</Link>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {news.length > 0 ? news.map((item, idx) => (
              <NewsItemRow
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + idx * 0.1 }}
                onClick={() => item.url && window.open(item.url, '_blank')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#fff', lineHeight: '1.3' }}>{item.title}</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(0,242,254,0.6)', textTransform: 'uppercase', padding: '0.2rem 0.5rem', background: 'rgba(0,242,254,0.1)', borderRadius: '6px' }}>{item.source}</div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.category}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{item.date}</span>
                </div>
              </NewsItemRow>
            )) : (
              <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.3 }}>
                <StatusText>Connecting to Neural Feed...</StatusText>
              </div>
            )}
          </div>
        </NewsListCard>

        <div style={{ gridColumn: 'span 12', marginTop: '2rem' }}>
          <MarketIndices />
        </div>
=======
>>>>>>> 7bc85fc (Resolved merge)
      </GridContainer>

      {/* ───── MARKET MATRIX ───── */}
      <GridContainer
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.0 }}
      >
        <h2 style={{ gridColumn: 'span 12', fontSize: '1.2rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Market Matrix
        </h2>
        {[
<<<<<<< HEAD
          { name: 'Automobile', icon: '🚗', path: '/vectors/automobile' },
          { name: 'Banking', icon: '🏦', path: '/vectors/banking' },
          { name: 'Finance', icon: '💰', path: '/vectors/finance' },
          { name: 'Energy', icon: '⚡', path: '/vectors/energy' },
          { name: 'Pharma', icon: '💊', path: '/vectors/pharma' },
          { name: 'FMCG', icon: '🛒', path: '/vectors/fmcg' },
          { name: 'Metals', icon: '⛏️', path: '/vectors/metals' },
          { name: 'Realty', icon: '🏗️', path: '/vectors/realty' },
          { name: 'IT', icon: '💻', path: '/vectors/it' },
          { name: 'Capital Goods', icon: '🏭', path: '/vectors/capital_goods' },
          { name: 'Telecom', icon: '📡', path: '/vectors/telecom' },
          { name: 'Chemicals', icon: '🧪', path: '/vectors/chemicals' },
          { name: 'Durables', icon: '🧺', path: '/vectors/consumer_durables' },
          { name: 'Construction', icon: '🏗️', path: '/vectors/construction' },
          { name: 'Hospitality', icon: '🏨', path: '/vectors/hospitality' },
=======
          { name: 'Automobile', icon: '🚗', path: '/stocks/automobile' },
          { name: 'Hospitality', icon: '🏨', path: '/stocks/hospitality' },
          { name: 'Finance', icon: '💼', path: '/stocks/finance' },
          { name: 'Banking', icon: '🏦', path: '/stocks/banking' },
          { name: 'Energy', icon: '⚡', path: '/stocks/energy' },
          { name: 'Pharma', icon: '💊', path: '/stocks/pharma' },
>>>>>>> 7bc85fc (Resolved merge)
        ].map(item => (
          <MatrixCard key={item.name} onClick={() => navigate(item.path)}>
            <div className="icon">{item.icon}</div>
            <div>{item.name}</div>
          </MatrixCard>
        ))}
      </GridContainer>

<<<<<<< HEAD
      {/* ───── MUTUAL FUNDS ───── */}
      <MutualFunds />

=======
>>>>>>> 7bc85fc (Resolved merge)
      {/* ───── GLOBAL INDICES ───── */}
      <h2 style={{ gridColumn: 'span 12', fontSize: '1.2rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', margin: '4rem 0 2rem' }}>
        Global Indices
      </h2>
      <IndicesCarousel>
        {[
          { name: 'S&P 500', value: '5,137.08', change: '+0.80%', positive: true },
          { name: 'NASDAQ', value: '16,274.94', change: '-0.12%', positive: false },
          { name: 'DOW JONES', value: '38,904.04', change: '+0.20%', positive: true },
          { name: 'FTSE 100', value: '7,682.50', change: '+0.17%', positive: true },
          { name: 'NIKKEI 225', value: '38,915.87', change: '-0.18%', positive: false },
        ].map(index => (
          <IndexCard key={index.name}>
            <div className="name">{index.name}</div>
            <div className="value">{index.value}</div>
            <div className="change" style={{ color: index.positive ? '#00ffa3' : '#ff2e63' }}>{index.change}</div>
          </IndexCard>
        ))}
      </IndicesCarousel>

      {/* ───── SECTOR SPOTLIGHT ───── */}
      <h2 style={{ gridColumn: 'span 12', fontSize: '1.2rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', margin: '4rem 0 2rem' }}>
        Sector Spotlight
      </h2>
      <SectorSpotlight>
        <div className="icon">💡</div>
        <div>
          <div className="title">Technology</div>
          <div className="description">The tech sector is buzzing with innovation, from AI and machine learning to the latest in consumer electronics. Explore the companies shaping our future.</div>
<<<<<<< HEAD
          <Link to="/vectors/automobile" style={{ color: '#00f2fe', textDecoration: 'none', fontWeight: 700 }}>Explore Vectors →</Link>
=======
          <Link to="/stocks/automobile" style={{ color: '#00f2fe', textDecoration: 'none', fontWeight: 700 }}>Explore Sectors →</Link>
>>>>>>> 7bc85fc (Resolved merge)
        </div>
      </SectorSpotlight>

      {/* ───── NEW: MARKET INSIGHTS BELOW SECTOR SPOTLIGHT ───── */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', margin: '4rem 0 2rem' }}>
        Market Insights
      </h2>
      <InsightsGrid
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {[
          {
            icon: '🧠',
            title: 'AI-Driven Predictions',
            desc: 'Leverage neural network models to predict price movements across sectors with machine learning accuracy.',
            tag: 'Intelligence',
            tagColor: 'rgba(0, 242, 254, 0.15)',
            tagText: '#00f2fe',
          },
          {
            icon: '📊',
            title: 'Cluster Analysis',
            desc: 'K-Means clustering identifies hidden stock groupings and correlations across the entire market universe.',
            tag: 'Analytics',
            tagColor: 'rgba(112, 40, 228, 0.15)',
            tagText: '#b388ff',
          },
          {
            icon: '⚡',
            title: 'Real-Time Alerts',
            desc: 'Instant notifications on price breakouts, trend reversals, and anomaly detections across your watchlist.',
            tag: 'Speed',
            tagColor: 'rgba(255, 193, 7, 0.15)',
            tagText: '#ffc107',
          },
          {
            icon: '🛡️',
            title: 'Risk Assessment',
            desc: 'Portfolio-level risk scoring powered by volatility models, beta analysis, and correlation matrices.',
            tag: 'Protection',
            tagColor: 'rgba(0, 255, 163, 0.15)',
            tagText: '#00ffa3',
          },
          {
            icon: '🌐',
            title: 'Global Coverage',
            desc: 'Track equities, metals, indices, and commodities from NYSE to BSE — unified in a single dashboard.',
            tag: 'Reach',
            tagColor: 'rgba(79, 172, 254, 0.15)',
            tagText: '#4facfe',
          },
          {
            icon: '🔮',
            title: 'Sentiment Radar',
            desc: 'NLP-powered news sentiment scoring gauges market mood from global financial news in real-time.',
            tag: 'Foresight',
            tagColor: 'rgba(255, 46, 99, 0.15)',
            tagText: '#ff2e63',
          },
        ].map((card, i) => (
          <InsightCard
            key={card.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="insight-icon">{card.icon}</div>
            <div className="insight-title">{card.title}</div>
            <div className="insight-desc">{card.desc}</div>
            <span
              className="insight-tag"
              style={{ background: card.tagColor, color: card.tagText }}
            >
              {card.tag}
            </span>
          </InsightCard>
        ))}
      </InsightsGrid>

      {/* ───── QUICK STATS ───── */}
      <QuickStatsRow
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <StatBox whileHover={{ scale: 1.04 }}>
          <div className="stat-value">150+</div>
          <div className="stat-label">Stocks Tracked</div>
        </StatBox>
        <StatBox whileHover={{ scale: 1.04 }}>
          <div className="stat-value">6</div>
          <div className="stat-label">Major Sectors</div>
        </StatBox>
        <StatBox whileHover={{ scale: 1.04 }}>
          <div className="stat-value">30s</div>
          <div className="stat-label">Refresh Rate</div>
        </StatBox>
        <StatBox whileHover={{ scale: 1.04 }}>
          <div className="stat-value">99.9%</div>
          <div className="stat-label">Uptime</div>
        </StatBox>
      </QuickStatsRow>

      {/* ───── CTA BANNER ───── */}
      <GlowBanner
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <BannerText>
          <h3>Ready to Navigate the Markets?</h3>
          <p>Create a portfolio, track positions, and harness AI-driven insights — all in one place.</p>
        </BannerText>
        <BannerButton
          onClick={() => navigate('/portfolio')}
          whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0,242,254,0.4)' }}
          whileTap={{ scale: 0.95 }}
        >
          Launch Portfolio →
        </BannerButton>
      </GlowBanner>

    </HomeContainer>
  );
};

export default Home;
