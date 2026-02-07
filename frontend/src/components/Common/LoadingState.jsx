// Loading State Component - Consistent loading UI across the app
import React from 'react';
import styled from 'styled-components';
import { Spinner, CenteredSpinner, Skeleton } from './StyledComponents';

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme, $padding }) => {
    if ($padding === 'sm') return theme.spacing[8];
    if ($padding === 'lg') return theme.spacing[20];
    return theme.spacing[16];
  }};
  text-align: center;
`;

const LoadingText = styled.p`
  margin-top: ${({ theme }) => theme.spacing[4]};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.base};
`;

/**
 * LoadingState - Display loading indicators
 * 
 * @param {string} variant - 'spinner', 'skeleton', 'inline'
 * @param {string} size - 'sm', 'md', 'lg' (for spinner)
 * @param {string} text - Optional loading message
 * @param {string} padding - 'sm', 'md', 'lg'
 * @param {number} skeletonCount - Number of skeleton rows (when variant='skeleton')
 * @param {string} skeletonHeight - Height of each skeleton row
 */
export default function LoadingState({
  variant = 'spinner',
  size = 'md',
  text,
  padding = 'md',
  skeletonCount = 3,
  skeletonHeight = '20px',
  ...props
}) {
  const spinnerSize = size === 'sm' ? '24px' : size === 'lg' ? '48px' : '32px';

  if (variant === 'inline') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }} {...props}>
        <Spinner $size={spinnerSize} />
        {text && <span>{text}</span>}
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div {...props}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Skeleton
            key={i}
            $height={skeletonHeight}
            style={{ marginBottom: '12px' }}
          />
        ))}
      </div>
    );
  }

  // Default: centered spinner
  return (
    <LoadingWrapper $padding={padding} {...props}>
      <Spinner $size={spinnerSize} />
      {text && <LoadingText>{text}</LoadingText>}
    </LoadingWrapper>
  );
}
