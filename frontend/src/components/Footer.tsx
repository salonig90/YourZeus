import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FooterContainer = styled.footer`
  background: ${props => props.theme.colors.secondaryBackground};
  border-top: 1px solid ${props => props.theme.colors.border};
  padding: 4rem 4rem 2rem;
  margin-top: 4rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 3rem 1.5rem 2rem;
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 4rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const BrandSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Logo = styled.div`
  font-size: 1.8rem;
  font-weight: 900;
  background: ${props => props.theme.colors.accentPrimary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -2px;
  text-transform: uppercase;
`;

const Description = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;
  font-size: 0.95rem;
  max-width: 300px;
`;

const LinksSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const SectionTitle = styled.h4`
  color: ${props => props.theme.colors.textPrimary};
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const FooterLink = styled(Link)`
  color: ${props => props.theme.colors.textSecondary};
  text-decoration: none;
  font-size: 0.9rem;
  transition: ${props => props.theme.transitions.fast};

  &:hover {
    color: ${props => props.theme.colors.textPrimary};
    transform: translateX(4px);
  }
`;

const Copyright = styled.div`
  max-width: 1200px;
  margin: 4rem auto 0;
  padding-top: 2rem;
  border-top: 1px solid ${props => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.85rem;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const SocialLink = styled.a`
  color: ${props => props.theme.colors.textSecondary};
  transition: ${props => props.theme.transitions.fast};
  
  &:hover {
    color: ${props => props.theme.colors.textPrimary};
  }
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <BrandSection>
          <Logo>ZEUS</Logo>
          <Description>
            Next-generation financial analytics platform. Empowering investors with real-time insights and advanced predictive modeling.
          </Description>
        </BrandSection>

        <LinksSection>
          <SectionTitle>Platform</SectionTitle>
          <FooterLink to="/">Overview</FooterLink>
          <FooterLink to="/news">Market News</FooterLink>
          <FooterLink to="/gold-silver">Commodities</FooterLink>
          <FooterLink to="/stocks">Equities</FooterLink>
        </LinksSection>

        <LinksSection>
          <SectionTitle>Resources</SectionTitle>
          <FooterLink to="/docs">Documentation</FooterLink>
          <FooterLink to="/api">API Access</FooterLink>
          <FooterLink to="/blog">Analysis Blog</FooterLink>
          <FooterLink to="/help">Support</FooterLink>
        </LinksSection>

        <LinksSection>
          <SectionTitle>Company</SectionTitle>
          <FooterLink to="/about">About Us</FooterLink>
          <FooterLink to="/careers">Careers</FooterLink>
          <FooterLink to="/privacy">Privacy Policy</FooterLink>
          <FooterLink to="/terms">Terms of Service</FooterLink>
        </LinksSection>
      </FooterContent>

      <Copyright>
        <div>© 2024 ZEUS Financial. All rights reserved.</div>
        <SocialLinks>
          <SocialLink href="#">Twitter</SocialLink>
          <SocialLink href="#">LinkedIn</SocialLink>
          <SocialLink href="#">GitHub</SocialLink>
        </SocialLinks>
      </Copyright>
    </FooterContainer>
  );
};

export default Footer;
