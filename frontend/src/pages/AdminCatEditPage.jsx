import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Container, Card, CardBody, FormGroup, Label, Input, Textarea, Select, Button, CheckboxLabel, Checkbox } from '../components/Common/StyledComponents.js';
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

  useEffect(() => {
    if (mode === 'edit' && id) {
      http.get(`/cats/${id}`).then((res) => {
        setFormData(res.data);
      });
    }
  }, [mode, id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (mode === 'create') {
      await http.post('/cats', formData);
    } else {
      await http.put(`/cats/${id}`, formData);
    }
    navigate('/admin/cats');
  }

  return (
    <PageWrapper>
      <Container>
        <FormCard>
          <CardBody>
            <h2 style={{ marginBottom: '2rem' }}>{mode === 'create' ? 'Add New Cat' : 'Edit Cat'}</h2>
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
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
                />
              </FormGroup>

              <FormGroup>
                <Label>Sex</Label>
                <Select name="sex" value={formData.sex} onChange={handleChange}>
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
                />
              </FormGroup>

              <FormGroup>
                <Label>Temperament</Label>
                <Textarea
                  rows={3}
                  name="temperament"
                  value={formData.temperament}
                  onChange={handleChange}
                />
              </FormGroup>

              <FormGroup>
                <Label>Main Image URL</Label>
                <Input
                  type="text"
                  name="main_image_url"
                  value={formData.main_image_url}
                  onChange={handleChange}
                />
              </FormGroup>

              <FormGroup>
                <Label>Status</Label>
                <Select name="status" value={formData.status} onChange={handleChange}>
                  <option value="available">Available</option>
                  <option value="pending">Pending</option>
                  <option value="hold">Hold</option>
                  <option value="alumni">Alumni</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    name="good_with_kids"
                    checked={formData.good_with_kids}
                    onChange={handleChange}
                  />
                  Good with Kids
                </CheckboxLabel>

                <CheckboxLabel>
                  <Checkbox
                    name="good_with_cats"
                    checked={formData.good_with_cats}
                    onChange={handleChange}
                  />
                  Good with Cats
                </CheckboxLabel>

                <CheckboxLabel>
                  <Checkbox
                    name="good_with_dogs"
                    checked={formData.good_with_dogs}
                    onChange={handleChange}
                  />
                  Good with Dogs
                </CheckboxLabel>

                <CheckboxLabel>
                  <Checkbox
                    name="is_special_needs"
                    checked={formData.is_special_needs}
                    onChange={handleChange}
                  />
                  Special Needs
                </CheckboxLabel>

                <CheckboxLabel>
                  <Checkbox
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                  />
                  Featured
                </CheckboxLabel>
              </FormGroup>

              <ButtonGroup>
                <Button type="submit">
                  {mode === 'create' ? 'Create Cat' : 'Save Changes'}
                </Button>
                <Button type="button" $variant="secondary" onClick={() => navigate('/admin/cats')}>
                  Cancel
                </Button>
              </ButtonGroup>
            </form>
          </CardBody>
        </FormCard>
      </Container>
    </PageWrapper>
  );
}
