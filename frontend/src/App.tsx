import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import News from './pages/News';
import GoldSilver from './pages/GoldSilver';
import Stocks from './pages/Stocks';
import Portfolio from './pages/Portfolio';
import PortfolioSector from './pages/PortfolioSector';
import Signup from './pages/Signup';
import SectorStocks from './pages/SectorStocks';
import MpinCreate from './pages/MpinCreate';
import { AuthProvider } from './contexts/AuthContext';
import RequireAuth from './components/RequireAuth';
import { theme } from './styles/theme';
import './App.css';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.textPrimary};
    font-family: 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
    line-height: 1.5;
  }

  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background};
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    letter-spacing: -0.02em;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.textPrimary};
  position: relative;
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: 
      radial-gradient(circle at 0% 0%, rgba(56, 189, 248, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 100% 100%, rgba(168, 85, 247, 0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
`;

const MainContent = styled(motion.div)`
  flex: 1;
  padding: 2rem 4rem;
  margin-top: 80px;
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition: any = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <AuthProvider>
          <AppContainer>
            <Navbar />
            <Chatbot />
            <AnimatePresence mode="wait">
              <MainContent
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/gold-silver" element={<GoldSilver />} />
                  <Route path="/stocks" element={<Stocks />} />
                  <Route path="/stocks/:sector" element={<SectorStocks />} />
                  <Route
                    path="/portfolio"
                    element={
                      <RequireAuth>
                        <Portfolio />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/portfolio/sector/:sector"
                    element={
                      <RequireAuth>
                        <PortfolioSector />
                      </RequireAuth>
                    }
                  />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/mpin/create" element={<MpinCreate />} />
                </Routes>
              </MainContent>
            </AnimatePresence>
            <Footer />
          </AppContainer>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;