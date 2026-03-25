import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const NavbarWrapper = styled.div`
  position: fixed;
  top: 2rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 1000;
  pointer-events: none;
`;

const NavbarContainer = styled(motion.nav)`
  width: 1000px;
  max-width: 95vw;
  background: rgba(10, 10, 15, 0.4);
  backdrop-filter: blur(30px) saturate(200%);
  padding: 0.6rem 1rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4),
              inset 0 1px 1px rgba(255, 255, 255, 0.1);
  pointer-events: auto;

  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 100px;
    padding: 2px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(0, 242, 254, 0.4) 25%, 
      rgba(112, 40, 228, 0.4) 75%, 
      transparent 100%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
`;

const LogoWrapper = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 1rem 0 0.5rem;
  cursor: pointer;
  justify-self: start;
`;

const Logo = styled.div`
  font-size: 1.4rem;
  font-weight: 950;
  letter-spacing: -2px;
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-transform: uppercase;
  filter: drop-shadow(0 0 10px rgba(0, 242, 254, 0.5));
`;

const NavLinks = styled.div`
  display: flex;
  gap: 0.3rem;
  align-items: center;
  padding: 0 0.5rem;
`;

const NavItem = styled(motion.div)`
  position: relative;
`;

const NavLink = styled(Link)`
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  padding: 0.7rem 1.1rem;
  border-radius: 100px;
  transition: all 0.3s ease;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  display: block;

  &:hover {
    color: #fff;
  }

  &.active {
    color: #00f2fe;
  }
`;

const GlowIndicator = styled(motion.div)`
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: #00f2fe;
  border-radius: 50%;
  box-shadow: 0 0 10px #00f2fe, 0 0 20px #00f2fe;
`;

const RightSection = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 0 0.5rem 0 1rem;
`;

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const coreLinks = [
    { path: '/', label: 'Home' },
    { path: '/news', label: 'News' },
    { path: '/gold-silver', label: 'Metals' },
    { path: '/stocks', label: 'Stocks' },
  ];

  const handleNavClick = (path: string) => {
    if (path === '/logout') {
      logout();
      navigate('/');
    }
  };

  return (
    <NavbarWrapper>
      <NavbarContainer
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        {/* Logo — left */}
        <LogoWrapper 
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
        >
          <Logo>ZEUS</Logo>
        </LogoWrapper>

        {/* Nav links — center */}
        <NavLinks style={{ justifySelf: 'center' }}>
          {coreLinks.map((item) => (
            <NavItem key={item.path}>
              <NavLink
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
              >
                {item.label}
              </NavLink>
              {location.pathname === item.path && (
                <GlowIndicator
                  layoutId="nav-glow"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </NavItem>
          ))}

          {user && (
            <NavItem>
              <NavLink
                to="/portfolio"
                className={location.pathname === '/portfolio' ? 'active' : ''}
              >
                VAULT
              </NavLink>
              {location.pathname === '/portfolio' && (
                <GlowIndicator
                  layoutId="nav-glow"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </NavItem>
          )}
        </NavLinks>

        {/* Auth action — right */}
        <RightSection>
          {user ? (
            <NavItem>
              <NavLink
                to="#"
                onClick={() => handleNavClick('/logout')}
                style={{
                  color: 'rgba(255, 80, 100, 0.8)',
                  fontSize: '0.7rem',
                }}
              >
                LOGOUT
              </NavLink>
            </NavItem>
          ) : (
            <NavItem>
              <NavLink
                to="/signup"
                className={location.pathname === '/signup' ? 'active' : ''}
                style={{
                  background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                  color: '#000',
                  padding: '0.6rem 1.4rem',
                  fontWeight: 900,
                }}
              >
                Sign Up
              </NavLink>
            </NavItem>
          )}
        </RightSection>
      </NavbarContainer>
    </NavbarWrapper>
  );
};

export default Navbar;