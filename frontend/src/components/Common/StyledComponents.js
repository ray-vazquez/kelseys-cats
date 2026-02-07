// Enhanced Styled Components - Phase 1+2: Professional UI Polish
// Comprehensive component library with variants, states, and refined interactions

import styled, { keyframes, css } from "styled-components";
import { Link } from "react-router-dom";

/* ========== LAYOUT COMPONENTS ========== */

export const Container = styled.div`
  width: 100%;
  max-width: ${({ $size, theme }) => {
    if ($size === 'sm') return theme.containerSizes.sm;
    if ($size === 'md') return theme.containerSizes.md;
    if ($size === 'lg') return theme.containerSizes.lg;
    if ($size === 'xl') return theme.containerSizes.xl;
    if ($size === '2xl') return theme.containerSizes['2xl'];
    if ($size === 'full') return '100%';
    return theme.containerSizes.xl;
  }};
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing[6]};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0 ${({ theme }) => theme.spacing[4]};
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols || 3}, 1fr);
  gap: ${({ theme, $gap }) => theme.spacing[$gap] || theme.spacing[6]};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(${({ $mdCols }) => $mdCols || 2}, 1fr);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

export const Flex = styled.div`
  display: flex;
  flex-direction: ${({ $direction }) => $direction || 'row'};
  align-items: ${({ $align }) => $align || 'stretch'};
  justify-content: ${({ $justify }) => $justify || 'flex-start'};
  gap: ${({ theme, $gap }) => theme.spacing[$gap] || theme.spacing[4]};
  flex-wrap: ${({ $wrap }) => ($wrap ? 'wrap' : 'nowrap')};
`;

export const Section = styled.section`
  padding: ${({ theme, $padding }) => {
    if ($padding === 'lg') return `${theme.spacing[20]} 0`;
    if ($padding === 'md') return `${theme.spacing[16]} 0`;
    if ($padding === 'sm') return `${theme.spacing[12]} 0`;
    if ($padding === 'xs') return `${theme.spacing[8]} 0`;
    return `${theme.spacing[16]} 0`;
  }};
  background-color: ${({ theme, $bg }) => {
    if ($bg === 'light') return theme.colors.light;
    if ($bg === 'dark') return theme.colors.secondary;
    if ($bg === 'primary') return theme.colors.primary;
    return 'transparent';
  }};
  color: ${({ theme, $bg }) => 
    ($bg === 'dark' || $bg === 'primary') ? theme.colors.white : 'inherit'
  };
`;

/* ========== CARD COMPONENTS ========== */

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  overflow: hidden;
  transition: all ${({ theme }) => theme.transitions.base};
  border: 1px solid ${({ theme }) => theme.colors.border};

  ${({ $hover }) => $hover !== false && css`
    &:hover {
      transform: translateY(-4px);
      box-shadow: ${({ theme }) => theme.shadows.lg};
      border-color: ${({ theme }) => theme.colors.primary};
    }
  `}

  ${({ $clickable }) => $clickable && css`
    cursor: pointer;
  `}
`;

export const CardImage = styled.img`
  width: 100%;
  height: ${({ $height }) => $height || '200px'};
  object-fit: cover;
  transition: transform ${({ theme }) => theme.transitions.slow};

  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

export const CardBody = styled.div`
  padding: ${({ theme, $padding }) => theme.spacing[$padding] || theme.spacing[6]};
`;

export const CardTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

export const CardText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin-bottom: ${({ theme }) => theme.spacing[4]};

  &:last-child {
    margin-bottom: 0;
  }
`;

/* ========== BUTTON COMPONENTS ========== */

const getButtonStyles = ({ theme, $variant, $size }) => {
  // Size styles
  const sizeStyles = {
    xs: css`
      padding: ${theme.spacing[1]} ${theme.spacing[3]};
      font-size: ${theme.fontSizes.xs};
    `,
    sm: css`
      padding: ${theme.spacing[2]} ${theme.spacing[4]};
      font-size: ${theme.fontSizes.sm};
    `,
    base: css`
      padding: ${theme.spacing[3]} ${theme.spacing[6]};
      font-size: ${theme.fontSizes.base};
    `,
    lg: css`
      padding: ${theme.spacing[4]} ${theme.spacing[8]};
      font-size: ${theme.fontSizes.lg};
    `,
  };

  // Variant styles
  const variantStyles = {
    primary: css`
      background-color: ${theme.colors.primary};
      color: ${theme.colors.white};
      border: 2px solid ${theme.colors.primary};

      &:hover:not(:disabled) {
        background-color: ${theme.colors.primaryHover};
        border-color: ${theme.colors.primaryHover};
        color: ${theme.colors.white};
        transform: translateY(-1px);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `,
    secondary: css`
      background-color: ${theme.colors.secondary};
      color: ${theme.colors.white};
      border: 2px solid ${theme.colors.secondary};

      &:hover:not(:disabled) {
        background-color: ${theme.colors.secondaryHover};
        border-color: ${theme.colors.secondaryHover};
        color: ${theme.colors.white};
        transform: translateY(-1px);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `,
    outline: css`
      background-color: transparent;
      color: ${theme.colors.primary};
      border: 2px solid ${theme.colors.primary};

      &:hover:not(:disabled) {
        background-color: ${theme.colors.primary};
        color: ${theme.colors.white};
        border-color: ${theme.colors.primary};
        transform: translateY(-1px);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `,
    ghost: css`
      background-color: transparent;
      color: ${theme.colors.primary};
      border: 2px solid transparent;

      &:hover:not(:disabled) {
        background-color: ${theme.colors.light};
        border-color: ${theme.colors.borderLight};
        color: ${theme.colors.primary};
      }
    `,
    link: css`
      background-color: transparent;
      color: ${theme.colors.text.link};
      border: 2px solid transparent;
      padding: 0;

      &:hover:not(:disabled) {
        color: ${theme.colors.text.linkHover};
        text-decoration: underline;
      }
    `,
    danger: css`
      background-color: ${theme.colors.danger};
      color: ${theme.colors.white};
      border: 2px solid ${theme.colors.danger};

      &:hover:not(:disabled) {
        background-color: ${theme.colors.dangerHover};
        border-color: ${theme.colors.dangerHover};
        color: ${theme.colors.white};
        transform: translateY(-1px);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `,
  };

  return css`
    ${sizeStyles[$size || 'base']}
    ${variantStyles[$variant || 'primary']}
  `;
};

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-align: center;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  text-decoration: none;
  white-space: nowrap;

  ${getButtonStyles}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 2px;
  }

  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
  `}

  ${({ $loading }) => $loading && css`
    position: relative;
    color: transparent;
    pointer-events: none;

    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      top: 50%;
      left: 50%;
      margin-left: -8px;
      margin-top: -8px;
      border: 2px solid ${({ theme }) => theme.colors.white};
      border-radius: 50%;
      border-top-color: transparent;
      animation: ${spin} 0.6s linear infinite;
    }
  `}
`;

