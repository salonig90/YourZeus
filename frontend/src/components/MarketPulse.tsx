import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

const PulseContainer = styled(motion.div)`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 2rem;
  border: 1px solid ${props => props.theme.colors.border};
  margin-top: 2rem;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${props => props.theme.colors.border};
  }
`;

const SectorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const SectorCard = styled(motion.div)<{ sentiment: 'bullish' | 'bearish' | 'neutral' }>`
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  border: 1px solid ${props => props.theme.colors.border};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${props => {
      if (props.sentiment === 'bullish') return props.theme.colors.success;
      if (props.sentiment === 'bearish') return props.theme.colors.danger;
      return props.theme.colors.textSecondary;
    }};
  }
`;

const SectorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SectorName = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
`;

const SentimentBadge = styled.span<{ sentiment: 'bullish' | 'bearish' | 'neutral' }>`
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: ${props => {
    if (props.sentiment === 'bullish') return 'rgba(0, 230, 118, 0.1)';
    if (props.sentiment === 'bearish') return 'rgba(255, 23, 68, 0.1)';
    return 'rgba(255, 255, 255, 0.05)';
  }};
  color: ${props => {
    if (props.sentiment === 'bullish') return props.theme.colors.success;
    if (props.sentiment === 'bearish') return props.theme.colors.danger;
    return props.theme.colors.textSecondary;
  }};
`;

const SentimentScore = styled.div`
  margin-top: 1rem;
  .label {
    font-size: 0.8rem;
    color: ${props => props.theme.colors.textSecondary};
    margin-bottom: 0.5rem;
    display: flex;
    justify-content: space-between;
  }
`;

const ScoreBar = styled.div<{ score: number; sentiment: 'bullish' | 'bearish' | 'neutral' }>`
  height: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.score}%;
    background: ${props => {
      if (props.sentiment === 'bullish') return props.theme.colors.success;
      if (props.sentiment === 'bearish') return props.theme.colors.danger;
      return props.theme.colors.textSecondary;
    }};
    border-radius: 3px;
    box-shadow: 0 0 10px ${props => {
      if (props.sentiment === 'bullish') return 'rgba(0, 230, 118, 0.3)';
      if (props.sentiment === 'bearish') return 'rgba(255, 23, 68, 0.3)';
      return 'transparent';
    }};
  }
`;

interface SectorSentiment {
  name: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number;
  reason: string;
}

const sectors: SectorSentiment[] = [
  { name: 'IT & Technology', sentiment: 'bullish', score: 85, reason: 'Strong earnings growth and AI demand' },
  { name: 'Banking & Finance', sentiment: 'neutral', score: 52, reason: 'Interest rate uncertainty affecting margins' },
  { name: 'Energy', sentiment: 'bearish', score: 28, reason: 'Global slowdown concerns and falling crude' },
  { name: 'Healthcare', sentiment: 'bullish', score: 72, reason: 'Increased R&D spending and defensive positioning' },
  { name: 'Consumer Goods', sentiment: 'neutral', score: 48, reason: 'Mixed demand in emerging markets' },
  { name: 'Automobile', sentiment: 'bullish', score: 78, reason: 'EV transition momentum and easing supply chain' },
];

const MarketPulse: React.FC = () => {
  return (
    <PulseContainer
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Title>
        <TrendingUp size={28} color="#4facfe" />
        Market Pulse & Sentiment
      </Title>
      
      <SectorGrid>
        {sectors.map((sector, index) => (
          <SectorCard
            key={sector.name}
            sentiment={sector.sentiment}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <SectorHeader>
              <SectorName>{sector.name}</SectorName>
              <SentimentBadge sentiment={sector.sentiment}>
                {sector.sentiment === 'bullish' && <TrendingUp size={14} />}
                {sector.sentiment === 'bearish' && <TrendingDown size={14} />}
                {sector.sentiment === 'neutral' && <Minus size={14} />}
                {sector.sentiment}
              </SentimentBadge>
            </SectorHeader>
            
            <p style={{ fontSize: '0.85rem', color: '#aaa', minHeight: '40px' }}>
              {sector.reason}
            </p>
            
            <SentimentScore>
              <div className="label">
                <span>Sentiment Score</span>
                <span>{sector.score}%</span>
              </div>
              <ScoreBar score={sector.score} sentiment={sector.sentiment} />
            </SentimentScore>
            
            <motion.div 
              style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4facfe', fontSize: '0.8rem', cursor: 'pointer' }}
              whileHover={{ x: 3 }}
            >
              <Info size={14} />
              View detailed analysis
            </motion.div>
          </SectorCard>
        ))}
      </SectorGrid>
    </PulseContainer>
  );
};

export default MarketPulse;
