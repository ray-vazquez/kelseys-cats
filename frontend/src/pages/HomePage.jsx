// Migrated HomePage - Using Phase 1+2 enhanced components with senior badge
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Container,
  Section,
  Grid,
  Card,
  CardImage,
  CardTitle,
  Badge,
  TextMuted,
} from "../components/Common/StyledComponents.js";
import SectionHero from "../components/Common/SectionHero.jsx";
import LoadingState from "../components/Common/LoadingState.jsx";
import { NoCatsFound } from "../components/Common/EmptyState.jsx";
import http from "../api/http.js";
import { Link } from "react-router-dom";

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[12]};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes["4xl"]};
`;

// Updated CardBody with flexbox to push button to bottom
const CardBody = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const CardContent = styled.div`
  flex: 1;
`;

const CardFooter = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[4]};
  flex-wrap: wrap;
  min-height: 2rem; /* Reserve space even when empty */
`;

const ButtonWrapper = styled.div`
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

const MissionText = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 700px;
  margin: 0 auto ${({ theme }) => theme.spacing[8]};
`;

// Masthead button styling - matches navbar secondary color
const MastheadButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-align: center;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  text-decoration: none;
  white-space: nowrap;
  padding: ${({ theme, $size }) => {
    if ($size === 'lg') return `${theme.spacing[4]} ${theme.spacing[8]}`;
    return `${theme.spacing[3]} ${theme.spacing[6]}`;
  }};
  font-size: ${({ theme, $size }) => {
    if ($size === 'lg') return theme.fontSizes.lg;
    return theme.fontSizes.base;
  }};
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  border: 2px solid ${({ theme }) => theme.colors.white};

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondaryHover};
    border-color: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.white};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 2px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 100%;
  }
`;

const LearnMoreButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-align: center;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  text-decoration: none;
  white-space: nowrap;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[6]};
  font-size: ${({ theme }) => theme.fontSizes.base};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  width: 100%;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    border-color: ${({ theme }) => theme.colors.primaryHover};
    color: ${({ theme }) => theme.colors.white};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 2px;
  }
`;

export default function HomePage() {
  const [featuredCats, setFeaturedCats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    http
      .get('/cats/all-available')
      .then((res) => {
        
        // Filter for truly featured cats (featured = true/1 after migration)
        const featured = (res.data.featured_foster_cats || [])
          .filter(cat => cat.featured)
          .slice(0, 12); // Show up to 12 featured cats
          
        setFeaturedCats(featured);
      })
      .catch((err) => {
        console.error("Failed to load featured cats", err);
        setFeaturedCats([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero Section - Using new SectionHero component */}
      <SectionHero
        variant="gradient"
        size="lg"
        title="Welcome to Kelsey's Cats"
        subtitle="Finding loving homes for cats in need. Every cat deserves a second chance at happiness."
        actions={
          <>
            <MastheadButton to="/cats" $size="lg">
              Meet Our Cats
            </MastheadButton>
            <MastheadButton to="/adoption" $size="lg">
              Adoption Info
            </MastheadButton>
          </>
        }
      />

      {/* Featured Cats Section */}
      <Section $padding="lg" $bg="light">
        <Container>
          <SectionTitle>Featured Cats</SectionTitle>

          {loading ? (
            <Grid $cols={3} $mdCols={2}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <LoadingState variant="skeleton" skeletonCount={5} />
                </Card>
              ))}
            </Grid>
          ) : featuredCats.length === 0 ? (
            <NoCatsFound
              description="No featured cats available right now. Check back soon or browse all our cats!"
              actions={
                <LearnMoreButton to="/cats">
                  View All Cats
                </LearnMoreButton>
              }
            />
          ) : (
            <Grid $cols={3} $mdCols={2}>
              {featuredCats.map((cat) => (
                <Card key={cat.id} $hover $flexColumn>
                  {cat.main_image_url && (
                    <CardImage
                      src={cat.main_image_url}
                      alt={cat.name}
                      $height="250px"
                    />
                  )}
                  <CardBody>
                    <CardContent>
                      <CardTitle>{cat.name}</CardTitle>
                      <TextMuted>
                        {cat.age_years
                          ? `${Math.floor(cat.age_years)} year${Math.floor(cat.age_years) !== 1 ? 's' : ''} old`
                          : "Age unknown"}{" "}
                        · {cat.breed || "Mixed breed"}
                      </TextMuted>
                      <CardFooter>
                        {!!cat.is_special_needs && (
                          <Badge $variant="warning">Special Needs</Badge>
                        )}
                        {!!cat.is_senior && (
                          <Badge $variant="secondary">Senior</Badge>
                        )}
                        {cat.bonded_pair_id > 0 && (
                          <Badge $variant="info">Bonded Pair</Badge>
                        )}
                      </CardFooter>
                    </CardContent>
                    <ButtonWrapper>
                      <LearnMoreButton to={`/cats/${cat.id}`}>
                        Learn More
                      </LearnMoreButton>
                    </ButtonWrapper>
                  </CardBody>
                </Card>
              ))}
            </Grid>
          )}
        </Container>
      </Section>

      {/* Mission Section */}
      <Section $padding="lg">
        <Container $size="md">
          <SectionTitle>Our Mission</SectionTitle>
          <MissionText>
            We're dedicated to rescuing and rehoming cats in need. Every cat in
            our care receives medical attention, love, and the chance to find
            their forever family. Thank you for considering adoption and helping
            us make a difference in these cats' lives.
          </MissionText>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <MastheadButton to="/adoption" $size="lg">
              How to Adopt
            </MastheadButton>
            <MastheadButton to="/alumni" $size="lg">
              Success Stories
            </MastheadButton>
          </div>
        </Container>
      </Section>
    </>
  );
}
