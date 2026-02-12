// Migrated AlumniPage - Using Phase 1+2 enhanced components
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
  TextMuted,
  FormGroup,
  Label,
  Select,
  Alert,
} from "../components/Common/StyledComponents.js";
import SectionHero from "../components/Common/SectionHero.jsx";
import LoadingState from "../components/Common/LoadingState.jsx";
import EmptyState from "../components/Common/EmptyState.jsx";
import http from "../api/http.js";
import PaginationControls from "../components/Common/PaginationControls.jsx";

const FilterSection = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing[6]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  border: 1px solid ${({ theme }) => theme.colors.border};
  max-width: 400px;
`;

const ResultsCount = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  text-align: center;
`;

const AdoptionDate = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  
  &::before {
    content: '❤️';
  }
`;

const CardFooter = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
`;

export default function AlumniPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({
    items: [],
    total: 0,
    page: 1,
    limit: 12,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const page = Number(searchParams.get("page") || "1");
  const year = searchParams.get("year") || "";

  useEffect(() => {
    loadAlumni(page, year);
  }, [page, year]);

  async function loadAlumni(currentPage, currentYear) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(data.limit));
      if (currentYear) {
        params.set("year", currentYear);
      }

      const res = await http.get(`/alumni?${params.toString()}`);
      const body = res.data;
      const items = Array.isArray(body) ? body : body.items || [];

      setData({
        items,
        total: body.total ?? items.length,
        page: body.page ?? currentPage,
        limit: body.limit ?? data.limit,
      });
    } catch (err) {
      console.error("Failed to load alumni", err);
      setError("Unable to load alumni. Please try again later.");
      setData((prev) => ({ ...prev, items: [], total: 0 }));
    } finally {
      setLoading(false);
    }
  }

  function handlePageChange(nextPage) {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("page", String(nextPage));
      return p;
    });
  }

  function handleYearChange(e) {
    const value = e.target.value;
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (value) {
        p.set("year", value);
        p.set("page", "1");
      } else {
        p.delete("year");
        p.set("page", "1");
      }
      return p;
    });
  }

  return (
    <>
      {/* Hero Section */}
      <SectionHero
        variant="gradient"
        size="md"
        title="Alumni Cats"
        subtitle="A keepsake gallery celebrating all the wonderful cats we've placed in loving forever homes. Each one has found their happy ending."
        actions={
          <ButtonLink to="/cats" $variant="outline" $size="lg">
            Meet Current Cats
          </ButtonLink>
        }
      />

      {/* Main Content */}
      <Section $padding="lg" $bg="light">
        <Container>
          {/* Filter Section */}
          <FilterSection>
            <FormGroup>
              <Label>Filter by Adoption Year</Label>
              <Select value={year} onChange={handleYearChange}>
                <option value="">All years</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </Select>
            </FormGroup>
          </FilterSection>

          {/* Error Alert */}
          {error && (
            <Alert $variant="danger" style={{ marginBottom: '2rem' }}>
              {error}
            </Alert>
          )}

          {/* Results Count */}
          {!loading && !error && data.items.length > 0 && (
            <ResultsCount>
              {data.total} success {data.total !== 1 ? 'stories' : 'story'}
              {year && ` from ${year}`}
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
          ) : !error && data.items.length === 0 ? (
            /* Empty State */
            <EmptyState
              icon="🎉"
              iconSize="lg"
              title={year ? `No adoptions in ${year}` : "No alumni cats yet"}
              description={
                year
                  ? "No cats were adopted in this year. Try selecting a different year or view all alumni."
                  : "We haven't placed any cats yet, but we're working hard to find forever homes for our current fosters!"
              }
              actions={
                year ? (
                  <ButtonLink
                    to="/alumni"
                    $variant="primary"
                    onClick={() => setSearchParams({})}
                  >
                    View All Alumni
                  </ButtonLink>
                ) : (
                  <ButtonLink to="/cats" $variant="primary">
                    Meet Our Current Cats
                  </ButtonLink>
                )
              }
            />
          ) : !error ? (
            /* Alumni Grid */
            <>
              <Grid $cols={3} $mdCols={2}>
                {data.items.map((cat) => {
                  // Check for senior status
                  const isSenior = cat.is_senior || (cat.age_years && cat.age_years >= 10);
                  
                  return (
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
                        
                        <AdoptionDate>
                          Adopted{" "}
                          {cat.adoption_date
                            ? new Date(cat.adoption_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : "date unknown"}
                        </AdoptionDate>
                        
                        {cat.age_years && (
                          <TextMuted>
                            {cat.age_years} years old · {cat.breed || "Mixed breed"}
                          </TextMuted>
                        )}
                        
                        {/* FIXED: Use explicit boolean checks to prevent rendering 0 */}
                        {(!!cat.is_special_needs || !!isSenior || (cat.bonded_pair_id > 0)) && (
                          <CardFooter>
                            {!!cat.is_special_needs && (
                              <Badge $variant="warning">Special Needs</Badge>
                            )}
                            {!!isSenior && (
                              <Badge $variant="secondary">Senior</Badge>
                            )}
                            {cat.bonded_pair_id > 0 && (
                              <Badge $variant="info">Bonded Pair</Badge>
                            )}
                          </CardFooter>
                        )}
                        
                        <div style={{ marginTop: "1rem" }}>
                          <ButtonLink to={`/alumni/${cat.id}`} $variant="primary" $fullWidth>
                            View Story
                          </ButtonLink>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </Grid>

              {/* Pagination */}
              {data.total > data.limit && (
                <div style={{ marginTop: '3rem' }}>
                  <PaginationControls
                    page={data.page}
                    limit={data.limit}
                    total={data.total}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : null}
        </Container>
      </Section>
    </>
  );
}
