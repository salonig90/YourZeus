import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/* ─── keyframes ─── */
const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

const scanLine = keyframes`
  0% { top: -10%; }
  100% { top: 110%; }
`;

const borderGlow = keyframes`
  0%, 100% { border-color: rgba(0, 242, 254, 0.08); }
  50% { border-color: rgba(0, 242, 254, 0.2); }
`;

/* ─── layout ─── */
const StocksContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 8rem 2rem 4rem;
`;

/* ─── header ─── */
const HeaderBlock = styled(motion.div)`
  margin-bottom: 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const StatusRow = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const LiveDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00ffa3;
  box-shadow: 0 0 10px #00ffa3;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const StatusLabel = styled.span`
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
`;

const PageTitle = styled(motion.h1)`
  font-size: clamp(3rem, 10vw, 6.5rem);
  font-weight: 950;
  letter-spacing: -4px;
  text-transform: uppercase;
  line-height: 0.9;
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

const SubTitle = styled(motion.p)`
  font-size: 0.95rem;
  color: rgba(255,255,255,0.4);
  max-width: 600px;
  line-height: 1.7;
  font-weight: 500;
`;

const MetricsRow = styled(motion.div)`
  display: flex;
  gap: 3rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
`;

const Metric = styled.div`
  .val {
    font-size: 1.4rem;
    font-weight: 950;
    font-family: 'JetBrains Mono', monospace;
    background: linear-gradient(135deg, #fff, rgba(255,255,255,0.7));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .lbl {
    font-size: 0.6rem;
    font-weight: 800;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin-top: 4px;
  }
`;

/* ─── cards grid ─── */
const Grid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const Card = styled(motion.div)<{ accent: string }>`
  position: relative;
  overflow: hidden;
  background: rgba(255,255,255,0.015);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 28px;
  padding: 2.2rem 2.5rem;
  cursor: pointer;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 2rem;
  align-items: center;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  animation: ${borderGlow} 6s ease infinite;

  /* holographic sheen */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      ${p => p.accent}15 0%,
      transparent 50%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

  /* scan line */
  &::after {
    content: '';
    position: absolute;
    top: -10%;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${p => p.accent}60, transparent);
    animation: ${scanLine} 5s linear infinite;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-6px) scale(1.01);
    border-color: ${p => p.accent}50;
    box-shadow: 0 0 30px ${p => p.accent}15, 0 20px 50px rgba(0,0,0,0.35);

    &::before { opacity: 1; }
  }

  @media (max-width: 640px) {
    grid-template-columns: auto 1fr;
    gap: 1.2rem;
  }
`;

const IconBox = styled.div<{ accent: string }>`
  width: 68px;
  height: 68px;
  border-radius: 20px;
  background: ${p => p.accent}12;
  border: 1px solid ${p => p.accent}20;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  position: relative;
  transition: all 0.3s ease;

  ${Card}:hover & {
    border-color: ${p => p.accent}50;
    box-shadow: 0 0 20px ${p => p.accent}20;
    transform: scale(1.1);
  }
`;

const InfoBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
`;

const SectorName = styled.h2`
  font-size: 1.35rem;
  font-weight: 950;
  letter-spacing: -0.5px;
  text-transform: uppercase;
  color: #fff;
`;

const SectorDesc = styled.p`
  font-size: 0.78rem;
  color: rgba(255,255,255,0.4);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TagRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.3rem;
`;

const Tag = styled.span<{ color: string }>`
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.55rem;
  font-weight: 900;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  background: ${p => p.color}15;
  color: ${p => p.color};
  border: 1px solid ${p => p.color}20;
`;

const StatsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  text-align: right;
  min-width: 100px;

  @media (max-width: 640px) {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
    border-top: 1px solid rgba(255,255,255,0.05);
    padding-top: 1rem;
  }
`;

const StatItem = styled.div`
  .label {
    font-size: 0.55rem;
    font-weight: 900;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    margin-bottom: 2px;
  }
  .value {
    font-size: 1.05rem;
    font-weight: 900;
    font-family: 'JetBrains Mono', monospace;
    color: #fff;
  }
`;

const GrowthIndicator = styled.span<{ positive: boolean }>`
  color: ${p => p.positive ? '#00ffa3' : '#ff2e63'};
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 1.05rem;
  font-weight: 900;
  font-family: 'JetBrains Mono', monospace;
  justify-content: flex-end;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 8px currentColor;
  }

  @media (max-width: 640px) {
    justify-content: flex-start;
  }
`;

const Rank = styled.span`
  position: absolute;
  top: 1.5rem;
  right: 1.8rem;
  font-size: 0.55rem;
  font-weight: 900;
  letter-spacing: 2px;
  color: rgba(255,255,255,0.12);
  font-family: 'JetBrains Mono', monospace;
`;


