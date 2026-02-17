// frontend/src/components/Admin/TagSelector.jsx
// Multi-select tag component for temperament and medical notes

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import http from '../../api/http';

const SelectorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}33;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  min-height: 100px;
  background: ${({ theme }) => theme.colors.background.secondary};
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 300px;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  box-shadow: ${({ theme }) => theme.shadows.md};
  z-index: 1000;
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

const DropdownItem = styled.div`
  padding: ${({ theme }) => theme.spacing[3]};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transitions.fast};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  
  &:hover {
    background: ${({ theme }) => theme.colors.background.secondary};
  }
  
  ${({ $selected, theme }) => $selected && `
    background: ${theme.colors.primary}22;
    font-weight: ${theme.fontWeights.semibold};
  `}
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  background: ${({ theme, $variant }) => {
    if ($variant === 'temperament') return theme.colors.primary;
    if ($variant === 'medical') return theme.colors.warning || '#f59e0b'; // Fallback to orange
    return theme.colors.secondary;
  }};
  color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  white-space: nowrap;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  line-height: 1;
  opacity: 0.8;
  transition: opacity ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    opacity: 1;
  }
`;

const EmptyState = styled.div`
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
  width: 100%;
  padding: ${({ theme }) => theme.spacing[4]};
`;

const CategoryBadge = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.neutral[200]};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

/**
 * TagSelector Component
 * Multi-select tag component for categorized tags (temperament, medical, etc.)
 * 
 * @param {string} category - Tag category: 'temperament', 'medical', 'general'
 * @param {Array<number>} value - Array of selected tag IDs
 * @param {Function} onChange - Callback when selection changes
 * @param {string} label - Label for the selector
 * @param {string} placeholder - Placeholder text
 */
export default function TagSelector({ 
  category, 
  value = [], 
  onChange, 
  label,
  placeholder = 'Search or select tags...'
}) {
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available tags for this category
  useEffect(() => {
    fetchTags();
  }, [category]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await http.get(`/tags?category=${category}`);
      setAvailableTags(response.data.tags || []);
    } catch (err) {
      console.error('Failed to fetch tags:', err);
      setError('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  // Get selected tag objects from IDs
  const selectedTags = availableTags.filter(tag => value.includes(tag.id));

  // Filter tags based on search query
  const filteredTags = availableTags.filter(tag => {
    const matchesSearch = !searchQuery || 
      tag.name.toLowerCase().includes(searchQuery.toLowerCase());
    const notSelected = !value.includes(tag.id);
    return matchesSearch && notSelected;
  });

  const handleTagSelect = (tagId) => {
    if (!value.includes(tagId)) {
      onChange([...value, tagId]);
      setSearchQuery('');
    }
  };

  const handleTagRemove = (tagId) => {
    onChange(value.filter(id => id !== tagId));
  };

  const handleSearchFocus = () => {
    setShowDropdown(true);
  };

  const handleSearchBlur = () => {
    // Delay to allow click events on dropdown items
    setTimeout(() => setShowDropdown(false), 200);
  };

  if (loading) {
    return (
      <SelectorWrapper>
        <Label>{label}</Label>
        <EmptyState>Loading tags...</EmptyState>
      </SelectorWrapper>
    );
  }

  if (error) {
    return (
      <SelectorWrapper>
        <Label>{label}</Label>
        <EmptyState style={{ color: 'red' }}>{error}</EmptyState>
      </SelectorWrapper>
    );
  }

  return (
    <SelectorWrapper>
      <Label>
        {label}
        <CategoryBadge>{availableTags.length} available</CategoryBadge>
      </Label>

      {/* Search/Add Input */}
      <DropdownContainer>
        <SearchInput
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
        />
        
        {/* Dropdown with available tags */}
        {showDropdown && filteredTags.length > 0 && (
          <Dropdown>
            {filteredTags.map(tag => (
              <DropdownItem
                key={tag.id}
                onClick={() => handleTagSelect(tag.id)}
              >
                {tag.name}
              </DropdownItem>
            ))}
          </Dropdown>
        )}
      </DropdownContainer>

      {/* Selected Tags Display */}
      <TagsContainer>
        {selectedTags.length === 0 ? (
          <EmptyState>
            No {category} tags selected. Search above to add tags.
          </EmptyState>
        ) : (
          selectedTags.map(tag => (
            <Tag key={tag.id} $variant={category}>
              {tag.name}
              <RemoveButton
                type="button"
                onClick={() => handleTagRemove(tag.id)}
                aria-label={`Remove ${tag.name}`}
              >
                ×
              </RemoveButton>
            </Tag>
          ))
        )}
      </TagsContainer>
    </SelectorWrapper>
  );
}
