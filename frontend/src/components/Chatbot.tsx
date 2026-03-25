<<<<<<< HEAD
import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const ChatbotContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

const ChatbotToggle = styled(motion.button)`
  width: 55px;
  height: 55px;
  border-radius: 50%;
  background: ${props => props.theme.colors.accentPrimary};
  border: none;
  color: #000;
  font-size: 1.4rem;
  cursor: pointer;
  box-shadow: ${props => props.theme.shadows.glow};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${props => props.theme.transitions.default};

  &:hover {
    transform: scale(1.1) rotate(5deg);
  }
`;

const ChatWindow = styled(motion.div)`
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 400px;
  height: 600px;
  background: rgba(10, 10, 10, 0.8);
  border-radius: 40px;
  box-shadow: 0 50px 100px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(40px);
  overflow: hidden;

=======
import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const getApiBase = () => {
  const env = (window as any).REACT_APP_API_URL || (window as any).REACT_APP_API_BASE;
  if (env) return env.replace(/\/api\/?$/, '');
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? `http://${window.location.hostname}:8000`
    : 'http://localhost:8000';
};
const API_BASE = getApiBase();

const PREDEFINED_QUESTIONS = [
  { icon: '📊', text: 'What is my portfolio risk level?' },
  { icon: '🌟', text: 'Suggest stocks for me' },
  { icon: '🔮', text: 'What is the market prediction this week?' },
  { icon: '⚔️', text: 'Compare TCS vs Infosys for me' },
  { icon: '📰', text: "What is today's market news?" },
];

const QUESTIONS_TO_ASK = [
  'What is P/E ratio?',
  'Explain RSI indicator',
  'What is the gold price today?',
  'Show me top IT stocks',
  'What is a moving average?',
  'How does SIP work?',
  'Add TCS to my portfolio',
  'What is Nifty 50?',
  'Forecast TCS for next 15 days',
  'Remove Infosys from my portfolio',
];

/* ─────────────────────────────────────────
   ANIMATIONS
───────────────────────────────────────── */
const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
`;
const borderAnim = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;
const glitch = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-1px); }
  75% { transform: translateX(1px); }
`;
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;
const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulseRing = keyframes`
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 242, 254, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(0, 242, 254, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 242, 254, 0); }
`;
/* ─────────────────────────────────────────
   STYLED COMPONENTS
───────────────────────────────────────── */
const Container = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  font-family: 'Inter', -apple-system, sans-serif;
`;

const ToggleBtn = styled(motion.button)`
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: #040406;
  border: none;
  color: #fff;
  font-size: 1.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 0 40px rgba(0,0,0,0.5);
`;

const RotatingHalo = styled(motion.div)`
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00f2fe, #4facfe, #a855f7, #00f2fe);
  background-size: 400% 400%;
  animation: ${rotate} 4s linear infinite, ${borderAnim} 10s ease infinite;
  z-index: -1;
  filter: blur(2px);
  
  &::before {
    content: '';
    position: absolute;
    inset: 2px;
    background: #040406;
    border-radius: 50%;
  }
