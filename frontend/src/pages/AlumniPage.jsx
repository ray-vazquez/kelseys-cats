// frontend/src/pages/AlumniPage.jsx
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
} from "../components/Common/StyledComponents.js";
import http from "../api/http.js";
import PaginationControls from "../components/Common/PaginationControls.jsx";
import { Spinner, CenteredSpinner } from "../components/Common/StyledComponents.js";

const PageWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing["3xl"]} 0;
`;

const PageTitle = styled.h1`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const TextMuted = styled.p`
  color: ${({ theme }) => theme.colors.gray};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
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
      setError("Unable to load alumni.");
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
      }
      return p;
    });
  }

  return (
    <PageWrapper>
      <Container>
        <PageTitle>Alumni Cats</PageTitle>
        <TextMuted>
          A keepsake gallery of all the cats Kelsey&apos;s Cats has placed in
          loving homes.
        </TextMuted>

        <div style={{ marginBottom: "1.5rem" }}>
          <label>
            Filter by adoption year:{" "}
            <select value={year} onChange={handleYearChange}>
              <option value="">All years</option>
              {/* You can hardcode a small range for now; later this can be dynamic */}
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </label>
        </div>

        {loading && (
          <CenteredSpinner>
            <Spinner aria-label="Loading cats" />
          </CenteredSpinner>
        )}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <>
            {data.items.length === 0 ? (
              <p>No alumni cats found yet.</p>
            ) : (
              <Grid cols={3} mdCols={2}>
                {data.items.map((cat) => (
                  <Card key={cat.id}>
                    {cat.main_image_url && (
                      <CardImage src={cat.main_image_url} alt={cat.name} />
                    )}
                    <CardBody>
                      <CardTitle>{cat.name}</CardTitle>
                      <TextMuted>
                        Adopted{" "}
                        {cat.adoption_date
                          ? new Date(cat.adoption_date).toLocaleDateString()
                          : "date unknown"}
                      </TextMuted>
                      {cat.is_special_needs && (
                        <Badge variant="warning">Special Needs</Badge>
                      )}
                      <div style={{ marginTop: "1rem" }}>
                        <Button as={Link} to={`/alumni/${cat.id}`}>
                          View Story
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            )}

            <PaginationControls
              page={data.page}
              limit={data.limit}
              total={data.total}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </Container>
    </PageWrapper>
  );
}
