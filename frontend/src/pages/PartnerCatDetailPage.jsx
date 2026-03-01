// frontend/src/pages/PartnerCatDetailPage.jsx
// Detail page for Voice for the Voiceless partner foster cats

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  Container,
  Section,
  ButtonLink,
  Badge,
  Alert,
  Button,
} from '../components/Common/StyledComponents.js';
import SectionHero from '../components/Common/SectionHero.jsx';
import LoadingState from '../components/Common/LoadingState.jsx';
import ErrorState from '../components/Common/ErrorState.jsx';
import ImageGallery from '../components/Common/ImageGallery.jsx';
import http from '../api/http.js';

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[12]};
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing[8]};
  }
`;

const DetailContent = styled.div``;

const CatHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const CatTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CatMeta = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
`;

const BadgeGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const PartnerBanner = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-size: ${({ theme }) => theme.fontSizes.base};
  box-shadow: ${({ theme }) => theme.shadows.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    text-align: center;
  }
`;

const InfoSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  padding: ${({ theme }) => theme.spacing[6]};
  background: ${({ theme }) => theme.colors.light};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border-left: 4px solid ${({ theme, $borderColor }) => $borderColor || theme.colors.primary};
`;

const InfoTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const InfoText = styled.p`
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: pre-wrap;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
`;

