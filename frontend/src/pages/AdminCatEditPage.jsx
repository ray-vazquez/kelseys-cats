// Fixed AdminCatEditPage - Now with status validation and improved spacing
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Container, Card, CardBody, FormGroup, Label, Input, Textarea, Select, Button, CheckboxLabel, Checkbox, Alert } from '../components/Common/StyledComponents.js';
import { Toast } from '../components/Common/Toast.jsx';
import http from '../api/http.js';

const PageWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing['3xl']} 0;
`;

const PageTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing[6]} 0;
`;

const FormCard = styled(Card)`
  max-width: 800px;
  margin: 0 auto;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  padding-top: ${({ theme }) => theme.spacing[6]};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: ${({ theme }) => theme.spacing[6]};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
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

const StatusHint = styled.small`
  display: block;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

const WarningBox = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  padding: ${({ theme }) => theme.spacing[3]};
  margin-top: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: #92400e;
  display: flex;
  align-items: start;
  gap: ${({ theme }) => theme.spacing[2]};

  &::before {
    content: '⚠️';
    font-size: ${({ theme }) => theme.fontSizes.lg};
    flex-shrink: 0;
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
  const [showAlumniWarning, setShowAlumniWarning] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && id) {
      setLoadingData(true);
      http.get(`/cats/${id}`)
        .then((res) => {
          // Convert null values to empty strings for form display
          const cat = res.data;
          setFormData({
            name: cat.name || '',
            age_years: cat.age_years ?? '',
            sex: cat.sex || 'unknown',
            breed: cat.breed || '',
            temperament: cat.temperament || '',
            good_with_kids: cat.good_with_kids || false,
            good_with_cats: cat.good_with_cats || false,
            good_with_dogs: cat.good_with_dogs || false,
            medical_notes: cat.medical_notes || '',
            is_special_needs: cat.is_special_needs || false,
            status: cat.status || 'available',
            main_image_url: cat.main_image_url || '',
            featured: cat.featured || false
          });
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
    
    // Special handling for status changes
    if (name === 'status') {
      const newStatus = value;
      const isAlumniOrAdopted = newStatus === 'alumni' || newStatus === 'adopted';
      
      // If changing to alumni/adopted AND currently featured, auto-uncheck featured
      if (isAlumniOrAdopted && formData.featured) {
        setFormData((prev) => ({
          ...prev,
          status: newStatus,
          featured: false
        }));
        
        // Show warning
        setShowAlumniWarning(true);
        
        // Show toast notification
        addToast({
          title: 'Featured Status Removed',
          message: `${newStatus === 'alumni' ? 'Alumni' : 'Adopted'} cats are not shown on the homepage, so the Featured checkbox has been automatically unchecked.`,
          variant: 'warning',
          duration: 7000
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value
        }));
        setShowAlumniWarning(false);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when user makes changes
    if (error) setError(null);
  }

  // Clean form data for submission - convert empty strings to null for backend
  function prepareFormData(data) {
    const cleaned = {};
    for (const [key, value] of Object.entries(data)) {
      // Convert empty strings to null
      if (value === '') {
        cleaned[key] = null;
      }
      // Keep booleans as-is
      else if (typeof value === 'boolean') {
        cleaned[key] = value;
      }
      // Keep numbers as-is (including 0)
      else if (typeof value === 'number') {
        cleaned[key] = value;
      }
      // Keep non-empty strings as-is
      else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Clean the data before sending
      const cleanedData = prepareFormData(formData);
      console.log('Submitting cleaned data:', cleanedData);

      if (mode === 'create') {
        await http.post('/cats', cleanedData);
        addToast({
          title: 'Success!',
          message: `${formData.name} has been added successfully`,
          variant: 'success',
          duration: 5000
        });
      } else {
        await http.put(`/cats/${id}`, cleanedData);
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

  const isAlumniOrAdopted = formData.status === 'alumni' || formData.status === 'adopted';

  return (
    <>
      <PageWrapper>
        <Container>
          <FormCard>
            <CardBody>
              <PageTitle>{mode === 'create' ? 'Add New Cat' : 'Edit Cat'}</PageTitle>

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
                    placeholder="Leave empty if unknown"
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
                    placeholder="e.g., Domestic Shorthair"
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
                    placeholder="Describe the cat's personality..."
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
                    placeholder="Any medical conditions or special needs..."
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
                    placeholder="https://..."
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Status</Label>
                  <Select name="status" value={formData.status} onChange={handleChange} disabled={loading}>
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="hold">Hold</option>
                    <option value="adopted">Adopted</option>
                    <option value="alumni">Alumni</option>
                  </Select>
                  <StatusHint>
                    Available: Ready for adoption | Pending: Application in review | Hold: Reserved | Adopted/Alumni: Successfully adopted
                  </StatusHint>
                  {showAlumniWarning && (
                    <WarningBox>
                      Featured status has been automatically removed because {formData.status === 'alumni' ? 'alumni' : 'adopted'} cats are not displayed on the homepage.
                    </WarningBox>
                  )}
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
                      disabled={loading || isAlumniOrAdopted}
                      title={isAlumniOrAdopted ? 'Alumni/Adopted cats cannot be featured' : ''}
                    />
                    Featured
                    {isAlumniOrAdopted && (
                      <StatusHint style={{ display: 'inline', marginLeft: '0.5rem' }}>
                        (Not available for Alumni/Adopted cats)
                      </StatusHint>
                    )}
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
