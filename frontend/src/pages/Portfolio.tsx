import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PortfolioClusterGraph from '../components/PortfolioClusterGraph';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
`;

const PortfolioContainer = styled.div`
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

const SummarySection = styled(GlassCard)`
  padding: 3rem;
  margin-bottom: 4rem;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const PortfolioValueDisplay = styled.div`
  .label {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: ${props => props.theme.colors.textSecondary};
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .value {
    font-size: 4rem;
    font-weight: 900;
    letter-spacing: -2px;
    color: ${props => props.theme.colors.textPrimary};
    font-family: 'JetBrains Mono', monospace;
  }

  .change {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 1.1rem;
    font-weight: 700;
    padding: 0.4rem 1rem;
    border-radius: 10px;
    margin-top: 1rem;
    
    &.positive {
      background: ${props => props.theme.colors.success}15;
      color: ${props => props.theme.colors.success};
    }
    
    &.negative {
      background: ${props => props.theme.colors.danger}15;
      color: ${props => props.theme.colors.danger};
    }
  }
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SectionTitle = styled(motion.h2)`
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -1px;
  margin-bottom: 2rem;
  color: ${props => props.theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SectorCardsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 4rem;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const SectorCard = styled(motion.div)<{ accentColor: string }>`
  background: rgba(15, 15, 22, 0.6);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 2rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.accentColor};
    opacity: 0.8;
    transition: height 0.3s ease;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, ${props => props.accentColor}08 0%, transparent 60%);
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: ${props => props.accentColor}40;
    box-shadow: 0 20px 60px -15px ${props => props.accentColor}25,
                0 0 40px -10px ${props => props.accentColor}15;

    &::before {
      height: 4px;
    }
  }
`;

const SectorIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  animation: ${float} 3s ease-in-out infinite;
`;

const SectorName = styled.h3`
  font-size: 1.3rem;
  font-weight: 800;
  text-transform: capitalize;
  margin-bottom: 0.5rem;
  color: #fff;
  letter-spacing: -0.3px;
`;

const SectorMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

const HoldingsCount = styled.div`
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.4);
`;

const SectorValue = styled.div<{ isPositive: boolean }>`
  font-size: 1.1rem;
  font-weight: 800;
  color: ${props => props.isPositive ? '#10b981' : '#ef4444'};
  font-family: 'JetBrains Mono', monospace;
`;

