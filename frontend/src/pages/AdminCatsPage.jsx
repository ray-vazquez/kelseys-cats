// AdminCatsPage - Enhanced with status filters
import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import {
  Container,
  Button,
  Spinner,
  CenteredSpinner,
  Alert,
  CheckboxLabel,
  Checkbox,
} from "../components/Common/StyledComponents.js";
import { Toast } from "../components/Common/Toast.jsx";
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

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
    gap: ${({ theme }) => theme.spacing[4]};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-wrap: wrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const FilterSection = styled.div`
  background: ${({ theme }) => theme.colors.light};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const FilterLabel = styled.label`
  display: block;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const FilterGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  flex-wrap: wrap;
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
  background-color: ${({ $status, theme }) => {
    switch ($status) {
      case 'available':
        return theme.colors.success;
      case 'adopted':
      case 'alumni':
        return theme.colors.info;
      case 'pending':
        return theme.colors.warning;
      case 'hold':
        return theme.colors.secondary;
      default:
        return theme.colors.light;
    }
  }};
  color: ${({ $status, theme }) => {
    switch ($status) {
      case 'available':
      case 'adopted':
      case 'alumni':
      case 'pending':
        return theme.colors.white;
      default:
        return theme.colors.text.primary;
    }
  }};
`;

const ActionsCell = styled.td`
  white-space: nowrap;

  & > *:not(:last-child) {
    margin-right: ${({ theme }) => theme.spacing.sm};
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.spacing[4]};
  right: ${({ theme }) => theme.spacing[4]};
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    left: ${({ theme }) => theme.spacing[4]};
    right: ${({ theme }) => theme.spacing[4]};
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
  const [toasts, setToasts] = useState([]);
  
  // Status filters
  const [showAvailable, setShowAvailable] = useState(true);
  const [showPending, setShowPending] = useState(true);
  const [showHold, setShowHold] = useState(true);
  const [showAlumni, setShowAlumni] = useState(false);

  const page = Number(searchParams.get("page") || "1");

  useEffect(() => {
    loadCats(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, showAvailable, showPending, showHold, showAlumni]);

  const addToast = (toast) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, {
      id,
      ...toast,
      onClose: () => setToasts(prev => prev.filter(t => t.id !== id))
    }]);
  };

  async function loadCats(currentPage) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(data.limit));
      
      // Build status filter - only add if at least one is selected
      const statuses = [];
      if (showAvailable) statuses.push('available');
      if (showPending) statuses.push('pending');
      if (showHold) statuses.push('hold');
      if (showAlumni) statuses.push('alumni');
      
      // If specific statuses selected, add to query; otherwise fetch all
      if (statuses.length > 0 && statuses.length < 4) {
        params.set("status", statuses.join(','));
      }
      
      const res = await http.get(`/cats?${params.toString()}`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to load cats", err);
      const errorMessage = err.response?.data?.message || "Unable to load cats.";
      setError(errorMessage);
      setData((prev) => ({ ...prev, items: [], total: 0 }));
      
      addToast({
        title: 'Error Loading Cats',
        message: errorMessage,
        variant: 'error',
        duration: 0
      });
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

  async function handleDelete(cat) {
    if (!window.confirm(`Delete ${cat.name}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await http.delete(`/cats/${cat.id}`);
      
      addToast({
        title: 'Cat Deleted',
        message: `${cat.name} has been removed successfully`,
        variant: 'info',
        duration: 5000
      });
      
      loadCats(page);
    } catch (err) {
      console.error("Delete failed", err);
      const errorMessage = err.response?.data?.message || "Failed to delete cat";
      
      addToast({
        title: 'Delete Failed',
        message: errorMessage,
        variant: 'error',
        duration: 0
      });
    }
  }

  async function handleDownloadCsv() {
    try {
      addToast({
        title: 'Downloading...',
        message: 'Preparing CSV export',
        variant: 'info',
        duration: 3000
      });

      const res = await http.get("/cats/export/csv", {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `kelseys-cats-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      addToast({
        title: 'Success!',
        message: 'CSV file downloaded successfully',
        variant: 'success',
        duration: 5000
      });
    } catch (err) {
      console.error("CSV export failed", err);
      const errorMessage = err.response?.data?.message || "Failed to download CSV";
      
      addToast({
        title: 'Export Failed',
        message: errorMessage,
        variant: 'error',
        duration: 0
      });
    }
  }

  function handleImportSuccess() {
    addToast({
      title: 'Import Successful!',
      message: 'Cats have been imported from CSV',
      variant: 'success',
      duration: 5000
    });
    loadCats(page);
  }

  return (
    <>
      <PageWrapper>
        <Container>
          <Header>
            <h1>Manage Cats</h1>
            <ButtonGroup>
              <Button
                as={Link}
                to="/admin/cats/new"
                data-tour="add-cat-button"
              >
                Add New Cat
              </Button>
              <Button
                $variant="outline"
                onClick={() => setShowImportModal(true)}
              >
                Import CSV
              </Button>
              <Button
                $variant="outline"
                onClick={handleDownloadCsv}
                data-tour="csv-buttons"
              >
                Download CSV
              </Button>
            </ButtonGroup>
          </Header>

          {showImportModal && (
            <CsvImportModal
              onClose={() => setShowImportModal(false)}
              onImported={handleImportSuccess}
            />
          )}

          {/* Status Filters */}
          <FilterSection>
            <FilterLabel>Filter by Status:</FilterLabel>
            <FilterGroup>
              <CheckboxLabel>
                <Checkbox
                  checked={showAvailable}
                  onChange={(e) => setShowAvailable(e.target.checked)}
                />
                Show Available
              </CheckboxLabel>
              <CheckboxLabel>
                <Checkbox
                  checked={showPending}
                  onChange={(e) => setShowPending(e.target.checked)}
                />
                Show Pending
              </CheckboxLabel>
              <CheckboxLabel>
                <Checkbox
                  checked={showHold}
                  onChange={(e) => setShowHold(e.target.checked)}
                />
                Show Hold
              </CheckboxLabel>
              <CheckboxLabel>
                <Checkbox
                  checked={showAlumni}
                  onChange={(e) => setShowAlumni(e.target.checked)}
                />
                Show Alumni
              </CheckboxLabel>
            </FilterGroup>
          </FilterSection>

          {error && (
            <Alert $variant="danger" style={{ marginBottom: '1.5rem' }}>
              {error}
            </Alert>
          )}

          {loading && (
            <CenteredSpinner>
              <Spinner aria-label="Loading cats" />
            </CenteredSpinner>
          )}

          {!loading && !error && (
            <>
              {data.items.length === 0 ? (
                <Alert $variant="info">
                  No cats found with the selected filters. Try adjusting your filter settings.
                </Alert>
              ) : (
                <>
                  <p style={{ marginBottom: '1rem', color: '#666' }}>
                    Showing {data.items.length} of {data.total} cats
                  </p>
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
                            <StatusBadge $status={cat.status}>{cat.status}</StatusBadge>
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
                              $variant="outline"
                              $size="sm"
                              to={`/admin/cats/${cat.id}/edit`}
                            >
                              Edit
                            </Button>
                            <Button
                              $variant="danger"
                              $size="sm"
                              onClick={() => handleDelete(cat)}
                            >
                              Delete
                            </Button>
                          </ActionsCell>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}

              {data.total > data.limit && (
                <PaginationControls
                  page={data.page}
                  limit={data.limit}
                  total={data.total}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </Container>
      </PageWrapper>

      {/* Toast Notifications */}
      <ToastContainer>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </ToastContainer>
    </>
  );
}
