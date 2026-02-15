// EXAMPLE: How to integrate TagSelector into admin cat forms
// This file demonstrates replacing textarea inputs with TagSelector components

import React, { useState, useEffect } from 'react';
import TagSelector from './TagSelector';
import http from '../../api/http';

export default function CatFormWithTags({ catId = null, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    age_years: '',
    gender: 'female',
    breed: '',
    bio: '',
    // ... other cat fields
  });
  
  // Separate state for tags (stored as arrays of tag IDs)
  const [temperamentTags, setTemperamentTags] = useState([]);
  const [medicalTags, setMedicalTags] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load existing cat data if editing
  useEffect(() => {
    if (catId) {
      loadCatData();
    }
  }, [catId]);

  const loadCatData = async () => {
    try {
      // Load cat basic data
      const catResponse = await http.get(`/cats/${catId}`);
      setFormData(catResponse.data);
      
      // Load cat tags
      const tagsResponse = await http.get(`/tags/cats/${catId}`);
      const { grouped } = tagsResponse.data;
      
      // Set temperament and medical tags from grouped response
      if (grouped.temperament) {
        setTemperamentTags(grouped.temperament.map(t => t.id));
      }
      if (grouped.medical) {
        setMedicalTags(grouped.medical.map(t => t.id));
      }
    } catch (error) {
      console.error('Failed to load cat data:', error);
      alert('Failed to load cat data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let savedCat;
      
      // Step 1: Create or update the cat
      if (catId) {
        // Update existing cat
        const response = await http.put(`/cats/${catId}`, formData);
        savedCat = response.data;
      } else {
        // Create new cat
        const response = await http.post('/cats', formData);
        savedCat = response.data;
      }
      
      // Step 2: Update tags using the new tags API
      await http.put(`/tags/cats/${savedCat.id}`, {
        temperament: temperamentTags,
        medical: medicalTags
      });
      
      alert('Cat saved successfully!');
      if (onSuccess) onSuccess(savedCat);
      
    } catch (error) {
      console.error('Failed to save cat:', error);
      alert('Failed to save cat: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h2>{catId ? 'Edit Cat' : 'Add New Cat'}</h2>

      {/* Basic cat information */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label>
          Name *
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label>
          Age (years)
          <input
            type="number"
            name="age_years"
            value={formData.age_years}
            onChange={handleInputChange}
            step="0.1"
            min="0"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label>
          Gender
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label>
          Breed
          <input
            type="text"
            name="breed"
            value={formData.breed}
            onChange={handleInputChange}
            placeholder="e.g., Domestic Shorthair"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label>
          Bio / Description
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={4}
            placeholder="Tell us about this cat's story..."
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
          />
        </label>
      </div>

      {/* REPLACED: temperament textarea with TagSelector */}
      <div style={{ marginBottom: '1.5rem' }}>
        <TagSelector
          category="temperament"
          value={temperamentTags}
          onChange={setTemperamentTags}
          label="Personality & Temperament"
          placeholder="Search personality traits (e.g., shy, playful, friendly)..."
        />
        <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
          Select tags that describe this cat's personality and behavior.
        </p>
      </div>

      {/* REPLACED: medical_notes textarea with TagSelector */}
      <div style={{ marginBottom: '1.5rem' }}>
        <TagSelector
          category="medical"
          value={medicalTags}
          onChange={setMedicalTags}
          label="Medical Conditions & Health Notes"
          placeholder="Search medical conditions (e.g., special diet, FIV+)..."
        />
        <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
          Select any medical conditions, dietary restrictions, or health considerations.
        </p>
      </div>

      {/* Additional cat fields... */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label>
          <input
            type="checkbox"
            name="is_special_needs"
            checked={formData.is_special_needs}
            onChange={(e) => setFormData(prev => ({ ...prev, is_special_needs: e.target.checked }))}
          />
          {' '}Special Needs
        </label>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label>
          <input
            type="checkbox"
            name="featured"
            checked={formData.featured}
            onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
          />
          {' '}Featured Cat (show on homepage)
        </label>
      </div>

      {/* Submit button */}
      <div style={{ marginTop: '2rem' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 2rem',
            background: '#4A90E2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          {loading ? 'Saving...' : (catId ? 'Update Cat' : 'Add Cat')}
        </button>
      </div>
    </form>
  );
}

/*
 * MIGRATION NOTES:
 * 
 * OLD WAY (textarea fields):
 * -------------------------
 * <textarea name="temperament" />
 * <textarea name="medical_notes" />
 * 
 * Issues:
 * - Inconsistent terminology ("shy" vs "timid" vs "nervous")
 * - Hard to search/filter
 * - Typos and formatting issues
 * - No standardization
 * 
 * 
 * NEW WAY (TagSelector components):
 * --------------------------------
 * <TagSelector category="temperament" />
 * <TagSelector category="medical" />
 * 
 * Benefits:
 * ✅ Standardized options (pre-seeded common tags)
 * ✅ Multi-select with visual chips
 * ✅ Searchable dropdown
 * ✅ Easy to add/remove tags
 * ✅ Backend validation
 * ✅ Filterable in search
 * ✅ Better UX with type-ahead
 * 
 * 
 * BACKEND CHANGES NEEDED:
 * ----------------------
 * 1. Run migration: 003_add_tag_categories.sql
 * 2. Tags API endpoints already created
 * 3. Server.js already updated with routes
 * 
 * 
 * DATA MIGRATION:
 * --------------
 * Existing free-text in temperament/medical_notes can be:
 * 1. Kept in legacy columns temporarily
 * 2. Manually reviewed and converted to tags
 * 3. Dropped once all data is migrated
 */
