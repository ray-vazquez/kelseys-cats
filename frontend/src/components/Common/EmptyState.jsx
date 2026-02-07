// Empty State Component - Better UX for no results / empty content
import React from 'react';
import styled from 'styled-components';
import { Button, ButtonLink } from './StyledComponents';

const EmptyWrapper = styled.div`
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

const EmptyIcon = styled.div`
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
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $size }) => {
    if ($size === 'sm') return '24px';
    if ($size === 'lg') return '48px';
    return '32px';
  }};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const EmptyTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const EmptyDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  max-width: 500px;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const EmptyActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
  justify-content: center;
`;

/**
 * EmptyState - Display when there's no content or results
 * 
 * @param {string} icon - Emoji or icon character
 * @param {string} iconSize - 'sm', 'md', 'lg'
 * @param {string} title - Main heading
 * @param {string} description - Descriptive text
 * @param {React.ReactNode} actions - Call-to-action buttons
 * @param {string} padding - 'sm', 'md', 'lg'
 * @param {string} minHeight - Minimum height (e.g., '400px')
 */
export default function EmptyState({
  icon = '🔍',
  iconSize = 'md',
  title = 'Nothing found',
  description,
  actions,
  padding = 'md',
  minHeight,
  children,
  ...props
}) {
  return (
    <EmptyWrapper $padding={padding} $minHeight={minHeight} {...props}>
      {icon && <EmptyIcon $size={iconSize}>{icon}</EmptyIcon>}
      {title && <EmptyTitle>{title}</EmptyTitle>}
      {description && <EmptyDescription>{description}</EmptyDescription>}
      {actions && <EmptyActions>{actions}</EmptyActions>}
      {children}
    </EmptyWrapper>
  );
}

// Predefined empty state variants for common scenarios
export const NoCatsFound = (props) => (
  <EmptyState
    icon="🐱"
    title="No cats found"
    description="We couldn't find any cats matching your search criteria. Try adjusting your filters or check back later."
    {...props}
  />
);

export const NoResults = (props) => (
  <EmptyState
    icon="🔍"
    title="No results"
    description="We couldn't find anything matching your search. Try different keywords or browse all items."
    {...props}
  />
);

export const ComingSoon = (props) => (
  <EmptyState
    icon="🚧"
    title="Coming soon"
    description="This feature is currently under development. Check back soon for updates!"
    {...props}
  />
);
