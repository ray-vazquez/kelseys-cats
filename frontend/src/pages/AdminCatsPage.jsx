import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Container,
  Button,
  Spinner,
  CenteredSpinner,
  CheckboxLabel,
  Checkbox,
} from "../components/Common/StyledComponents.js";
import { Toast } from "../components/Common/Toast.jsx";
import ConfirmationModal from "../components/Common/ConfirmationModal.jsx";
import http from "../api/http.js";
import PaginationControls from "../components/Common/PaginationControls.jsx";
import CsvImportModal from "../components/Admin/CsvImportModal.jsx";

const PageWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing[5]} 0 ${({ theme }) => theme.spacing[8]};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding-top: ${({ theme }) => theme.spacing[4]};
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};

  h1 {
    margin: 0;
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    align-items: flex-start;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-wrap: wrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 100%;

    & > * {
      flex: 1 1 auto;
    }
  }
`;

const FilterSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  background: ${({ theme }) => theme.colors.neutral[50]};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const FilterControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
`;

const FilterLabel = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const FilterGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
`;

const TableRegion = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.base};
`;

const Table = styled.table`
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;

  th,
  td {
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    text-align: left;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    vertical-align: middle;
  }

  th {
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    color: ${({ theme }) => theme.colors.secondary};
    background-color: ${({ theme }) => theme.colors.neutral[50]};
    white-space: nowrap;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  tbody tr:hover {
    background-color: ${({ theme }) => theme.colors.light};
  }

  td:nth-child(1),
  td:nth-child(4),
  td:nth-child(5) {
    white-space: nowrap;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 2px ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  background-color: ${({ $status, theme }) => {
    switch ($status) {
      case "available": return theme.colors.success;
      case "adopted":
      case "alumni": return theme.colors.info;
      case "pending": return theme.colors.warning;
      case "hold": return "#000000";
      default: return theme.colors.light;
    }
  }};
  color: ${({ $status }) =>
    ["available", "adopted", "alumni", "pending", "hold"].includes($status)
      ? "#ffffff"
      : "#374151"};
`;

const ActionsCell = styled.td`
  width: 1%;
  white-space: nowrap;

  & > *:not(:last-child) {
    margin-right: ${({ theme }) => theme.spacing[2]};
  }
`;

const CountText = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing[2]};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const ToastContainer = styled.div`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing[4]};
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

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[4]};
  color: ${({ theme }) => theme.colors.text.secondary};

  p {
    margin: 0;
  }

  p + p {
    margin-top: ${({ theme }) => theme.spacing[2]};
  }
`;

