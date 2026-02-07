// Migrated CatDetailPage - Using Phase 1+2 enhanced components with compact title, senior badge, and bio
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import {
  Container,
  Section,
  ButtonLink,
  Badge,
  Alert,
  Flex,
} from "../components/Common/StyledComponents.js";
import SectionHero from "../components/Common/SectionHero.jsx";
import LoadingState from "../components/Common/LoadingState.jsx";
import EmptyState from "../components/Common/EmptyState.jsx";
import http from "../api/http.js";

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

const InfoSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  padding: ${({ theme }) => theme.spacing[6]};
  background: ${({ theme }) => theme.colors.light};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
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

export default function CatDetailPage() {
  const { id } = useParams();
  const [cat, setCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    http
      .get(`/cats/${id}`)
      .then((res) => setCat(res.data))
      .catch((err) => {
        console.error("Failed to load cat", err);
        setError("Unable to load cat details. Please try again.");
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
          compactTitle
        />
        <Section $padding="lg">
          <Container>
            <DetailGrid>
              <ImageWrapper>
                <LoadingState variant="skeleton" skeletonCount={1} skeletonHeight="400px" />
              </ImageWrapper>
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
            {error && (
              <Alert $variant="danger" style={{ marginBottom: '2rem' }}>
                {error}
              </Alert>
            )}
            <EmptyState
              icon="🐱"
              iconSize="lg"
              title="Cat not found"
              description="This cat may have been adopted or is no longer available. Check out our other wonderful cats looking for homes!"
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

  const isAvailable = cat.status === 'available';
  const isAdopted = cat.status === 'adopted';

  return (
    <>
      {/* Hero Section - Compact title for cat names */}
      <SectionHero
        variant="gradient"
        size="sm"
        title={cat.name}
        subtitle={
          isAvailable
            ? "Available for adoption"
            : isAdopted
            ? "Successfully adopted!"
            : cat.status
        }
        compactTitle
      />

      {/* Main Content */}
      <Section $padding="lg">
        <Container>
          {/* Status Alert */}
          {!isAvailable && (
            <Alert $variant={isAdopted ? "success" : "info"} style={{ marginBottom: '2rem' }}>
              {isAdopted
                ? `${cat.name} has found their forever home! Check out our other cats looking for adoption.`
                : `${cat.name} is currently ${cat.status}.`}
            </Alert>
          )}

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

            {/* Details Column */}
            <DetailContent>
              <CatHeader>
                <CatTitle>{cat.name}</CatTitle>
                <CatMeta>
                  {cat.age_years ? `${cat.age_years} years old` : "Age unknown"} ·{" "}
                  {cat.sex || "Unknown"} · {cat.breed || "Mixed breed"}
                </CatMeta>

                <BadgeGroup>
                  {cat.is_special_needs && (
                    <Badge $variant="warning">Special Needs</Badge>
                  )}
                  {cat.is_senior && (
                    <Badge $variant="secondary">Senior</Badge>
                  )}
                  {cat.bonded_pair_id && (
                    <Badge $variant="info">Bonded Pair</Badge>
                  )}
                  {cat.featured && (
                    <Badge $variant="success">Featured</Badge>
                  )}
                </BadgeGroup>
              </CatHeader>

              {/* Bio Section */}
              {cat.bio && (
                <InfoSection>
                  <InfoTitle>About {cat.name}</InfoTitle>
                  <InfoText>{cat.bio}</InfoText>
                </InfoSection>
              )}

              {/* Temperament */}
              {cat.temperament && (
                <InfoSection>
                  <InfoTitle>Temperament</InfoTitle>
                  <InfoText>{cat.temperament}</InfoText>
                </InfoSection>
              )}

              {/* Good With */}
              <InfoSection>
                <InfoTitle>Good With</InfoTitle>
                <InfoList>
                  <InfoListItem>
                    <strong>Kids:</strong>
                    <span>{cat.good_with_kids ? "✅ Yes" : "❌ No"}</span>
                  </InfoListItem>
                  <InfoListItem>
                    <strong>Cats:</strong>
                    <span>{cat.good_with_cats ? "✅ Yes" : "❌ No"}</span>
                  </InfoListItem>
                  <InfoListItem>
                    <strong>Dogs:</strong>
                    <span>{cat.good_with_dogs ? "✅ Yes" : "❌ No"}</span>
                  </InfoListItem>
                </InfoList>
              </InfoSection>

              {/* Medical Notes */}
              {cat.medical_notes && (
                <InfoSection>
                  <InfoTitle>Medical Notes</InfoTitle>
                  <InfoText>{cat.medical_notes}</InfoText>
                </InfoSection>
              )}

              {/* Intake Information */}
              {cat.intake_date && (
                <InfoSection>
                  <InfoTitle>Additional Information</InfoTitle>
                  <InfoList>
                    <InfoListItem>
                      <strong>Intake Date:</strong>
                      <span>{new Date(cat.intake_date).toLocaleDateString()}</span>
                    </InfoListItem>
                    {cat.color && (
                      <InfoListItem>
                        <strong>Color:</strong>
                        <span>{cat.color}</span>
                      </InfoListItem>
                    )}
                  </InfoList>
                </InfoSection>
              )}

              {/* Action Buttons */}
              <ActionButtons>
                {isAvailable && (
                  <ButtonLink to="/adoption" $variant="primary" $size="lg">
                    Adoption Information
                  </ButtonLink>
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
