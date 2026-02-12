import React, { useState } from 'react';
import styled from 'styled-components';
import Lightbox from './Lightbox.jsx';

const GalleryContainer = styled.div`
  position: sticky;
  top: ${({ theme }) => theme.spacing[4]};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    position: relative;
    top: 0;
  }
`;

const MainImage = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  transition: transform ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: scale(1.02);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: ${({ theme }) => theme.spacing[2]};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  }
`;

const Thumbnail = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  overflow: hidden;
  cursor: pointer;
  border: 3px solid ${({ theme, $active }) => 
    $active ? theme.colors.primary : 'transparent'
  };
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: scale(1.05);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Placeholder = styled.div`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.neutral[200]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 32px;
  }
`;

const ZoomIndicator = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing[3]};
  right: ${({ theme }) => theme.spacing[3]};
  background: rgba(0, 0, 0, 0.6);
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  pointer-events: none;
  opacity: 0;
  transition: opacity ${({ theme }) => theme.transitions.fast};

  ${MainImage}:hover & {
    opacity: 1;
  }
`;

export default function ImageGallery({ images, alt }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Ensure images is an array
  const imageArray = Array.isArray(images) ? images : images ? [images] : [];

  // Convert to proper format if needed
  const formattedImages = imageArray.map((img) => {
    if (typeof img === 'string') {
      return { url: img, alt };
    }
    return img;
  });

  if (formattedImages.length === 0) {
    return (
      <GalleryContainer>
        <MainImage>
          <Placeholder>🐱</Placeholder>
        </MainImage>
      </GalleryContainer>
    );
  }

  const currentImage = formattedImages[currentIndex];

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    if (currentIndex < formattedImages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <>
      <GalleryContainer>
        <MainImage onClick={() => openLightbox(currentIndex)}>
          <img src={currentImage.url} alt={currentImage.alt || alt} />
          <ZoomIndicator>
            🔍 Click to enlarge
          </ZoomIndicator>
        </MainImage>

        {formattedImages.length > 1 && (
          <ThumbnailGrid>
            {formattedImages.map((image, index) => (
              <Thumbnail
                key={index}
                $active={index === currentIndex}
                onClick={() => setCurrentIndex(index)}
              >
                <img src={image.url} alt={image.alt || `${alt} ${index + 1}`} />
              </Thumbnail>
            ))}
          </ThumbnailGrid>
        )}
      </GalleryContainer>

      {lightboxOpen && (
        <Lightbox
          images={formattedImages}
          currentIndex={currentIndex}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}
    </>
  );
}
