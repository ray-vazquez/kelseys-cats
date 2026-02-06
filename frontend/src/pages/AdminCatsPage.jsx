// frontend/src/pages/AdminCatsPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import {
  Container,
  Button,
  Spinner,
  CenteredSpinner,
} from "../components/Common/StyledComponents.js";
import http from "../api/http.js";
import PaginationControls from "../components/Common/PaginationControls.jsx";
import CsvImportModal from "../components/Admin/CsvImportModal.jsx";


const PageWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing["3xl"]} 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  th,
  td {
    padding: ${({ theme }) => theme.spacing.sm};
    border-bottom: 1px solid ${({ theme }) => theme.colors.light};
    text-align: left;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  th {
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    color: ${({ theme }) => theme.colors.secondary};
  }

  tbody tr:hover {
    background-color: ${({ theme }) => theme.colors.light};
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background-color: ${({ theme }) => theme.colors.light};
  color: ${({ theme }) => theme.colors.secondary};
`;

const ActionsCell = styled.td`
  white-space: nowrap;

  & > *:not(:last-child) {
    margin-right: ${({ theme }) => theme.spacing.sm};
  }
`;

export default function AdminCatsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({
    items: [],
    total: 0,
    page: 1,
    limit: 20,
  });
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);

  const [error, setError] = useState(null);

  const page = Number(searchParams.get("page") || "1");

  useEffect(() => {
    loadCats(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function loadCats(currentPage) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(data.limit));
      // admin view: no status filter, show all non-deleted
      const res = await http.get(`/cats?${params.toString()}`);
      // res.data is { items, total, page, limit }
      setData(res.data);
    } catch (err) {
      console.error("Failed to load cats", err);
      setError("Unable to load cats.");
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

  async function handleDelete(id) {
    if (!window.confirm("Delete this cat? This will soft-delete the record.")) {
      return;
    }
    try {
      await http.delete(`/cats/${id}`);
      loadCats(page);
    } catch (err) {
      console.error("Delete failed", err);
      window.alert("Delete failed.");
    }
  }

  async function handleDownloadCsv() {
    try {
      const res = await http.get("/cats/export/csv", {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "kelseys-cats-export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export failed", err);
      window.alert("Failed to download CSV.");
    }
  }


  return (
    <PageWrapper>
      <Container>
        <Header>
          <h1>Manage Cats</h1>
          <div>
            <Button
              as={Link}
              to="/admin/cats/new"
              style={{ marginRight: "0.5rem" }}
              data-tour="add-cat-button"
            >
              Add New Cat
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowImportModal(true)}
              style={{ marginRight: "0.5rem" }}
            >
              Import from CSV
            </Button>
            <Button
              variant="secondary"
              onClick={handleDownloadCsv}
              data-tour="csv-buttons"
            >
              Download CSV
            </Button>
          </div>
        </Header>

        {showImportModal && (
          <CsvImportModal
            onClose={() => setShowImportModal(false)}
            onImported={() => loadCats(page)}
          />
        )}

        {loading && (
          <CenteredSpinner>
            <Spinner aria-label="Loading cats" />
          </CenteredSpinner>
        )}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <>
            {data.items.length === 0 ? (
              <p>No cats found.</p>
            ) : (
              <Table data-tour="cats-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Featured</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((cat) => (
                    <tr key={cat.id}>
                      <td>{cat.id}</td>
                      <td>{cat.name}</td>
                      <td>
                        <StatusBadge>{cat.status}</StatusBadge>
                      </td>
                      <td>{cat.featured ? "Yes" : "No"}</td>
                      <td>
                        {cat.updated_at
                          ? new Date(cat.updated_at).toLocaleDateString()
                          : ""}
                      </td>
                      <ActionsCell>
                        <Button
                          as={Link}
                          variant="secondary"
                          size="sm"
                          to={`/admin/cats/${cat.id}/edit`}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(cat.id)}
                        >
                          Delete
                        </Button>
                      </ActionsCell>
                    </tr>
                  ))}
                </tbody>
              </Table>
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
