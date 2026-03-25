import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── keyframes ─── */
const gridPulse = keyframes`
  0%, 100% { opacity: 0.03; }
  50% { opacity: 0.08; }
`;

const scanLine = keyframes`
  0% { top: -5%; }
  100% { top: 105%; }
`;

const glitch = keyframes`
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(2px, -2px); }
  60% { transform: translate(-1px, -1px); }
  80% { transform: translate(1px, 1px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const borderFlow = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
`;

const holoPulse = keyframes`
  0%, 100% { opacity: 0; }
  50% { opacity: 0.06; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

const dataStream = keyframes`
  0% { transform: translateY(-100%); opacity: 0; }
  10% { opacity: 0.4; }
  90% { opacity: 0.4; }
  100% { transform: translateY(100vh); opacity: 0; }
`;

/* ─── backgrounds ─── */
const PageWrapper = styled.div`
  position: relative;
  min-height: 100vh;
`;

const GridBackground = styled.div`
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(0, 242, 254, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 242, 254, 0.05) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: ${gridPulse} 6s ease-in-out infinite;
`;

const DataStreamColumn = styled.div<{ left: number; delay: number }>`
  position: fixed;
  left: ${p => p.left}%;
  top: 0;
  width: 1px;
  height: 80px;
  background: linear-gradient(180deg, transparent, rgba(0,242,254,0.3), transparent);
  z-index: -1;
  animation: ${dataStream} ${p => 6 + p.delay}s linear infinite;
  animation-delay: ${p => p.delay}s;
  pointer-events: none;
`;

/* ─── container ─── */
const NewsContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 8rem 2rem 4rem;
  position: relative;
`;

/* ─── header / title ─── */
const HeaderSection = styled(motion.div)`
  margin-bottom: 4rem;
  position: relative;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const GlitchTitle = styled(motion.h1)`
  font-size: clamp(3rem, 9vw, 7rem);
  font-weight: 950;
  line-height: 0.9;
  letter-spacing: -4px;
  text-transform: uppercase;
  position: relative;
  background: linear-gradient(
    90deg,
    #00f2fe 0%,
    #4facfe 30%,
    #fff 50%,
    #4facfe 70%,
    #00f2fe 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 5s linear infinite;

  &::before,
  &::after {
    content: 'NEURAL FEED';
    position: absolute;
    inset: 0;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  &::before {
    background: linear-gradient(90deg, #ff2e63, transparent);
    -webkit-background-clip: text;
    clip-path: polygon(0 0, 100% 0, 100% 33%, 0 33%);
    animation: ${glitch} 3s steps(1) infinite;
    opacity: 0.15;
  }

  &::after {
    background: linear-gradient(90deg, #00f2fe, transparent);
    -webkit-background-clip: text;
    clip-path: polygon(0 66%, 100% 66%, 100% 100%, 0 100%);
    animation: ${glitch} 3s steps(1) infinite reverse;
    opacity: 0.15;
  }
`;

const SubLabel = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-top: 1rem;
`;

const StatusDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00ffa3;
  box-shadow: 0 0 10px #00ffa3;
  animation: ${holoPulse} 2s ease-in-out infinite;
  animation-direction: alternate;
  opacity: 1;
`;

const StatusText = styled.span`
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
`;

/* ─── search bar ─── */
const SearchBar = styled(motion.div)`
  position: relative;
  max-width: 520px;
  margin-bottom: 2rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1.5rem 1rem 3rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  outline: none;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255,255,255,0.25);
    letter-spacing: 1px;
    text-transform: uppercase;
    font-size: 0.7rem;
  }

  &:focus {
    border-color: rgba(0,242,254,0.3);
    box-shadow: 0 0 20px rgba(0,242,254,0.08);
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  opacity: 0.4;
`;

/* ─── category tabs ─── */
const TabRow = styled(motion.div)`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: 3rem;
`;

const Tab = styled(motion.button)<{ active: boolean }>`
  padding: 0.55rem 1.4rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  border: 1px solid ${p => p.active ? 'rgba(0,242,254,0.4)' : 'rgba(255,255,255,0.08)'};
  background: ${p => p.active
    ? 'linear-gradient(135deg, rgba(0,242,254,0.15), rgba(79,172,254,0.1))'
    : 'rgba(255,255,255,0.02)'};
  color: ${p => p.active ? '#00f2fe' : 'rgba(255,255,255,0.4)'};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  ${p => p.active && `
    box-shadow: 0 0 15px rgba(0,242,254,0.1);
  `}

  &:hover {
    border-color: rgba(0,242,254,0.3);
    color: #fff;
    background: rgba(255,255,255,0.04);
  }
`;

/* ─── trending topics ─── */
const TrendingRow = styled(motion.div)`
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 4rem;
`;

const TrendingLabel = styled.span`
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  margin-right: 0.5rem;
`;

const TrendingChip = styled(motion.span)`
  padding: 0.4rem 1rem;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 800;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 242, 254, 0.1);
    border-color: rgba(0, 242, 254, 0.3);
    color: #00f2fe;
    box-shadow: 0 0 12px rgba(0,242,254,0.1);
  }
`;

/* ─── featured hero article ─── */
const FeaturedHero = styled(motion.div)`
  position: relative;
  border-radius: 32px;
  overflow: hidden;
  margin-bottom: 4rem;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  min-height: 360px;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 100% 0%, rgba(0,242,254,0.08) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  &::after {
    content: '';
    position: absolute;
    top: -5%;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(0,242,254,0.5), transparent);
    animation: ${scanLine} 5s linear infinite;
    z-index: 1;
  }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const FeaturedContent = styled.div`
  padding: 3.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
  position: relative;
  z-index: 2;
`;

