// Fixed AdminCatEditPage - Now with proper error handling and Toast notifications
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Container, Card, CardBody, FormGroup, Label, Input, Textarea, Select, Button, CheckboxLabel, Checkbox, Alert } from '../components/Common/StyledComponents.js';
import { Toast } from '../components/Common/Toast.jsx';
import http from '../api/http.js';

const PageWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing['3xl']} 0;
`;

const FormCard = styled(Card)`
  max-width: 800px;
  margin: 0 auto;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
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

export default function AdminCatEditPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age_years: '',
    sex: 'unknown',
    breed: '',
    temperament: '',
    good_with_kids: false,
    good_with_cats: false,
    good_with_dogs: false,
    medical_notes: '',
    is_special_needs: false,
    status: 'available',
    main_image_url: '',
    featured: false
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(mode === 'edit');
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (mode === 'edit' && id) {
      setLoadingData(true);
      http.get(`/cats/${id}`)
        .then((res) => {
          setFormData(res.data);
          setLoadingData(false);
        })
        .catch((err) => {
          console.error('Failed to load cat data:', err);
          setError('Failed to load cat data. Please try again.');
          setLoadingData(false);
          addToast({
            title: 'Error',
            message: 'Failed to load cat data',
            variant: 'error',
            duration: 0
          });
        });
    }
  }, [mode, id]);

  const addToast = (toast) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, {
      id,
      ...toast,
      onClose: () => setToasts(prev => prev.filter(t => t.id !== id))
    }]);
  };

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user makes changes
    if (error) setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'create') {
        await http.post('/cats', formData);
        addToast({
          title: 'Success!',
          message: `${formData.name} has been added successfully`,
          variant: 'success',
          duration: 5000
        });
      } else {
        await http.put(`/cats/${id}`, formData);
        addToast({
          title: 'Success!',
          message: `${formData.name} has been updated successfully`,
          variant: 'success',
          duration: 5000
        });
      }
      
      // Navigate after a short delay to allow user to see the toast
      setTimeout(() => {
        navigate('/admin/cats');
      }, 1000);
    } catch (err) {
      console.error('Failed to save cat:', err);
      
      // Extract error message from response
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'An unexpected error occurred';
      
      setError(errorMessage);
      setLoading(false);
      
      addToast({
        title: mode === 'create' ? 'Failed to Add Cat' : 'Failed to Update Cat',
        message: errorMessage,
        variant: 'error',
        duration: 0 // Keep visible until manually closed
      });
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Are you sure you want to delete ${formData.name}? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      await http.delete(`/cats/${id}`);
      addToast({
        title: 'Deleted',
        message: `${formData.name} has been removed`,
        variant: 'info',
        duration: 5000
      });
      
      setTimeout(() => {
        navigate('/admin/cats');
      }, 1000);
    } catch (err) {
      console.error('Failed to delete cat:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to delete cat';
      
      setError(errorMessage);
      setLoading(false);
      
      addToast({
        title: 'Delete Failed',
        message: errorMessage,
        variant: 'error',
        duration: 0
      });
    }
  }

  if (loadingData) {
    return (
      <PageWrapper>
        <Container>
          <FormCard>
            <CardBody>
              <p>Loading cat data...</p>
            </CardBody>
          </FormCard>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <>
      <PageWrapper>
        <Container>
          <FormCard>
            <CardBody>
              <h2 style={{ marginBottom: '2rem' }}>{mode === 'create' ? 'Add New Cat' : 'Edit Cat'}</h2>
              
              {error && (
                <Alert $variant="danger" style={{ marginBottom: '1.5rem' }}>
                  <strong>Error:</strong> {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Name *</Label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Age (years)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    name="age_years"
                    value={formData.age_years}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Sex</Label>
                  <Select name="sex" value={formData.sex} onChange={handleChange} disabled={loading}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unknown">Unknown</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Breed</Label>
                  <Input
                    type="text"
                    name="breed"
                    value={formData.breed}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Temperament</Label>
                  <Textarea
                    rows={3}
                    name="temperament"
                    value={formData.temperament}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Medical Notes</Label>
                  <Textarea
                    rows={3}
                    name="medical_notes"
                    value={formData.medical_notes}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Main Image URL</Label>
                  <Input
                    type="text"
                    name="main_image_url"
                    value={formData.main_image_url}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Status</Label>
                  <Select name="status" value={formData.status} onChange={handleChange} disabled={loading}>
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="hold">Hold</option>
                    <option value="adopted">Adopted</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <CheckboxLabel>
                    <Checkbox
                      name="good_with_kids"
                      checked={formData.good_with_kids}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    Good with Kids
                  </CheckboxLabel>

                  <CheckboxLabel>
                    <Checkbox
                      name="good_with_cats"
                      checked={formData.good_with_cats}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    Good with Cats
                  </CheckboxLabel>

                  <CheckboxLabel>
                    <Checkbox
                      name="good_with_dogs"
                      checked={formData.good_with_dogs}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    Good with Dogs
                  </CheckboxLabel>

                  <CheckboxLabel>
                    <Checkbox
                      name="is_special_needs"
                      checked={formData.is_special_needs}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    Special Needs
                  </CheckboxLabel>

                  <CheckboxLabel>
                    <Checkbox
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    Featured
                  </CheckboxLabel>
                </FormGroup>

                <ButtonGroup>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : (mode === 'create' ? 'Create Cat' : 'Save Changes')}
                  </Button>
                  <Button type="button" $variant="outline" onClick={() => navigate('/admin/cats')} disabled={loading}>
                    Cancel
                  </Button>
                  {mode === 'edit' && (
                    <Button type="button" $variant="danger" onClick={handleDelete} disabled={loading}>
                      {loading ? 'Deleting...' : 'Delete'}
                    </Button>
                  )}
                </ButtonGroup>
              </form>
            </CardBody>
          </FormCard>
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
