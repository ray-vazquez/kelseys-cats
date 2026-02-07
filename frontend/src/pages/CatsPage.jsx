// Migrated CatsPage - Using Petfinder API for unified cat display
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
  Alert,
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

const SourceBadge = styled(Badge)`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 10;
`;

const StatsBar = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[8]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  padding: ${({ theme }) => theme.spacing[6]};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

const StatItem = styled.div`
  text-align: center;
  
  .stat-value {
    font-size: ${({ theme }) => theme.fontSizes['3xl']};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    color: ${({ theme }) => theme.colors.primary.main};
    display: block;
  }
  
  .stat-label {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-top: ${({ theme }) => theme.spacing[2]};
  }
`;

export default function CatsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({
    foster_cats: [],
    shelter_cats: [],
    total: 0,
    duplicates_removed: 0
  });
  const [loading, setLoading] = useState(true);
  const [seniorOnly, setSeniorOnly] = useState(false);
  const [showShelterCats, setShowShelterCats] = useState(true);

  const page = Number(searchParams.get("page") || "1");

  useEffect(() => {
    setLoading(true);
    
    // Fetch all available cats (foster + shelter, deduplicated)
    http
      .get('/cats/all-available')
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error("Failed to load cats", err);
        setData({ foster_cats: [], shelter_cats: [], total: 0, duplicates_removed: 0 });
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter cats based on filters
  const filteredCats = React.useMemo(() => {
    let allCats = [
      ...data.foster_cats,
      ...(showShelterCats ? data.shelter_cats : [])
    ];
    
    if (seniorOnly) {
      allCats = allCats.filter(cat => 
        cat.is_senior || 
        (cat.petfinder_data?.age_text === 'Senior')
      );
    }
    
    return allCats;
  }, [data, seniorOnly, showShelterCats]);

  // Pagination
  const perPage = 12;
  const startIdx = (page - 1) * perPage;
  const paginatedCats = filteredCats.slice(startIdx, startIdx + perPage);

  function handlePageChange(nextPage) {
    setSearchParams({ page: String(nextPage) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      {/* Hero Section */}
      <SectionHero
        variant="gradient"
        size="md"
        title="Adoptable Cats"
        subtitle="Find your perfect feline companion from our foster home and Voice for the Voiceless"
        actions={
          <ButtonLink to="/adoption" $variant="outline" $size="lg">
            How to Adopt
          </ButtonLink>
        }
      />

      {/* Main Content */}
      <Section $padding="lg">
        <Container>
          {/* Stats Bar */}
          {!loading && data.total > 0 && (
            <StatsBar>
              <StatItem>
                <span className="stat-value">{data.foster_cats.length}</span>
                <span className="stat-label">🏠 Our Foster Cats</span>
              </StatItem>
              <StatItem>
                <span className="stat-value">{data.shelter_cats.length}</span>
                <span className="stat-label">🐾 Voice Shelter Cats</span>
              </StatItem>
              <StatItem>
                <span className="stat-value">{data.total}</span>
                <span className="stat-label">Total Available</span>
              </StatItem>
            </StatsBar>
          )}

          {/* Info Alert */}
          {!loading && data.duplicates_removed > 0 && (
            <Alert $variant="info" style={{ marginBottom: '2rem' }}>
              <strong>Smart Deduplication:</strong> We automatically removed {data.duplicates_removed} duplicate{data.duplicates_removed !== 1 ? 's' : ''} 
              {' '}to show you a clean list of all available cats.
            </Alert>
          )}

          {/* Filter Section */}
          <FilterSection>
            <FilterTitle>Filter Options</FilterTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <CheckboxLabel>
                <Checkbox
                  checked={seniorOnly}
                  onChange={(e) => setSeniorOnly(e.target.checked)}
                />
                Show senior cats only
              </CheckboxLabel>
              <CheckboxLabel>
                <Checkbox
                  checked={showShelterCats}
                  onChange={(e) => setShowShelterCats(e.target.checked)}
                />
                Include cats from Voice for the Voiceless shelter
              </CheckboxLabel>
            </div>
          </FilterSection>

          {/* Results Count */}
          {!loading && filteredCats.length > 0 && (
            <ResultsCount>
              Showing {paginatedCats.length} of {filteredCats.length} cat{filteredCats.length !== 1 ? 's' : ''}
              {seniorOnly && ' (senior cats only)'}
              {!showShelterCats && ' (foster cats only)'}
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
          ) : filteredCats.length === 0 ? (
            /* Empty State */
            <NoCatsFound
              description={
                seniorOnly
                  ? "No senior cats are currently available. Try clearing the filter to see all cats."
                  : !showShelterCats
                  ? "Enable shelter cats filter to see more available cats."
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
            /* Unified Cats Grid */
            <>
              <Grid $cols={3} $mdCols={2}>
                {paginatedCats.map((cat) => (
                  <Card key={`${cat.source}-${cat.id || cat.petfinder_id}`} $hover style={{ position: 'relative' }}>
                    {/* Source Badge */}
                    <SourceBadge 
                      $variant={cat.source === 'foster' ? 'success' : 'info'}
                    >
                      {cat.source === 'foster' ? '🏠 Our Foster' : '🐾 Voice Shelter'}
                    </SourceBadge>

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
                          : cat.petfinder_data?.age_text || "Age unknown"}{" "}
                        · {cat.breed || "Mixed breed"}
                      </TextMuted>
                      
                      <CardFooter>
                        {cat.is_special_needs && (
                          <Badge $variant="warning">Special Needs</Badge>
                        )}
                        {(cat.is_senior || cat.petfinder_data?.age_text === 'Senior') && (
                          <Badge $variant="secondary">Senior</Badge>
                        )}
                        {cat.bonded_pair_id && (
                          <Badge $variant="info">Bonded Pair</Badge>
                        )}
                      </CardFooter>
                      
                      <div style={{ marginTop: "1rem" }}>
                        {cat.source === 'foster' ? (
                          // Foster cats link to your detail page
                          <ButtonLink to={`/cats/${cat.id}`} $variant="primary" $fullWidth>
                            View Details
                          </ButtonLink>
                        ) : (
                          // Shelter cats link to Petfinder
                          <ButtonLink 
                            as="a"
                            href={cat.adoptapet_url} 
                            target="_blank"
                            rel="noopener noreferrer"
                            $variant="primary" 
                            $fullWidth
                          >
                            View on Petfinder →
                          </ButtonLink>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </Grid>

              {/* Pagination */}
              {filteredCats.length > perPage && (
                <div style={{ marginTop: '3rem' }}>
                  <PaginationControls
                    page={page}
                    limit={perPage}
                    total={filteredCats.length}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </Container>
      </Section>
    </>
  );
}