/* ─── Component ─── */
const Stocks: React.FC = () => {
  const navigate = useNavigate();

  const totalCompanies = sectors.reduce((sum, s) => {
    const n = parseInt(s.stats.companies);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  return (
    <StocksContainer>
      {/* ─── HEADER ─── */}
      <HeaderBlock
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <StatusRow
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <LiveDot />
          <StatusLabel>Live Market Data • {sectors.length} Sectors Active</StatusLabel>
        </StatusRow>

        <PageTitle
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, type: 'spring', stiffness: 70 }}
        >
          Sector Intelligence
        </PageTitle>

        <SubTitle
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Explore curated market sectors with real-time analytics, growth tracking, and AI-powered insights across Indian and global equities.
        </SubTitle>

        <MetricsRow
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Metric>
            <div className="val">{sectors.length}</div>
            <div className="lbl">Sectors</div>
          </Metric>
          <Metric>
            <div className="val">{totalCompanies}+</div>
            <div className="lbl">Companies</div>
          </Metric>
          <Metric>
            <div className="val">Real-Time</div>
            <div className="lbl">Data Feed</div>
          </Metric>
          <Metric>
            <div className="val">IND + US</div>
            <div className="lbl">Markets</div>
          </Metric>
        </MetricsRow>
      </HeaderBlock>

      {/* ─── SECTOR CARDS ─── */}
      <Grid
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {sectors.map((sector, idx) => (
          <Card
            key={sector.id}
            accent={sector.accent}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + idx * 0.07 }}
            onClick={() => navigate(`/stocks/${sector.sectorId}`)}
          >
            <Rank>#{String(idx + 1).padStart(2, '0')}</Rank>
            <IconBox accent={sector.accent}>{sector.icon}</IconBox>
            <InfoBlock>
              <SectorName>{sector.name}</SectorName>
              <SectorDesc>{sector.description}</SectorDesc>
              <TagRow>
                {sector.tags.map(t => (
                  <Tag key={t} color={sector.accent}>{t}</Tag>
                ))}
              </TagRow>
            </InfoBlock>
            <StatsColumn>
              <StatItem>
                <div className="label">Entities</div>
                <div className="value">{sector.stats.companies}</div>
              </StatItem>
              <StatItem>
                <div className="label">Growth</div>
                <GrowthIndicator positive={sector.stats.growth.startsWith('+')}>
                  {sector.stats.growth}
                </GrowthIndicator>
              </StatItem>
              <StatItem>
                <div className="label">Mkt Cap</div>
                <div className="value">{sector.stats.marketCap}</div>
              </StatItem>
            </StatsColumn>
          </Card>
        ))}
      </Grid>
    </StocksContainer>
  );
};