const FeaturedVisual = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 7rem;
  position: relative;
  z-index: 2;
  animation: ${float} 4s ease-in-out infinite;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const Badge = styled.span<{ color?: string }>`
  display: inline-block;
  padding: 0.35rem 1rem;
  border-radius: 8px;
  font-size: 0.6rem;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  width: fit-content;
  background: ${p => p.color || 'rgba(0,242,254,0.12)'};
  color: #00f2fe;
  border: 1px solid rgba(0,242,254,0.15);
`;

const FeaturedTitle = styled.h2`
  font-size: clamp(1.8rem, 3.5vw, 2.6rem);
  font-weight: 950;
  line-height: 1.1;
  letter-spacing: -1.5px;
`;

const FeaturedDesc = styled.p`
  font-size: 0.95rem;
  color: rgba(255,255,255,0.45);
  line-height: 1.7;
  max-width: 520px;
`;

const ReadButton = styled(motion.button)`
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
  border: none;
  padding: 0.9rem 2.2rem;
  border-radius: 14px;
  font-weight: 900;
  font-size: 0.75rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  color: #000;
  width: fit-content;
`;

/* ─── news grid ─── */
const FeedSection = styled.div`
  margin-bottom: 4rem;
`;

const SectionTitle = styled(motion.h2)`
  font-size: 1.1rem;
  font-weight: 900;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  margin-bottom: 2.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(255,255,255,0.1), transparent);
  }
`;

const CardGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const HoloCard = styled(motion.div)`
  background: rgba(255,255,255,0.015);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 24px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  /* holographic sheen */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(0,242,254,0.04) 0%,
      transparent 40%,
      rgba(112,40,228,0.04) 60%,
      transparent 100%
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
    background: linear-gradient(90deg, transparent, rgba(0,242,254,0.35), transparent);
    animation: ${scanLine} 5s linear infinite;
    pointer-events: none;
  }

  /* animated border glow on hover */
  &:hover {
    transform: translateY(-8px);
    border-color: rgba(0,242,254,0.25);
    box-shadow:
      0 0 20px rgba(0,242,254,0.06),
      0 25px 50px rgba(0,0,0,0.3);

    &::before { opacity: 1; }
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardDate = styled.span`
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: rgba(255,255,255,0.25);
  font-family: 'JetBrains Mono', monospace;
`;

const CardSource = styled.span`
  font-size: 0.6rem;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.2);
  padding: 0.25rem 0.7rem;
  background: rgba(255,255,255,0.04);
  border-radius: 6px;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 900;
  line-height: 1.25;
  letter-spacing: -0.5px;
  color: #fff;
`;

const CardBody = styled.p`
  font-size: 0.85rem;
  color: rgba(255,255,255,0.4);
  line-height: 1.7;
  flex-grow: 1;