`;

const InnerIcon = styled.div`
  background: linear-gradient(135deg, #00f2fe, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 900;
  filter: drop-shadow(0 0 5px rgba(0, 242, 254, 0.5));
`;

const NotificationDot = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 14px;
  height: 14px;
  background: #00ffa3;
  border-radius: 50%;
  border: 2px solid #040406;
  animation: ${pulse} 2s infinite;
`;

const WindowBorderWrap = styled(motion.div)`
  position: absolute;
  bottom: 72px;
  right: 0;
  width: 420px;
  padding: 1.5px;
  border-radius: 28px;
  background: linear-gradient(135deg, #00f2fe, #4facfe, #a855f7, #00f2fe);
  background-size: 300% 300%;
  animation: ${borderAnim} 6s ease infinite;
  box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(0,242,254,0.15);

  @media (max-width: 480px) {
    width: calc(100vw - 32px);
    right: -12px;
  }
`;

const ChatWindow = styled.div`
  width: 100%;
  height: 600px;
  background: rgba(6, 6, 12, 0.94);
  background-image: 
    radial-gradient(circle at 50% 0%, rgba(0, 242, 254, 0.05) 0%, transparent 70%),
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 100% 100%, 25px 25px, 25px 25px;
  border-radius: 27px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(40px);
  position: relative;
  
>>>>>>> 7bc85fc (Resolved merge)
  &::before {
    content: '';
    position: absolute;
    inset: 0;
<<<<<<< HEAD
    background: radial-gradient(circle at 0% 0%, rgba(0, 242, 254, 0.05) 0%, transparent 50%);
=======
    background: radial-gradient(circle at top right, rgba(168, 85, 247, 0.05), transparent 40%);
>>>>>>> 7bc85fc (Resolved merge)
    pointer-events: none;
  }
`;

<<<<<<< HEAD
const ChatHeader = styled.div`
  padding: 2rem;
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const ChatTitle = styled.h3`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.8rem;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: #00ffa3;
    border-radius: 50%;
    box-shadow: 0 0 10px #00ffa3;
  }
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
=======
const Header = styled.div`
  padding: 1.2rem 1.5rem;
  background: rgba(255,255,255,0.02);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const AvatarRing = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00f2fe, #a855f7);
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AvatarInner = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #0a0a12;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const HeaderTitle = styled.div`
  h3 {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 900;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #fff;
    animation: ${glitch} 10s ease-in-out infinite;
  }
  p {
    margin: 0;
    font-size: 0.65rem;
    color: rgba(255,255,255,0.4);
    letter-spacing: 0.5px;
  }
`;

const StatusDot = styled.span<{ online?: boolean }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${props => props.online ? '#00ffa3' : '#888'};
  box-shadow: ${props => props.online ? '0 0 8px #00ffa3' : 'none'};
  animation: ${props => props.online ? pulse : 'none'} 2s infinite;
  display: inline-block;
  margin-right: 0.3rem;
`;

const ModeBadge = styled.div<{ private?: boolean }>`
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 1px;
  padding: 3px 8px;
  border-radius: 20px;
  text-transform: uppercase;
  background: ${props => props.private
    ? 'rgba(168,85,247,0.15)'
    : 'rgba(0,242,254,0.1)'};
  color: ${props => props.private ? '#a855f7' : '#00f2fe'};
  border: 1px solid ${props => props.private
    ? 'rgba(168,85,247,0.3)'
    : 'rgba(0,242,254,0.2)'};
`;

const CloseBtn = styled.button`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: all 0.2s;
  &:hover { background: rgba(255,255,255,0.1); color: #fff; }
`;

const MessageArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(0,242,254,0.2);
>>>>>>> 7bc85fc (Resolved merge)
    border-radius: 10px;
  }
`;

<<<<<<< HEAD
const Message = styled(motion.div)<{ isBot: boolean }>`
  display: flex;
  justify-content: ${props => props.isBot ? 'flex-start' : 'flex-end'};
`;

const MessageBubble = styled.div<{ isBot: boolean }>`
  max-width: 85%;
  padding: 1rem 1.4rem;
  border-radius: ${props => props.isBot ? '24px 24px 24px 4px' : '24px 24px 4px 24px'};
  background: ${props => props.isBot ? 'rgba(255, 255, 255, 0.03)' : 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)'};
  color: ${props => props.isBot ? 'rgba(255, 255, 255, 0.8)' : '#000'};
  font-size: 0.9rem;
  line-height: 1.6;
  font-weight: 500;
  border: 1px solid ${props => props.isBot ? 'rgba(255, 255, 255, 0.05)' : 'transparent'};
  box-shadow: ${props => !props.isBot ? '0 10px 20px rgba(0, 242, 254, 0.2)' : 'none'};
`;

const InputContainer = styled.form`
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.01);
  display: flex;
  gap: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const Input = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 0.8rem 1.2rem;
  color: #fff;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: rgba(0, 242, 254, 0.5);
    background: rgba(255, 255, 255, 0.05);
  }
`;

const SendButton = styled.button`
  background: #fff;
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 50%;
=======
const QuestionPills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const QuestionPill = styled(motion.button)`
  background: rgba(0,242,254,0.06);
  border: 1px solid rgba(0,242,254,0.2);
  border-radius: 20px;
  padding: 5px 12px;
  color: rgba(0,242,254,0.8);
  font-size: 0.7rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  &:hover {
    background: rgba(0,242,254,0.12);
    border-color: rgba(0,242,254,0.4);
    color: #00f2fe;
  }
`;