export const ButtonLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-align: center;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  text-decoration: none;
  white-space: nowrap;

  ${getButtonStyles}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 2px;
  }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

/* ========== BADGE COMPONENTS ========== */

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[3]};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  line-height: 1;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  white-space: nowrap;

  ${({ theme, $variant }) => {
    switch ($variant) {
      case 'success':
        return css`
          background-color: ${theme.colors.success};
          color: #ffffff;
        `;
      case 'warning':
        return css`
          background-color: ${theme.colors.warning};
          color: #ffffff;
        `;
      case 'danger':
        return css`
          background-color: ${theme.colors.danger};
          color: #ffffff;
        `;
      case 'info':
        return css`
          background-color: ${theme.colors.info};
          color: #ffffff;
        `;
      case 'secondary':
        return css`
          background-color: #7c3aed;
          color: #ffffff;
        `;
      default:
        return css`
          background-color: ${theme.colors.primary};
          color: #ffffff;
        `;
    }
  }}
`;

/* ========== FORM COMPONENTS ========== */

export const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};

  &:last-child {
    margin-bottom: 0;
  }
`;

export const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};

  ${({ $required }) => $required && css`
    &::after {
      content: ' *';
      color: ${({ theme }) => theme.colors.danger};
    }
  `}
`;

const inputStyles = css`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  font-size: ${({ theme }) => theme.fontSizes.base};
  line-height: ${({ theme }) => theme.lineHeights.normal};
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.white};
  border: 2px solid ${({ theme, $error }) => 
    $error ? theme.colors.danger : theme.colors.border
  };
  border-radius: ${({ theme }) => theme.borderRadius.base};
  transition: all ${({ theme }) => theme.transitions.fast};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.borderDark};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.focus};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.neutral[100]};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const Input = styled.input`
  ${inputStyles}
`;

export const Textarea = styled.textarea`
  ${inputStyles}
  resize: vertical;
  min-height: 100px;
  font-family: ${({ theme }) => theme.fonts.body};
`;

export const Select = styled.select`
  ${inputStyles}
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }
`;

export const Checkbox = styled.input.attrs({ type: "checkbox" })`
  width: 18px;
  height: 18px;
  margin-right: ${({ theme }) => theme.spacing[2]};
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.primary};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 2px;
  }
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  font-size: ${({ theme }) => theme.fontSizes.base};
  cursor: pointer;
  user-select: none;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

export const HelperText = styled.small`
  display: block;
  margin-top: ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme, $error }) => 
    $error ? theme.colors.danger : theme.colors.text.secondary
  };
`;

/* ========== ALERT COMPONENTS ========== */

export const Alert = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border-left: 4px solid;
  
  ${({ theme, $variant }) => {
    switch ($variant) {
      case 'success':
        return css`
          background-color: ${theme.colors.successLight};
          color: ${theme.colors.success};
          border-color: ${theme.colors.success};
        `;
      case 'warning':
        return css`
          background-color: ${theme.colors.warningLight};
          color: ${theme.colors.warning};
          border-color: ${theme.colors.warning};
        `;
      case 'danger':
        return css`
          background-color: ${theme.colors.dangerLight};
          color: ${theme.colors.danger};
          border-color: ${theme.colors.danger};
        `;
      case 'info':
      default:
        return css`
          background-color: ${theme.colors.infoLight};
          color: ${theme.colors.info};
          border-color: ${theme.colors.info};
        `;
    }
  }}
`;

/* ========== LOADING COMPONENTS ========== */

export const Spinner = styled.div`
  display: inline-block;
  width: ${({ $size }) => $size || '40px'};
  height: ${({ $size }) => $size || '40px'};
  border: 3px solid ${({ theme }) => theme.colors.neutral[200]};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export const CenteredSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[16]} 0;
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

export const Skeleton = styled.div`
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.neutral[100]} 25%,
    ${({ theme }) => theme.colors.neutral[200]} 50%,
    ${({ theme }) => theme.colors.neutral[100]} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  height: ${({ $height }) => $height || '20px'};
  width: ${({ $width }) => $width || '100%'};
`;

/* ========== DIVIDER ========== */

export const Divider = styled.hr`
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing[6]} 0;
`;

/* ========== TEXT UTILITIES ========== */

export const TextMuted = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

export const TextSmall = styled.small`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;