`;

const CardFooter = styled.div`
  padding-top: 1.2rem;
  border-top: 1px solid rgba(255,255,255,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ReadMore = styled.span`
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #00f2fe;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: gap 0.3s ease;

  ${HoloCard}:hover & {
    gap: 1rem;
  }
`;

const CategoryDot = styled.span<{ cat: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${p => {
    switch (p.cat) {
      case 'Markets': return '#00f2fe';
      case 'Commodities': return '#ffc107';
      case 'Economy': return '#00ffa3';
      case 'Analysis': return '#b388ff';
      case 'Education': return '#ff2e63';
      default: return '#4facfe';
    }
  }};
  box-shadow: 0 0 8px ${p => {
    switch (p.cat) {
      case 'Markets': return '#00f2fe';
      case 'Commodities': return '#ffc107';
      case 'Economy': return '#00ffa3';
      case 'Analysis': return '#b388ff';
      case 'Education': return '#ff2e63';
      default: return '#4facfe';
    }
  }};
`;

/* ─── live ticker bar ─── */
const tickerScroll = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const TickerBar = styled.div`
  overflow: hidden;
  border-top: 1px solid rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  padding: 0.8rem 0;
  margin-bottom: 4rem;
  position: relative;

  &::before, &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 80px;
    z-index: 2;
    pointer-events: none;
  }
  &::before { left: 0; background: linear-gradient(90deg, #020204, transparent); }
  &::after  { right: 0; background: linear-gradient(270deg, #020204, transparent); }
`;

const TickerTrack = styled.div`
  display: flex;
  gap: 3rem;
  animation: ${tickerScroll} 30s linear infinite;
  width: max-content;
`;

const TickerItem = styled.span<{ positive: boolean }>`
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 1px;
  font-family: 'JetBrains Mono', monospace;
  white-space: nowrap;
  color: ${p => p.positive ? '#00ffa3' : '#ff2e63'};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .name {
    color: rgba(255,255,255,0.6);
  }
`;

/* ─── bottom stats ─── */
const BottomStats = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;

  @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
`;

const StatCard = styled(motion.div)`
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 20px;
  padding: 1.8rem;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(0,242,254,0.2);
    transform: translateY(-4px);
  }

  .val {
    font-size: 1.6rem;
    font-weight: 950;
    font-family: 'JetBrains Mono', monospace;
    background: linear-gradient(135deg, #00f2fe, #4facfe);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .lbl {
    margin-top: 0.4rem;
    font-size: 0.6rem;
    font-weight: 800;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
  }
`;


/* ════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════ */
const News: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Markets', 'Commodities', 'Economy', 'Analysis', 'Education'];

  const filteredNews = newsItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const tickerData = [
    { name: 'AAPL', val: '$182.63', pos: true, change: '+1.23%' },
    { name: 'GOOGL', val: '$141.80', pos: false, change: '-0.45%' },
    { name: 'MSFT', val: '$415.20', pos: true, change: '+0.87%' },
    { name: 'AMZN', val: '$178.25', pos: true, change: '+2.10%' },
    { name: 'TSLA', val: '$175.34', pos: false, change: '-1.02%' },
    { name: 'NVDA', val: '$878.37', pos: true, change: '+3.54%' },
    { name: 'META', val: '$502.30', pos: true, change: '+1.67%' },
    { name: 'NFLX', val: '$628.90', pos: false, change: '-0.31%' },
  ];

  return (
    <PageWrapper>
      {/* animated grid background */}
      <GridBackground />
      {/* data stream columns */}
      {[8, 22, 38, 55, 72, 88].map((l, i) => (
        <DataStreamColumn key={l} left={l} delay={i * 1.4} />
      ))}

      <NewsContainer>
        {/* ─── HEADER ─── */}
        <HeaderSection
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <TitleRow>
            <div>
              <GlitchTitle
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, type: 'spring', stiffness: 60 }}
              >
                Neural Feed
              </GlitchTitle>
              <SubLabel
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <StatusDot />
                <StatusText>Live • Real-Time Intelligence Stream</StatusText>
              </SubLabel>
            </div>
          </TitleRow>

          <SearchBar
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SearchIcon>🔍</SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search intelligence..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </SearchBar>

          <TabRow
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {categories.map(cat => (
              <Tab
                key={cat}
                active={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {cat}
              </Tab>
            ))}
          </TabRow>

          <TrendingRow
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <TrendingLabel>Trending:</TrendingLabel>
            {['#AI', '#Web3', '#Inflation', '#Geopolitics', '#Earnings', '#FedRate'].map(t => (
              <TrendingChip key={t} whileHover={{ y: -3, scale: 1.05 }}>{t}</TrendingChip>
            ))}
          </TrendingRow>
        </HeaderSection>

        {/* ─── LIVE TICKER ─── */}
        <TickerBar>
          <TickerTrack>
            {[...tickerData, ...tickerData].map((t, i) => (
              <TickerItem key={`${t.name}-${i}`} positive={t.pos}>
                <span className="name">{t.name}</span> {t.val} {t.change}
              </TickerItem>
            ))}
          </TickerTrack>
        </TickerBar>

        {/* ─── FEATURED ARTICLE ─── */}
        <FeaturedHero
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <FeaturedContent>
            <Badge>⚡ Strategic Analysis</Badge>
            <FeaturedTitle>THE NEURAL ARCHITECTURE OF MODERN PORTFOLIOS</FeaturedTitle>
            <FeaturedDesc>
              Deep dive into the algorithmic shifts governing institutional asset allocation in the age of autonomous finance. Discover how neural nets reshape risk.
            </FeaturedDesc>
            <ReadButton
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,242,254,0.35)' }}
              whileTap={{ scale: 0.95 }}
            >
              Access Intelligence →
            </ReadButton>
          </FeaturedContent>
          <FeaturedVisual>💎</FeaturedVisual>
        </FeaturedHero>

        {/* ─── NEWS FEED ─── */}
        <FeedSection>
          <SectionTitle
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            Latest Intelligence
          </SectionTitle>

          <AnimatePresence mode="wait">
            <CardGrid
              key={selectedCategory + searchQuery}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              {filteredNews.map((item, idx) => (
                <HoloCard
                  key={idx}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * idx, duration: 0.4 }}
                  layout
                >
                  <CardHeader>
                    <Badge>{item.category}</Badge>
                    <CardDate>{item.date}</CardDate>
                  </CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardBody>{item.content}</CardBody>
                  <CardFooter>
                    <ReadMore>
                      Read Protocol <span>→</span>
                    </ReadMore>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CategoryDot cat={item.category} />
                      <CardSource>{item.source}</CardSource>
                    </div>
                  </CardFooter>
                </HoloCard>
              ))}
            </CardGrid>
          </AnimatePresence>
        </FeedSection>

        {/* ─── BOTTOM STATS ─── */}
        <BottomStats
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <StatCard whileHover={{ scale: 1.03 }}>
            <div className="val">1,247</div>
            <div className="lbl">Articles Indexed</div>
          </StatCard>
          <StatCard whileHover={{ scale: 1.03 }}>
            <div className="val">24/7</div>
            <div className="lbl">Live Monitoring</div>
          </StatCard>
          <StatCard whileHover={{ scale: 1.03 }}>
            <div className="val">50+</div>
            <div className="lbl">Sources Tracked</div>
          </StatCard>
          <StatCard whileHover={{ scale: 1.03 }}>
            <div className="val">{'<'}2s</div>
            <div className="lbl">Feed Latency</div>
          </StatCard>
        </BottomStats>
      </NewsContainer>
    </PageWrapper>
  );
};

