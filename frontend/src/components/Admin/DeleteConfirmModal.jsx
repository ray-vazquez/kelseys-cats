// Delete Confirmation Modal Component
import React from 'react';
import styled from 'styled-components';
import { Button } from '../Common/StyledComponents.js';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[4]};
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  max-width: 500px;
  width: 100%;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.light};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: #fee2e2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
`;

const HeaderText = styled.div`
  flex: 1;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ModalBody = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
`;

const ModalText = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing[4]} 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  font-size: ${({ theme }) => theme.fontSizes.base};

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const HighlightText = styled.strong`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const WarningText = styled.p`
  margin: ${({ theme }) => theme.spacing[4]} 0 0 0;
  padding: ${({ theme }) => theme.spacing[3]};
  background: #fef3c7;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  color: #92400e;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  display: flex;
  align-items: start;
  gap: ${({ theme }) => theme.spacing[2]};

  &::before {
    content: '⚠️';
    flex-shrink: 0;
  }
`;

const ModalFooter = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
  border-top: 1px solid ${({ theme }) => theme.colors.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  justify-content: flex-end;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column-reverse;
  }
`;

export default function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Delete",
  itemName,
  itemType = "item",
  loading = false 
}) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  return (
    <Backdrop onClick={handleBackdropClick}>
      <Modal role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
        <ModalHeader>
          <IconWrapper>
            🗑️
          </IconWrapper>
          <HeaderText>
            <ModalTitle id="delete-modal-title">{title}</ModalTitle>
          </HeaderText>
        </ModalHeader>

        <ModalBody>
          <ModalText>
            Are you sure you want to delete <HighlightText>{itemName}</HighlightText>?
          </ModalText>
          <WarningText>
            This action cannot be undone. The {itemType} will be permanently removed from the system.
          </WarningText>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            $variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            $variant="danger"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </ModalFooter>
      </Modal>
    </Backdrop>
  );
}
