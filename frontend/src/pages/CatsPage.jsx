// CatsPage - Unified listing with comprehensive search and advanced filtering
import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import {
  Container,
  Section,
  Grid,
  Card,
  CardImage,
  CardTitle,
  ButtonLink,
  Badge,
  Checkbox,
  CheckboxLabel,
  TextMuted,
  Input,
  Select,
  Button,
  TextSmall,
  TextMedium,
} from "../components/Common/StyledComponents.js";
import SectionHero from "../components/Common/SectionHero.jsx";
import LoadingState from "../components/Common/LoadingState.jsx";
import { NoCatsFound } from "../components/Common/EmptyState.jsx";
import http from "../api/http.js";
import PaginationControls from "../components/Common/PaginationControls.jsx";

// Fixed wrapper - no margin change
const FilterWrapper = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const FilterSection = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing[6]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;
  z-index: ${({ $isExpanded }) => ($isExpanded ? "100" : "10")};
`;

const FilterTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

// New: search header wrapper with embedded stats line
const SearchHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const SearchStatsLine = styled.div`
  min-height: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SearchBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const SearchInput = styled(Input)`
  flex: 1;
  font-size: ${({ theme }) => theme.fontSizes.base};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

// Overlay that blocks content behind when expanded - like select dropdown behavior
const FilterOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 50;
  opacity: ${({ $isOpen }) => ($isOpen ? "1" : "0")};
  pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
  transition: opacity 0.3s ease-in-out;
  backdrop-filter: blur(2px);
`;

// Advanced filters now use absolute positioning to overlay content
const AdvancedFiltersContainer = styled.div`
  position: ${({ $isOpen }) => ($isOpen ? "absolute" : "relative")};
  top: ${({ $isOpen }) => ($isOpen ? "100%" : "auto")};
  left: ${({ $isOpen }) => ($isOpen ? "0" : "auto")};
  right: ${({ $isOpen }) => ($isOpen ? "0" : "auto")};
  max-height: ${({ $isOpen }) => ($isOpen ? "600px" : "0")};
  opacity: ${({ $isOpen }) => ($isOpen ? "1" : "0")};
  overflow: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};
  transition:
    max-height 0.3s ease-in-out,
    opacity 0.3s ease-in-out;
  background: ${({ theme, $isOpen }) =>
    $isOpen ? theme.colors.white : "transparent"};
  z-index: ${({ $isOpen }) => ($isOpen ? "60" : "1")};

  ${({ $isOpen, theme }) =>
    $isOpen &&
    `
    margin-top: ${theme.spacing[2]};
    padding: ${theme.spacing[6]};
    border-radius: ${theme.borderRadius.lg};
    box-shadow: ${theme.shadows.lg};
    border: 1px solid ${theme.colors.border};
  `}
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const FilterLabel = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const AgeRangeGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  align-items: center;
`;

const AgeInput = styled(Input)`
  width: 80px;
  text-align: center;
`;

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[4]};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const FilterActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing[4]};
  padding-top: ${({ theme }) => theme.spacing[4]};
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const ClearFiltersButton = styled(Button)`
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};

  &:hover {
    background: ${({ theme }) => theme.colors.neutral[50]};
    border-color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const ActiveFiltersBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.base};
`;

const FilterBadge = styled(Badge)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[3]};
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  &::after {
    content: "×";
    font-size: ${({ theme }) => theme.fontSizes.lg};
    margin-left: ${({ theme }) => theme.spacing[1]};
  }
`;

const ResultsCount = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  text-align: center;
`;

const CardBody = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
  display: flex;
  flex-direction: column;
  flex: 1;
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

// Stats bar background now has stable height
const StatsBarContainer = styled.div`
  min-height: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[0]};
`;

const StatsBar = styled.div`
  display: flex;
  justify-content:;
  gap: ${({ theme }) => theme.spacing[8]};
  padding-bottom: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[4]};
  }
`;

const StatItem = styled.div`
  text-align: center;

  .stat-value {
    font-size: ${({ theme }) => theme.fontSizes["3xl"]};
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

const ExpandToggle = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};

  &:hover {
    text-decoration: underline;
  }
`;