export default function AdminCatsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, cat: null, loading: false });
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
    const toastId = Date.now().toString();
    setToasts(prev => [...prev, {
      id: toastId,
      ...toast,
      onClose: () => setToasts(prev => prev.filter(t => t.id !== toastId))
    }]);
  };

  async function loadCats(currentPage) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(data.limit));
      const statuses = [];
      if (showAvailable) statuses.push("available");
      if (showPending) statuses.push("pending");
      if (showHold) statuses.push("hold");
      if (showAlumni) statuses.push("alumni");
      if (statuses.length > 0 && statuses.length < 4) params.set("status", statuses.join(","));

      const res = await http.get(`/cats?${params.toString()}`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to load cats", err);
      setData(prev => ({ ...prev, items: [], total: 0 }));
      addToast({
        title: "Error Loading Cats",
        message: err.response?.data?.message || "Unable to load cats.",
        variant: "error",
        duration: 0
      });
    } finally {
      setLoading(false);
    }
  }

  function handlePageChange(nextPage) {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set("page", String(nextPage));
      return p;
    });
  }

  function setStatusFilter(setter) {
    setter(value => !value);
    if (page !== 1) setSearchParams({});
  }

  function openDeleteModal(cat) {
    setDeleteModal({ isOpen: true, cat, loading: false });
  }

  function closeDeleteModal() {
    if (!deleteModal.loading) setDeleteModal({ isOpen: false, cat: null, loading: false });
  }

  async function confirmDelete() {
    if (!deleteModal.cat) return;
    setDeleteModal(prev => ({ ...prev, loading: true }));

    try {
      await http.delete(`/cats/${deleteModal.cat.id}`);
      addToast({
        title: "Cat Moved to Deleted",
        message: `${deleteModal.cat.name} has been moved to Deleted Cats. You can restore it from there.`,
        variant: "info",
        duration: 5000
      });
      setDeleteModal({ isOpen: false, cat: null, loading: false });
      loadCats(page);
    } catch (err) {
      console.error("Delete failed", err);
      setDeleteModal(prev => ({ ...prev, loading: false }));
      addToast({
        title: "Delete Failed",
        message: err.response?.data?.message || "Failed to delete cat",
        variant: "error",
        duration: 0
      });
    }
  }

  async function handleDownloadCsv() {
    try {
      const res = await http.get("/cats/export/csv", { responseType: "blob" });
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `kelseys-cats-export-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      addToast({ title: "CSV Downloaded", message: "Export completed successfully", variant: "success", duration: 4000 });
    } catch (err) {
      addToast({
        title: "Export Failed",
        message: err.response?.data?.message || "Failed to download CSV",
        variant: "error",
        duration: 0
      });
    }
  }

  function handleImportSuccess() {
    addToast({ title: "Import Successful", message: "Cats have been imported from CSV", variant: "success", duration: 5000 });
    loadCats(page);
  }

  return (
    <>
      <PageWrapper>
        <Container $density="compact">
          <Header>
            <h1>Manage Cats</h1>
            <ButtonGroup>
              <Button as={Link} to="/admin/cats/new" $size="sm">Add New Cat</Button>
              <Button $variant="outline" $size="sm" onClick={() => setShowImportModal(true)}>Import CSV</Button>
              <Button $variant="outline" $size="sm" onClick={handleDownloadCsv}>Download CSV</Button>
            </ButtonGroup>
          </Header>

          {showImportModal && (
            <CsvImportModal onClose={() => setShowImportModal(false)} onImported={handleImportSuccess} />
          )}

          <FilterSection aria-label="Cat status filters">
            <FilterControls>
              <FilterLabel>Show status:</FilterLabel>
              <FilterGroup>
                <CheckboxLabel>
                  <Checkbox checked={showAvailable} onChange={() => setStatusFilter(setShowAvailable)} />
                  Available
                </CheckboxLabel>
                <CheckboxLabel>
                  <Checkbox checked={showPending} onChange={() => setStatusFilter(setShowPending)} />
                  Pending
                </CheckboxLabel>
                <CheckboxLabel>
                  <Checkbox checked={showHold} onChange={() => setStatusFilter(setShowHold)} />
                  Hold
                </CheckboxLabel>
                <CheckboxLabel>
                  <Checkbox checked={showAlumni} onChange={() => setStatusFilter(setShowAlumni)} />
                  Alumni
                </CheckboxLabel>
              </FilterGroup>
            </FilterControls>
            <Button $variant="outline" $size="sm" onClick={() => navigate("/admin/cats/deleted")}>
              View Deleted Cats
            </Button>
          </FilterSection>

          {loading ? (
            <CenteredSpinner><Spinner aria-label="Loading cats" /></CenteredSpinner>
          ) : data.items.length === 0 ? (
            <EmptyState>
              <p><strong>No cats found with the selected filters.</strong></p>
              <p>Adjust the status filters to broaden the list.</p>
            </EmptyState>
          ) : (
            <>
              <CountText>Showing {data.items.length} of {data.total} cats</CountText>
              <TableRegion tabIndex="0" aria-label="Cats table, horizontally scrollable on narrow screens">
                <Table>
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
                    {data.items.map(cat => (
                      <tr key={cat.id}>
                        <td>{cat.id}</td>
                        <td><strong>{cat.name}</strong></td>
                        <td><StatusBadge $status={cat.status}>{cat.status}</StatusBadge></td>
                        <td>{cat.featured ? "Yes" : "No"}</td>
                        <td>{cat.updated_at ? new Date(cat.updated_at).toLocaleDateString() : "—"}</td>
                        <ActionsCell>
                          <Button as={Link} $variant="outline" $size="sm" to={`/admin/cats/${cat.id}/edit`}>Edit</Button>
                          <Button $variant="danger" $size="sm" onClick={() => openDeleteModal(cat)}>Delete</Button>
                        </ActionsCell>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableRegion>
              <PaginationControls
                density="compact"
                page={data.page}
                limit={data.limit}
                total={data.total}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </Container>
      </PageWrapper>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Cat"
        message={deleteModal.cat ? `Are you sure you want to delete "${deleteModal.cat.name}"? This moves the cat to Deleted Cats, where it can be restored later.` : ""}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        icon="🗑️"
        loading={deleteModal.loading}
      />

      <ToastContainer>
        {toasts.map(toast => <Toast key={toast.id} {...toast} />)}
      </ToastContainer>
    </>
  );
}
