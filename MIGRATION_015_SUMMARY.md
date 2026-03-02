# Migration 015: Age Text Standardization

**Date:** March 1, 2026  
**Status:** ✅ READY TO DEPLOY  
**Priority:** 🔴 P0 - Launch Blocker  

---

## Summary

Standardizes age field across all cat tables by:
- **Removing** `age_years` (DECIMAL) from both `cats` and `vfv_cats` tables
- **Standardizing** on `age_text` (VARCHAR) with values: "Kitten", "Young", "Adult", "Senior"
- **Updating** `all_available_cats` view to expose only `age_text`
- **Simplifying** admin form to use select dropdown instead of number input

---

## Problem Solved

**Age Display Regression:**
- Featured cats showed "Age unknown" despite having valid `age_years` data
- Root cause: Frontend expected `age_text` (exists in `vfv_cats`), but `cats` table only had `age_years`
- Schema inconsistency caused by incremental feature additions

---

## Files Modified

### ✅ Backend (Completed)

1. **`backend/migrations/015_standardize_age_text.js`** (NEW)
   - Adds `age_text` column to `cats` table
   - Backfills from `age_years` using category mapping:
     - `< 1` → "Kitten"
     - `1-2` → "Young"
     - `3-9` → "Adult"
     - `10+` → "Senior"
   - Drops `age_years` from both `cats` and `vfv_cats`
   - Updates `all_available_cats` view
   - Includes rollback function

2. **`backend/src/models/CatModel.js`** (UPDATED)
   - Line 141: `age_years` → `age_text` in INSERT statement
   - Line 147: `data.age_years` → `data.age_text`
   - Line 177: Added `"age_text"` to allowed fields array, removed `"age_years"`

3. **`backend/src/controllers/cat.controller.js`** (UPDATED)
   - Line 16: Updated comment from "age_years >= 10" to "is_senior flag"

4. **`backend/src/services/adoptAPetScraper.js`** (NEEDS UPDATE)
   - ⚠️ Still writes `age_years` to database (lines ~107, ~750, ~755, ~794, ~817)
   - ⚠️ Function `mapAgeToYears()` should be removed (lines 44-96)
   - ⚠️ Validation logic references `age_years` (lines 123-128)
   - **Action:** Remove all `age_years` references, keep only `age_text`

### ⏳ Frontend (Pending - Separate Session)

5. **`src/pages/AdminCatEditPage.jsx`** or similar admin form
   - Replace age number input with select dropdown
   - Options: Kitten, Young, Adult, Senior

6. **`src/components/CatCard.jsx`**
   - Use `cat.age_text` directly (no helper needed)

7. **`src/pages/CatDetailPage.jsx`**
   - Use `cat.age_text` directly

8. **`src/pages/PartnerCatDetailPage.jsx`**
   - Already uses `age_text` correctly

---

## Deployment Sequence

### Phase 1: Backend Migration (Deploy First)

```bash
# 1. Backup database
mysqldump -u user -p kelseys_cats > backup_before_migration_015.sql

# 2. Run migration locally first (test)
node backend/migrations/015_standardize_age_text.js

# 3. Verify migration succeeded
mysql -u user -p kelseys_cats
> DESCRIBE cats;        -- Should NOT show age_years
> DESCRIBE vfv_cats;    -- Should NOT show age_years
> SELECT age_text, COUNT(*) FROM cats GROUP BY age_text;

# 4. Deploy backend to production
# (includes migration runner)

# 5. Verify production API
curl https://your-api.com/api/cats | jq '.[0].age_text'
# Should return "Kitten", "Young", "Adult", or "Senior"
```

### Phase 2: Scraper Update (Before Next Scrape)

```bash
# Update adoptAPetScraper.js to remove age_years
# Redeploy backend
# Test manual scrape
```

### Phase 3: Frontend Update (After Backend Verified)

```bash
# Update admin form + display components
# Deploy frontend
# Test create/edit cat flows
```

---

## Verification Steps

### After Backend Migration:

✅ **Schema Check:**
```sql
-- These should FAIL (columns dropped):
SELECT age_years FROM cats LIMIT 1;
SELECT age_years FROM vfv_cats LIMIT 1;

-- These should SUCCEED:
SELECT age_text FROM cats LIMIT 10;
SELECT age_text FROM vfv_cats LIMIT 10;
SELECT age_text FROM all_available_cats LIMIT 10;
```

✅ **Data Integrity:**
```sql
-- Check age distribution
SELECT age_text, COUNT(*) as count 
FROM cats 
GROUP BY age_text;

-- Expected output:
-- Kitten | X
-- Young  | X
-- Adult  | X
-- Senior | X
-- NULL   | X (if some cats have no age)
```

✅ **API Response:**
```bash
# Test public endpoint
curl http://localhost:3000/api/cats | jq '.[0]'

# Should include: "age_text": "Adult"
# Should NOT include: "age_years"
```

### After Frontend Changes:

✅ Admin create cat form shows dropdown (not number input)  
✅ Admin edit cat form shows dropdown with pre-selected value  
✅ Cat cards display age_text correctly  
✅ Cat detail pages display age_text correctly  
✅ No console errors about missing age_years  

---

## Rollback Procedure

If migration causes issues:

```bash
# 1. Stop application
# 2. Restore database backup
mysql -u user -p kelseys_cats < backup_before_migration_015.sql

# 3. OR run rollback function in migration file
# (See migration file's down() function)

# 4. Restart application with previous backend code
```

---

## Regression Risks

### 🟡 Medium Risk: Data Loss During Backfill

**Symptom:** Cats with precise ages (e.g., 2.5 years) get bucketed into categories.  
**Impact:** Loss of age precision.  
**Mitigation:** User confirmed no concern about losing precision ages.

### 🟡 Medium Risk: Frontend Breaks Before Backend Deploy

**Symptom:** If frontend deployed first, expects age_text but gets age_years.  
**Impact:** Age display regression continues.  
**Mitigation:** Deploy backend FIRST, then frontend.

### 🟢 Low Risk: Scraper Writes to Wrong Column

**Symptom:** Scraper tries to write to deleted `age_years` column.  
**Impact:** Scraper fails with SQL error.  
**Mitigation:** Update scraper to remove age_years before next automated scrape.

---

## Next Steps

### Immediate (Tonight/Tomorrow):
1. ✅ Update `adoptAPetScraper.js` to remove age_years references
2. ⏳ Test migration locally
3. ⏳ Deploy backend to production
4. ⏳ Verify production API response

### After Backend Verified:
5. ⏳ Update frontend admin form (select dropdown)
6. ⏳ Update frontend display components
7. ⏳ Deploy frontend
8. ⏳ Full regression test

---

## Success Criteria

- ✅ Migration runs without errors
- ✅ All existing cats have age_text populated
- ✅ API returns age_text (not age_years)
- ✅ Admin form uses select dropdown
- ✅ Cat cards display age correctly
- ✅ Featured cats no longer show "Age unknown"
- ✅ Partner cats still display age correctly
- ✅ Scraper runs without errors

---

## Timeline

**Created:** March 1, 2026, 9:51 PM EST  
**Launch Date:** March 6, 2026  
**Days Remaining:** 5  
**Must Complete By:** March 3, 2026 (before feature freeze March 4)

---

## Related Issues

- **P0:** Age display regression (featured cats show "Age unknown")
- **P1:** Scraper image bug (separate issue)
- **P1:** Bio text cleaning (separate issue)

---

**Status: ✅ BACKEND MIGRATION COMPLETE - READY FOR SCRAPER UPDATE**
