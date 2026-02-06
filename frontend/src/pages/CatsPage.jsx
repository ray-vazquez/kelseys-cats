// frontend/src/pages/CatsPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  Checkbox,
  CheckboxLabel,
} from "../components/Common/StyledComponents.js";
import http from "../api/http.js";
import PaginationControls from "../components/Common/PaginationControls.jsx";
import {
  Spinner,
  CenteredSpinner,
} from "../components/Common/StyledComponents.js";

const PageTitle = styled.h1`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FilterSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const TextMuted = styled.p`
  color: ${({ theme }) => theme.colors.gray};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
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
    <Container style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
      <PageTitle>Current Foster Cats</PageTitle>

      <FilterSection>
        <CheckboxLabel>
          <Checkbox
            checked={seniorOnly}
            onChange={(e) => setSeniorOnly(e.target.checked)}
          />
          Show senior cats only (10+ years)
        </CheckboxLabel>
      </FilterSection>

      {loading ? (
        <CenteredSpinner>
          <Spinner aria-label="Loading cats" />
        </CenteredSpinner>
      ) : data.items.length === 0 ? (
        <p>No cats found.</p>
      ) : (
        <>
          <Grid cols={3} mdCols={2}>
            {data.items.map((cat) => (
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
                      View Details
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </Grid>

          <PaginationControls
            page={data.page}
            limit={data.limit}
            total={data.total}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </Container>
  );
}