const MsgRow = styled(motion.div)<{ bot: boolean }>`
  display: flex;
  justify-content: ${p => p.bot ? 'flex-start' : 'flex-end'};
  flex-direction: column;
  align-items: ${p => p.bot ? 'flex-start' : 'flex-end'};
`;

const SysLog = styled.div`
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 0.58rem;
  color: #00ffa3;
  opacity: 0.5;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
  &::before { content: '>> '; font-weight: 900; }
`;

const Bubble = styled(motion.div)<{ bot?: boolean }>`
  max-width: 85%;
  padding: 1rem 1.25rem;
  border-radius: ${props => props.bot ? '20px 20px 20px 4px' : '20px 20px 4px 20px'};
  background: ${props => props.bot 
    ? 'rgba(255, 255, 255, 0.03)' 
    : 'linear-gradient(135deg, rgba(0, 242, 254, 0.1), rgba(168, 85, 247, 0.1))'};
  color: ${props => props.bot ? '#e0e0e0' : '#fff'};
  font-size: 0.85rem;
  line-height: 1.5;
  border: 1px solid ${props => props.bot 
    ? 'rgba(255,255,255,0.08)' 
    : 'rgba(0, 242, 254, 0.3)'};
  backdrop-filter: blur(10px);
  box-shadow: ${props => props.bot 
    ? '0 10px 30px rgba(0,0,0,0.2)' 
    : '0 10px 30px rgba(0, 242, 254, 0.05)'};
  position: relative;
  
  p { margin: 0; }
  strong { color: #00f2fe; }
`;

const BotActionIcon = styled.div`
  position: absolute;
  top: -10px;
  left: -10px;
  width: 24px;
  height: 24px;
  background: #040406;
  border: 1px solid rgba(0, 242, 254, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  z-index: 2;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.3);
`;

const intentColors: Record<string, string> = {
  recommendation: '#10b981',
  portfolio: '#a855f7',
  forecasting: '#f59e0b',
  qa: '#00f2fe',
  error: '#ef4444',
  general: '#6b7280',
};

const IntentTag = styled.span<{ intent: string }>`
  display: inline-block;
  font-size: 0.58rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 2px 7px;
  border-radius: 20px;
  margin-top: 5px;
  background: ${p => `${intentColors[p.intent] || '#6b7280'}20`};
  color: ${p => intentColors[p.intent] || '#6b7280'};
  border: 1px solid ${p => `${intentColors[p.intent] || '#6b7280'}40`};
`;

const TypingWrap = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.7rem 1rem;
  background: rgba(255,255,255,0.04);
  border-radius: 20px 20px 20px 4px;
  border: 1px solid rgba(255,255,255,0.06);
  width: fit-content;
`;

const Dot = styled.span<{ d: number }>`
  width: 5px;
  height: 5px;
  background: #00f2fe;
  border-radius: 50%;
  animation: ${pulse} 1.4s ease-in-out infinite;
  animation-delay: ${p => p.d * 0.16}s;
`;

const TypingLabel = styled.span`
  font-size: 0.6rem;
  color: rgba(0,242,254,0.6);
  letter-spacing: 1px;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', monospace;
`;

const InputBar = styled.form`
  padding: 1.2rem;
  background: rgba(255,255,255,0.02);
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  gap: 0.75rem;
  align-items: center;
  position: relative;
  
  &::before {
    content: '>>';
    color: #4facfe;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    font-weight: bold;
    opacity: 0.6;
    margin-left: 0.5rem;
  }
`;

const TextInput = styled.input`
  flex: 1;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 0.7rem 1.1rem;
  color: #fff;
  font-size: 0.85rem;
  outline: none;
  transition: all 0.3s;
  &:focus {
    border-color: rgba(0,242,254,0.4);
    background: rgba(255,255,255,0.07);
  }
  &::placeholder { color: rgba(255,255,255,0.2); }
