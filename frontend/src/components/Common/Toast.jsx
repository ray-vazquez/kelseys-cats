// Toast notification component - Prominent colors, bottom right position
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
  bottom: ${({ theme }) => theme.spacing[4]};
  right: ${({ theme }) => theme.spacing[4]};
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  pointer-events: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    left: ${({ theme }) => theme.spacing[4]};
    right: ${({ theme }) => theme.spacing[4]};
    bottom: ${({ theme }) => theme.spacing[4]};
  }
`;

const ToastItem = styled.div`
  background: ${({ theme, $variant }) => {
    switch ($variant) {
      case 'success':
        return '#10b981'; // Green-500
      case 'error':
      case 'danger':
        return '#ef4444'; // Red-500
      case 'warning':
        return '#f59e0b'; // Amber-500
      case 'info':
      default:
        return '#3b82f6'; // Blue-500
    }
  }};
  color: #ffffff;
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
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

const ToastTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: #ffffff;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const ToastMessage = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  color: rgba(255, 255, 255, 0.95);
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all 0.15s;
  opacity: 0.9;
  flex-shrink: 0;
  font-size: 20px;
  font-weight: bold;
  line-height: 1;

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.2);
  }

  &:focus {
    outline: 2px solid #ffffff;
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

  return (
    <ToastItem $variant={variant} $isClosing={isClosing} role="alert" aria-live="polite">
      <ToastContent>
        {title && <ToastTitle>{title}</ToastTitle>}
        {message && <ToastMessage>{message}</ToastMessage>}
        {!title && !message && <ToastMessage>Notification</ToastMessage>}
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