/* ─── data ─── */
const sectors = [
  {
    id: 1,
    sectorId: 'automobile and auto components',
    name: 'Auto & Components',
    icon: '🚗',
    accent: '#00f2fe',
    description: 'Automobile manufacturers and auto component suppliers.',
    tags: ['Automotive', 'Manufacturing'],
    stats: { companies: 'Dynamic', growth: '+8.2%', marketCap: 'TBD' }
  },
  {
    id: 2,
    sectorId: 'capital goods',
    name: 'Capital Goods',
    icon: '🏭',
    accent: '#ff4081',
    description: 'Industrial products, machinery, and equipment manufacturing.',
    tags: ['Industrial', 'Engineering'],
    stats: { companies: 'Dynamic', growth: '+15.5%', marketCap: 'TBD' }
  },
  {
    id: 3,
    sectorId: 'chemicals',
    name: 'Chemicals',
    icon: '🧪',
    accent: '#76ff03',
    description: 'Specialty chemicals, agrochemicals and industrial chemicals.',
    tags: ['Specialty', 'Agrochem'],
    stats: { companies: 'Dynamic', growth: '+14.2%', marketCap: 'TBD' }
  },
  {
    id: 4,
    sectorId: 'constructions',
    name: 'Constructions',
    icon: '🏗️',
    accent: '#ff6e40',
    description: 'Infrastructure construction and civil engineering projects.',
    tags: ['Infra', 'EPC'],
    stats: { companies: 'Dynamic', growth: '+13.8%', marketCap: 'TBD' }
  },
  {
    id: 5,
    sectorId: 'construction materials',
    name: 'Const. Materials',
    icon: '🧱',
    accent: '#a1887f',
    description: 'Cement, bricks, and other building materials.',
    tags: ['Cement', 'Building'],
    stats: { companies: 'Dynamic', growth: '+7.5%', marketCap: 'TBD' }
  },
  {
    id: 6,
    sectorId: 'consumer durables',
    name: 'Consumer Durables',
    icon: '🧺',
    accent: '#ffd740',
    description: 'Electronic appliances and household durable goods.',
    tags: ['Appliances', 'Electronics'],
    stats: { companies: 'Dynamic', growth: '+9.5%', marketCap: 'TBD' }
  },
  {
    id: 7,
    sectorId: 'consumer services',
    name: 'Consumer Services',
    icon: '🤝',
    accent: '#ff80ab',
    description: 'Retailing, hospitality, and other consumer-facing services.',
    tags: ['Retail', 'Services'],
    stats: { companies: 'Dynamic', growth: '+18.4%', marketCap: 'TBD' }
  },
  {
    id: 8,
    sectorId: 'fast moving consumer goods',
    name: 'FMCG',
    icon: '🛒',
    accent: '#e040fb',
    description: 'Fast-moving consumer goods and household essentials.',
    tags: ['Consumer', 'Essentials'],
    stats: { companies: 'Dynamic', growth: '+4.9%', marketCap: 'TBD' }
  },
  {
    id: 9,
    sectorId: 'financial services',
    name: 'Financial Services',
    icon: '💰',
    accent: '#b388ff',
    description: 'Banking, NBFCs, insurance, and other financial institutions.',
    tags: ['Banking', 'Insurance'],
    stats: { companies: 'Dynamic', growth: '+6.8%', marketCap: 'TBD' }
  },
  {
    id: 10,
    sectorId: 'health care',
    name: 'Healthcare',
    icon: '💊',
    accent: '#00ffa3',
    description: 'Pharmaceuticals, hospitals, and healthcare diagnostics.',
    tags: ['Pharma', 'Hospitals'],
    stats: { companies: 'Dynamic', growth: '+7.4%', marketCap: 'TBD' }
  },
  {
    id: 11,
    sectorId: 'information technology',
    name: 'IT Services',
    icon: '💻',
    accent: '#00b0ff',
    description: 'Software services and technology consultants.',
    tags: ['Software', 'Cloud', 'AI'],
    stats: { companies: 'Dynamic', growth: '+12.1%', marketCap: 'TBD' }
  },
  {
    id: 12,
    sectorId: 'metals & mining',
    name: 'Metals & Mining',
    icon: '⛏️',
    accent: '#78909c',
    description: 'Steel, aluminum, and mineral mining companies.',
    tags: ['Steel', 'Mining'],
    stats: { companies: 'Dynamic', growth: '+11.2%', marketCap: 'TBD' }
  },
  {
    id: 13,
    sectorId: 'oil gas and consumable fuels',
    name: 'Oil & Gas',
    icon: '🛢️',
    accent: '#ffb74d',
    description: 'Oil, natural gas, and other consumable energy fuels.',
    tags: ['Energy', 'Oil'],
    stats: { companies: 'Dynamic', growth: '+9.1%', marketCap: 'TBD' }
  },
  {
    id: 14,
    sectorId: 'power',
    name: 'Power',
    icon: '⚡',
    accent: '#ff9100',
    description: 'Electricity generation and power distribution companies.',
    tags: ['Electricity', 'Renewable'],
    stats: { companies: 'Dynamic', growth: '+5.3%', marketCap: 'TBD' }
  },
  {
    id: 15,
    sectorId: 'realty',
    name: 'Real Estate',
    icon: '🏘️',
    accent: '#ff5252',
    description: 'Real estate developers and property management firms.',
    tags: ['Property', 'Residential'],
    stats: { companies: 'Dynamic', growth: '+10.4%', marketCap: 'TBD' }
  },
  {
    id: 16,
    sectorId: 'telecommunication',
    name: 'Telecom',
    icon: '📡',
    accent: '#536dfe',
    description: 'Network providers and communication services.',
    tags: ['Connectivity', '5G'],
    stats: { companies: 'Dynamic', growth: '+6.2%', marketCap: 'TBD' }
  },
  {
    id: 17,
    sectorId: 'textiles',
    name: 'Textiles',
    icon: '🧵',
    accent: '#ba68c8',
    description: 'Textile manufacturing and garment exports.',
    tags: ['Garments', 'Exports'],
    stats: { companies: 'Dynamic', growth: '+4.5%', marketCap: 'TBD' }
  },
  {
    id: 18,
    sectorId: 'us_stocks',
    name: 'USA Stocks',
    icon: '🇺🇸',
    accent: '#ff5252',
    description: 'Top US companies across technology, finance, and consumer sectors.',
    tags: ['NASDAQ', 'NYSE', 'Global'],
    stats: { companies: 'Dynamic', growth: '+12.4%', marketCap: 'TBD' }
  }
];

export default Stocks;