`;

const SendBtn = styled(motion.button)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00f2fe, #4facfe);
  border: none;
>>>>>>> 7bc85fc (Resolved merge)
  color: #000;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
<<<<<<< HEAD
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05) rotate(-10deg);
    background: #00f2fe;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const FAQs = [
  {
    keywords: ['hello', 'hi', 'hey', 'start', 'zeus'],
    response: 'Hello! 👋 I\'m Zeus Assistant. I can help you manage your wealth and understand market trends. Try asking me about:\n• Portfolio management\n• Market sectors\n• Analytics and indicators (RSI, MA20)\n• Precious metals (Gold/Silver)\n• Financial news and predictions'
  },
  {
    keywords: ['portfolio', 'add stock', 'how to add', 'my stocks'],
    response: '💼 Portfolio Management:\n1. Browse "📈 Stocks" in the sidebar.\n2. Select a sector (e.g., IT, Banking).\n3. Click "Add" on any stock card.\n4. Access your "💼 Portfolio" to view totals and P/E trends.\n\n*Note: You must be logged in to save your portfolio.*'
  },
  {
    keywords: ['pe ratio', 'p/e', 'valuation', 'expensive'],
    response: '📊 P/E Ratio (Price-to-Earnings):\n• It shows how much you pay for $1 of a company\'s profit.\n• High P/E: Investors expect high growth (or the stock is overvalued).\n• Low P/E: The stock might be undervalued or have low growth potential.\n• We track your portfolio\'s P/E over time to monitor valuation trends.'
  },
  {
    keywords: ['rsi', 'relative strength', 'overbought', 'oversold'],
    response: '📉 RSI (Relative Strength Index):\n• RSI < 30: The asset is "Oversold" (potential buying opportunity).\n• RSI > 70: The asset is "Overbought" (potential selling signal).\n• We integrate RSI into our metals and stock charts to help you spot entry/exit points.'
  },
  {
    keywords: ['ma20', 'moving average', 'trend line', 'sma'],
    response: '📈 MA20 (20-Day Moving Average):\n• It calculates the average price over the last 20 days.\n• Price > MA20: Strong bullish momentum.\n• Price < MA20: Potential bearish trend.\n• We use this on our Gold/Silver graphs to smooth out daily volatility.'
  },
  {
    keywords: ['gold', 'silver', 'metals', 'rate', 'price'],
    response: '💰 Precious Metals:\n• Gold (XAU): Current spot price around $5,173.73/oz.\n• Silver (XAG): Current spot price around $85.3735/oz.\n• Gold is a "safe haven" during inflation, while Silver has high industrial use.'
  },
  {
    keywords: ['prediction', 'future', 'forecast', 'march'],
    response: '🔮 Market Predictions:\n• We use statistical models for 15-day and monthly (March) forecasts.\n• "Bullish": Expecting prices to rise (🚀).\n• "Bearish": Expecting prices to fall (📉).\n• Check our daily March prediction table on the Gold/Silver page!'
  },
  {
    keywords: ['api key', 'secret', 'developer', 'zeus_'],
    response: '🔑 API Keys:\n• Every Zeus user gets a unique API key (e.g., zeus_abc...).\n• You can find yours in the Profile or after logging in.\n• Use this key to access our backend financial endpoints programmatically.'
  },
  {
    keywords: ['bullish', 'bearish', 'market trend', 'up', 'down'],
    response: '🐂 Bullish vs 🐻 Bearish:\n• Bullish: Prices are going up. Think of a bull tossing prices up with its horns!\n• Bearish: Prices are going down. Think of a bear swiping prices down with its paws.'
  },
  {
    keywords: ['login', 'signup', 'account', 'register'],
    response: '🔐 Account Access:\n• Use the "Sign Up" toggle to switch between Login and Register.\n• Creating an account lets you save your portfolio and view your API key.'
  },
  {
    keywords: ['help', 'options', 'what can you do', 'features'],
    response: '🛠️ Zeus Features:\n• Live Market Tracking (Stocks & Metals)\n• Advanced Analytics (RSI, MA20, Correlation)\n• AI-Driven Price Predictions\n• Real-Time Financial News\n• Secure Portfolio Management'
  },
  {
    keywords: ['market cap', 'capitalization', 'large cap', 'mid cap'],
    response: '🏢 Market Capitalization:\n• The total value of all a company\'s shares.\n• Large Cap: Stable, established companies (e.g., Apple, Reliance).\n• Mid/Small Cap: Higher growth potential but higher risk.\n• We display market caps to help you understand company size.'
  },
  {
    keywords: ['dividend', 'yield', 'payout'],
    response: '💰 Dividends:\n• A portion of company profits paid out to shareholders.\n• Dividend Yield: The annual dividend payment divided by the stock price.\n• High-yield stocks are often favored for steady income.'
  },
  {
    keywords: ['volatility', 'risk', 'beta', 'swing'],
    response: '📉 Volatility:\n• How much an asset\'s price swings up or down.\n• High Volatility: Fast price changes (higher risk/reward).\n• Low Volatility: Steady price movements (lower risk).\n• Our K-Means clustering helps you identify volatile stocks in your portfolio.'
  },
  {
    keywords: ['index', 's&p 500', 'nifty', 'market benchmark'],
    response: '📈 Market Indices:\n• An Index tracks a group of stocks to represent the overall market (e.g., S&P 500, Nifty 50).\n• It acts as a benchmark to compare your portfolio\'s performance.'
  }
];

const TypingIndicator = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  background: ${props => props.theme.colors.secondaryBackground};
  border-radius: ${props => props.theme.borderRadius.medium};
  width: fit-content;
  border: 1px solid ${props => props.theme.colors.border};

  span {
    width: 6px;
    height: 6px;
    background: ${props => props.theme.colors.accentPrimary};
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
  }

  span:nth-child(1) { animation-delay: -0.32s; }
  span:nth-child(2) { animation-delay: -0.16s; }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1.0); }
  }
`;