const ViewArrow = styled.div<{ accentColor: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: ${props => props.accentColor};
  opacity: 0.7;
  transition: opacity 0.3s ease;
  letter-spacing: 1px;
  text-transform: uppercase;

  ${SectorCard}:hover & {
    opacity: 1;
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 0.75rem;
`;

const StatPill = styled.div`
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;

  span {
    color: rgba(255, 255, 255, 0.85);
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
  }
`;

const NewsletterSection = styled(motion.div)`
  margin-top: 4rem;
  padding: 3rem;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.borderRadius.large};
  border: 1px solid ${props => props.theme.colors.border};
  text-align: center;
  backdrop-filter: blur(10px);
`;

const NewsletterTitle = styled.h2`
  font-size: 2.2rem;
  margin-bottom: 1rem;
  background: ${props => props.theme.colors.accentPrimary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
`;

const NewsletterButton = styled.button`
  background: ${props => props.theme.colors.accentPrimary};
  border: none;
  color: #000;
  padding: 1rem 2.5rem;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.theme.shadows.glow};

  &:hover {
    transform: scale(1.05);
    filter: brightness(1.1);
  }
`;

const PaymentModal = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  background: #1a1a1a;
  padding: 2.5rem;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.1);
  z-index: 1001;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const PaymentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-top: 1.5rem;
`;

const PaymentInput = styled.input`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 1rem;
  border-radius: 10px;
  color: white;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #4facfe;
  }
`;

const Portfolio: React.FC = () => {
  const navigate = useNavigate();
  const { user, portfolio, portfolioBySector, removeFromPortfolio } = useAuth();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentData, setPaymentData] = useState({ card: '', expiry: '', cvv: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await fetch('/api/auth/newsletter/subscribe/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ email: user?.email })
      });

      await fetch('/api/auth/payments/dummy/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          amount: 9.99,
          card_number: paymentData.card,
          expiry: paymentData.expiry,
          cvv: paymentData.cvv
        })
      });

      alert('Successfully subscribed! Thank you for your payment.');
      setShowPayment(false);
    } catch (err) {
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalValue = portfolio.reduce((total, item) => {
    return total + item.price;
  }, 0);

  const totalChange = portfolio.reduce((total, item) => {
    return total + item.change;
  }, 0);

  const avgChange = portfolio.length > 0 ? (totalChange / portfolio.length).toFixed(2) : '0.00';
  const isPositive = parseFloat(avgChange) >= 0;

  const SECTOR_CONFIG: { [key: string]: { icon: string; color: string; gradient: string } } = {
    'it': { icon: '💻', color: '#4facfe', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    'banking': { icon: '🏦', color: '#f093fb', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    'automobile': { icon: '🚗', color: '#43e97b', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    'energy': { icon: '⚡', color: '#fa709a', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    'pharma': { icon: '💊', color: '#a18cd1', gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
    'fmcg': { icon: '🛒', color: '#fbc2eb', gradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
    'metals': { icon: '⛏️', color: '#ffecd2', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    'finance': { icon: '💰', color: '#a1c4fd', gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
    'realty': { icon: '🏗️', color: '#84fab0', gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
    'capital_goods': { icon: '🏭', color: '#ff4081', gradient: 'linear-gradient(135deg, #ff4081 0%, #ff80ab 100%)' },
    'telecom': { icon: '📡', color: '#536dfe', gradient: 'linear-gradient(135deg, #536dfe 0%, #8c9eff 100%)' },
    'chemicals': { icon: '🧪', color: '#76ff03', gradient: 'linear-gradient(135deg, #76ff03 0%, #b2ff59 100%)' },
    'consumer_durables': { icon: '🧺', color: '#ffd740', gradient: 'linear-gradient(135deg, #ffd740 0%, #ffe57f 100%)' },
    'construction': { icon: '🏗️', color: '#ff6e40', gradient: 'linear-gradient(135deg, #ff6e40 0%, #ff9e80 100%)' },
    'hospitality': { icon: '🏨', color: '#d4fc79', gradient: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' },
    'us_stocks': { icon: '🇺🇸', color: '#667eea', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  };

  const sectors = Object.entries(portfolioBySector);

  return (
    <PortfolioContainer>
      <PageHeader
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1>Institutional Portfolio</h1>
        <p>Advanced asset tracking and risk analysis. Zeus monitors your holdings with institutional-grade precision.</p>
      </PageHeader>

      <SummarySection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <PortfolioValueDisplay>
          <div className="label">Total Portfolio Value</div>
          <div className="value">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className={`change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '▲' : '▼'} {Math.abs(parseFloat(avgChange))}% Average Return
          </div>
        </PortfolioValueDisplay>
        <AnalyticsGrid>
          <div style={{ height: '100%', minHeight: '200px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>{sectors.length} Active Sectors</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '0.3rem' }}>{portfolio.length} total holdings</span>
          </div>
          <div style={{ height: '100%', minHeight: '200px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{isPositive ? '📈' : '📉'}</div>
            <span style={{ color: isPositive ? '#10b981' : '#ef4444', fontSize: '0.85rem', fontWeight: 700 }}>
              {isPositive ? 'Portfolio Trending Up' : 'Portfolio Trending Down'}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '0.3rem' }}>
              {isPositive ? '▲' : '▼'} {Math.abs(parseFloat(avgChange))}% avg change
            </span>
          </div>
        </AnalyticsGrid>
      </SummarySection>

      <PortfolioClusterGraph portfolio={portfolio} />

      {sectors.length > 0 ? (
        <>
          <SectionTitle
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            🏛️ Your Sector Holdings
          </SectionTitle>

          <SectorCardsGrid
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {sectors.map(([sector, stocks], index) => {
              const config = SECTOR_CONFIG[sector.toLowerCase()] || { icon: '📁', color: '#94a3b8', gradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' };
              const sectorTotalValue = stocks.reduce((sum, s) => sum + s.price, 0);
              const sectorAvgChange = stocks.length > 0 
                ? stocks.reduce((sum, s) => sum + s.change, 0) / stocks.length 
                : 0;
              const sectorIsPositive = sectorAvgChange >= 0;

              return (
                <SectorCard
                  key={sector}
                  accentColor={config.color}
                  onClick={() => navigate(`/portfolio/sector/${sector.toLowerCase()}`)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ y: -8 }}
                >
                  <SectorIcon>{config.icon}</SectorIcon>
                  <SectorName>{sector} Sector</SectorName>
                  
                  <StatsRow>
                    <StatPill>
                      Holdings: <span>{stocks.length}</span>
                    </StatPill>
                    <StatPill>
                      Value: <span>${sectorTotalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </StatPill>
                  </StatsRow>

                  <SectorMeta>
                    <HoldingsCount>
                      {stocks.map(s => s.symbol).slice(0, 3).join(', ')}
                      {stocks.length > 3 ? ` +${stocks.length - 3}` : ''}
                    </HoldingsCount>
                    <SectorValue isPositive={sectorIsPositive}>
                      {sectorIsPositive ? '▲' : '▼'} {Math.abs(sectorAvgChange).toFixed(2)}%
                    </SectorValue>
                  </SectorMeta>

                  <ViewArrow accentColor={config.color}>
                    View Stocks & Analytics →
                  </ViewArrow>
                </SectorCard>
              );
            })}
          </SectorCardsGrid>
        </>
      ) : (
        <GlassCard style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Your portfolio is empty</h3>
          <p style={{ color: '#94a3b8' }}>Start adding stocks to track your performance and get deep analytics.</p>
          <button 
            onClick={() => navigate('/stocks')}
            style={{ 
              marginTop: '2rem',
              padding: '0.8rem 2rem',
              background: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Explore Stocks
          </button>
        </GlassCard>
      )}

      <NewsletterSection
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <NewsletterTitle>Premium Intelligence</NewsletterTitle>
        <p style={{ color: '#94a3b8', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
          Get exclusive market reports and AI-driven trade signals delivered to your inbox weekly.
        </p>
        <NewsletterButton onClick={() => setShowPayment(true)}>
          Subscribe to Zeus Premium
        </NewsletterButton>
      </NewsletterSection>

      <AnimatePresence>
        {showPayment && (
          <>
            <Overlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayment(false)}
            />
            <PaymentModal
              initial={{ opacity: 0, scale: 0.9, y: '-50%', x: '-50%' }}
              animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, y: '-50%', x: '-50%' }}
            >
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Zeus Premium</h2>
              <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>$9.99 / month • Cancel anytime</p>
              <PaymentForm onSubmit={handlePayment}>
                <PaymentInput 
                  placeholder="Card Number" 
                  value={paymentData.card}
                  onChange={e => setPaymentData({...paymentData, card: e.target.value})}
                  required
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <PaymentInput 
                    placeholder="MM/YY" 
                    value={paymentData.expiry}
                    onChange={e => setPaymentData({...paymentData, expiry: e.target.value})}
                    required
                  />
                  <PaymentInput 
                    placeholder="CVV" 
                    value={paymentData.cvv}
                    onChange={e => setPaymentData({...paymentData, cvv: e.target.value})}
                    required
                  />
                </div>
                <NewsletterButton 
                  type="submit" 
                  disabled={isProcessing}
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  {isProcessing ? 'Processing...' : 'Complete Payment'}
                </NewsletterButton>
              </PaymentForm>
              <button 
                onClick={() => setShowPayment(false)}
                style={{ 
                  width: '100%', 
                  background: 'transparent', 
                  border: 'none', 
                  color: '#94a3b8', 
                  marginTop: '1rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Cancel
              </button>
            </PaymentModal>
          </>
        )}
      </AnimatePresence>
    </PortfolioContainer>
  );
};

export default Portfolio;