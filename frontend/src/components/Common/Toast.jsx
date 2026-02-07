// Toast notification component - Simplified design
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
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border-left: 4px solid ${({ theme, $variant }) => {
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
  min-width: 300px;
  max-width: 450px;
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[3]};
  animation: ${({ $isClosing }) => ($isClosing ? slideOut : slideIn)}
    0.2s ease-out;
  pointer-events: auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    min-width: 0;
    max-width: 100%;
  }
`;

const ToastContent = styled.div`
  flex: 1;
`;

const ToastMessage = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all 0.15s;
  opacity: 0.5;
  flex-shrink: 0;
  font-size: 18px;
  line-height: 1;

  &:hover {
    opacity: 1;
    background: ${({ theme }) => theme.colors.light};
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export function Toast({
  title,
  message,
  variant = 'info',
  duration = 5000,
  onClose,
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

  // Combine title and message into single text
  const displayText = title && message ? `${title}: ${message}` : title || message;

  return (
    <ToastItem $variant={variant} $isClosing={isClosing} role="alert" aria-live="polite">
      <ToastContent>
        <ToastMessage>{displayText}</ToastMessage>
      </ToastContent>
      {onClose && (
        <CloseButton onClick={onClose} aria-label="Close notification">
          ×
        </CloseButton>
      )}
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