const SystemLog = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: #00ffa3;
  opacity: 0.6;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '>>';
    font-weight: 900;
  }
`;

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'SYSTEM INITIALIZED. NEURAL UPLINK ESTABLISHED. ⚡\n\nI am Zeus Core Assistant. Ready to provide strategic financial intelligence and portfolio diagnostics.',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const findResponse = (userMessage: string): string => {
    const words = userMessage.toLowerCase().trim().split(/\s+/);
    let bestMatch = null;
    let highestScore = 0;

    for (const faq of FAQs) {
      let score = 0;
      for (const keyword of faq.keywords) {
        if (userMessage.toLowerCase().includes(keyword)) {
          score += 2; // Exact keyword match
        }
        for (const word of words) {
          if (word === keyword) score += 3; // Word-for-word match
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = faq;
      }
    }

    if (highestScore > 1) {
      return bestMatch!.response;
    }

    return "I'm still learning about that! 🧠 Try asking about:\n• Gold/Silver prices\n• P/E Ratio or RSI\n• Portfolio management\n• Market predictions\n• App features like API keys";
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMsgText = inputValue;
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: userMsgText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot thinking/typing
    setTimeout(() => {
      const response = findResponse(userMsgText);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <ChatbotContainer>
      <ChatbotToggle
        onClick={() => setIsOpen(!isOpen)}
        animate={{ scale: isOpen ? 0.9 : 1 }}
        title="Chat Assistant"
      >
        {isOpen ? '✕' : '💬'}
      </ChatbotToggle>

      <AnimatePresence mode="wait">
        {isOpen && (
          <ChatWindow
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <ChatHeader>
              <ChatTitle>Assistant</ChatTitle>
              <div style={{ opacity: 0.6, fontSize: '0.8rem' }}>Online</div>
            </ChatHeader>

            <MessageList>
              {messages.map((message) => (
                <div key={message.id}>
                  {message.isBot && (
                    <SystemLog>
                      PROCESSED_{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </SystemLog>
                  )}
                  <Message
                    isBot={message.isBot}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <MessageBubble isBot={message.isBot}>
                      {message.text.split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </MessageBubble>
                  </Message>
                </div>
              ))}
              {isTyping && (
                <div>
                  <SystemLog>CALCULATING_RESPONSE...</SystemLog>
                  <Message isBot={true} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <TypingIndicator>
                      <span></span>
                      <span></span>
                      <span></span>
                    </TypingIndicator>
                  </Message>
                </div>
              )}
            </MessageList>

            <InputContainer onSubmit={handleSubmit}>
              <Input
                type="text"
                placeholder="Type a message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <SendButton type="submit" disabled={!inputValue.trim()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </SendButton>
            </InputContainer>
          </ChatWindow>
        )}
      </AnimatePresence>
    </ChatbotContainer>
=======
  flex-shrink: 0;
  &:disabled { opacity: 0.3; cursor: not-allowed; }
`;

