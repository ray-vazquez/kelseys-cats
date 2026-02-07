// Toast notification component
import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.spacing[4]};
  right: ${({ theme }) => theme.spacing[4]};
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  pointer-events: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    left: ${({ theme }) => theme.spacing[4]};
    right: ${({ theme }) => theme.spacing[4]};
  }
`;

const ToastItem = styled.div`
  background: ${({ theme, $variant }) => {
    switch ($variant) {
      case 'success':
        return theme.colors.success;
      case 'error':
      case 'danger':
        return theme.colors.danger;
      case 'warning':
        return theme.colors.warning;
      case 'info':
      default:
        return theme.colors.info;
    }
  }};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[5]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  min-width: 300px;
  max-width: 500px;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  animation: ${({ $isClosing }) => ($isClosing ? slideOut : slideIn)}
    ${({ theme }) => theme.transitions.base} ${({ theme }) => theme.easings.easeOut};
  pointer-events: auto;
  position: relative;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    min-width: 0;
    max-width: 100%;
  }
`;

const ToastIcon = styled.span`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  flex-shrink: 0;
  line-height: 1;
`;

const ToastContent = styled.div`
  flex: 1;
`;

const ToastTitle = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-size: ${({ theme }) => theme.fontSizes.base};
  margin-bottom: ${({ $hasMessage, theme }) => ($hasMessage ? theme.spacing[1] : '0')};
`;

const ToastMessage = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  opacity: 0.95;
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing[1]};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  transition: all ${({ theme }) => theme.transitions.fast};
  opacity: 0.8;
  flex-shrink: 0;

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.white};
    outline-offset: 2px;
  }
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  width: 100%;
  border-radius: 0 0 ${({ theme }) => theme.borderRadius.lg} ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: ${({ theme }) => theme.colors.white};
    width: 100%;
    animation: progress ${({ $duration }) => $duration}ms linear;
  }

  @keyframes progress {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }
`;

const getIcon = (variant) => {
  switch (variant) {
    case 'success':
      return '✅';
    case 'error':
    case 'danger':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'info':
    default:
      return 'ℹ️';
  }
};

export function Toast({
  title,
  message,
  variant = 'info',
  duration = 5000,
  onClose,
  showProgress = true,
  isClosing = false,
}) {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <ToastItem $variant={variant} $isClosing={isClosing} role="alert" aria-live="polite">
      <ToastIcon>{getIcon(variant)}</ToastIcon>
      <ToastContent>
        {title && <ToastTitle $hasMessage={!!message}>{title}</ToastTitle>}
        {message && <ToastMessage>{message}</ToastMessage>}
      </ToastContent>
      {onClose && (
        <CloseButton onClick={onClose} aria-label="Close notification">
          ✕
        </CloseButton>
      )}
      {showProgress && duration && <ProgressBar $duration={duration} />}
    </ToastItem>
  );
}

export default function ToastProvider({ children, toasts = [] }) {
  return (
    <>
      {children}
      <ToastContainer>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </ToastContainer>
    </>
  );
}
