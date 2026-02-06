// frontend/src/pages/CatDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import styled from "styled-components";
import {
  Container,
  Button,
  Badge,
  Skeleton,

} from "../components/Common/StyledComponents.js";
import http from "../api/http.js";

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing["2xl"]};
  padding: ${({ theme }) => theme.spacing["3xl"]} 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const ImageWrapper = styled.div`
  img {
    width: 100%;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    object-fit: cover;
  }
`;

const DetailContent = styled.div`
  h1 {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

const TextMuted = styled.p`
  color: ${({ theme }) => theme.colors.gray};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  h5 {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.secondary};
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    padding: ${({ theme }) => theme.spacing.xs} 0;
  }
`;

export default function CatDetailPage() {
  const { id } = useParams();
  const [cat, setCat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    http
      .get(`/cats/${id}`)
      .then((res) => setCat(res.data))
      .catch((err) => {
        console.error("Failed to load cat", err);
        setCat(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Container
        aria-busy="true"
        aria-live="polite"
        style={{ padding: "3rem 0" }}
      >
        <DetailGrid>
          <ImageWrapper>
            <Skeleton style={{ width: "100%", height: 320 }} />
          </ImageWrapper>
          <DetailContent>
            <Skeleton style={{ height: 28, width: "40%", marginBottom: 12 }} />
            <Skeleton style={{ height: 16, width: "60%", marginBottom: 24 }} />
            <Skeleton style={{ height: 16, width: "80%", marginBottom: 12 }} />
            <Skeleton style={{ height: 16, width: "70%", marginBottom: 12 }} />
            <Skeleton style={{ height: 40, width: 180, marginTop: 16 }} />
          </DetailContent>
        </DetailGrid>
      </Container>
    );
  }

  if (!cat) {
    return (
      <Container style={{ padding: "3rem 0" }}>
        <p>Cat not found.</p>
      </Container>
    );
  }

  return (
    <Container>
      <DetailGrid>
        <ImageWrapper>
          {cat.main_image_url && (
            <img src={cat.main_image_url} alt={cat.name} />
          )}
        </ImageWrapper>

        <DetailContent>
          <h1>{cat.name}</h1>
          <TextMuted>
            {cat.age_years ? `${cat.age_years} years old` : "Age unknown"} ·{" "}
            {cat.sex} · {cat.breed || "Mixed breed"}
          </TextMuted>

          {cat.is_special_needs && (
            <Badge variant="warning">Special Needs</Badge>
          )}

          <Section>
            <h5>Temperament</h5>
            <p>{cat.temperament || "Not specified"}</p>
          </Section>

          <Section>
            <h5>Good With</h5>
            <ul>
              <li>Kids: {cat.good_with_kids ? "Yes" : "No"}</li>
              <li>Cats: {cat.good_with_cats ? "Yes" : "No"}</li>
              <li>Dogs: {cat.good_with_dogs ? "Yes" : "No"}</li>
            </ul>
          </Section>

          {cat.medical_notes && (
            <Section>
              <h5>Medical Notes</h5>
              <p>{cat.medical_notes}</p>
            </Section>
          )}

          <Button as={Link} to="/adoption" size="lg">
            Adoption Information
          </Button>
        </DetailContent>
      </DetailGrid>
    </Container>
  );
}