/* ─── MPIN Overlay ─── */
const MpinOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(4,4,6,0.92);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 27px;
`;

const MpinCard = styled(motion.div)`
  width: 280px;
  padding: 2rem;
  background: rgba(10,10,20,0.9);
  border: 1px solid rgba(168,85,247,0.3);
  border-radius: 24px;
  box-shadow: 0 0 40px rgba(168,85,247,0.2);
  text-align: center;
`;

const MpinTitle = styled.h3`
  margin: 0 0 0.3rem;
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #a855f7, #00f2fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const MpinSub = styled.p`
  margin: 0 0 1.5rem;
  font-size: 0.72rem;
  color: rgba(255,255,255,0.4);
  line-height: 1.5;
`;

const MpinDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 1.5rem;
`;

const MpinDot = styled.div<{ filled: boolean }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid ${p => p.filled ? '#a855f7' : 'rgba(255,255,255,0.2)'};
  background: ${p => p.filled ? '#a855f7' : 'transparent'};
  box-shadow: ${p => p.filled ? '0 0 10px rgba(168,85,247,0.6)' : 'none'};
  transition: all 0.2s;
`;

const PinGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 1rem;
`;

const PinKey = styled(motion.button)`
  height: 48px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: rgba(168,85,247,0.15);
    border-color: rgba(168,85,247,0.4);
  }
  &:active { transform: scale(0.95); }
`;

const MpinError = styled(motion.div)`
  font-size: 0.72rem;
  color: #ef4444;
  margin-bottom: 0.8rem;
  font-weight: 700;
`;

const MpinSuccess = styled(motion.div)`
  font-size: 0.72rem;
  color: #10b981;
  margin-bottom: 0.8rem;
  font-weight: 700;
`;

const MpinCancelBtn = styled.button`
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.3);
  font-size: 0.72rem;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 0.5rem;
  &:hover { color: rgba(255,255,255,0.6); }
`;