/* ─── static data ─── */
const newsItems = [
  {
    title: '📈 Stock Market Hits All-Time High',
    content: 'Major indices reached record levels as investor confidence grows amid economic recovery. Market sentiment remains bullish with strong institutional buying.',
    date: 'MAR 04, 2026',
    category: 'Markets',
    source: 'Financial Times'
  },
  {
    title: '💰 Gold Prices Surge 5%',
    content: 'Precious metals see strong demand as investors seek safe-haven assets. Gold futures trading at highest levels in months.',
    date: 'MAR 03, 2026',
    category: 'Commodities',
    source: 'Reuters'
  },
  {
    title: '🌍 Global Economic Outlook Improves',
    content: 'IMF revises growth forecasts upward as key economies show resilience. Emerging markets lead the recovery charge.',
    date: 'MAR 02, 2026',
    category: 'Economy',
    source: 'Bloomberg'
  },
  {
    title: '💼 Portfolio Diversification Tips',
    content: 'Expert advice on building a balanced investment portfolio in uncertain times. Learn strategies from top portfolio managers.',
    date: 'MAR 01, 2026',
    category: 'Analysis',
    source: 'Motley Fool'
  },
  {
    title: '📊 Tech Stocks Lead Market Rally',
    content: 'Technology sector continues to outperform as innovation drives growth. AI and cloud computing stocks show exceptional gains.',
    date: 'FEB 28, 2026',
    category: 'Markets',
    source: 'CNBC'
  },
  {
    title: '🔒 Security Best Practices for Investors',
    content: 'How to protect your financial accounts and personal information online. Multi-factor authentication and secure passwords matter.',
    date: 'FEB 27, 2026',
    category: 'Education',
    source: 'Investor Daily'
  }
];

export default News;