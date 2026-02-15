# Tag System Implementation Guide

## Overview

This migration introduces a **categorized tag system** to replace free-text fields for `temperament` and `medical_notes`. Tags provide:

- ✅ **Consistency**: Standardized terminology across all cats
- ✅ **Searchability**: Easy filtering by personality traits and medical conditions
- ✅ **Data Quality**: Prevents typos and inconsistent phrasing
- ✅ **Flexibility**: Can add custom tags when needed
- ✅ **Analytics**: Track common traits/conditions across the shelter

---

## Database Schema Changes

### New Tables

#### `tag_categories`
Stores tag category definitions (temperament, medical, general).

```sql
CREATE TABLE tag_categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Modified Tables

#### `tags`
Adds `category_id` to support categorization.

```sql
ALTER TABLE tags 
ADD COLUMN category_id INT UNSIGNED NULL,
ADD CONSTRAINT fk_tag_category 
  FOREIGN KEY (category_id) REFERENCES tag_categories(id);
```

---

## Pre-seeded Tags

### Temperament Tags (20 options)
- Affectionate, Shy, Playful, Calm, Independent
- Vocal, Curious, Gentle, Energetic, Lap Cat
- Social, Timid, Confident, Friendly, Reserved
- Adventurous, Cuddly, Mellow, Talkative, Quiet

### Medical Tags (20 options)
- FIV+, FeLV+, Hyperthyroid, Diabetes, Asthma
- Kidney Disease, Heart Murmur, Dental Issues, Allergies
- Special Diet, Medication Required, Chronic Condition
- Vision Impaired, Hearing Impaired, Mobility Issues
- Arthritis, Upper Respiratory, Skin Condition
- Weight Management, Senior Care

---

## Running the Migration

### Option 1: Using MySQL CLI
```bash
mysql -u root -p kelseyscats < backend/db/migrations/003_add_tag_categories.sql
```

### Option 2: Using MySQL Shell
```bash
mysqlsh --sql "mysql://root:password@localhost:3306/kelseyscats" \
  --file=backend/db/migrations/003_add_tag_categories.sql
```

### Option 3: Using Node.js Script
```javascript
import { query } from './backend/src/lib/db.js';
import fs from 'fs';

const sql = fs.readFileSync(
  './backend/db/migrations/003_add_tag_categories.sql', 
  'utf-8'
);

await query(sql);
console.log('✅ Migration complete!');
```

---

## API Endpoints

### Get All Tags (with optional category filter)
```http
GET /api/tags?category=temperament
```

**Response:**
```json
{
  "tags": [
    { "id": 1, "name": "Affectionate", "category_name": "temperament" },
    { "id": 2, "name": "Shy", "category_name": "temperament" }
  ],
  "grouped": {
    "temperament": {
      "category": "temperament",
      "description": "Personality and behavior traits",
      "tags": [
        { "id": 1, "name": "Affectionate" },
        { "id": 2, "name": "Shy" }
      ]
    }
  }
}
```

### Get Tag Categories
```http
GET /api/tags/categories
```

### Get Tags for a Cat
```http
GET /api/tags/cats/:catId
```

**Response:**
```json
{
  "tags": [
    { "id": 1, "name": "Shy", "category_name": "temperament" },
    { "id": 15, "name": "Special Diet", "category_name": "medical" }
  ],
  "grouped": {
    "temperament": [
      { "id": 1, "name": "Shy" }
    ],
    "medical": [
      { "id": 15, "name": "Special Diet" }
    ]
  }
}
```

### Update Cat Tags (Admin)
```http
PUT /api/tags/cats/:catId
Content-Type: application/json

{
  "temperament": [1, 4, 10],
  "medical": [15, 20]
}
```

### Create New Tag (Admin)
```http
POST /api/tags
Content-Type: application/json

