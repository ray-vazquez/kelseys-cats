// SectionHero Component - Reusable hero/masthead with variants
// Provides consistent styling for page headers and call-to-action sections

import React from 'react';
import styled from 'styled-components';
import { Container } from './StyledComponents';

const HeroWrapper = styled.div`
  position: relative;
  padding: ${({ theme, $size }) => {
    if ($size === 'sm') return `${theme.spacing[12]} 0`;
    if ($size === 'md') return `${theme.spacing[16]} 0`;
    if ($size === 'lg') return `${theme.spacing[24]} 0`;
    if ($size === 'xl') return `${theme.spacing[32]} 0`;
    return `${theme.spacing[20]} 0`;
  }};
  text-align: ${({ $align }) => $align || 'center'};
  
  ${({ theme, $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%);
          color: ${theme.colors.white};
        `;
      case 'secondary':
        return `
          background: linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.secondaryDark} 100%);
          color: ${theme.colors.white};
        `;
      case 'light':
        return `
          background-color: ${theme.colors.light};
          color: ${theme.colors.text.primary};
        `;
      case 'gradient':
        return `
          background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.info} 100%);
          color: ${theme.colors.white};
        `;
      default:
        return `
          background-color: ${theme.colors.primary};
          color: ${theme.colors.white};
        `;
    }
  }}

  ${({ $image }) => $image && `
    background-image: url(${$image});
    background-size: cover;
    background-position: center;
    background-blend-mode: overlay;
  `}

  ${({ $overlay }) => $overlay && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, ${$overlay === 'light' ? '0.3' : '0.5'});
      z-index: 0;
    }
  `}
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: ${({ $narrow }) => $narrow ? '800px' : '100%'};
  margin: 0 auto;
`;

const HeroTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['5xl']};
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  line-height: ${({ theme }) => theme.lineHeights.tight};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  letter-spacing: ${({ theme }) => theme.letterSpacings.tight};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes['4xl']};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ theme }) => theme.fontSizes['3xl']};
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.light};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  opacity: 0.9;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }
`;

const HeroActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  justify-content: ${({ $align }) => {
    if ($align === 'left') return 'flex-start';
    if ($align === 'right') return 'flex-end';
    return 'center';
  }};
  flex-wrap: wrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: stretch;

    > * {
      width: 100%;
    }
  }
`;

/**
 * SectionHero - Versatile hero/masthead component
 * 
 * @param {string} title - Main heading text
 * @param {string} subtitle - Optional subtitle/lead text
 * @param {ReactNode} children - Optional content (typically buttons/CTAs)
 * @param {string} variant - Style variant: 'default' | 'primary' | 'secondary' | 'light' | 'gradient'
 * @param {string} size - Vertical padding size: 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} align - Text alignment: 'left' | 'center' | 'right'
 * @param {boolean} narrow - Constrain content width for better readability
 * @param {string} image - Background image URL
 * @param {string} overlay - Add dark overlay on image: 'light' | 'dark'
 */
export default function SectionHero({
  title,
  subtitle,
  children,
  variant = 'default',
  size = 'base',
  align = 'center',
  narrow = false,
  image,
  overlay,
}) {
  return (
    <HeroWrapper 
      $variant={variant} 
      $size={size} 
      $align={align}
      $image={image}
      $overlay={overlay}
    >
      <Container>
        <HeroContent $narrow={narrow}>
          {title && <HeroTitle>{title}</HeroTitle>}
          {subtitle && <HeroSubtitle>{subtitle}</HeroSubtitle>}
          {children && (
            <HeroActions $align={align}>
              {children}
            </HeroActions>
          )}
        </HeroContent>
      </Container>
    </HeroWrapper>
  );
}
