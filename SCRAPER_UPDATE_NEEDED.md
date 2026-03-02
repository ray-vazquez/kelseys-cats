# Scraper Update Required: Remove age_years References

**File:** `backend/src/services/adoptAPetScraper.js`  
**Priority:** 🔴 CRITICAL - Must complete before next automated scrape  
**Date:** March 1, 2026

---

## Summary

The scraper currently writes both `age_text` AND `age_years` to the `vfv_cats` table. After Migration 015, the `age_years` column no longer exists, so the scraper will fail with SQL errors if not updated.

**Action Required:** Remove ALL `age_years` references from the scraper.

---

## Changes Needed

### 1. ❌ DELETE: Function `mapAgeToYears()` (Lines 44-96)

**Current Code:**
```javascript
/**
 * Maps age text from Adopt-a-Pet to numeric years.
 * ...
 */
function mapAgeToYears(ageText) {
  if (!ageText || ageText.trim() === '') return null;
  // ... [~50 lines of conversion logic]
  return null;
}
```

**Action:** **DELETE ENTIRE FUNCTION** - No longer needed since we only use `age_text`.

---

### 2. ✏️ UPDATE: Validation Function (Lines 107-136)

**Current Code:**
```javascript
function validateScrapedCat(catData) {
  const errors = [];
  const warnings = [];
  
  // ... name/id validation ...
  
  // Age validation
  if (!catData.age_text || catData.age_text.trim() === '') {
    warnings.push('Missing age_text');
  }
  
  const age_years = mapAgeToYears(catData.age_text);  // ❌ REMOVE THIS
  if (age_years === null && catData.age_text &&      // ❌ REMOVE THIS
      !['unknown', 'n/a', ''].includes(catData.age_text.toLowerCase().trim())) {
    warnings.push(`Could not parse age_years from age_text: "${catData.age_text}"`);
  }
  
  // ... rest of validation ...
}
```

**Updated Code:**
```javascript
function validateScrapedCat(catData) {
  const errors = [];
  const warnings = [];
  
  // ... name/id validation ...
  
  // Age validation
  if (!catData.age_text || catData.age_text.trim() === '') {
    warnings.push('Missing age_text');
  }
  // ✅ Removed age_years parsing - we only validate age_text exists
  
  // ... rest of validation ...
}
```

---

### 3. ✏️ UPDATE: `getPartnerFosterCats()` Function (Lines ~620)

**Current Code:**
```javascript
export async function getPartnerFosterCats() {
  try {
    const [cats] = await query(
      `SELECT 
        id, adoptapet_id, name, age_text, age_years,  // ❌ REMOVE age_years
        breed, color, hair_length, sex,
        ...
      FROM vfv_cats 
      ORDER BY name ASC`,
    );
    return cats;
  }
```

**Updated Code:**
```javascript
export async function getPartnerFosterCats() {
  try {
    const [cats] = await query(
      `SELECT 
        id, adoptapet_id, name, age_text,  // ✅ Removed age_years
        breed, color, hair_length, sex,
        ...
      FROM vfv_cats 
      ORDER BY name ASC`,
    );
    return cats;
  }
```

---

### 4. ✏️ UPDATE: Database Save Logic (Lines ~750-820)

**Current Code (Line ~750):**
```javascript
for (const cat of scrapedCats) {
  try {
    const age_years = mapAgeToYears(cat.age_text);  // ❌ REMOVE THIS LINE

    const s = {
      adoptapet_id: cat.adoptapet_id ?? null,
      name: cat.name ?? null,
      age_text: cat.age_text ?? null,
      age_years: age_years ?? null,  // ❌ REMOVE THIS LINE
      breed: cat.breed ?? null,
      // ...
    };
```

**Updated Code:**
```javascript
for (const cat of scrapedCats) {
  try {
    // ✅ Removed mapAgeToYears() call

    const s = {
      adoptapet_id: cat.adoptapet_id ?? null,
      name: cat.name ?? null,
      age_text: cat.age_text ?? null,
      // ✅ Removed age_years field
      breed: cat.breed ?? null,
      // ...
    };
```

---

