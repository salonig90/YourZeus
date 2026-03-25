import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { yfinanceService, NewsItem } from '../services/yfinanceService';

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
  background: #020204;
  color: #fff;
  overflow-x: hidden;
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
  outline: none;
  transition: all 0.3s ease;

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

  &:hover {
    transform: translateY(-8px);
    border-color: rgba(0,242,254,0.25);
    box-shadow: 0 0 20px rgba(0,242,254,0.06);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Badge = styled.span`
  padding: 0.35rem 1rem;
  border-radius: 8px;
  font-size: 0.6rem;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  background: rgba(0,242,254,0.12);
  color: #00f2fe;
`;

const CardDate = styled.span`
  font-size: 0.65rem;
  color: rgba(255,255,255,0.25);
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 900;
  line-height: 1.25;
`;

const CardBody = styled.p`
  font-size: 0.85rem;
  color: rgba(255,255,255,0.4);
  line-height: 1.7;
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
  color: #00f2fe;
`;

const CardSource = styled.span`
  font-size: 0.65rem;
  color: rgba(255,255,255,0.2);
  text-transform: uppercase;
`;

const CategoryDot = styled.span<{ cat: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${p => {
    switch (p.cat) {
      case 'Markets': return '#00f2fe';
      case 'Business': return '#ffc107';
      case 'Economy': return '#00ffa3';
      case 'Corporate': return '#b388ff';
      case 'Analysis': return '#ff2e63';
      default: return '#4facfe';
    }
  }};
`;

const TickerBar = styled.div`
  overflow: hidden;
  padding: 1rem 0;
  background: rgba(255,255,255,0.02);
  margin-bottom: 3rem;
`;

const TickerTrack = styled.div`
  display: flex;
  gap: 3rem;
  width: max-content;
`;

const TickerItem = styled.span<{ positive: boolean }>`
  font-size: 0.75rem;
  font-weight: 800;
  color: ${p => p.positive ? '#00ffa3' : '#ff2e63'};
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
`;

const FeaturedHero = styled(motion.div)`
  padding: 4rem;
  border-radius: 32px;
  background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(0,242,254,0.05));
  margin-bottom: 4rem;
  border: 1px solid rgba(255,255,255,0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FeaturedContent = styled.div`
  max-width: 600px;
`;

const FeaturedTitle = styled.h2`
  font-size: 3rem;
  font-weight: 950;
  margin: 1.5rem 0;
`;

const FeaturedDesc = styled.p`
  font-size: 1.1rem;
  color: rgba(255,255,255,0.5);
  margin-bottom: 2rem;
`;

const ReadButton = styled(motion.button)`
  background: #00f2fe;
  color: #000;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 12px;
  font-weight: 900;
  cursor: pointer;
`;

const FeaturedVisual = styled.div`
  font-size: 8rem;
`;

const News: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Markets', 'Business', 'Economy', 'Corporate', 'Analysis', 'Global'];

  React.useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const data = await yfinanceService.getNews();
        setNews(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleNewsClick = (url: string) => {
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <PageWrapper>
      <GridBackground />
      <NewsContainer>
        <HeaderSection
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <TitleRow>
            <div>
              <GlitchTitle>Neural Feed</GlitchTitle>
              <SubLabel>
                <StatusDot />
                <StatusText>Live Real-Time Intelligence</StatusText>
              </SubLabel>
            </div>
          </TitleRow>

          <SearchBar>
            <SearchIcon>🔍</SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search intelligence..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </SearchBar>

          <TabRow>
            {categories.map(cat => (
              <Tab
                key={cat}
                active={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Tab>
            ))}
          </TabRow>
        </HeaderSection>

        <FeaturedHero>
          <FeaturedContent>
            <Badge>Strategic Analysis</Badge>
            <FeaturedTitle>The Future of Financial Data</FeaturedTitle>
            <FeaturedDesc>Real-time insights from across the globe, processed by neural architectures for maximum clarity.</FeaturedDesc>
            <ReadButton>Explore Intelligence</ReadButton>
          </FeaturedContent>
          <FeaturedVisual>⚛️</FeaturedVisual>
        </FeaturedHero>

        <CardGrid>
          {loading ? (
            <StatusText>Loading Intelligence Stream...</StatusText>
          ) : filteredNews.map((item, idx) => (
            <HoloCard
              key={idx}
              onClick={() => handleNewsClick(item.url)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <CardHeader>
                <Badge>{item.category}</Badge>
                <CardDate>{item.date}</CardDate>
              </CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardBody>{item.content}</CardBody>
              <CardFooter>
                <ReadMore>Read Article →</ReadMore>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CategoryDot cat={item.category} />
                  <CardSource>{item.source}</CardSource>
                </div>
              </CardFooter>
            </HoloCard>
          ))}
        </CardGrid>
      </NewsContainer>
    </PageWrapper>
  );
};

export default News;