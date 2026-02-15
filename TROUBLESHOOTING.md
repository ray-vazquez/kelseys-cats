# Troubleshooting Guide

## Issues: Search not filtering & Cat names not displaying

### Root Cause Analysis

Both issues are **related** and stem from the same problem:

1. **Database view not updated**: The `all_available_cats` view in your database doesn't have the latest schema
2. **Schema mismatch**: The old view definition references a `deleted_at` column that doesn't exist in the base `cats` table
3. **Result**: View fails to return data, causing empty cat lists and failed searches

### Quick Fix Steps

#### Step 1: Run the Fixed Migration

```bash
# Navigate to backend directory
cd backend

# Run the fixed migration
mysql -u your_username -p your_database < migrations/04_fix_all_available_cats_view.sql
```

Or via MySQL client:
```sql
SOURCE backend/migrations/04_fix_all_available_cats_view.sql;
```

#### Step 2: Verify the Fix

Test the debug endpoints to confirm data is flowing:

```bash
# Check view columns
curl http://localhost:5000/api/debug/view-columns

# Get sample cats
curl http://localhost:5000/api/debug/sample-cats

# Test search
curl "http://localhost:5000/api/debug/test-search?search=tabby"
```

#### Step 3: Restart Backend Server

```bash
npm run dev
```

#### Step 4: Test Frontend

1. Navigate to http://localhost:3000/cats
2. You should now see cat names on cards
3. Try searching for a cat name
4. Search should filter results in real-time

### What Was Fixed

#### Migration: `04_fix_all_available_cats_view.sql`

**Fixed Issues:**
- ❌ Removed `deleted_at` column checks (doesn't exist in schema)
- ✅ Fixed gender ENUM conversion (`Male` → `male`, `Female` → `female`)
- ✅ Ensured all columns match actual table structures
- ✅ Simplified view to only query `status = 'available'`

**New Schema:**
```sql
SELECT 
  c.name,              -- Now returns properly
  c.breed,             -- Searchable
  c.description,       -- Searchable
  c.medical_notes,     -- Searchable
  c.color,             -- Searchable
  c.age,               -- Searchable
  c.good_with_kids,    -- Filterable
  c.good_with_cats,    -- Filterable
  c.good_with_dogs,    -- Filterable
  ...
FROM cats c
WHERE c.status = 'available'  -- Simple, no deleted_at check
```

### Debug Endpoints Added

New endpoints for troubleshooting (development only):

```http
# View database columns
GET /api/debug/view-columns

# Get sample cats from view
GET /api/debug/sample-cats

# Test search functionality
GET /api/debug/test-search?search=tabby
```

### Common Issues & Solutions

#### Issue: "Unknown column 'deleted_at'"

**Cause**: Old view still active

**Solution**: Run migration 04
```bash
mysql -u root -p kelseys_cats < migrations/04_fix_all_available_cats_view.sql
```

#### Issue: Cat names show as "undefined" or blank

**Cause**: View not returning `name` column

**Solution**: 
1. Check debug endpoint: `curl http://localhost:5000/api/debug/sample-cats`
2. If empty, verify view exists: `SHOW FULL TABLES LIKE 'all_available_cats';`
3. Re-run migration 04

#### Issue: Search returns no results

**Cause**: SQL search failing or view empty

**Solution**:
1. Test direct SQL:
```sql
SELECT * FROM all_available_cats WHERE name LIKE '%test%' LIMIT 5;
```
2. If empty, check base tables:
```sql
SELECT COUNT(*) FROM cats WHERE status = 'available';
SELECT COUNT(*) FROM vfv_cats;
```
3. If base tables have data but view is empty, re-create view

#### Issue: Gender filter not working

**Cause**: Gender ENUM case sensitivity

**Solution**: Fixed in migration 04 - converts `Male`/`Female` to lowercase `male`/`female`

### Verification Checklist

- [ ] Migration 04 executed successfully
- [ ] View exists: `SHOW FULL TABLES LIKE 'all_available_cats';`
- [ ] View returns data: `SELECT * FROM all_available_cats LIMIT 1;`
- [ ] API returns cats: `curl http://localhost:5000/api/cats/all-available`
- [ ] Frontend shows cat names
- [ ] Search bar filters results
- [ ] Advanced filters work

### Testing the Fix

```bash
# 1. Test backend directly
curl http://localhost:5000/api/cats/all-available | jq '.featured_foster_cats[] | {id, name, breed}'

# 2. Test search
curl "http://localhost:5000/api/cats/all-available?search=tabby" | jq '.total'

# 3. Test filters
curl "http://localhost:5000/api/cats/all-available?gender=female&isSenior=1" | jq '.total'
```

### Database Schema Reference

**Cats Table (Featured Fosters):**
- `name` VARCHAR(100) ✅
- `age` VARCHAR(50)
- `gender` ENUM('Male', 'Female', 'Unknown')
- `breed` VARCHAR(100)
- `description` TEXT
- `medical_notes` TEXT
- `good_with_kids` BOOLEAN
- `good_with_cats` BOOLEAN
- `good_with_dogs` BOOLEAN
- `status` ENUM('available', 'pending', 'adopted')
- ❌ `deleted_at` - **DOES NOT EXIST**

**VFV Cats Table (Partner Fosters):**
- `name` VARCHAR(100) ✅
- `age_text` VARCHAR(20)
- `age_years` DECIMAL(3,1)
- `gender` VARCHAR(20)
- `breed` VARCHAR(100)
- `description` TEXT

### Still Having Issues?

1. Check server logs for SQL errors
2. Verify database connection
3. Run debug endpoints to see raw data
4. Check browser console for frontend errors
5. Ensure backend and frontend are running

### Contact

If issues persist after following this guide:
- Check GitHub Issues
- Review backend logs: `backend/logs/error.log`
- Test with curl commands above