export default function CatsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({
    featured_foster_cats: [],
    partner_foster_cats: [],
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    minAge: "",
    maxAge: "",
    sex: "all",
    goodWithKids: false,
    goodWithCats: false,
    goodWithDogs: false,
    isSpecialNeeds: false,
    isSenior: false,
    showPartnerFosters: true,
  });

  const page = Number(searchParams.get("page") || "1");

  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams();

    if (searchQuery.trim()) params.append("search", searchQuery.trim());
    if (filters.minAge) params.append("minAge", filters.minAge);
    if (filters.maxAge) params.append("maxAge", filters.maxAge);
    if (filters.sex !== "all") params.append("sex", filters.sex);
    if (filters.goodWithKids) params.append("goodWithKids", "1");
    if (filters.goodWithCats) params.append("goodWithCats", "1");
    if (filters.goodWithDogs) params.append("goodWithDogs", "1");
    if (filters.isSpecialNeeds) params.append("isSpecialNeeds", "1");
    if (filters.isSenior) params.append("isSenior", "1");

    const queryString = params.toString();
    const url = queryString
      ? `/cats/all-available?${queryString}`
      : "/cats/all-available";

    http
      .get(url)
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error("Failed to load cats", err);
        setData({
          featured_foster_cats: [],
          partner_foster_cats: [],
          total: 0,
        });
      })
      .finally(() => setLoading(false));
  }, [searchQuery, filters]);

  const filteredCats = useMemo(() => {
    return [
      ...data.featured_foster_cats,
      ...(filters.showPartnerFosters ? data.partner_foster_cats : []),
    ];
  }, [data, filters.showPartnerFosters]);

  const filteredStats = useMemo(
    () => ({
      featured: data.featured_foster_cats.length,
      partner: filters.showPartnerFosters ? data.partner_foster_cats.length : 0,
      total: filteredCats.length,
    }),
    [data, filters.showPartnerFosters, filteredCats],
  );

  useEffect(() => {
    if (page !== 1) setSearchParams({ page: "1" });
  }, [searchQuery, filters]);

  const perPage = 12;
  const startIdx = (page - 1) * perPage;
  const endIdx = Math.min(startIdx + perPage, filteredCats.length);
  const paginatedCats = filteredCats.slice(startIdx, endIdx);

  function handlePageChange(nextPage) {
    setSearchParams({ page: String(nextPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilters({
      minAge: "",
      maxAge: "",
      sex: "all",
      goodWithKids: false,
      goodWithCats: false,
      goodWithDogs: false,
      isSpecialNeeds: false,
      isSenior: false,
      showPartnerFosters: true,
    });
  };

  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== "" ||
      filters.minAge !== "" ||
      filters.maxAge !== "" ||
      filters.sex !== "all" ||
      filters.goodWithKids ||
      filters.goodWithCats ||
      filters.goodWithDogs ||
      filters.isSpecialNeeds ||
      filters.isSenior ||
      !filters.showPartnerFosters
    );
  }, [searchQuery, filters]);

  const getActiveFilterLabels = () => {
    const labels = [];
    if (searchQuery.trim())
      labels.push({ key: "search", label: `Search: "${searchQuery}"` });
    if (filters.minAge)
      labels.push({ key: "minAge", label: `Min Age: ${filters.minAge}` });
    if (filters.maxAge)
      labels.push({ key: "maxAge", label: `Max Age: ${filters.maxAge}` });
    if (filters.sex !== "all")
      labels.push({ key: "sex", label: `sex: ${filters.sex}` });
    if (filters.goodWithKids)
      labels.push({ key: "goodWithKids", label: "Good with Kids" });
    if (filters.goodWithCats)
      labels.push({ key: "goodWithCats", label: "Good with Cats" });
    if (filters.goodWithDogs)
      labels.push({ key: "goodWithDogs", label: "Good with Dogs" });
    if (filters.isSpecialNeeds)
      labels.push({ key: "isSpecialNeeds", label: "Special Needs" });
    if (filters.isSenior) labels.push({ key: "isSenior", label: "Senior" });
    if (!filters.showPartnerFosters)
      labels.push({ key: "showPartnerFosters", label: "Featured Only" });
    return labels;
  };

  const removeFilter = (key) => {
    if (key === "search") setSearchQuery("");
    else if (["minAge", "maxAge", "sex"].includes(key)) {
      handleFilterChange(key, key === "sex" ? "all" : "");
    } else handleFilterChange(key, key === "showPartnerFosters");
  };

  const isSearching = searchQuery.trim() !== "" || hasActiveFilters;

  // Shared stats text for search header + background
  let statsText = "";
  if (loading) {
    statsText = "Loading cats...";
  } else if (filteredCats.length === 0 && isSearching) {
    statsText = "No cats match your search.";
  } else if (filteredCats.length === 0) {
    statsText = "No cats are currently available.";
  } else {
    statsText = `Showing ${startIdx + 1}-${endIdx} of ${filteredCats.length} cat${
      filteredCats.length !== 1 ? "s" : ""
    }${hasActiveFilters ? " (filtered)" : ""}`;
  }

  return (
    <>
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

      <Section $padding="sm">
        <Container>
          {/* Background stats area with stable height */}

          {/* Overlay to block content when filters expanded */}
          <FilterOverlay
            $isOpen={showAdvancedFilters}
            onClick={() => setShowAdvancedFilters(false)}
          />

          <FilterWrapper>
            <FilterSection $isExpanded={showAdvancedFilters}>
              <FilterTitle>
                🔍 Search & Filter
                <ExpandToggle
                  type="button"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  {showAdvancedFilters ? "▲ Hide" : "▼ Show"} Advanced Filters
                </ExpandToggle>
              </FilterTitle>
              <StatsBarContainer>
                {!loading && filteredStats.total > 0 && (
                  <StatsBar>
                    <TextMedium>
                      <span className="stat-value">
                        {filteredStats.featured}
                      </span>
                      <span className="stat-label">🏠 Featured Fosters</span>
                    </TextMedium>
                    {filters.showPartnerFosters && (
                      <TextMedium>
                        <span className="stat-value">
                          {filteredStats.partner}
                        </span>
                        <span className="stat-label">🏛️ At Partner Homes</span>
                      </TextMedium>
                    )}
                    <TextMedium>
                      <span className="stat-value">
                        {filteredStats.total}
                        <span>&nbsp;</span>
                      </span>
                      <span className="stat-label">Total Available</span>
                    </TextMedium>
                  </StatsBar>
                )}
              </StatsBarContainer>

              {/* NEW: Compact stats line above the search bar */}
              <SearchHeader>
                <SearchStatsLine>
                  <TextSmall>{statsText}</TextSmall>
                </SearchStatsLine>

                <SearchBar>
                  <SearchInput
                    type="text"
                    placeholder="Search by name, breed, bio, temperament, or medical notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <Button
                      type="button"
                      $variant="outline"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear
                    </Button>
                  )}
                </SearchBar>
              </SearchHeader>

              {/* Advanced filters with overlay behavior */}
              <AdvancedFiltersContainer $isOpen={showAdvancedFilters}>
                <FilterGrid>
                  <FilterGroup>
                    <FilterLabel>Age Range (years)</FilterLabel>
                    <AgeRangeGroup>
                      <AgeInput
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Min"
                        value={filters.minAge}
                        onChange={(e) =>
                          handleFilterChange("minAge", e.target.value)
                        }
                      />
                      <span>to</span>
                      <AgeInput
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Max"
                        value={filters.maxAge}
                        onChange={(e) =>
                          handleFilterChange("maxAge", e.target.value)
                        }
                      />
                    </AgeRangeGroup>
                  </FilterGroup>

                  <FilterGroup>
                    <FilterLabel>sex</FilterLabel>
                    <Select
                      value={filters.sex}
                      onChange={(e) =>
                        handleFilterChange("sex", e.target.value)
                      }
                    >
                      <option value="all">All</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </Select>
                  </FilterGroup>
                </FilterGrid>

                <CheckboxGroup>
                  <CheckboxLabel>
                    <Checkbox
                      checked={filters.goodWithKids}
                      onChange={(e) =>
                        handleFilterChange("goodWithKids", e.target.checked)
                      }
                    />
                    Good with Kids
                  </CheckboxLabel>
                  <CheckboxLabel>
                    <Checkbox
                      checked={filters.goodWithCats}
                      onChange={(e) =>
                        handleFilterChange("goodWithCats", e.target.checked)
                      }
                    />
                    Good with Cats
                  </CheckboxLabel>
                  <CheckboxLabel>
                    <Checkbox
                      checked={filters.goodWithDogs}
                      onChange={(e) =>
                        handleFilterChange("goodWithDogs", e.target.checked)
                      }
                    />
                    Good with Dogs
                  </CheckboxLabel>
                  <CheckboxLabel>
                    <Checkbox
                      checked={filters.isSpecialNeeds}
                      onChange={(e) =>
                        handleFilterChange("isSpecialNeeds", e.target.checked)
                      }
                    />
                    Special Needs
                  </CheckboxLabel>
                  <CheckboxLabel>
                    <Checkbox
                      checked={filters.isSenior}
                      onChange={(e) =>
                        handleFilterChange("isSenior", e.target.checked)
                      }
                    />
                    Senior Cats
                  </CheckboxLabel>
                  <CheckboxLabel>
                    <Checkbox
                      checked={filters.showPartnerFosters}
                      onChange={(e) =>
                        handleFilterChange(
                          "showPartnerFosters",
                          e.target.checked,
                        )
                      }
                    />
                    Include VFV Partner Homes
                  </CheckboxLabel>
                </CheckboxGroup>

                {hasActiveFilters && (
                  <FilterActions>
                    <ClearFiltersButton type="button" onClick={clearFilters}>
                      Clear All Filters
                    </ClearFiltersButton>
                  </FilterActions>
                )}
              </AdvancedFiltersContainer>
            </FilterSection>
          </FilterWrapper>

          {hasActiveFilters && getActiveFilterLabels().length > 0 && (
            <ActiveFiltersBar>
              {getActiveFilterLabels().map((filter) => (
                <FilterBadge
                  key={filter.key}
                  $variant="secondary"
                  onClick={() => removeFilter(filter.key)}
                  title="Click to remove"
                >
                  {filter.label}
                </FilterBadge>
              ))}
            </ActiveFiltersBar>
          )}

          {/* ResultsCount below filters kept for extra clarity when there ARE results */}
          {/* {!loading && filteredCats.length > 0 && (
            <ResultsCount>{statsText}</ResultsCount>
          )} */}

          {loading ? (
            <Grid $cols={3} $mdCols={2}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <LoadingState variant="skeleton" skeletonCount={5} />
                </Card>
              ))}
            </Grid>
          ) : filteredCats.length === 0 ? (
            <NoCatsFound
              description={
                hasActiveFilters
                  ? "No cats match your current filters. Try adjusting your search criteria."
                  : "No cats are currently available. Check back soon for new arrivals!"
              }
              actions={
                hasActiveFilters ? (
                  <Button $variant="primary" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                ) : (
                  <ButtonLink to="/adoption" $variant="primary">
                    Learn About Adoption
                  </ButtonLink>
                )
              }
            />
          ) : (
            <>
              <Grid $cols={3} $mdCols={2}>
                {paginatedCats.map((cat) => (
                  <Card
                    key={`${cat.source}-${cat.id}`}
                    $flexColumn
                    $hover
                    style={{ position: "relative" }}
                  >
                    <SourceBadge
                      $variant={
                        cat.source === "featured_foster" ? "success" : "info"
                      }
                    >
                      {cat.source === "featured_foster"
                        ? "🏠 Featured Foster"
                        : "🏛️ At Partner Home"}
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
                          ? `${Math.floor(cat.age_years)} year${
                              Math.floor(cat.age_years) !== 1 ? "s" : ""
                            } old`
                          : cat.age || "Age unknown"}{" "}
                        · {cat.breed || "Mixed breed"}
                      </TextMuted>
                      {(cat.is_special_needs === 1 ||
                        cat.is_senior === 1 ||
                        cat.bonded_pair_id) && (
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
                      <div style={{ flex: 1 }} />
                      <div style={{ marginTop: "1rem" }}>
                        {cat.source === "featured_foster" ? (
                          <ButtonLink
                            to={`/cats/${cat.id}`}
                            $variant="primary"
                            $fullWidth
                          >
                            View Details
                          </ButtonLink>
                        ) : (
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
              {filteredCats.length > perPage && (
                <div style={{ marginTop: "3rem" }}>
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