const VerifyBtn = styled(motion.button)`
  width: 100%;
  padding: 0.7rem;
  background: linear-gradient(135deg, #a855f7, #6366f1);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 0.85rem;
  font-weight: 900;
  cursor: pointer;
  letter-spacing: 1px;
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
interface Message {
  id: string;
  text: string;
  bot: boolean;
  intent?: string;
  ts: Date;
}

interface MpinState {
  active: boolean;
  pin: string;
  action?: string;
  symbol?: string;
  stockName?: string;
  price?: number;
  userId?: number;
  error: string;
  loading: boolean;
  attempts: number;
}

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `zeus_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: 'SYSTEM INITIALIZED ⚡\n\nI am Zeus Core — your AI financial intelligence engine.\n\nAsk me anything about stocks, markets, portfolio, or predictions.',
      bot: true,
      intent: 'general',
      ts: new Date(),
    },
  ]);
  const [mpin, setMpin] = useState<MpinState>({
    active: false, pin: '', error: '', loading: false, attempts: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-close on tab switch, defocus, outside click, or scroll
  useEffect(() => {
    if (!open) return;

    const closeChat = () => setOpen(false);

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeChat();
      }
    };

    document.addEventListener('visibilitychange', closeChat);
    window.addEventListener('blur', closeChat);
    window.addEventListener('scroll', closeChat, { passive: true });
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('visibilitychange', closeChat);
      window.removeEventListener('blur', closeChat);
      window.removeEventListener('scroll', closeChat);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Detect if user is logged in
  const token = localStorage.getItem('accessToken');
  const isPrivate = !!token;

  const scrollBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollBottom(); }, [messages, loading]);

  const addMessage = useCallback((msg: Omit<Message, 'id' | 'ts'>) => {
    setMessages(prev => [...prev, { ...msg, id: Date.now().toString(), ts: new Date() }]);
  }, []);

  const sendQuery = useCallback(async (query: string) => {
    if (!query.trim() || loading) return;
    addMessage({ text: query, bot: false });
    setInput('');
    setLoading(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/chat/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, session_id: sessionId }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      addMessage({
        text: data.response || '⚡ No response received.',
        bot: true,
        intent: data.intent || 'qa',
      });

      // If portfolio action + MPIN required
      if (data.requires_mpin && data.symbol) {
        setMpin(prev => ({
          ...prev,
          active: true,
          pin: '',
          error: '',
          action: data.action,
          symbol: data.symbol,
          stockName: data.stock_name,
          price: data.price,
          userId: undefined, // will extract from token at verify time
        }));
      }
    } catch (err: any) {
      addMessage({
        text: "⚡ **Zeus AI is temporarily unavailable.**\n\nPlease check your connection and try again.",
        bot: true,
        intent: 'error',
      });
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [addMessage, loading, sessionId, token]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendQuery(input); };

  /* ── MPIN handlers ── */
  const pressKey = (k: string) => {
    if (mpin.pin.length < 4 && k !== 'DEL') {
      setMpin(p => ({ ...p, pin: p.pin + k, error: '' }));
    }
    if (k === 'DEL') {
      setMpin(p => ({ ...p, pin: p.pin.slice(0, -1), error: '' }));
    }
  };

  const getUserIdFromToken = (): number | null => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || payload.id || null;
    } catch { return null; }
  };

  const verifyMpin = async () => {
    if (mpin.pin.length !== 4) {
      setMpin(p => ({ ...p, error: 'Enter 4-digit MPIN' }));
      return;
    }
    const userId = getUserIdFromToken();
    if (!userId) {
      setMpin(p => ({ ...p, error: 'Session expired. Please log in again.' }));
      return;
    }

    setMpin(p => ({ ...p, loading: true, error: '' }));
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-mpin/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, mpin: mpin.pin }),
      });
      const data = await res.json();

      if (data.verified) {
        // MPIN correct → execute portfolio action
        setMpin(p => ({ ...p, loading: false, pin: '' }));

        if (mpin.action === 'portfolio_add' && mpin.symbol) {
          try {
            const addRes = await fetch(`${API_BASE}/api/auth/portfolio/add/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ symbol: mpin.symbol, sector: 'general', quantity: 1, buying_price: mpin.price || 0 }),
            });
            const addData = await addRes.json();
            addMessage({
              text: addData.success
                ? `✅ **${mpin.stockName} added to your portfolio!**\nRefreshing your Vault...`
                : `⚠️ Could not add stock: ${addData.message}`,
              bot: true,
              intent: 'portfolio',
            });
            
            if (addData.success) {
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            }
          } catch (err: any) {
            addMessage({ text: `⚠️ Failed to execute portfolio action. API Error.`, bot: true, intent: 'error' });
          }
        } else if (mpin.action === 'portfolio_remove' && mpin.symbol) {
          addMessage({
            text: `✅ **${mpin.stockName} removed from your portfolio.**\nYour holdings have been updated.`,
            bot: true,
            intent: 'portfolio',
          });
        }
        setMpin(prev => ({ ...prev, active: false }));
      } else {
        const remaining = data.attempts_remaining ?? (2 - mpin.attempts);
        setMpin(p => ({
          ...p,
          loading: false,
          pin: '',
          attempts: p.attempts + 1,
          error: `Incorrect MPIN. ${remaining} attempt(s) remaining.`,
        }));
      }
    } catch {
      setMpin(p => ({ ...p, loading: false, error: 'Verification failed. Try again.' }));
    }
  };

  const cancelMpin = () => {
    setMpin({ active: false, pin: '', error: '', loading: false, attempts: 0 });
    addMessage({ text: '🚫 Action cancelled. Portfolio unchanged.', bot: true, intent: 'portfolio' });
  };

  const keyLayout = ['1','2','3','4','5','6','7','8','9','','0','DEL'];

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <Container ref={containerRef}>
      {/* Toggle button */}
      <ToggleBtn
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
      >
        <RotatingHalo />
        {open ? '✕' : <InnerIcon>🤖</InnerIcon>}
        {!open && <NotificationDot />}
      </ToggleBtn>

      <AnimatePresence>
        {open && (
          <WindowBorderWrap
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          >
            <ChatWindow>
              {/* Header */}
              <Header>
                <HeaderLeft>
                  <AvatarRing>
                    <AvatarInner>
                      <img src="/api/media/zeus_ai_avatar.png" alt="Zeus AI" onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerText = '⚡';
                      }} />
                    </AvatarInner>
                  </AvatarRing>
                  <HeaderTitle>
                    <h3>Zeus AI Core</h3>
                    <p>
                      <StatusDot online />
                      Neural Intelligence Online
                    </p>
                  </HeaderTitle>
                </HeaderLeft>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ModeBadge private={isPrivate}>
                    {isPrivate ? '🔒 Private' : '🌐 Public'}
                  </ModeBadge>
                  <CloseBtn onClick={() => setOpen(false)}>✕</CloseBtn>
                </div>
              </Header>

              {/* Messages */}
              <MessageArea>
                {messages.map((msg, i) => (
                  <MsgRow
                    key={msg.id}
                    bot={msg.bot}
                    initial={{ opacity: 0, x: msg.bot ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {msg.bot && (
                      <SysLog>
                        ZEUS_AI · {msg.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </SysLog>
                    )}
                    <Bubble bot={msg.bot}>
                      {msg.bot && <BotActionIcon>🤖</BotActionIcon>}
                      <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
                      
                      {msg.bot && msg.intent === 'general' && messages.length < 3 && (
                        <QuestionPills>
                          {PREDEFINED_QUESTIONS.map(q => (
                            <QuestionPill
                              key={q.text}
                              onClick={() => sendQuery(q.text)}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              {q.icon} {q.text}
                            </QuestionPill>
                          ))}
                        </QuestionPills>
                      )}
                    </Bubble>
                    {msg.bot && msg.intent && msg.intent !== 'general' && (
                      <IntentTag intent={msg.intent}>{msg.intent}</IntentTag>
                    )}
                  </MsgRow>
                ))}

                {loading && (
                  <MsgRow
                    bot
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <SysLog>ZEUS_AI · PROCESSING...</SysLog>
                    <TypingWrap>
                      <Dot d={0} />
                      <Dot d={1} />
                      <Dot d={2} />
                      <TypingLabel>ZEUS · THINKING</TypingLabel>
                    </TypingWrap>
                  </MsgRow>
                )}
                <div ref={bottomRef} />
              </MessageArea>

              {/* Input */}
              <InputBar onSubmit={handleSubmit}>
                <TextInput
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask Zeus AI anything…"
                  disabled={loading}
                />
                <SendBtn
                  type="submit"
                  disabled={!input.trim() || loading}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </SendBtn>
              </InputBar>

              {/* MPIN Overlay */}
              <AnimatePresence>
                {mpin.active && (
                  <MpinOverlay
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <MpinCard
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.85, opacity: 0 }}
                    >
                      <MpinTitle>🔐 VERIFY MPIN</MpinTitle>
                      <MpinSub>
                        {mpin.stockName ? `Confirm action for ${mpin.stockName}` : 'Enter your 4-digit secure PIN'}
                      </MpinSub>

                      <MpinDots>
                        {[0,1,2,3].map(i => (
                          <MpinDot key={i} filled={i < mpin.pin.length} />
                        ))}
                      </MpinDots>

                      <AnimatePresence>
                        {mpin.error && (
                          <MpinError
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                          >
                            ⚠️ {mpin.error}
                          </MpinError>
                        )}
                      </AnimatePresence>

                      <PinGrid>
                        {keyLayout.map((k, i) => (
                          <PinKey
                            key={i}
                            onClick={() => k && pressKey(k)}
                            disabled={!k}
                            style={{ opacity: k ? 1 : 0, cursor: k ? 'pointer' : 'default' }}
                            whileTap={k ? { scale: 0.9 } : {}}
                          >
                            {k === 'DEL' ? '⌫' : k}
                          </PinKey>
                        ))}
                      </PinGrid>

                      <VerifyBtn
                        onClick={verifyMpin}
                        disabled={mpin.pin.length !== 4 || mpin.loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {mpin.loading ? 'VERIFYING…' : 'VERIFY MPIN'}
                      </VerifyBtn>

                      <br />
                      <MpinCancelBtn onClick={cancelMpin}>Cancel action</MpinCancelBtn>
                    </MpinCard>
                  </MpinOverlay>
                )}
              </AnimatePresence>
            </ChatWindow>
          </WindowBorderWrap>
        )}
      </AnimatePresence>
    </Container>
>>>>>>> 7bc85fc (Resolved merge)
  );
};

export default Chatbot;
