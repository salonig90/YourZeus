import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { yfinanceService, MutualFundData } from '../services/yfinanceService';
import { Star, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const FundsContainer = styled(motion.div)`
  margin-top: 3rem;
  padding: 2rem;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.borderRadius.large};
  border: 1px solid ${props => props.theme.colors.border};
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 2rem;
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

const FundsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const FundCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  border: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FundHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const FundName = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
`;

const FundSymbol = styled.span`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
  background: rgba(255, 255, 255, 0.05);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
`;

const FundPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
`;

const PriceChange = styled.span<{ positive: boolean }>`
  font-size: 0.9rem;
  color: ${props => props.positive ? props.theme.colors.success : props.theme.colors.danger};
  display: flex;
  align-items: center;
  gap: 0.2rem;
`;

const FundStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  
  .label {
    font-size: 0.75rem;
    color: ${props => props.theme.colors.textSecondary};
    text-transform: uppercase;
  }
  
  .value {
    font-size: 0.9rem;
    font-weight: 600;
    color: #fff;
  }
`;

const Rating = styled.div`
  display: flex;
  gap: 2px;
  color: #FFD700;
`;

const MutualFunds: React.FC = () => {
  const [funds, setFunds] = useState<MutualFundData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFunds = async () => {
      const data = await yfinanceService.getMutualFunds();
      setFunds(data.slice(0, 20)); // Show top 20
      setLoading(false);
    };
    fetchFunds();
  }, []);

  if (loading) return <div>Loading funds...</div>;

  return (
    <FundsContainer
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Title>
        <TrendingUp size={28} color="#00e676" />
        Top Mutual Funds
      </Title>
      
      <FundsGrid>
        {funds.map((fund, index) => (
          <FundCard
            key={fund.symbol}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, borderColor: 'rgba(0, 230, 118, 0.3)' }}
          >
            <FundHeader>
              <div>
                <FundName>{fund.name.split('.')[0]}</FundName>
                <FundSymbol>{fund.symbol}</FundSymbol>
              </div>
              <Rating>
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    fill={i < fund.rating ? "#FFD700" : "none"} 
                    stroke={i < fund.rating ? "#FFD700" : "#444"} 
                  />
                ))}
              </Rating>
            </FundHeader>
            
            <FundPrice>
              ${fund.currentPrice.toLocaleString()}
              <PriceChange positive={fund.change >= 0}>
                {fund.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(fund.changePercent).toFixed(2)}%
              </PriceChange>
            </FundPrice>
            
            <FundStats>
              <StatItem>
                <span className="label">Category</span>
                <span className="value">{fund.category}</span>
              </StatItem>
              <StatItem>
                <span className="label">AUM</span>
                <span className="value">${(fund.aum / 1000).toFixed(1)}B</span>
              </StatItem>
            </FundStats>
            
            <motion.div 
              style={{ marginTop: 'auto', paddingTop: '1rem', color: '#00e676', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              whileHover={{ x: 5 }}
            >
              Invest Now <DollarSign size={14} />
            </motion.div>
          </FundCard>
        ))}
      </FundsGrid>
    </FundsContainer>
  );
};

export default MutualFunds;
