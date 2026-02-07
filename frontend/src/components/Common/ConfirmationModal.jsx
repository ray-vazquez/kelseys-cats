// ConfirmationModal - Reusable confirmation dialog
import React from 'react';
import styled from 'styled-components';
import { Button } from './StyledComponents.js';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: ${({ theme }) => theme.spacing[4]};
  animation: fadeIn 0.15s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  max-width: 500px;
  width: 100%;
  animation: slideUp 0.2s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme, $variant }) => {
    if ($variant === 'danger') return theme.colors.danger;
    if ($variant === 'warning') return theme.colors.warning;
    return theme.colors.text.primary;
  }};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const IconWrapper = styled.span`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  line-height: 1;
`;

const ModalBody = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  font-size: ${({ theme }) => theme.fontSizes.base};
`;

const ModalFooter = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing[3]};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column-reverse;
  }
`;

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon = '⚠️',
  loading = false
}) {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <ModalHeader>
          <ModalTitle id="modal-title" $variant={variant}>
            {icon && <IconWrapper>{icon}</IconWrapper>}
            {title}
          </ModalTitle>
        </ModalHeader>
        <ModalBody>
          {message}
        </ModalBody>
        <ModalFooter>
          <Button
            type="button"
            $variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            $variant={variant}
            onClick={handleConfirm}
            disabled={loading}
            $loading={loading}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </Modal>
    </Overlay>
  );
}
