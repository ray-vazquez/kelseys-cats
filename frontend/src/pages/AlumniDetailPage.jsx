// AlumniDetailPage - Shows adopted cat details with Image Gallery
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import {
  Container,
  Section,
  ButtonLink,
  Badge,
  Alert,
} from "../components/Common/StyledComponents.js";
import SectionHero from "../components/Common/SectionHero.jsx";
import LoadingState from "../components/Common/LoadingState.jsx";
import EmptyState from "../components/Common/EmptyState.jsx";
import ImageGallery from "../components/Common/ImageGallery.jsx";
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
      .get(`/cats/${id}`)
      .then((res) => {
        const catData = res.data;
        // Verify this is actually an alumni cat
        if (catData.status !== 'alumni') {
          setError('This cat is not an alumni.');
          setCat(null);
        } else {
          setCat(catData);
        }
      })
      .catch((err) => {
        console.error("Failed to load alumni cat", err);
        setError("Unable to load alumni details. Please try again.");
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
              <div>
                <LoadingState variant="skeleton" skeletonCount={1} skeletonHeight="400px" />
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
          title="Alumni Not Found"
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
              title="Alumni cat not found"
              description="Check out our other success stories!"
              actions={
                <ButtonLink to="/alumni" $variant="primary">
                  View All Alumni
                </ButtonLink>
              }
            />
          </Container>
        </Section>
      </>
    );
  }

  const isSenior = cat.is_senior || (cat.age_years && cat.age_years >= 10);

  // Prepare images array for gallery
  const catImages = [];
  if (cat.main_image_url) {
    catImages.push(cat.main_image_url);
  }
  // Add additional images if they exist
  if (cat.additional_images && Array.isArray(cat.additional_images)) {
    catImages.push(...cat.additional_images);
  }

  return (
    <>
      {/* Hero Section */}
      <SectionHero
        variant="gradient"
        size="sm"
        title={cat.name}
        subtitle="Successfully Adopted!"
        compactTitle
      />

      {/* Main Content */}
      <Section $padding="lg">
        <Container>
          <Alert $variant="success" style={{ marginBottom: '2rem' }}>
            🎉 {cat.name} has found their forever home!
          </Alert>

          <DetailGrid>
            {/* Image Gallery Column */}
            <ImageGallery images={catImages} alt={cat.name} />

            {/* Details Column */}
            <DetailContent>
              <CatHeader>
                <CatTitle>{cat.name}</CatTitle>
                <CatMeta>
                  {cat.age_years ? `${cat.age_years} years old` : "Age unknown"} ·{" "}
                  {cat.sex || "Unknown"} · {cat.breed || "Mixed breed"}
                </CatMeta>

                <BadgeGroup>
                  <Badge $variant="success">Adopted</Badge>
                  {cat.is_special_needs && (
                    <Badge $variant="warning">Special Needs</Badge>
                  )}
                  {isSenior && (
                    <Badge $variant="secondary">Senior</Badge>
                  )}
                  {cat.bonded_pair_id && (
                    <Badge $variant="info">Bonded Pair</Badge>
                  )}
                </BadgeGroup>
              </CatHeader>

              {/* Success Story */}
              {cat.bio && (
                <InfoSection>
                  <InfoTitle>Success Story</InfoTitle>
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

              {/* Action Buttons */}
              <ActionButtons>
                <ButtonLink to="/alumni" $variant="outline" $size="lg">
                  View All Alumni
                </ButtonLink>
                <ButtonLink to="/cats" $variant="primary" $size="lg">
                  Meet Available Cats
                </ButtonLink>
              </ActionButtons>
            </DetailContent>
          </DetailGrid>
        </Container>
      </Section>
    </>
  );
}
