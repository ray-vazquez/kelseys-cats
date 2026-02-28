// Error State Component - Consistent error UI across the app
import React from 'react';
import styled from 'styled-components';
import { Button } from './StyledComponents';

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme, $padding }) => {
    if ($padding === 'sm') return theme.spacing[8];
    if ($padding === 'lg') return theme.spacing[24];
    return theme.spacing[16];
  }};
  text-align: center;
  min-height: ${({ $minHeight }) => $minHeight || 'auto'};
`;

const ErrorIcon = styled.div`
  width: ${({ $size }) => {
    if ($size === 'sm') return '48px';
    if ($size === 'lg') return '96px';
    return '64px';
  }};
  height: ${({ $size }) => {
    if ($size === 'sm') return '48px';
    if ($size === 'lg') return '96px';
    return '64px';
  }};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.error?.light || '#fee'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $size }) => {
    if ($size === 'sm') return '24px';
    if ($size === 'lg') return '48px';
    return '32px';
  }};
  color: ${({ theme }) => theme.colors.error?.main || '#c41e3a'};
`;

const ErrorTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const ErrorMessage = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  max-width: 500px;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const ErrorActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
  justify-content: center;
`;

/**
 * ErrorState - Display error messages with optional retry action
 * 
 * @param {string} icon - Emoji or icon character (default: '⚠️')
 * @param {string} iconSize - 'sm', 'md', 'lg'
 * @param {string} title - Error heading (default: 'Something went wrong')
 * @param {string} message - Error description (default generic message)
 * @param {function} onRetry - Optional retry callback
 * @param {string} retryText - Text for retry button (default: 'Try Again')
 * @param {React.ReactNode} actions - Additional action buttons
 * @param {string} padding - 'sm', 'md', 'lg'
 * @param {string} minHeight - Minimum height (e.g., '400px')
 */
export default function ErrorState({
  icon = '⚠️',
  iconSize = 'md',
  title = 'Something went wrong',
  message = 'We encountered an error while loading this content. Please try again.',
  onRetry,
  retryText = 'Try Again',
  actions,
  padding = 'md',
  minHeight,
  children,
  ...props
}) {
  return (
    <ErrorWrapper
      role="alert"
      aria-live="polite"
      $padding={padding}
      $minHeight={minHeight}
      {...props}
    >
      {icon && <ErrorIcon $size={iconSize}>{icon}</ErrorIcon>}
      {title && <ErrorTitle>{title}</ErrorTitle>}
      {message && <ErrorMessage>{message}</ErrorMessage>}
      
      {(onRetry || actions) && (
        <ErrorActions>
          {onRetry && (
            <Button onClick={onRetry} variant="primary">
              {retryText}
            </Button>
          )}
          {actions}
        </ErrorActions>
      )}
      
      {children}
    </ErrorWrapper>
  );
}

// Predefined error state variants for common scenarios
export const LoadError = ({ onRetry, ...props }) => (
  <ErrorState
    icon="⚠️"
    title="Failed to load"
    message="We couldn't load this content. Please check your connection and try again."
    onRetry={onRetry}
    {...props}
  />
);

export const NotFoundError = (props) => (
  <ErrorState
    icon="🔍"
    title="Not found"
    message="The content you're looking for doesn't exist or has been removed."
    {...props}
  />
);

export const NetworkError = ({ onRetry, ...props }) => (
  <ErrorState
    icon="📡"
    title="Connection error"
    message="We're having trouble connecting. Please check your internet connection and try again."
    onRetry={onRetry}
    {...props}
  />
);

export const ServerError = ({ onRetry, ...props }) => (
  <ErrorState
    icon="🔧"
    title="Server error"
    message="Our servers are experiencing issues. We're working to fix this. Please try again in a few moments."
    onRetry={onRetry}
    {...props}
  />
);
