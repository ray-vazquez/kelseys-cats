# Database Migrations

This directory contains SQL migration files for the Kelsey's Cats database.

## Quick Start

### Automated Migration Runner (Recommended)

```bash
cd backend
npm run migrate
```

This will:
- Prompt for your MySQL password
- Run all migrations in the correct order
- Verify the database view was created successfully
- Show statistics about available cats

### Manual Migration

If you prefer to run migrations manually:

```bash
# From project root
mysql -u root -p kelseys_cats < backend/migrations/create_vfv_cats_table.sql
mysql -u root -p kelseys_cats < backend/migrations/add_featured_to_view.sql
```

### List Available Migrations

```bash
npm run migrate:list
```

## Migration Files

### Core Schema

1. **`create_vfv_cats_table.sql`**
   - Creates `vfv_cats` table for Voice for the Voiceless partner foster cats
   - Stores scraped Petfinder data for faster queries
   - Required before creating the unified view

2. **`add_featured_to_view.sql`** ⭐ **Latest Version**
   - Creates `all_available_cats` view that unifies foster cats and partner cats
   - Includes `featured` column for homepage spotlight filtering
   - Automatically deduplicates cats that appear in both sources
   - Maps column names for consistency (gender→sex, description→temperament)

### Historical Migrations

3. **`create_all_available_cats_view.sql`** (Superseded by #2)
   - Original view creation without `featured` column
   - Do not run this - use `add_featured_to_view.sql` instead

4. **`add_adoptapet_url.sql`**
   - Adds `adoptapet_url` column to `cats` table
   - Allows linking to Adopt-a-Pet listings

5. **`add_adoptapet_id_to_vfv_cats.sql`**
   - Adds `adoptapet_id` column to `vfv_cats` for deduplication

6. **`add_additional_images_column.sql`**
   - Adds `additional_images` JSON column to `cats` table
   - Stores multiple image URLs per cat

## Database Schema Overview

### Tables

- **`cats`** - Kelsey's featured foster cats
  - Columns: id, name, age_years, sex, breed, temperament, featured, status, etc.
  - `featured = 1` cats appear on homepage spotlight
  - `status = 'available'` for adoptable cats
  - Soft-delete support via `deleted_at`

- **`vfv_cats`** - Voice for the Voiceless partner foster cats
  - Scraped from Petfinder API
  - Stored locally for faster queries
  - Auto-updated via scraper cron job

### Views

- **`all_available_cats`** - Unified query of both tables
  - Combines `cats` (featured fosters) + `vfv_cats` (partner fosters)
  - Automatically deduplicates by `adoptapet_id`
  - Adds `source` field: `'featured_foster'` or `'partner_foster'`
  - Used by `/api/cats/all-available` endpoint

## Column Mapping

The view normalizes column names across tables:

| View Column     | cats table      | vfv_cats table  |
|-----------------|-----------------|------------------|
| sex             | sex             | gender          |
| temperament     | temperament     | description     |
| adoptapet_url   | adoptapet_url   | petfinder_url   |
| adoptapet_id    | (derived)       | petfinder_id    |

## Verification

After running migrations, verify the view exists:

```sql
USE kelseys_cats;

-- Check view exists
SHOW TABLES LIKE 'all_available_cats';

-- View structure
DESCRIBE all_available_cats;

-- Count by source
SELECT source, COUNT(*) as count 
FROM all_available_cats 
GROUP BY source;

-- Check featured cats (should be 12)
SELECT id, name, featured, source 
FROM all_available_cats 
WHERE featured = 1;
```

## Troubleshooting

### "Table doesn't exist" errors

1. **Run migrations**: `npm run migrate`
2. **Restart backend**: `npm run dev`
3. **Check database**: Verify `all_available_cats` view exists

### "Column not found" errors

Make sure you're running the **latest** `add_featured_to_view.sql`, not the old `create_all_available_cats_view.sql`.

### Migration runner fails

**On Windows with Git Bash:**
```bash
bash backend/scripts/run-migrations.sh
```

**Manual alternative:**
```bash
mysql -u root -p kelseys_cats < backend/migrations/create_vfv_cats_table.sql
mysql -u root -p kelseys_cats < backend/migrations/add_featured_to_view.sql
```

## Development Notes

### Adding New Migrations

1. Create SQL file in `backend/migrations/`
2. Use descriptive naming: `add_feature_name.sql` or `modify_table_name.sql`
3. Include `-- Migration:` comment header with purpose and date
4. Add to `run-migrations.sh` MIGRATIONS array
5. Test on local database before committing

### Schema Changes

If you modify the `cats` or `vfv_cats` table structure:

1. Update the corresponding table migration
2. **Recreate the view** in `add_featured_to_view.sql`
3. Update this README with column mapping changes
4. Test that `/api/cats/all-available` still works

## Additional Scripts

- **`backend/scripts/update-admin-password.js`** - Reset admin user password
- **`backend/scripts/run-migrations.sh`** - Migration runner (used by `npm run migrate`)

## Support

For migration issues, check:
1. MySQL is running: `mysql -u root -p -e "SELECT 1"`
2. Database exists: `mysql -u root -p -e "SHOW DATABASES LIKE 'kelseys_cats'"`
3. Correct credentials in `.env`: `DB_URL=mysql://user:pass@localhost:3306/kelseys_cats`
