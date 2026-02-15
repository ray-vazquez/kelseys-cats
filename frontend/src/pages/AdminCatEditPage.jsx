// AdminCatEditPage with Cloudinary Integration
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Container, Card, CardBody, FormGroup, Label, Input, Textarea, Select, Button, Alert } from '../components/Common/StyledComponents.js';
import { Toast } from '../components/Common/Toast.jsx';
import ImageUploader from '../components/Admin/ImageUploader.jsx';
import http from '../api/http.js';

const PageWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing[12]} 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing[8]} 0;
  }
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

const TagsSection = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  padding: ${({ theme }) => theme.spacing[5]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const TagsTitle = styled.h4`
  font-size: ${({ theme}) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing[1]} 0;
`;

const ImagesSection = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  padding: ${({ theme }) => theme.spacing[5]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const ImageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-top: ${({ theme }) => theme.spacing[3]};
`;

const ImageItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.light};
  border-radius: ${({ theme }) => theme.borderRadius.base};
`;

const ImagePreview = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  flex-shrink: 0;
`;

const ImagePlaceholder = styled.div`
  width: 60px;
  height: 60px;
  background: ${({ theme }) => theme.colors.neutral[200]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
`;

const ImageUrl = styled.span`
  flex: 1;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  word-break: break-all;
`;

const RemoveButton = styled.button`
  background: ${({ theme }) => theme.colors.danger};
  color: white;
  border: none;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.dangerHover};
  }
`;

const AddImageSection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[3]};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
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

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.fontSizes.base};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
  width: fit-content;
  opacity: ${({ $muted }) => ($muted ? 0.4 : 1)};
  color: ${({ theme, $muted }) => ($muted ? theme.colors.text.tertiary : 'inherit')};

  &:hover {
    color: ${({ theme, $disabled, $muted }) => 
      ($disabled || $muted) ? 'inherit' : theme.colors.primary
    };
  }
  
  input[type="checkbox"] {
    opacity: ${({ $muted }) => ($muted ? 0.4 : 1)};
  }
`;

const Checkbox = styled.input.attrs({ type: "checkbox" })`
  width: 18px;
  height: 18px;
  margin-right: ${({ theme }) => theme.spacing[2]};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  accent-color: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 2px;
  }
`;

const NameFieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const NameErrorText = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  display: block;
`;

const SectionDivider = styled.div`
  margin-top: ${({ theme }) => theme.spacing[4]};
  padding-top: ${({ theme }) => theme.spacing[4]};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const OrDivider = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  margin: ${({ theme }) => theme.spacing[3]} 0;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: ${({ theme }) => theme.fontSizes.sm};

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
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
    bio: '',
    temperament: '',
    good_with_kids: false,
    good_with_cats: false,
    good_with_dogs: false,
    medical_notes: '',
    is_special_needs: false,
    is_senior: false,
    status: 'available',
    main_image_url: '',
    additional_images: [],
    featured: false
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [mainImageUrlInput, setMainImageUrlInput] = useState(''); // Separate state for main image URL input
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(mode === 'edit');
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [showAlumniWarning, setShowAlumniWarning] = useState(false);
  const [nameError, setNameError] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && id) {
      setLoadingData(true);
      http.get(`/cats/${id}`)
        .then((res) => {
          const cat = res.data;
          
          // Parse additional_images if it's a JSON string
          let parsedImages = [];
          if (cat.additional_images) {
            try {
              parsedImages = typeof cat.additional_images === 'string' 
                ? JSON.parse(cat.additional_images)
                : cat.additional_images;
            } catch (e) {
              console.error('Failed to parse additional_images:', e);
              parsedImages = [];
            }
          }
          
          setFormData({
            name: cat.name || '',
            age_years: cat.age_years ?? '',
            sex: cat.sex || 'unknown',
            breed: cat.breed || '',
            bio: cat.bio || '',
            temperament: cat.temperament || '',
            good_with_kids: cat.good_with_kids || false,
            good_with_cats: cat.good_with_cats || false,
            good_with_dogs: cat.good_with_dogs || false,
            medical_notes: cat.medical_notes || '',
            is_special_needs: cat.is_special_needs || false,
            is_senior: cat.is_senior || false,
            status: cat.status || 'available',
            main_image_url: cat.main_image_url || '',
            additional_images: parsedImages,
            featured: cat.featured || false
          });
          
          // Sync main image URL input with formData
          setMainImageUrlInput(cat.main_image_url || '');
          
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
    
    if (name === 'name') {
      setNameError(false);
    }
    
    if (name === 'status') {
      const newStatus = value;
      const isAlumni = newStatus === 'alumni';
      
      if (isAlumni && formData.featured) {
        setFormData((prev) => ({
          ...prev,
          status: newStatus,
          featured: false
        }));
        
        setShowAlumniWarning(true);
        
        addToast({
          title: 'Featured Status Removed',
          message: 'Alumni cats are not shown on the homepage, so the Featured checkbox has been automatically unchecked.',
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
    
    if (error) setError(null);
  }

  // Handle main image upload
  const handleMainImageUpload = (uploadData) => {
    setFormData(prev => ({
      ...prev,
      main_image_url: uploadData.url
    }));
    setMainImageUrlInput(uploadData.url);
    
    addToast({
      title: 'Main Image Uploaded',
      message: 'Image successfully uploaded to Cloudinary',
      variant: 'success',
      duration: 3000
    });
  };
  
  // Handle setting main image URL manually
  const handleSetMainImageUrl = () => {
    if (!mainImageUrlInput.trim()) {
      addToast({
        title: 'Invalid URL',
        message: 'Please enter a valid image URL',
        variant: 'warning',
        duration: 3000
      });
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      main_image_url: mainImageUrlInput.trim()
    }));
    
    addToast({
      title: 'Main Image URL Set',
      message: 'Main image URL has been updated',
      variant: 'success',
      duration: 3000
    });
  };

  // Handle additional image upload
  const handleAdditionalImageUpload = (uploadData) => {
    setFormData(prev => ({
      ...prev,
      additional_images: [...prev.additional_images, uploadData.url]
    }));
    
    addToast({
      title: 'Image Added',
      message: 'Image uploaded and added to gallery',
      variant: 'success',
      duration: 3000
    });
  };

  const handleImageUploadError = (error) => {
    addToast({
      title: 'Upload Failed',
      message: error,
      variant: 'error',
      duration: 5000
    });
  };

  function handleAddImage() {
    if (!newImageUrl.trim()) {
      addToast({
        title: 'Invalid URL',
        message: 'Please enter a valid image URL',
        variant: 'warning',
        duration: 3000
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      additional_images: [...prev.additional_images, newImageUrl.trim()]
    }));
    setNewImageUrl('');
    
    addToast({
      title: 'Image Added',
      message: 'Image URL added to gallery',
      variant: 'success',
      duration: 3000
    });
  }

  function handleRemoveImage(index) {
    setFormData(prev => ({
      ...prev,
      additional_images: prev.additional_images.filter((_, i) => i !== index)
    }));
    
    addToast({
      title: 'Image Removed',
      message: 'Image removed from gallery',
      variant: 'info',
      duration: 3000
    });
  }

  function prepareFormData(data) {
    const cleaned = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === '') {
        cleaned[key] = null;
      }
      else if (key === 'additional_images') {
        // Convert array to JSON string for backend
        cleaned[key] = JSON.stringify(value);
      }
      else if (typeof value === 'boolean') {
        cleaned[key] = value;
      }
      else if (typeof value === 'number') {
        cleaned[key] = value;
      }
      else if (Array.isArray(value)) {
        cleaned[key] = value;
      }
      else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Name validation
    if (!formData.name || formData.name.trim() === '') {
      setNameError(true);
      setError('Name is required');
      addToast({
        title: 'Validation Error',
        message: 'Please enter a name for the cat',
        variant: 'error',
        duration: 5000
      });
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
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
      
      setTimeout(() => {
        navigate('/admin/cats');
      }, 1000);
    } catch (err) {
      console.error('Failed to save cat:', err);
      
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
        duration: 0
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

  const isAlumni = formData.status === 'alumni';

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
                  <NameFieldWrapper>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={loading}
                      $error={nameError}
                    />
                    {nameError && <NameErrorText>Name is required</NameErrorText>}
                  </NameFieldWrapper>
                </FormGroup>

                <FormGroup>
                  <Label>Age (years)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
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
                  <Label>Bio</Label>
                  <Textarea
                    rows={4}
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Brief biography or story about the cat..."
                  />
                  <StatusHint>
                    A short introduction or background story that will be displayed on the cat's detail page.
                  </StatusHint>
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

                {/* Main Image Upload Section */}
                <ImagesSection>
                  <TagsTitle>Main Image</TagsTitle>
                  <StatusHint>
                    Upload a main image to Cloudinary or enter a URL manually. This image will be shown as the primary image in lists and the main gallery image.
                  </StatusHint>

                  <FormGroup style={{ marginTop: '1rem' }}>
                    <ImageUploader
                      mode="single"
                      onUploadComplete={handleMainImageUpload}
                      onUploadError={handleImageUploadError}
                      disabled={loading}
                      maxSizeMB={10}
                    />
                  </FormGroup>

                  <OrDivider>or enter URL manually</OrDivider>

                  <AddImageSection>
                    <Input
                      type="text"
                      value={mainImageUrlInput}
                      onChange={(e) => setMainImageUrlInput(e.target.value)}
                      disabled={loading}
                      placeholder="https://..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSetMainImageUrl();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleSetMainImageUrl} disabled={loading} $variant="outline">
                      Set URL
                    </Button>
                  </AddImageSection>
                  
                  {formData.main_image_url && (
                    <StatusHint style={{ marginTop: '0.5rem' }}>
                      Current: {formData.main_image_url}
                    </StatusHint>
                  )}
                </ImagesSection>

                {/* Additional Images Section */}
                <ImagesSection>
                  <TagsTitle>Additional Images Gallery</TagsTitle>
                  <StatusHint>
                    Upload multiple images to Cloudinary or add URLs manually. These will appear as thumbnails below the main image on the cat's detail page.
                  </StatusHint>

                  {formData.additional_images.length > 0 && (
                    <ImageList>
                      {formData.additional_images.map((url, index) => (
                        <ImageItem key={index}>
                          {url ? (
                            <ImagePreview src={url} alt={`Additional ${index + 1}`} onError={(e) => e.target.style.display = 'none'} />
                          ) : (
                            <ImagePlaceholder>🖼️</ImagePlaceholder>
                          )}
                          <ImageUrl>{url}</ImageUrl>
                          <RemoveButton type="button" onClick={() => handleRemoveImage(index)}>
                            Remove
                          </RemoveButton>
                        </ImageItem>
                      ))}
                    </ImageList>
                  )}

                  <SectionDivider>
                    <TagsTitle style={{ marginBottom: '0.75rem' }}>Upload to Cloudinary</TagsTitle>
                    <ImageUploader
                      mode="multiple"
                      allowMultiple={true}
                      onUploadComplete={handleAdditionalImageUpload}
                      onUploadError={handleImageUploadError}
                      disabled={loading}
                      maxSizeMB={10}
                    />
                  </SectionDivider>

                  <OrDivider>or add URL manually</OrDivider>

                  <AddImageSection>
                    <Input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      disabled={loading}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImage();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddImage} disabled={loading} $variant="outline">
                      Add Image
                    </Button>
                  </AddImageSection>
                </ImagesSection>

                <FormGroup>
                  <Label>Status</Label>
                  <Select name="status" value={formData.status} onChange={handleChange} disabled={loading}>
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="hold">Hold</option>
                    <option value="alumni">Alumni - (Adopted)</option>
                  </Select>
                  <StatusHint>
                    Available: Ready for adoption | Pending: Application in review | Hold: Reserved | Alumni: Successfully adopted
                  </StatusHint>
                  {showAlumniWarning && (
                    <WarningBox>
                      Featured status has been automatically removed because alumni cats are not displayed on the homepage.
                    </WarningBox>
                  )}
                </FormGroup>

                <TagsSection>
                  <TagsTitle>Tags</TagsTitle>
                  
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
                      name="is_senior"
                      checked={formData.is_senior}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    Senior
                  </CheckboxLabel>

                  <CheckboxLabel 
                    $disabled={isAlumni}
                    $muted={isAlumni}
                    title={isAlumni ? 'Alumni cats cannot be featured' : ''}
                  >
                    <Checkbox
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                      disabled={loading || isAlumni}
                    />
                    Featured
                    {isAlumni && (
                      <StatusHint style={{ display: 'inline', marginLeft: '0.5rem' }}>
                        (Not available for Alumni cats)
                      </StatusHint>
                    )}
                  </CheckboxLabel>
                </TagsSection>

                <ButtonGroup>
                  {mode === 'edit' && (
                    <Button type="button" $variant="danger" onClick={handleDelete} disabled={loading} style={{ marginRight: 'auto' }}>
                      {loading ? 'Deleting...' : 'Delete'}
                    </Button>
                  )}
                  <Button type="button" $variant="outline" onClick={() => navigate('/admin/cats')} disabled={loading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : (mode === 'create' ? 'Create Cat' : 'Save Changes')}
                  </Button>
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
