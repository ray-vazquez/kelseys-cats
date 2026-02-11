// Migrated HomePage - Using Phase 1+2 enhanced components with senior badge - UPDATED BUTTONS
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Container,
  Section,
  Grid,
  Card,
  CardImage,
  CardBody,
  CardTitle,
  ButtonLink,
  Badge,
  TextMuted,
} from "../components/Common/StyledComponents.js";
import SectionHero from "../components/Common/SectionHero.jsx";
import LoadingState from "../components/Common/LoadingState.jsx";
import { NoCatsFound } from "../components/Common/EmptyState.jsx";
import http from "../api/http.js";

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[12]};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes["4xl"]};
`;

const CardFooter = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[4]};
  flex-wrap: wrap;
`;

const MissionText = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 700px;
  margin: 0 auto ${({ theme }) => theme.spacing[8]};
`;

// Masthead buttons - teal background with white text
const MastheadButton = styled(ButtonLink)`
  background: #16a085;
  color: #ffffff;
  border-color: #16a085;
  
  &:hover:not(:disabled) {
    background: #138d75;
    color: #ffffff;
    border-color: #138d75;
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  }
`;

// Outline variant for secondary button
const MastheadButtonOutline = styled(ButtonLink)`
  background: transparent;
  color: #ffffff;
  border-color: #ffffff;
  
  &:hover:not(:disabled) {
    background: #ffffff;
    color: #16a085;
    border-color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  }
`;

export default function HomePage() {
  const [featuredCats, setFeaturedCats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("status", "available");
    params.set("featured", "true");  // Request only featured cats from API
    params.set("page", "1");
    params.set("limit", "12");  // Increased limit to show more featured cats

    setLoading(true);
    http
      .get(`/cats?${params.toString()}`)
      .then((res) => {
        const body = res.data;
        const items = Array.isArray(body) ? body : body.items || [];
        // No need to filter anymore - API returns only featured cats
        setFeaturedCats(items);
      })
      .catch((err) => {
        console.error("Failed to load featured cats", err);
        setFeaturedCats([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero Section - Using new SectionHero component with teal buttons */}
      <SectionHero
        variant="gradient"
        size="lg"
        title="Welcome to Kelsey's Cats"
        subtitle="Finding loving homes for cats in need. Every cat deserves a second chance at happiness."
        actions={
          <>
            <MastheadButton to="/cats" $size="lg">
              Meet Current Cats
            </MastheadButton>
            <MastheadButtonOutline to="/adoption" $size="lg">
              How to Adopt
            </MastheadButtonOutline>
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
                <ButtonLink to="/cats" $variant="primary">
                  View All Cats
                </ButtonLink>
              }
            />
          ) : (
            <Grid $cols={3} $mdCols={2}>
              {featuredCats.map((cat) => (
                <Card key={cat.id} $hover>
                  {cat.main_image_url && (
                    <CardImage
                      src={cat.main_image_url}
                      alt={cat.name}
                      $height="250px"
                    />
                  )}
                  <CardBody>
                    <CardTitle>{cat.name}</CardTitle>
                    <TextMuted>
                      {cat.age_years
                        ? `${cat.age_years} years old`
                        : "Age unknown"}{" "}
                      · {cat.breed || "Mixed breed"}
                    </TextMuted>
                    {cat.temperament && (
                      <p style={{ marginBottom: '1rem', lineHeight: 1.5 }}>
                        {cat.temperament.length > 100
                          ? `${cat.temperament.substring(0, 100)}...`
                          : cat.temperament}
                      </p>
                    )}
                    <CardFooter>
                      {cat.is_special_needs && (
                        <Badge $variant="warning">Special Needs</Badge>
                      )}
                      {cat.is_senior && (
                        <Badge $variant="secondary">Senior</Badge>
                      )}
                      {cat.bonded_pair_id && (
                        <Badge $variant="info">Bonded Pair</Badge>
                      )}
                    </CardFooter>
                    <div style={{ marginTop: "1rem" }}>
                      <ButtonLink to={`/cats/${cat.id}`} $variant="primary">
                        Learn More
                      </ButtonLink>
                    </div>
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
            <ButtonLink to="/adoption" $variant="primary" $size="lg">
              How to Adopt
            </ButtonLink>
            <ButtonLink to="/alumni" $variant="outline" $size="lg">
              Success Stories
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