const InfoItem = styled.div`
  padding: ${({ theme }) => theme.spacing[3]};
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  
  .label {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    margin-bottom: ${({ theme }) => theme.spacing[1]};
  }
  
  .value {
    font-size: ${({ theme }) => theme.fontSizes.base};
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
  }
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const InfoListItem = styled.li`
  padding: ${({ theme }) => theme.spacing[2]} 0;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};

  &:last-child {
    border-bottom: none;
  }

  strong {
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    min-width: 100px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-top: ${({ theme }) => theme.spacing[8]};
  padding-top: ${({ theme }) => theme.spacing[8]};
  border-top: 2px solid ${({ theme }) => theme.colors.border};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const AdoptButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[8]};
  
  &::after {
    content: '→';
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }
`;

export default function PartnerCatDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cat, setCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCat = () => {
    setLoading(true);
    setError(null);

    http
      .get(`/cats/partner/${id}`)
      .then((res) => setCat(res.data))
      .catch((err) => {
        console.error('Failed to load partner cat', err);
        setError("We couldn't load this cat's details. They may have been adopted!");
        setCat(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCat();
  }, [id]);

  // Format age display
  const formatAge = (cat) => {
    if (!cat) return 'Age unknown';
    
    // Primary: use age_text from Adopt-a-Pet
    if (cat.age_text && cat.age_text.trim() !== '') {
      return cat.age_text;
    }
    
    // Fallback: format age_years if available
    if (typeof cat.age_years === 'number') {
      if (cat.age_years < 1) {
        const months = Math.round(cat.age_years * 12);
        return `${months} month${months === 1 ? '' : 's'}`;
      }
      return `${Math.floor(cat.age_years)} year${Math.floor(cat.age_years) === 1 ? '' : 's'}`;
    }
    
    return 'Age unknown';
  };

  // Format sex display
  const formatSex = (sex) => {
    if (!sex) return 'Unknown';
    return sex.charAt(0).toUpperCase() + sex.slice(1).toLowerCase();
  };

  // Format hair length display
  const formatHairLength = (hair) => {
    if (!hair) return 'Unknown';
    return hair.charAt(0).toUpperCase() + hair.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <>
        <SectionHero
          variant="gradient"
          size="sm"
          title="Loading..."
          compactTitle
        />
        <Section $padding="lg">
          <Container>
            <DetailGrid>
              <div>
                <LoadingState
                  variant="skeleton"
                  skeletonCount={1}
                  skeletonHeight="400px"
                />
              </div>
              <DetailContent>
                <LoadingState variant="skeleton" skeletonCount={8} />
              </DetailContent>
            </DetailGrid>
          </Container>
        </Section>
      </>
    );
  }

  if (error || !cat) {
    return (
      <>
        <SectionHero
          variant="gradient"
          size="sm"
          title="Cat Not Found"
          compactTitle
        />
        <Section $padding="lg">
          <Container>
            <ErrorState
              icon="🐱"
              iconSize="lg"
              title="Cat not found"
              message={
                error ||
                "This partner cat may have been adopted or is no longer available. They could have found their forever home! 🎉"
              }
              onRetry={error ? fetchCat : undefined}
              actions={
                <>
                  <ButtonLink to="/cats" $variant="primary">
                    View All Cats
                  </ButtonLink>
                  <ButtonLink to="/alumni" $variant="outline">
                    View Alumni
                  </ButtonLink>
                </>
              }
            />
          </Container>
        </Section>
      </>
    );
  }

  // Prepare images array
  const catImages = cat.main_image_url ? [cat.main_image_url] : [];

  // Check for special badges
  const hasBadges = !!cat.special_needs || !!cat.is_senior;

  return (
    <>
      {/* Hero Section */}
      <SectionHero
        variant="gradient"
        size="sm"
        title={cat.name}
        subtitle="Available for adoption through Voice for the Voiceless"
        compactTitle
      />

      {/* Main Content */}
      <Section $padding="lg">
        <Container>
          {/* Partner Foster Banner */}
          <PartnerBanner>
            <span style={{ fontSize: '2rem' }}>🏛️</span>
            <div>
              <strong>Partner Foster</strong> · This cat is being fostered by another Voice for the Voiceless volunteer.
              Adoption is handled through Adopt-a-Pet.
            </div>
          </PartnerBanner>

          <DetailGrid>
            {/* Image Gallery Column */}
            <ImageGallery images={catImages} alt={cat.name} />

            {/* Details Column */}
            <DetailContent>
              <CatHeader>
                <CatTitle>{cat.name}</CatTitle>
                <CatMeta>
                  {formatAge(cat)}
                  {' · '}
                  {formatSex(cat.sex)}
                  {' · '}
                  {cat.breed || 'Mixed breed'}
                </CatMeta>

                {hasBadges && (
                  <BadgeGroup>
                    {!!cat.special_needs && (
                      <Badge $variant="warning">Special Needs</Badge>
                    )}
                    {!!cat.is_senior && <Badge $variant="secondary">Senior</Badge>}
                  </BadgeGroup>
                )}
              </CatHeader>

              {/* Bio Section */}
              {cat.description && (
                <InfoSection>
                  <InfoTitle>About {cat.name}</InfoTitle>
                  <InfoText>{cat.description}</InfoText>
                </InfoSection>
              )}

              {/* Partner Cat Details */}
              <InfoSection $borderColor="#764ba2">
                <InfoTitle>Details</InfoTitle>
                <InfoGrid>
                  {cat.color && (
                    <InfoItem>
                      <div className="label">Color</div>
                      <div className="value">{cat.color}</div>
                    </InfoItem>
                  )}
                  {cat.hair_length && (
                    <InfoItem>
                      <div className="label">Hair Length</div>
                      <div className="value">{formatHairLength(cat.hair_length)}</div>
                    </InfoItem>
                  )}
                  <InfoItem>
                    <div className="label">Spayed/Neutered</div>
                    <div className="value">{cat.spayed_neutered ? '✅ Yes' : '❌ No'}</div>
                  </InfoItem>
                  <InfoItem>
                    <div className="label">Shots Current</div>
                    <div className="value">{cat.shots_current ? '✅ Yes' : '❌ No'}</div>
                  </InfoItem>
                </InfoGrid>
              </InfoSection>

              {/* Good With */}
              <InfoSection>
                <InfoTitle>Good With</InfoTitle>
                <InfoList>
                  <InfoListItem>
                    <strong>Kids:</strong>
                    <span>{cat.good_with_kids ? '✅ Yes' : '❌ No'}</span>
                  </InfoListItem>
                  <InfoListItem>
                    <strong>Cats:</strong>
                    <span>{cat.good_with_cats ? '✅ Yes' : '❌ No'}</span>
                  </InfoListItem>
                  <InfoListItem>
                    <strong>Dogs:</strong>
                    <span>{cat.good_with_dogs ? '✅ Yes' : '❌ No'}</span>
                  </InfoListItem>
                </InfoList>
              </InfoSection>

              {/* Adoption CTA */}
              <Alert $variant="info" style={{ marginTop: '2rem' }}>
                <strong>Ready to adopt {cat.name}?</strong>
                <p style={{ marginTop: '0.5rem' }}>
                  Click below to view {cat.name}'s full profile and adoption application on Adopt-a-Pet.
                </p>
              </Alert>

              {/* Action Buttons */}
              <ActionButtons>
                {cat.adoptapet_url && (
                  <AdoptButton
                    as="a"
                    href={cat.adoptapet_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    $variant="primary"
                    $size="lg"
                  >
                    Adopt on Adopt-a-Pet
                  </AdoptButton>
                )}
                <ButtonLink to="/cats" $variant="outline" $size="lg">
                  View All Cats
                </ButtonLink>
              </ActionButtons>
            </DetailContent>
          </DetailGrid>
        </Container>
      </Section>
    </>
  );
}
