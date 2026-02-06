// frontend/src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import {
  Container,
  Grid,
  Card,
  CardImage,
  CardBody,
  CardTitle,
  Button,
  Badge,
  Skeleton
} from "../components/Common/StyledComponents.js";
import http from "../api/http.js";

const Masthead = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing["4xl"]} 0;
  text-align: center;
`;

const MastheadTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["5xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes["4xl"]};
  }
`;

const MastheadLead = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.light};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Section = styled.section`
  padding: ${({ theme }) => theme.spacing["3xl"]} 0;
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing["2xl"]};
  color: ${({ theme }) => theme.colors.secondary};
`;

const TextMuted = styled.p`
  color: ${({ theme }) => theme.colors.gray};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export default function HomePage() {
  const [featuredCats, setFeaturedCats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("status", "available");
    params.set("page", "1");
    params.set("limit", "6");
    // we’ll filter featured client-side for now

    setLoading(true);
    http
      .get(`/cats?${params.toString()}`)
      .then((res) => {
        const body = res.data;
        const items = Array.isArray(body) ? body : body.items || [];
        // filter to featured
        const featuredOnly = items.filter((cat) => cat.featured);
        setFeaturedCats(featuredOnly);
      })
      .catch((err) => {
        console.error("Failed to load featured cats", err);
        setFeaturedCats([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Masthead>
        <Container>
          <MastheadTitle>Welcome to Kelsey&apos;s Cats</MastheadTitle>
          <MastheadLead>Finding loving homes for cats in need</MastheadLead>
          <Button as={Link} to="/cats" variant="outline" size="lg">
            Meet Our Cats
          </Button>
        </Container>
      </Masthead>

      <Section aria-busy={loading} aria-live="polite">
        <Container>
          <SectionTitle>Featured Cats</SectionTitle>

          {loading ? (
            <Grid cols={3} mdCols={2}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <Skeleton style={{ height: 200 }} />
                  <CardBody>
                    <Skeleton
                      style={{ height: 20, width: "60%", marginBottom: 8 }}
                    />
                    <Skeleton
                      style={{ height: 14, width: "80%", marginBottom: 4 }}
                    />
                    <Skeleton style={{ height: 14, width: "40%" }} />
                  </CardBody>
                </Card>
              ))}
            </Grid>
          ) : featuredCats.length === 0 ? (
            <TextMuted>
              No featured cats at the moment. Check back soon!
            </TextMuted>
          ) : (
            <Grid cols={3} mdCols={2}>
              {featuredCats.map((cat) => (
                <Card key={cat.id}>
                  {cat.main_image_url && (
                    <CardImage src={cat.main_image_url} alt={cat.name} />
                  )}
                  <CardBody>
                    <CardTitle>{cat.name}</CardTitle>
                    <TextMuted>
                      {cat.age_years
                        ? `${cat.age_years} years old`
                        : "Age unknown"}{" "}
                      · {cat.breed || "Mixed breed"}
                    </TextMuted>
                    {cat.is_special_needs && (
                      <Badge variant="warning">Special Needs</Badge>
                    )}
                    <div style={{ marginTop: "1rem" }}>
                      <Button as={Link} to={`/cats/${cat.id}`}>
                        Learn More
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </Grid>
          )}
        </Container>
      </Section>
    </>
  );
}
