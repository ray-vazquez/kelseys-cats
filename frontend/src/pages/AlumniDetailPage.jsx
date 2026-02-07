// Migrated AlumniDetailPage - Using Phase 1+2 enhanced components
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  Container,
  Section,
  ButtonLink,
  Badge,
  Alert,
} from '../components/Common/StyledComponents.js';
import SectionHero from '../components/Common/SectionHero.jsx';
import LoadingState from '../components/Common/LoadingState.jsx';
import EmptyState from '../components/Common/EmptyState.jsx';
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

const ImageWrapper = styled.div`
  position: sticky;
  top: ${({ theme }) => theme.spacing[4]};
  
  img {
    width: 100%;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    object-fit: cover;
    aspect-ratio: 1;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    position: relative;
    top: 0;
  }
`;

const StoryContent = styled.div``;

const StoryHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const StoryTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const AdoptionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};

  &::before {
    content: '❤️';
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }
`;

const BadgeGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const InfoSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  padding: ${({ theme }) => theme.spacing[6]};
  background: ${({ theme }) => theme.colors.light};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border-left: 4px solid ${({ theme }) => theme.colors.success};
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
  margin-bottom: ${({ theme }) => theme.spacing[4]};

  &:last-child {
    margin-bottom: 0;
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
    min-width: 120px;
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

export default function AlumniDetailPage() {
  const { id } = useParams();
  const [cat, setCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    http
      .get(`/alumni/${id}`)
      .then((res) => setCat(res.data))
      .catch((err) => {
        console.error('Failed to load alumni cat', err);
        setError('Unable to load success story. Please try again.');
        setCat(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <SectionHero
          variant="gradient"
          size="sm"
          title="Loading..."
        />
        <Section $padding="lg">
          <Container>
            <DetailGrid>
              <ImageWrapper>
                <LoadingState variant="skeleton" skeletonCount={1} skeletonHeight="400px" />
              </ImageWrapper>
              <StoryContent>
                <LoadingState variant="skeleton" skeletonCount={8} />
              </StoryContent>
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
          title="Story Not Found"
        />
        <Section $padding="lg">
          <Container>
            {error && (
              <Alert $variant="danger" style={{ marginBottom: '2rem' }}>
                {error}
              </Alert>
            )}
            <EmptyState
              icon="🎉"
              iconSize="lg"
              title="Success story not found"
              description="This alumni cat's story may have been removed or is no longer available. Browse our other success stories!"
              actions={
                <>
                  <ButtonLink to="/alumni" $variant="primary">
                    View All Alumni
                  </ButtonLink>
                  <ButtonLink to="/cats" $variant="outline">
                    Meet Current Cats
                  </ButtonLink>
                </>
              }
            />
          </Container>
        </Section>
      </>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <SectionHero
        variant="gradient"
        size="sm"
        title={`${cat.name}'s Success Story`}
        subtitle="A happy ending and a forever home"
      />

      {/* Main Content */}
      <Section $padding="lg">
        <Container>
          {/* Success Alert */}
          <Alert $variant="success" style={{ marginBottom: '3rem' }}>
            <strong>🎉 Happy Forever Home!</strong> {cat.name} was successfully adopted
            {cat.adoption_date && (
              <> on {new Date(cat.adoption_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</>
            )}. Thank you for supporting our mission!
          </Alert>

          <DetailGrid>
            {/* Image Column */}
            <ImageWrapper>
              {cat.main_image_url ? (
                <img src={cat.main_image_url} alt={cat.name} />
              ) : (
                <div style={{
                  width: '100%',
                  aspectRatio: '1',
                  background: '#e5e5e5',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px'
                }}>
                  🐱
                </div>
              )}
            </ImageWrapper>

            {/* Story Column */}
            <StoryContent>
              <StoryHeader>
                <StoryTitle>{cat.name}</StoryTitle>
                
                <AdoptionMeta>
                  Adopted{' '}
                  {cat.adoption_date
                    ? new Date(cat.adoption_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'date unknown'}
                </AdoptionMeta>

                <BadgeGroup>
                  {cat.is_special_needs && (
                    <Badge $variant="warning">Special Needs</Badge>
                  )}
                  {cat.bonded_pair_id && (
                    <Badge $variant="info">Bonded Pair</Badge>
                  )}
                  {cat.age_years >= 10 && (
                    <Badge $variant="secondary">Senior</Badge>
                  )}
                </BadgeGroup>
              </StoryHeader>

              {/* About Section */}
              <InfoSection>
                <InfoTitle>About {cat.name}</InfoTitle>
                {cat.temperament ? (
                  <InfoText>{cat.temperament}</InfoText>
                ) : (
                  <InfoText>A wonderful cat who found their perfect forever home.</InfoText>
                )}
              </InfoSection>

              {/* Cat Details */}
              <InfoSection>
                <InfoTitle>Details</InfoTitle>
                <InfoList>
                  {cat.age_years && (
                    <InfoListItem>
                      <strong>Age at Adoption:</strong>
                      <span>{cat.age_years} years old</span>
                    </InfoListItem>
                  )}
                  {cat.sex && (
                    <InfoListItem>
                      <strong>Sex:</strong>
                      <span>{cat.sex}</span>
                    </InfoListItem>
                  )}
                  {cat.breed && (
                    <InfoListItem>
                      <strong>Breed:</strong>
                      <span>{cat.breed}</span>
                    </InfoListItem>
                  )}
                  {cat.color && (
                    <InfoListItem>
                      <strong>Color:</strong>
                      <span>{cat.color}</span>
                    </InfoListItem>
                  )}
                </InfoList>
              </InfoSection>

              {/* Time in Foster Care */}
              {cat.intake_date && cat.adoption_date && (
                <InfoSection>
                  <InfoTitle>Journey to Forever Home</InfoTitle>
                  <InfoList>
                    <InfoListItem>
                      <strong>Intake Date:</strong>
                      <span>{new Date(cat.intake_date).toLocaleDateString()}</span>
                    </InfoListItem>
                    <InfoListItem>
                      <strong>Adoption Date:</strong>
                      <span>{new Date(cat.adoption_date).toLocaleDateString()}</span>
                    </InfoListItem>
                    <InfoListItem>
                      <strong>Time in Care:</strong>
                      <span>
                        {Math.floor(
                          (new Date(cat.adoption_date) - new Date(cat.intake_date)) /
                          (1000 * 60 * 60 * 24)
                        )} days
                      </span>
                    </InfoListItem>
                  </InfoList>
                </InfoSection>
              )}

              {/* Action Buttons */}
              <ActionButtons>
                <ButtonLink to="/alumni" $variant="primary" $size="lg">
                  More Success Stories
                </ButtonLink>
                <ButtonLink to="/cats" $variant="outline" $size="lg">
                  Meet Current Cats
                </ButtonLink>
              </ActionButtons>
            </StoryContent>
          </DetailGrid>
        </Container>
      </Section>
    </>
  );
}
