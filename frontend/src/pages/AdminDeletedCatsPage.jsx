import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Container,
  Section,
  Card,
  CardBody,
  CardTitle,
  Button,
  Alert,
  Badge,
} from '../components/Common/StyledComponents.js';
import LoadingState from '../components/Common/LoadingState.jsx';
import { NoCatsFound } from '../components/Common/EmptyState.jsx';
import ConfirmationModal from '../components/Common/ConfirmationModal.jsx';
import { hardDeleteCat, fetchDeletedCats } from '../api/catsApi.js';
import http from '../api/http.js';
import { useNavigate } from 'react-router-dom';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const CatList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const CatItem = styled(Card)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[6]};
  gap: ${({ theme }) => theme.spacing[4]};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const CatInfo = styled.div`
  flex: 1;
`;

const CatName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing[2]} 0;
`;

const CatMeta = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  align-items: center;
  flex-wrap: wrap;
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const MetaItem = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const DeletedDate = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.error || theme.colors.danger || '#dc2626'};
  font-style: italic;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 100%;
    
    button {
      flex: 1;
    }
  }
`;

export default function AdminDeletedCatsPage() {
  const navigate = useNavigate();
  const [deletedCats, setDeletedCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [restoringId, setRestoringId] = useState(null);
  
  // Hard delete modal state
  const [hardDeleteModal, setHardDeleteModal] = useState({
    isOpen: false,
    cat: null,
    loading: false
  });

  useEffect(() => {
    loadDeletedCats();
  }, []);

  async function loadDeletedCats() {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchDeletedCats();
      setDeletedCats(data.items || []);
    } catch (err) {
      console.error('Failed to fetch deleted cats:', err);
      setError('Failed to load deleted cats. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore(catId, catName) {
    if (!window.confirm(`Are you sure you want to restore "${catName}"?`)) {
      return;
    }

    setRestoringId(catId);
    setError(null);
    setSuccess(null);

    try {
      await http.post(`/cats/${catId}/restore`);
      setSuccess(`"${catName}" has been restored successfully!`);
      
      // Remove from deleted list
      setDeletedCats(prev => prev.filter(cat => cat.id !== catId));
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Failed to restore cat:', err);
      setError(`Failed to restore "${catName}". Please try again.`);
    } finally {
      setRestoringId(null);
    }
  }

  function openHardDeleteModal(cat) {
    setHardDeleteModal({
      isOpen: true,
      cat,
      loading: false
    });
  }

  function closeHardDeleteModal() {
    if (!hardDeleteModal.loading) {
      setHardDeleteModal({
        isOpen: false,
        cat: null,
        loading: false
      });
    }
  }

  async function confirmHardDelete() {
    if (!hardDeleteModal.cat) return;
    
    setHardDeleteModal(prev => ({ ...prev, loading: true }));
    setError(null);
    setSuccess(null);

    try {
      await hardDeleteCat(hardDeleteModal.cat.id);
      setSuccess(`"${hardDeleteModal.cat.name}" has been permanently deleted.`);
      
      // Remove from deleted list
      setDeletedCats(prev => prev.filter(cat => cat.id !== hardDeleteModal.cat.id));
      
      closeHardDeleteModal();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Failed to permanently delete cat:', err);
      setError(`Failed to permanently delete "${hardDeleteModal.cat.name}". Please try again.`);
      setHardDeleteModal(prev => ({ ...prev, loading: false }));
    }
  }

  function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  return (
    <>
      <Section $padding="lg">
        <Container>
          <PageHeader>
            <PageTitle>🗑️ Deleted Cats</PageTitle>
            <Button 
              $variant="outline" 
              onClick={() => navigate('/admin/cats')}
            >
              ← Back to Cats
            </Button>
          </PageHeader>

          {success && (
            <Alert $variant="success" style={{ marginBottom: '2rem' }}>
              ✅ {success}
            </Alert>
          )}

          {error && (
            <Alert $variant="danger" style={{ marginBottom: '2rem' }}>
              ⚠️ {error}
            </Alert>
          )}

          {loading ? (
            <Card>
              <CardBody>
                <LoadingState variant="spinner" message="Loading deleted cats..." />
              </CardBody>
            </Card>
          ) : deletedCats.length === 0 ? (
            <NoCatsFound
              title="No Deleted Cats"
              description="Great! You don't have any deleted cats. All cats are active."
              actions={
                <Button 
                  $variant="primary" 
                  onClick={() => navigate('/admin/cats')}
                >
                  Back to Cats List
                </Button>
              }
            />
          ) : (
            <>
              <CatList>
                {deletedCats.map((cat) => (
                  <CatItem key={cat.id}>
                    <CatInfo>
                      <CatName>
                        {cat.name}
                        {cat.status === 'alumni' && (
                          <Badge $variant="success" style={{ marginLeft: '0.5rem' }}>
                            Alumni
                          </Badge>
                        )}
                        {cat.is_senior && (
                          <Badge $variant="secondary" style={{ marginLeft: '0.5rem' }}>
                            Senior
                          </Badge>
                        )}
                      </CatName>
                      
                      <CatMeta>
                        {cat.age_years !== null && (
                          <MetaItem>
                            🎂 {cat.age_years} {cat.age_years === 1 ? 'year' : 'years'} old
                          </MetaItem>
                        )}
                        {cat.breed && (
                          <MetaItem>🐱 {cat.breed}</MetaItem>
                        )}
                        {cat.sex && (
                          <MetaItem>
                            {cat.sex === 'male' ? '♂️' : cat.sex === 'female' ? '♀️' : '⚧'} {cat.sex}
                          </MetaItem>
                        )}
                      </CatMeta>
                      
                      <DeletedDate>
                        🗑️ Deleted {formatDate(cat.deleted_at)}
                      </DeletedDate>
                    </CatInfo>

                    <ActionButtons>
                      <Button
                        $variant="primary"
                        onClick={() => handleRestore(cat.id, cat.name)}
                        disabled={restoringId === cat.id}
                      >
                        {restoringId === cat.id ? '⏳ Restoring...' : '↩️ Restore'}
                      </Button>
                      <Button
                        $variant="danger"
                        onClick={() => openHardDeleteModal(cat)}
                      >
                        🔥 Delete Forever
                      </Button>
                    </ActionButtons>
                  </CatItem>
                ))}
              </CatList>
            </>
          )}
        </Container>
      </Section>

      {/* Hard Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={hardDeleteModal.isOpen}
        onClose={closeHardDeleteModal}
        onConfirm={confirmHardDelete}
        title="Delete Forever"
        message={hardDeleteModal.cat ? `Are you sure you want to permanently delete "${hardDeleteModal.cat.name}"? This action CANNOT be undone and will remove all data associated with this cat including images and tags.` : ''}
        confirmText="Delete Forever"
        cancelText="Cancel"
        variant="danger"
        icon="⚠️"
        loading={hardDeleteModal.loading}
      />
    </>
  );
}
