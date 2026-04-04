import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const FooterWrapper = styled.footer`
  background-color: ${({ theme }) => theme.colors.secondary};
  color: rgba(255, 255, 255, 0.75);
  padding: ${({ theme }) => theme.spacing[16]} 0 ${({ theme }) => theme.spacing[8]};
  margin-top: auto;
`;

const FooterGrid = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing[6]};
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[12]};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr 1fr;
    gap: ${({ theme }) => theme.spacing[8]};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing[6]};
  }
`;

const BrandCol = styled.div``;

const BrandName = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: white;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  line-height: 1.1;
`;

const BrandTagline = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  color: rgba(255, 255, 255, 0.55);
  max-width: 26ch;
  margin-bottom: ${({ theme }) => theme.spacing[5]};
`;

const SocialLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const SocialLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-decoration: none;
  transition:
    background ${({ theme }) => theme.transitions.fast},
    color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    text-decoration: none;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primaryLight};
    outline-offset: 3px;
  }
`;

const FooterCol = styled.div``;

const ColTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: ${({ theme }) => theme.letterSpacings.widest};
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const FooterLinkItem = styled.li`
  a {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-family: ${({ theme }) => theme.fonts.body};
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.fast};

    &:hover {
      color: white;
      text-decoration: none;
    }

    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.primaryLight};
      outline-offset: 2px;
      border-radius: ${({ theme }) => theme.borderRadius.sm};
    }
  }
`;

const DividerLine = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin: ${({ theme }) => `${theme.spacing[10]} auto 0`};
  max-width: 1280px;
  padding: 0 ${({ theme }) => theme.spacing[6]};
`;

const FooterBottom = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing[6]} ${theme.spacing[6]} 0`};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[3]};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    text-align: center;
  }
`;

const Copyright = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-family: ${({ theme }) => theme.fonts.body};
  color: rgba(255, 255, 255, 0.3);
  margin: 0;
`;

const HeartNote = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-family: ${({ theme }) => theme.fonts.body};
  color: rgba(255, 255, 255, 0.3);
  margin: 0;
`;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <FooterWrapper>
      <FooterGrid>
        <BrandCol>
          <BrandName>
            <span aria-hidden="true">🐱</span>
            Kelsey's Cats
          </BrandName>
          <BrandTagline>
            Sharing the journey of foster cats finding their forever homes —
            one purr at a time.
          </BrandTagline>
          <SocialLinks>
            <SocialLink
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow on Instagram"
            >
              IG
            </SocialLink>
            <SocialLink
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow on Facebook"
            >
              FB
            </SocialLink>
          </SocialLinks>
        </BrandCol>

        <FooterCol>
          <ColTitle>Cats</ColTitle>
          <FooterLinks>
            <FooterLinkItem>
              <Link to="/cats">Current Fosters</Link>
            </FooterLinkItem>
            <FooterLinkItem>
              <Link to="/alumni">Alumni</Link>
            </FooterLinkItem>
          </FooterLinks>
        </FooterCol>

        <FooterCol>
          <ColTitle>Adoption</ColTitle>
          <FooterLinks>
            <FooterLinkItem>
              <Link to="/adoption">How to Adopt</Link>
            </FooterLinkItem>
            <FooterLinkItem>
              <Link to="/adoption#faq">FAQ</Link>
            </FooterLinkItem>
            <FooterLinkItem>
              <Link to="/adoption#process">The Process</Link>
            </FooterLinkItem>
          </FooterLinks>
        </FooterCol>

        <FooterCol>
          <ColTitle>About</ColTitle>
          <FooterLinks>
            <FooterLinkItem>
              <Link to="/about">Our Story</Link>
            </FooterLinkItem>
            <FooterLinkItem>
              <Link to="/about#agency">Foster Agency</Link>
            </FooterLinkItem>
          </FooterLinks>
        </FooterCol>
      </FooterGrid>

      <DividerLine />

      <FooterBottom>
        <Copyright>© {year} Kelsey's Cats. All rights reserved.</Copyright>
        <HeartNote>Made with ♥ for every cat waiting for a home</HeartNote>
      </FooterBottom>
    </FooterWrapper>
  );
}
