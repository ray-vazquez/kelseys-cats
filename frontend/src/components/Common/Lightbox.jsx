import React, { useEffect, useCallback } from 'react';
import styled from 'styled-components';

const LightboxOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease-in-out;
  padding: 80px 40px 40px;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 60px 20px 20px;
  }
`;

const LightboxContent = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LightboxImage = styled.img`
  width: 85vw;
  height: 85vh;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  animation: zoomIn 0.2s ease-in-out;
  
  @keyframes zoomIn {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 90vw;
    height: 75vh;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 95vw;
    height: 70vh;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.white};
  width: 52px;
  height: 52px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  line-height: 1;
  font-weight: 300;
  transition: all ${({ theme }) => theme.transitions.fast};
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 44px;
    height: 44px;
    font-size: 28px;
    top: 15px;
    right: 15px;
  }
`;

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ $direction }) => ($direction === 'prev' ? 'left: 30px;' : 'right: 30px;')}
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.white};
  width: 60px;
  height: 60px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  line-height: 1;
  font-weight: 300;
  transition: all ${({ theme }) => theme.transitions.fast};
  z-index: 10;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-50%) scale(1.1);
  }

  &:active:not(:disabled) {
    transform: translateY(-50%) scale(0.95);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 48px;
    height: 48px;
    font-size: 32px;
    ${({ $direction }) => ($direction === 'prev' ? 'left: 15px;' : 'right: 15px;')}
  }
`;

const ImageCounter = styled.div`
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[5]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    bottom: 20px;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  }
`;

export default function Lightbox({ images, currentIndex, onClose, onNext, onPrev }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
    },
    [onClose, onNext, onPrev]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  if (!images || images.length === 0 || currentIndex < 0 || currentIndex >= images.length) {
    return null;
  }

  const currentImage = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  return (
    <LightboxOverlay onClick={onClose}>
      <LightboxContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="Close lightbox">
          ×
        </CloseButton>

        {images.length > 1 && (
          <>
            <NavButton
              $direction="prev"
              onClick={onPrev}
              disabled={!hasPrev}
              aria-label="Previous image"
            >
              ‹
            </NavButton>
            <NavButton
              $direction="next"
              onClick={onNext}
              disabled={!hasNext}
              aria-label="Next image"
            >
              ›
            </NavButton>
          </>
        )}

        <LightboxImage
          src={currentImage.url}
          alt={currentImage.alt || `Image ${currentIndex + 1}`}
        />

        {images.length > 1 && (
          <ImageCounter>
            {currentIndex + 1} / {images.length}
          </ImageCounter>
        )}
      </LightboxContent>
    </LightboxOverlay>
  );
}
