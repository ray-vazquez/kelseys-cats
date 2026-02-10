// Updated StyledComponents with lighter success alert text
import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';

// Container
export const Container = styled.div`
  max-width: ${({ $size }) => 
    $size === 'sm' ? '768px' :
    $size === 'md' ? '1024px' :
    $size === 'lg' ? '1280px' :
    '1140px'};
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing[6]};
`;

// Section
export const Section = styled.section`
  padding: ${({ $padding, theme }) =>
    $padding === 'sm' ? `${theme.spacing[8]} 0` :
    $padding === 'md' ? `${theme.spacing[12]} 0` :
    $padding === 'lg' ? `${theme.spacing[16]} 0` :
    `${theme.spacing[12]} 0`};
  background: ${({ $bg, theme }) =>
    $bg === 'light' ? theme.colors.background.secondary :
    $bg === 'white' ? theme.colors.white :
    'transparent'};
`;

// Grid
export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols || 3}, 1fr);
  gap: ${({ theme }) => theme.spacing[6]};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(${({ $mdCols }) => $mdCols || 2}, 1fr);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

// Flex
export const Flex = styled.div`
  display: flex;
  justify-content: ${({ $justify }) => $justify || 'flex-start'};
  align-items: ${({ $align }) => $align || 'stretch'};
  gap: ${({ $gap, theme }) => theme.spacing[$gap] || '0'};
  flex-direction: ${({ $direction }) => $direction || 'row'};
  flex-wrap: ${({ $wrap }) => ($wrap ? 'wrap' : 'nowrap')};
`;

// Card
export const Card = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.base};
  transition: all ${({ theme }) => theme.transitions.normal};

  ${({ $hover }) =>
    $hover &&
    css`
      &:hover {
        transform: translateY(-4px);
        box-shadow: ${({ theme }) => theme.shadows.lg};
      }
    `}
`;

export const CardImage = styled.img`
  width: 100%;
  height: ${({ $height }) => $height || '200px'};
  object-fit: cover;
  display: block;
`;

export const CardBody = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
`;

export const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  color: ${({ theme }) => theme.colors.text.primary};
`;

// Button Base Styles
const buttonBaseStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ $size, theme }) =>
    $size === 'sm' ? `${theme.spacing[2]} ${theme.spacing[4]}` :
    $size === 'lg' ? `${theme.spacing[4]} ${theme.spacing[8]}` :
    `${theme.spacing[3]} ${theme.spacing[6]}`};
  font-size: ${({ $size, theme }) =>
    $size === 'sm' ? theme.fontSizes.sm :
    $size === 'lg' ? theme.fontSizes.lg :
    theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all ${({ theme }) => theme.transitions.fast};
  cursor: pointer;
  border: 2px solid transparent;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  text-align: center;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return css`
          background: ${theme.colors.primary.main};
          color: #1e293b;
          border-color: ${theme.colors.primary.main};

          &:hover:not(:disabled) {
            background: ${theme.colors.primary.dark};
            border-color: ${theme.colors.primary.dark};
            transform: translateY(-2px);
            box-shadow: ${theme.shadows.md};
          }
        `;
      case 'secondary':
        return css`
          background: ${theme.colors.secondary};
          color: ${theme.colors.white};
          border-color: ${theme.colors.secondary};

          &:hover:not(:disabled) {
            background: ${theme.colors.secondaryDark};
            border-color: ${theme.colors.secondaryDark};
            transform: translateY(-2px);
            box-shadow: ${theme.shadows.md};
          }
        `;
      case 'outline':
        return css`
          background: transparent;
          color: ${theme.colors.white};
          border-color: ${theme.colors.white};

          &:hover:not(:disabled) {
            background: ${theme.colors.white};
            color: ${theme.colors.primary.main};
            transform: translateY(-2px);
            box-shadow: ${theme.shadows.md};
          }
        `;
      case 'ghost':
        return css`
          background: transparent;
          color: ${theme.colors.primary.main};
          border-color: transparent;

          &:hover:not(:disabled) {
            background: ${theme.colors.primary.light};
          }
        `;
      case 'danger':
        return css`
          background: ${theme.colors.error?.main || '#dc2626'};
          color: ${theme.colors.white};
          border-color: ${theme.colors.error?.main || '#dc2626'};

          &:hover:not(:disabled) {
            background: ${theme.colors.error?.dark || '#b91c1c'};
            border-color: ${theme.colors.error?.dark || '#b91c1c'};
            transform: translateY(-2px);
            box-shadow: ${theme.shadows.md};
          }
        `;
      default:
        return css`
          background: ${theme.colors.gray[200]};
          color: ${theme.colors.text.primary};
          border-color: ${theme.colors.gray[300]};

          &:hover:not(:disabled) {
            background: ${theme.colors.gray[300]};
            border-color: ${theme.colors.gray[400]};
          }
        `;
    }
  }}
`;

export const Button = styled.button`
  ${buttonBaseStyles}
`;

export const ButtonLink = styled(Link)`
  ${buttonBaseStyles}
`;

// Badge
export const Badge = styled.span`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[3]}`};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: ${({ theme }) => theme.borderRadius.full};

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'success':
        return css`
          background: ${theme.colors.success.light};
          color: ${theme.colors.success.dark};
        `;
      case 'warning':
        return css`
          background: ${theme.colors.warning.light};
          color: ${theme.colors.warning.dark};
        `;
      case 'info':
        return css`
          background: ${theme.colors.info.light};
          color: ${theme.colors.info.dark};
        `;
      case 'secondary':
        return css`
          background: ${theme.colors.gray[200]};
          color: ${theme.colors.gray[700]};
        `;
      default:
        return css`
          background: ${theme.colors.primary.light};
          color: ${theme.colors.primary.dark};
        `;
    }
  }}
`;

// Alert - Updated with lighter text for success variant
export const Alert = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border-left: 4px solid;
  font-size: ${({ theme }) => theme.fontSizes.base};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'success':
        return css`
          background: ${theme.colors.success.light};
          border-color: ${theme.colors.success.main};
          color: #065f46; // Darker green for better contrast
        `;
      case 'warning':
        return css`
          background: ${theme.colors.warning.light};
          border-color: ${theme.colors.warning.main};
          color: ${theme.colors.warning.dark};
        `;
      case 'danger':
        return css`
          background: ${theme.colors.error?.light || '#fee2e2'};
          border-color: ${theme.colors.error?.main || '#dc2626'};
          color: ${theme.colors.error?.dark || '#991b1b'};
        `;
      case 'info':
        return css`
          background: ${theme.colors.info.light};
          border-color: ${theme.colors.info.main};
          color: ${theme.colors.info.dark};
        `;
      default:
        return css`
          background: ${theme.colors.gray[100]};
          border-color: ${theme.colors.gray[400]};
          color: ${theme.colors.text.primary};
        `;
    }
  }}

  strong {
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }
`;

// Form Components
export const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

export const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.base};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.light};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.gray[100]};
    cursor: not-allowed;
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.light};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.gray[100]};
    cursor: not-allowed;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.base};
  background: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.light};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.gray[100]};
    cursor: not-allowed;
  }
`;

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  cursor: pointer;
  margin-right: ${({ theme }) => theme.spacing[2]};
`;

// Text Utilities
export const TextMuted = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

export const TextBold = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;