**Current Code (Line ~790):**
```javascript
        await query(
          `UPDATE vfv_cats SET 
            name = ?, age_text = ?, age_years = ?,  // ❌ REMOVE age_years
            breed = ?, color = ?, hair_length = ?, sex = ?,
            // ...
          WHERE id = ?`,
          [
            s.name, s.age_text, s.age_years,  // ❌ REMOVE s.age_years
            s.breed, s.color, s.hair_length, s.sex,
            // ...
          ],
        );
```

**Updated Code:**
```javascript
        await query(
          `UPDATE vfv_cats SET 
            name = ?, age_text = ?,  // ✅ Removed age_years
            breed = ?, color = ?, hair_length = ?, sex = ?,
            // ...
          WHERE id = ?`,
          [
            s.name, s.age_text,  // ✅ Removed s.age_years
            s.breed, s.color, s.hair_length, s.sex,
            // ...
          ],
        );
```

---

**Current Code (Line ~817):**
```javascript
          await query(
            `INSERT INTO vfv_cats (
              adoptapet_id, name, age_text, age_years,  // ❌ REMOVE age_years
              breed, color, hair_length, sex,
              // ...
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              s.adoptapet_id, s.name, s.age_text, s.age_years,  // ❌ REMOVE s.age_years
              s.breed, s.color, s.hair_length, s.sex,
              // ...
            ],
          );
```

**Updated Code:**
```javascript
          await query(
            `INSERT INTO vfv_cats (
              adoptapet_id, name, age_text,  // ✅ Removed age_years
              breed, color, hair_length, sex,
              // ...
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,  // One less ?
            [
              s.adoptapet_id, s.name, s.age_text,  // ✅ Removed s.age_years
              s.breed, s.color, s.hair_length, s.sex,
              // ...
            ],
          );
```

**IMPORTANT:** The number of `?` placeholders in the VALUES clause must match the number of parameters in the array!

---

## Testing After Update

### 1. Verify Syntax
```bash
node -c backend/src/services/adoptAPetScraper.js
# Should output nothing (no syntax errors)
```

### 2. Test Manual Scrape
```bash
# From admin panel or via API:
POST /api/admin/scraper/run

# Check logs for:
# - No SQL errors about age_years
# - Cats successfully saved
# - age_text populated correctly
```

### 3. Verify Database
```sql
-- Check recent scrape
SELECT name, age_text, scraped_at 
FROM vfv_cats 
ORDER BY scraped_at DESC 
LIMIT 10;

-- Verify age_text values are categorical
SELECT DISTINCT age_text FROM vfv_cats;
-- Expected: 'Kitten', 'Young', 'Adult', 'Senior', 'Baby', etc.
```

---

## Quick Reference: All Lines to Change

| Line Range | Action | Description |
|------------|--------|-------------|
| 44-96 | DELETE | `mapAgeToYears()` function |
| 123-128 | REMOVE | Age years parsing validation |
| ~620 | REMOVE | `age_years` from SELECT query |
| ~750 | REMOVE | `mapAgeToYears()` call |
| ~755 | REMOVE | `age_years` from object |
| ~794 | REMOVE | `age_years` from UPDATE query + params |
| ~817 | REMOVE | `age_years` from INSERT query + params |

---

## Deployment Sequence

1. ✅ Migration 015 runs (adds age_text to cats, drops age_years)
2. ⏳ **Update scraper (THIS TASK)**
3. ⏳ Redeploy backend
4. ⏳ Test manual scrape
5. ⏳ Verify automated daily scrape works

---

## Risk Assessment

### 🟢 Low Risk If Done Before Next Scrape

- Migration drops `age_years` column
- Next scrape will fail if it tries to write to `age_years`
- Error will be SQL constraint violation
- **Mitigation:** Update scraper immediately after migration

### 🔴 High Risk If Not Updated

- Automated daily scrape will fail
- Partner cats won't update
- Stale data on website
- **Resolution:** Update scraper ASAP, re-run manual scrape

---

**Status: ⚠️ UPDATE NEEDED - Complete before next automated scrape (daily at midnight)**

**Created:** March 1, 2026, 9:53 PM EST  
**Must Complete By:** March 2, 2026 (before midnight)
