# Migration Guide for Kelsey's Cats

Complete guide for creating, running, and managing database migrations.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Available Scripts](#available-scripts)
3. [Creating New Migrations](#creating-new-migrations)
4. [Migration Workflow](#migration-workflow)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Run All Migrations

```bash
cd backend
npm run migrate
```

### Run Single Migration

```bash
npm run migrate:vfv-table     # Create vfv_cats table
npm run migrate:view          # Create/update all_available_cats view
npm run migrate:adoptapet-url # Add adoptapet_url column
```

### List Available Migrations

```bash
npm run migrate:list
```

---

## Available Scripts

### Core Migration Scripts

| Script | Description |
|--------|-------------|
| `npm run migrate` | Run all migrations in order |
| `npm run migrate:all` | Alias for `migrate` |
| `npm run migrate:bash` | Bash version (requires mysql CLI) |
| `npm run migrate:list` | List all migration files |

### Individual Migration Scripts

| Script | Migration File | Purpose |
|--------|---------------|----------|
| `npm run migrate:vfv-table` | `create_vfv_cats_table.sql` | Creates `vfv_cats` table for partner foster cats |
| `npm run migrate:view` | `add_featured_to_view.sql` | Creates `all_available_cats` unified view |
| `npm run migrate:adoptapet-url` | `add_adoptapet_url.sql` | Adds `adoptapet_url` column to `cats` table |
| `npm run migrate:adoptapet-id` | `add_adoptapet_id_to_vfv_cats.sql` | Adds `adoptapet_id` column for deduplication |
| `npm run migrate:additional-images` | `add_additional_images_column.sql` | Adds `additional_images` JSON column |

---

## Creating New Migrations

### Step 1: Copy the Template

```bash
cp backend/migrations/TEMPLATE.sql backend/migrations/your_migration_name.sql
```

**Naming Convention:** `action_target.sql`
- ✅ Good: `add_age_column.sql`, `create_users_table.sql`, `update_cats_view.sql`
- ❌ Bad: `migration1.sql`, `fix.sql`, `temp.sql`

### Step 2: Write Your Migration

Edit the new file:

```sql
-- Migration: Add age_years column to cats table
-- Purpose: Store cat age in years for better filtering
-- Date: 2026-02-14
-- Author: Your Name

ALTER TABLE cats ADD COLUMN age_years INT DEFAULT NULL;
```

### Step 3: Add to Migration Runner

Edit `backend/scripts/run-migrations.js`:

```javascript
const MIGRATIONS = [
  'create_vfv_cats_table.sql',
  'add_featured_to_view.sql',
  'your_migration_name.sql'  // Add here
];
```

### Step 4: Add NPM Script

Edit `backend/package.json`:

```json
"scripts": {
  "migrate:your-feature": "node scripts/migrations/run-single-migration.js your_migration_name.sql"
}
```

### Step 5: Test Locally

```bash
npm run migrate:your-feature
```

### Step 6: Commit

```bash
git add backend/migrations/your_migration_name.sql
git add backend/scripts/run-migrations.js
git add backend/package.json
git commit -m "Add migration: your feature description"
git push origin main
```

---

## Migration Workflow

### For New Features

```mermaid
graph TD
    A[Design Schema Change] --> B[Create Migration File]
    B --> C[Test Locally]
    C --> D[Update run-migrations.js]
    D --> E[Add NPM Script]
    E --> F[Commit & Push]
    F --> G[Team Runs npm run migrate]
```

### For Team Members

```bash
# 1. Pull latest code
git pull origin main

# 2. Run migrations
cd backend
npm run migrate

# 3. Restart server
npm run dev
```

---

## Best Practices

### ✅ DO

1. **Always use idempotent SQL**
   ```sql
   CREATE TABLE IF NOT EXISTS...
   DROP VIEW IF EXISTS...
   ALTER TABLE ADD COLUMN IF NOT EXISTS... (use conditional logic)
   ```

2. **Add descriptive headers**
   ```sql
   -- Migration: Clear, concise description
   -- Purpose: Why this change is needed
   -- Date: When it was created
   ```

3. **Test before committing**
   ```bash
   npm run migrate:your-feature  # Test single migration
   npm run migrate               # Test with all migrations
   ```

4. **Use meaningful names**
   - `add_status_enum.sql` ✅
   - `migration_03.sql` ❌

5. **Document breaking changes**
   - Add comments about data migration needs
   - Note any required backfills

### ❌ DON'T

1. **Don't modify existing migrations**
   - Create a new migration instead
   - Existing migrations may have already run in production

2. **Don't use hardcoded values**
   ```sql
   -- Bad
   INSERT INTO cats VALUES (1, 'Fluffy', ...);
   
   -- Good
   ALTER TABLE cats ADD COLUMN name VARCHAR(100);
   ```

3. **Don't forget to handle rollback scenarios**
   - Consider how to undo the migration if needed
   - Document any manual steps required

4. **Don't mix concerns**
   - One migration = one logical change
   - Don't combine unrelated schema changes

---

## Common Migration Patterns

### Add Column

```sql
-- Check if column exists before adding
SET @column_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'cats' 
  AND COLUMN_NAME = 'new_column'
);

SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE cats ADD COLUMN new_column VARCHAR(100)',
  'SELECT "Column already exists"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
```

### Create Table

```sql
CREATE TABLE IF NOT EXISTS new_table (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Create/Update View

```sql
DROP VIEW IF EXISTS view_name;

CREATE VIEW view_name AS
SELECT 
  id,
  name,
  status
FROM cats
WHERE status = 'available';
```

### Add Index

```sql
-- Check if index exists
SET @index_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'cats'
  AND INDEX_NAME = 'idx_status'
);

SET @sql = IF(
  @index_exists = 0,
  'CREATE INDEX idx_status ON cats(status)',
  'SELECT "Index already exists"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
```

---

## Troubleshooting

### Connection Errors

**Error:** `ECONNREFUSED`

**Solution:**
```bash
# Make sure MySQL is running
# Windows: net start MySQL80
# Mac: brew services start mysql
# Linux: sudo systemctl start mysql
```

### Column Already Exists

**Error:** `Duplicate column name`

**Solution:** Migration already ran. This is okay - the script will continue.

### View Doesn't Exist

**Error:** `Table 'kelseys_cats.all_available_cats' doesn't exist`

**Solution:**
```bash
npm run migrate:vfv-table  # Create table first
npm run migrate:view       # Then create view
```

### Wrong Column Name

**Error:** `Unknown column 'gender' in 'field list'`

**Solution:** Run table creation migration first:
```bash
npm run migrate:vfv-table
```

### Permission Denied

**Error:** `Access denied for user`

**Solution:** Check DB_URL environment variable:
```bash
# Set correct credentials
export DB_URL=mysql://your_user:your_password@localhost:3306/kelseys_cats
```

---

## Migration Checklist

Before creating a migration:

- [ ] Migration file named clearly (`action_target.sql`)
- [ ] Header filled out with description, purpose, date
- [ ] SQL is idempotent (can run multiple times safely)
- [ ] Tested locally with `npm run migrate:your-feature`
- [ ] Added to `MIGRATIONS` array in `run-migrations.js`
- [ ] Added NPM script in `package.json`
- [ ] Committed with descriptive message
- [ ] Team notified to run migrations after pulling

---

## Need Help?

Check these resources:

1. **Migration README:** `backend/migrations/README.md`
2. **Template File:** `backend/migrations/TEMPLATE.sql`
3. **Existing Migrations:** Study successful migrations in `backend/migrations/`
4. **Database Schema:** Check current tables with `SHOW TABLES;` and `DESCRIBE table_name;`

---

**Remember:** Migrations are permanent. Test thoroughly before committing!
