// Migrated CatsPage - Using Phase 1+2 enhanced components with is_senior badge
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
  Checkbox,
  CheckboxLabel,
  TextMuted,
} from "../components/Common/StyledComponents.js";
import SectionHero from "../components/Common/SectionHero.jsx";
import LoadingState from "../components/Common/LoadingState.jsx";
import { NoCatsFound } from "../components/Common/EmptyState.jsx";
import http from "../api/http.js";
import PaginationControls from "../components/Common/PaginationControls.jsx";

const FilterSection = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing[6]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const FilterTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ResultsCount = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  text-align: center;
`;

const CardFooter = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[4]};
  flex-wrap: wrap;
`;

export default function CatsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({
    items: [],
    total: 0,
    page: 1,
    limit: 12,
  });
  const [loading, setLoading] = useState(true);
  const [seniorOnly, setSeniorOnly] = useState(false);

  const page = Number(searchParams.get("page") || "1");

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("status", "available");
    params.set("page", String(page));
    params.set("limit", String(data.limit));
    if (seniorOnly) params.set("senior", "true");

    setLoading(true);
    http
      .get(`/cats?${params.toString()}`)
      .then((res) => {
        const body = res.data;
        const items = Array.isArray(body) ? body : body.items || [];
        setData({
          items,
          total: body.total ?? items.length,
          page: body.page ?? page,
          limit: body.limit ?? data.limit,
        });
      })
      .catch((err) => {
        console.error("Failed to load cats", err);
        setData((prev) => ({ ...prev, items: [], total: 0 }));
      })
      .finally(() => setLoading(false));
  }, [page, seniorOnly]);

  function handlePageChange(nextPage) {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("page", String(nextPage));
      return p;
    });
  }

  return (
    <>
      {/* Hero Section - Updated to gradient variant */}
      <SectionHero
        variant="gradient"
        size="md"
        title="Current Foster Cats"
        subtitle="Meet our wonderful cats looking for their forever homes. Each one has a unique personality and story."
        actions={
          <ButtonLink to="/adoption" $variant="outline" $size="lg">
            How to Adopt
          </ButtonLink>
        }
      />

      {/* Main Content */}
      <Section $padding="lg">
        <Container>
          {/* Filter Section */}
          <FilterSection>
            <FilterTitle>Filter Options</FilterTitle>
            <CheckboxLabel>
              <Checkbox
                checked={seniorOnly}
                onChange={(e) => setSeniorOnly(e.target.checked)}
              />
              Show senior cats only
            </CheckboxLabel>
          </FilterSection>

          {/* Results Count */}
          {!loading && data.items.length > 0 && (
            <ResultsCount>
              Showing {data.items.length} of {data.total} cat{data.total !== 1 ? 's' : ''}
              {seniorOnly && ' (senior cats only)'}
            </ResultsCount>
          )}

          {/* Loading State */}
          {loading ? (
            <Grid $cols={3} $mdCols={2}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <LoadingState variant="skeleton" skeletonCount={5} />
                </Card>
              ))}
            </Grid>
          ) : data.items.length === 0 ? (
            /* Empty State */
            <NoCatsFound
              description={
                seniorOnly
                  ? "No senior cats are currently available. Try clearing the filter to see all cats."
                  : "No cats are currently available. Check back soon for new arrivals!"
              }
              actions={
                seniorOnly ? (
                  <ButtonLink
                    to="/cats"
                    $variant="primary"
                    onClick={() => setSeniorOnly(false)}
                  >
                    Show All Cats
                  </ButtonLink>
                ) : (
                  <ButtonLink to="/adoption" $variant="primary">
                    Learn About Adoption
                  </ButtonLink>
                )
              }
            />
          ) : (
            /* Cats Grid */
            <>
              <Grid $cols={3} $mdCols={2}>
                {data.items.map((cat) => (
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
                        <ButtonLink to={`/cats/${cat.id}`} $variant="primary" $fullWidth>
                          View Details
                        </ButtonLink>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </Grid>

              {/* Pagination */}
              <div style={{ marginTop: '3rem' }}>
                <PaginationControls
                  page={data.page}
                  limit={data.limit}
                  total={data.total}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </Container>
      </Section>
    </>
  );
}
