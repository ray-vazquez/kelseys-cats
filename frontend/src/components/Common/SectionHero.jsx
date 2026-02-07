// Reusable Hero/Masthead Component with Variants
import React from 'react';
import styled, { css } from 'styled-components';
import { Container, Button, ButtonLink } from './StyledComponents';

const HeroWrapper = styled.section`
  position: relative;
  overflow: hidden;
  
  ${({ theme, $variant }) => {
    switch ($variant) {
      case 'gradient':
        return css`
          background: linear-gradient(
            135deg,
            ${theme.colors.primary} 0%,
            ${theme.colors.primaryDark} 100%
          );
        `;
      case 'image':
        return css`
          background-image: url(${({ $bgImage }) => $bgImage});
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: ${theme.colors.overlay};
            z-index: 1;
          }
        `;
      case 'secondary':
        return css`
          background-color: ${theme.colors.secondary};
        `;
      case 'light':
        return css`
          background-color: ${theme.colors.light};
        `;
      default: // 'primary'
        return css`
          background-color: ${theme.colors.primary};
        `;
    }
  }}

  color: ${({ theme, $variant }) => 
    ($variant === 'light') ? theme.colors.text.primary : theme.colors.white
  };
  
  padding: ${({ theme, $size }) => {
    switch ($size) {
      case 'sm':
        return `${theme.spacing[12]} 0`;
      case 'lg':
        return `${theme.spacing[24]} 0`;
      case 'xl':
        return `${theme.spacing[32]} 0`;
      default: // 'md'
        return `${theme.spacing[16]} 0`;
    }
  }};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme, $size }) => {
      switch ($size) {
        case 'sm':
          return `${theme.spacing[8]} 0`;
        case 'lg':
          return `${theme.spacing[16]} 0`;
        case 'xl':
          return `${theme.spacing[20]} 0`;
        default:
          return `${theme.spacing[12]} 0`;
      }
    }};
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: ${({ $align }) => $align || 'center'};
  max-width: ${({ $narrow }) => $narrow ? '800px' : '100%'};
  margin: 0 auto;
`;

const HeroTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['6xl']};
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  line-height: ${({ theme }) => theme.lineHeights.tight};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
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
  opacity: 0.95;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    margin-bottom: ${({ theme }) => theme.spacing[6]};
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
    
    ${Button}, ${ButtonLink} {
      width: 100%;
    }
  }
`;

/**
 * SectionHero - Reusable hero/masthead component
 * 
 * @param {string} variant - 'primary', 'secondary', 'gradient', 'image', 'light'
 * @param {string} size - 'sm', 'md', 'lg', 'xl'
 * @param {string} align - 'left', 'center', 'right'
 * @param {boolean} narrow - Constrain content width to 800px
 * @param {string} bgImage - Background image URL (when variant='image')
 * @param {string} title - Hero title text
 * @param {string} subtitle - Hero subtitle/description
 * @param {React.ReactNode} actions - Call-to-action buttons
 * @param {React.ReactNode} children - Additional custom content
 */
export default function SectionHero({
  variant = 'primary',
  size = 'md',
  align = 'center',
  narrow = false,
  bgImage,
  title,
  subtitle,
  actions,
  children,
  ...props
}) {
  return (
    <HeroWrapper $variant={variant} $size={size} $bgImage={bgImage} {...props}>
      <Container>
        <HeroContent $align={align} $narrow={narrow}>
          {title && <HeroTitle>{title}</HeroTitle>}
          {subtitle && <HeroSubtitle>{subtitle}</HeroSubtitle>}
          {actions && <HeroActions $align={align}>{actions}</HeroActions>}
          {children}
        </HeroContent>
      </Container>
    </HeroWrapper>
  );
}
