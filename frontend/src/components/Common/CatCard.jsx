import React from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.card};
  text-decoration: none;
  color: inherit;
  transition:
    transform ${({ theme }) => theme.transitions.spring},
    box-shadow ${({ theme }) => theme.transitions.spring};
  border: 1px solid ${({ theme }) => theme.colors.warmBorder};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
    text-decoration: none;
    color: inherit;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 3px;
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.creamDeep};
  flex-shrink: 0;
`;

const CatImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
  display: block;
  transition: transform ${({ theme }) => theme.transitions.slow};

  ${Card}:hover & {
    transform: scale(1.04);
  }
`;

const ImgPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  background: ${({ theme }) => theme.colors.creamDeep};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const StatusBadge = styled.span`
  position: absolute;
  top: ${({ theme }) => theme.spacing[3]};
  left: ${({ theme }) => theme.spacing[3]};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[3]}`};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  line-height: 1.6;

  ${({ $status, theme }) => {
    const s = ($status ?? '').toLowerCase();
    if (s === 'available' || s === 'foster' || s === '') {
      return css`
        background: ${theme.colors.statusAvailableLight};
        color: ${theme.colors.statusAvailableText};
        border: 1px solid rgba(42, 157, 143, 0.2);
      `;
    }
    if (s === 'adopted') {
      return css`
        background: ${theme.colors.statusAdoptedLight};
        color: ${theme.colors.statusAdoptedText};
        border: 1px solid rgba(108, 117, 125, 0.2);
      `;
    }
    if (s === 'pending') {
      return css`
        background: ${theme.colors.statusPendingLight};
        color: ${theme.colors.statusPendingText};
        border: 1px solid rgba(243, 156, 18, 0.25);
      `;
    }
    return css`
      background: ${theme.colors.statusFosteredLight};
      color: ${theme.colors.statusFosteredText};
      border: 1px solid rgba(155, 89, 182, 0.2);
    `;
  }}
`;

const CardBody = styled.div`
  padding: ${({ theme }) => theme.spacing[5]};
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const CatName = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0;
  line-height: ${({ theme }) => theme.lineHeights.tight};
`;

const CatMeta = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

const MetaTag = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const CatDesc = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin: ${({ theme }) => `${theme.spacing[2]} 0 0`};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: none;
`;

const ViewLink = styled.span`
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing[4]};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  transition: gap ${({ theme }) => theme.transitions.fast};

  ${Card}:hover & {
    gap: ${({ theme }) => theme.spacing[2]};
  }
`;

function getStatusLabel(status) {
  const map = {
    available: 'Available',
    foster: 'Available',
    adopted: 'Adopted',
    pending: 'Pending Adoption',
  };
  const key = (status ?? '').toLowerCase();
  return map[key] ?? (status || 'Available');
}

export default function CatCard({ cat, isPartner = false }) {
  if (!cat) return null;

  const {
    id,
    name,
    breed,
    age,
    age_unit,
    status,
    primary_image_url,
    description,
    sex,
  } = cat;

  const href = isPartner ? `/cats/partner/${id}` : `/cats/${id}`;

  const ageStr =
    age != null
      ? `${age} ${age_unit ?? (age === 1 ? 'year' : 'years')} old`
      : null;

  const sexLabel =
    sex === 'male' ? '♂ Male' : sex === 'female' ? '♀ Female' : null;

  return (
    <Card to={href} aria-label={`Learn more about ${name}`}>
      <ImageWrapper>
        {primary_image_url ? (
          <CatImg
            src={primary_image_url}
            alt={`Photo of ${name}`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <ImgPlaceholder aria-hidden="true">🐱</ImgPlaceholder>
        )}
        <StatusBadge
          $status={status}
          aria-label={`Status: ${getStatusLabel(status)}`}
        >
          {getStatusLabel(status)}
        </StatusBadge>
      </ImageWrapper>

      <CardBody>
        <CatName>{name}</CatName>
        <CatMeta>
          {breed && <MetaTag>🐾 {breed}</MetaTag>}
          {ageStr && <MetaTag>🎂 {ageStr}</MetaTag>}
          {sexLabel && <MetaTag>{sexLabel}</MetaTag>}
        </CatMeta>
        {description && <CatDesc>{description}</CatDesc>}
        <ViewLink>
          Meet {name} <span aria-hidden="true">→</span>
        </ViewLink>
      </CardBody>
    </Card>
  );
}
