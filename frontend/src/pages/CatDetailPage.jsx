// frontend/src/pages/CatDetailPage.jsx
import React, { useState, useEffect, useMemo } from "react";
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
  font-size: ${({ theme }) => theme.fontSizes["4xl"]};
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

  // NEW: grouped tags state
  const [tagData, setTagData] = useState(null);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagsError, setTagsError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setTagsLoading(true);
    setTagsError(null);

    // fetch core cat data
    http
      .get(`/cats/${id}`)
      .then((res) => setCat(res.data))
      .catch((err) => {
        console.error("Failed to load cat", err);
        setError("Unable to load cat details. Please try again.");
        setCat(null);
      })
      .finally(() => setLoading(false));

    // fetch grouped tags for this cat
    http
      .get(`/tags/cats/${id}`)
      .then((res) => {
        // expects: { cat_id, tags, grouped: { temperament: [...], medical: [...] } } [file:3]
        setTagData(res.data);
      })
      .catch((err) => {
        console.error("Failed to load cat tags", err);
        // non-fatal: still show page without tags
        setTagsError("Unable to load personality and medical tags.");
      })
      .finally(() => setTagsLoading(false));
  }, [id]);

  // NOTE: validTags from flat cat.tags is no longer used for display,
  // but you can keep it if anything else depends on it.
  const validTags = useMemo(() => {
    if (!cat?.tags || !Array.isArray(cat.tags)) return [];
    return cat.tags.filter(
      (tag) =>
        tag !== null &&
        tag !== undefined &&
        tag !== "" &&
        typeof tag === "string",
    );
  }, [cat?.tags]);

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
            {error && (
              <Alert $variant="danger" style={{ marginBottom: "2rem" }}>
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

  const isAvailable = cat.status === "available";
  const isAdopted = cat.status === "alumni";

  const isSenior =
    !!cat.is_senior || (cat.age_years != null && cat.age_years >= 10);

  const catImages = [];
  if (cat.main_image_url) {
    catImages.push(cat.main_image_url);
  }
  if (cat.additional_images) {
    try {
      const additionalImages =
        typeof cat.additional_images === "string"
          ? JSON.parse(cat.additional_images)
          : cat.additional_images;

      if (Array.isArray(additionalImages)) {
        catImages.push(...additionalImages);
      }
    } catch (e) {
      console.error("Failed to parse additional_images:", e);
    }
  }

  const hasBadges =
    !!cat.is_special_needs ||
    isSenior ||
    cat.bonded_pair_id > 0 ||
    !!cat.featured;

  // NEW: derive grouped temperament/medical tags
  const temperamentTags = tagData?.grouped?.temperament || [];
  const medicalTags = tagData?.grouped?.medical || [];
  const hasTemperament = temperamentTags.length > 0;
  const hasMedical = medicalTags.length > 0;

  return (
    <>
      {/* Hero Section */}
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
            <Alert
              $variant={isAdopted ? "success" : "info"}
              style={{ marginBottom: "2rem" }}
            >
              {isAdopted
                ? `${cat.name} has found their forever home! Check out our other cats looking for adoption.`
                : `${cat.name} is currently ${cat.status}.`}
            </Alert>
          )}

          <DetailGrid>
            {/* Image Gallery Column */}
            <ImageGallery images={catImages} alt={cat.name} />

            {/* Details Column */}
            <DetailContent>
              <CatHeader>
                <CatTitle>{cat.name}</CatTitle>
                <CatMeta>
                  {cat.age_years
                    ? `${Math.floor(cat.age_years)} year${
                        Math.floor(cat.age_years) !== 1 ? "s" : ""
                      } old`
                    : "Age unknown"}
                  {" · "}
                  {cat.sex || "Unknown"}
                  {" · "}
                  {cat.breed || "Mixed breed"}
                </CatMeta>

                {hasBadges && (
                  <BadgeGroup>
                    {!!cat.is_special_needs && (
                      <Badge $variant="warning">Special Needs</Badge>
                    )}
                    {isSenior && <Badge $variant="secondary">Senior</Badge>}
                    {cat.bonded_pair_id > 0 && (
                      <Badge $variant="info">Bonded Pair</Badge>
                    )}
                    {!!cat.featured && (
                      <Badge $variant="success">Featured</Badge>
                    )}
                  </BadgeGroup>
                )}
              </CatHeader>

              {/* Bio Section */}
              {cat.bio && (
                <InfoSection>
                  <InfoTitle>About {cat.name}</InfoTitle>
                  <InfoText>{cat.bio}</InfoText>
                </InfoSection>
              )}

              {/* Personality & Temperament (grouped temperament tags) */}
              {!tagsLoading && hasTemperament && (
                <InfoSection>
                  <InfoTitle>Personality &amp; Temperament</InfoTitle>
                  <BadgeGroup>
                    {temperamentTags.map((tag) => (
                      <Badge key={tag.id} $variant="info">
                        {tag.name}
                      </Badge>
                    ))}
                  </BadgeGroup>
                </InfoSection>
              )}

              {/* Medical Information (grouped medical tags) */}
              {!tagsLoading && hasMedical && (
                <InfoSection>
                  <InfoTitle>Medical Information</InfoTitle>
                  <BadgeGroup>
                    {medicalTags.map((tag) => (
                      <Badge key={tag.id} $variant="info">
                        {tag.name}
                      </Badge>
                    ))}
                  </BadgeGroup>
                </InfoSection>
              )}

              {/* Optional lightweight tags loading state */}
              {tagsLoading && (
                <InfoSection>
                  <InfoTitle>Personality &amp; Temperament</InfoTitle>
                  <InfoText>Loading tags...</InfoText>
                </InfoSection>
              )}

              {/* Optional subtle error when no tags to show */}
              {!tagsLoading && tagsError && !hasTemperament && !hasMedical && (
                <Alert $variant="info" style={{ marginBottom: "2rem" }}>
                  {tagsError}
                </Alert>
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
