// backend/src/services/petfinderService.js
// Service for fetching Voice for the Voiceless cats from Petfinder API

import { env } from '../config/env.js';

const PETFINDER_API_URL = 'https://api.petfinder.com/v2';
const VOICE_ORG_ID = 'NY1296'; // Voice for the Voiceless organization ID
const TOKEN_CACHE_KEY = 'petfinder_token';
const CATS_CACHE_KEY = 'voice_shelter_cats';
const TOKEN_EXPIRY = 3600 * 1000; // 1 hour
const CATS_CACHE_EXPIRY = 6 * 3600 * 1000; // 6 hours

// In-memory cache (consider Redis for production)
const cache = {
  token: null,
  tokenExpiry: 0,
  cats: null,
  catsExpiry: 0
};

/**
 * Get Petfinder API access token
 * @returns {Promise<string>} Access token
 */
async function getAccessToken() {
  // Check cache
  if (cache.token && Date.now() < cache.tokenExpiry) {
    return cache.token;
  }

  // Request new token
  const response = await fetch(`${PETFINDER_API_URL}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.PETFINDER_API_KEY,
      client_secret: env.PETFINDER_SECRET
    })
  });

  if (!response.ok) {
    throw new Error(`Petfinder auth failed: ${response.status}`);
  }

  const data = await response.json();
  
  // Cache token
  cache.token = data.access_token;
  cache.tokenExpiry = Date.now() + TOKEN_EXPIRY;
  
  return data.access_token;
}

/**
 * Fetch cats from Voice for the Voiceless via Petfinder API
 * @param {Object} options - Query options
 * @param {boolean} options.forceRefresh - Force bypass cache
 * @returns {Promise<Array>} Array of cat objects
 */
export async function getVoiceShelterCats({ forceRefresh = false } = {}) {
  // Check cache (unless force refresh)
  if (!forceRefresh && cache.cats && Date.now() < cache.catsExpiry) {
    console.log('Returning cached Voice shelter cats');
    return cache.cats;
  }

  try {
    const token = await getAccessToken();
    
    // Fetch animals from Voice for the Voiceless
    const response = await fetch(
      `${PETFINDER_API_URL}/animals?organization=${VOICE_ORG_ID}&type=cat&status=adoptable&limit=100`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Petfinder API failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Petfinder data to match your cat schema
    const cats = data.animals.map(animal => ({
      petfinder_id: animal.id,
      name: animal.name,
      age_years: parseAge(animal.age),
      breed: animal.breeds.primary || 'Domestic Shorthair',
      description: animal.description || '',
      main_image_url: animal.photos?.[0]?.large || animal.photos?.[0]?.medium || null,
      is_special_needs: animal.attributes?.special_needs || false,
      gender: animal.gender?.toLowerCase() || 'unknown',
      adoptapet_url: animal.url, // Petfinder profile URL
      source: 'voice_shelter',
      // Additional Petfinder data
      petfinder_data: {
        age_text: animal.age,
        size: animal.size,
        coat: animal.coat,
        colors: animal.colors,
        environment: animal.environment,
        tags: animal.tags || []
      }
    }));

    // Cache results
    cache.cats = cats;
    cache.catsExpiry = Date.now() + CATS_CACHE_EXPIRY;
    
    console.log(`Fetched ${cats.length} cats from Voice for the Voiceless`);
    return cats;
    
  } catch (error) {
    console.error('Error fetching Voice shelter cats:', error);
    
    // Return cached data if available (even if expired)
    if (cache.cats) {
      console.log('Returning stale cached data due to error');
      return cache.cats;
    }
    
    // Return empty array as fallback
    return [];
  }
}

/**
 * Parse Petfinder age string to approximate years
 * @param {string} ageStr - Age string from Petfinder (Baby, Young, Adult, Senior)
 * @returns {number|null} Approximate age in years
 */
function parseAge(ageStr) {
  const ageMap = {
    'Baby': 0.5,
    'Young': 2,
    'Adult': 5,
    'Senior': 10
  };
  return ageMap[ageStr] || null;
}

/**
 * Clear cache (useful for manual refresh)
 */
export function clearCache() {
  cache.cats = null;
  cache.catsExpiry = 0;
  console.log('Petfinder cache cleared');
}

/**
 * Get cache status
 */
export function getCacheInfo() {
  return {
    hasCachedCats: !!cache.cats,
    catsCount: cache.cats?.length || 0,
    catsExpiresIn: cache.catsExpiry > Date.now() ? cache.catsExpiry - Date.now() : 0,
    hasToken: !!cache.token,
    tokenExpiresIn: cache.tokenExpiry > Date.now() ? cache.tokenExpiry - Date.now() : 0
  };
}