{
  "name": "Snuggly",
  "category_id": 1
}
```

---

## Frontend Integration

### Using the TagSelector Component

```jsx
import TagSelector from '../components/Admin/TagSelector';

function CatForm() {
  const [temperamentTags, setTemperamentTags] = useState([]);
  const [medicalTags, setMedicalTags] = useState([]);

  return (
    <form>
      {/* Replace textarea for temperament */}
      <TagSelector
        category="temperament"
        value={temperamentTags}
        onChange={setTemperamentTags}
        label="Personality & Temperament"
        placeholder="Search personality traits..."
      />

      {/* Replace textarea for medical notes */}
      <TagSelector
        category="medical"
        value={medicalTags}
        onChange={setMedicalTags}
        label="Medical Conditions & Notes"
        placeholder="Search medical conditions..."
      />
    </form>
  );
}
```

### Saving Tags When Creating/Updating a Cat

```javascript
const handleSubmit = async (catData) => {
  // Save the cat first
  const cat = await http.post('/cats', catData);
  
  // Then update tags
  await http.put(`/tags/cats/${cat.id}`, {
    temperament: temperamentTags,
    medical: medicalTags
  });
};
```

---

## Migration Path for Existing Data

### Step 1: Backup existing text data
```sql
-- Keep legacy columns temporarily
ALTER TABLE featured_foster_cats 
ADD COLUMN temperament_legacy TEXT NULL,
ADD COLUMN medical_notes_legacy TEXT NULL;

UPDATE featured_foster_cats 
SET temperament_legacy = temperament,
    medical_notes_legacy = medical_notes;
```

### Step 2: Manual/scripted tag assignment
- Review existing free-text entries
- Assign appropriate tags from the predefined list
- Use admin interface or bulk script

### Step 3: Deprecate old columns (after verification)
```sql
ALTER TABLE featured_foster_cats 
DROP COLUMN temperament,
DROP COLUMN medical_notes;
```

---

## Frontend Search Integration

Tags are already integrated into the existing search system!

### Existing `cat_tags` table supports:
- Filtering by tag names
- Multi-tag search (AND/OR logic)
- Tag-based recommendations

### Example: Search for cats with specific traits
```javascript
// Frontend already supports this via existing tag system
const response = await http.get('/cats/all-available?tags=Shy,Gentle');
```

---

## Best Practices

### For Admins
1. **Use predefined tags** whenever possible for consistency
2. **Create new tags sparingly** - check if similar tags exist first
3. **Be specific**: "Vision Impaired" is better than "Special Needs"
4. **Multi-select appropriately**: A cat can be both "Shy" and "Gentle"

### For Developers
1. **Cache tags in frontend** - they don't change often
2. **Validate tag IDs** before submission
3. **Handle missing categories** gracefully
4. **Display tags as badges** on cat cards for better UX

---

## Rollback Procedure

If needed, rollback by:

```sql
-- 1. Remove foreign key constraint
ALTER TABLE tags DROP FOREIGN KEY fk_tag_category;

-- 2. Remove category_id column
ALTER TABLE tags DROP COLUMN category_id;

-- 3. Drop tag_categories table
DROP TABLE tag_categories;

-- 4. Restore legacy text fields (if backed up)
UPDATE featured_foster_cats 
SET temperament = temperament_legacy,
    medical_notes = medical_notes_legacy
WHERE temperament_legacy IS NOT NULL;
```

---

## Future Enhancements

- [ ] Tag popularity analytics dashboard
- [ ] AI-suggested tags based on cat descriptions
- [ ] Tag synonyms/aliases for search
- [ ] User-submitted tag requests (with admin approval)
- [ ] Conditional tag rules (e.g., "Senior" auto-adds "Senior Care")

---

## Support

For questions or issues with the tag system:
1. Check API response in browser DevTools
2. Verify migration ran successfully: `SELECT * FROM tag_categories`
3. Test tag endpoints with curl/Postman
4. Review backend logs for error details
