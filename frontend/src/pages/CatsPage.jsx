// CatsPage - Unified listing with Featured Foster vs Partner Foster badges
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
    featured_foster_cats: [],
    partner_foster_cats: [],
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [seniorOnly, setSeniorOnly] = useState(false);
  const [showPartnerFosters, setShowPartnerFosters] = useState(true);

  const page = Number(searchParams.get("page") || "1");

  useEffect(() => {
    setLoading(true);
    
    // Fetch all available cats (featured + partner, deduplicated via view)
    http
      .get('/cats/all-available')
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error("Failed to load cats", err);
        setData({ featured_foster_cats: [], partner_foster_cats: [], total: 0 });
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter cats based on filters
  const filteredCats = React.useMemo(() => {
    let allCats = [
      ...data.featured_foster_cats,
      ...(showPartnerFosters ? data.partner_foster_cats : [])
    ];
    
    if (seniorOnly) {
      allCats = allCats.filter(cat => cat.is_senior);
    }
    
    return allCats;
  }, [data, seniorOnly, showPartnerFosters]);

  // Calculate filtered counts for dynamic stats
  const filteredStats = React.useMemo(() => {
    let featuredCats = data.featured_foster_cats || [];
    let partnerCats = showPartnerFosters ? (data.partner_foster_cats || []) : [];
    
    if (seniorOnly) {
      featuredCats = featuredCats.filter(cat => cat.is_senior);
      partnerCats = partnerCats.filter(cat => cat.is_senior);
    }
    
    return {
      featured: featuredCats.length,
      partner: partnerCats.length,
      total: featuredCats.length + partnerCats.length
    };
  }, [data, seniorOnly, showPartnerFosters]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (page !== 1) {
      setSearchParams({ page: "1" });
    }
  }, [seniorOnly, showPartnerFosters]);

  // Pagination
  const perPage = 12;
  const startIdx = (page - 1) * perPage;
  const endIdx = Math.min(startIdx + perPage, filteredCats.length);
  const paginatedCats = filteredCats.slice(startIdx, endIdx);

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
        subtitle="Find your perfect feline companion from cats in our care and other VFV foster homes"
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
          {!loading && filteredStats.total > 0 && (
            <StatsBar>
              <StatItem>
                <span className="stat-value">{filteredStats.featured}</span>
                <span className="stat-label">🏠 Featured Fosters</span>
              </StatItem>
              {showPartnerFosters && (
                <StatItem>
                  <span className="stat-value">{filteredStats.partner}</span>
                  <span className="stat-label">🏘️ At Partner Homes</span>
                </StatItem>
              )}
              <StatItem>
                <span className="stat-value">{filteredStats.total}</span>
                <span className="stat-label">Total {seniorOnly ? 'Senior ' : ''}Available</span>
              </StatItem>
            </StatsBar>
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
                  checked={showPartnerFosters}
                  onChange={(e) => setShowPartnerFosters(e.target.checked)}
                />
                Include cats from VFV partner foster homes
              </CheckboxLabel>
            </div>
          </FilterSection>

          {/* Results Count */}
          {!loading && filteredCats.length > 0 && (
            <ResultsCount>
              Showing {startIdx + 1}-{endIdx} of {filteredCats.length} cat{filteredCats.length !== 1 ? 's' : ''}
              {seniorOnly && ' (senior cats only)'}
              {!showPartnerFosters && ' (featured fosters only)'}
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
                  : !showPartnerFosters
                  ? "Enable partner fosters filter to see more available cats."
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
                  <Card key={`${cat.source}-${cat.id}`} $hover style={{ position: 'relative' }}>
                    {/* Source Badge */}
                    <SourceBadge 
                      $variant={cat.source === 'featured_foster' ? 'success' : 'info'}
                    >
                      {cat.source === 'featured_foster' ? '🏠 Featured Foster' : '🏘️ At Partner Home'}
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
                          : "Age unknown"}{" "}
                        · {cat.breed || "Mixed breed"}
                      </TextMuted>
                      
                      {/* FIXED: Only render CardFooter if there are badges to show */}
                      {(cat.is_special_needs === 1 || cat.is_senior === 1 || cat.bonded_pair_id) && (
                        <CardFooter>
                          {cat.is_special_needs === 1 && (
                            <Badge $variant="warning">Special Needs</Badge>
                          )}
                          {cat.is_senior === 1 && (
                            <Badge $variant="secondary">Senior</Badge>
                          )}
                          {cat.bonded_pair_id && (
                            <Badge $variant="info">Bonded Pair</Badge>
                          )}
                        </CardFooter>
                      )}
                      
                      <div style={{ marginTop: "1rem" }}>
                        {cat.source === 'featured_foster' ? (
                          // Featured foster cats link to your detail page
                          <ButtonLink to={`/cats/${cat.id}`} $variant="primary" $fullWidth>
                            View Details
                          </ButtonLink>
                        ) : (
                          // Partner foster cats link to Adopt-a-Pet
                          <ButtonLink 
                            as="a"
                            href={cat.adoptapet_url} 
                            target="_blank"
                            rel="noopener noreferrer"
                            $variant="primary" 
                            $fullWidth
                          >
                            View on Adopt-a-Pet →
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
