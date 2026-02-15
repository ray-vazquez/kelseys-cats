# Quick Migration Guide

## 🐛 Current Issue: Search not working & Names not showing

### Quick Fix (Run This Now!)

```bash
# From project root
cd backend

# Apply the fix
mysql -u your_username -p your_database_name < migrations/04_fix_all_available_cats_view.sql

# Restart server
npm run dev
```

### What Migration 04 Fixes

✅ Removes `deleted_at` column reference (doesn't exist)
✅ Fixes gender ENUM case conversion
✅ Enables search across all fields
✅ Returns cat names properly
✅ Makes filters work correctly

## All Migrations (In Order)

### 1. `01_create_base_schema.sql` (Base Tables)
Creates cats, tags, users, alumni tables

```bash
mysql -u root -p kelseys_cats < migrations/01_create_base_schema.sql
```

### 2. `02_create_admin_users_table.sql` (Admin Auth)
Creates admin_users table for authentication

```bash
mysql -u root -p kelseys_cats < migrations/02_create_admin_users_table.sql
```

### 3. `create_vfv_cats_table.sql` (Partner Fosters)
Creates vfv_cats table for partner foster cats

```bash
mysql -u root -p kelseys_cats < migrations/create_vfv_cats_table.sql
```

### 4. `create_all_available_cats_view.sql` (Original View)
⚠️ **SKIP THIS** - Has bugs, use migration 04 instead

### 5. `03_update_all_available_cats_view.sql` (Enhanced View)
⚠️ **SKIP THIS** - References non-existent column, use migration 04 instead

### 6. ⭐ `04_fix_all_available_cats_view.sql` (CURRENT FIX)
**👉 RUN THIS ONE!**

Fixes all issues with the view

```bash
mysql -u root -p kelseys_cats < migrations/04_fix_all_available_cats_view.sql
```

## Verify the Fix

```bash
# Test the API
curl http://localhost:5000/api/debug/sample-cats

# Should return cats with names:
# {
#   "success": true,
#   "count": 5,
#   "cats": [
#     { "id": 1, "name": "Fluffy", ... }
#   ]
# }
```

## Common Commands

```bash
# Check if view exists
mysql -u root -p -e "SHOW FULL TABLES FROM kelseys_cats LIKE 'all_available_cats';"

# View structure
mysql -u root -p -e "DESCRIBE kelseys_cats.all_available_cats;"

# Test query
mysql -u root -p -e "SELECT id, name, breed FROM kelseys_cats.all_available_cats LIMIT 5;"

# Drop view (if needed to start fresh)
mysql -u root -p -e "DROP VIEW IF EXISTS kelseys_cats.all_available_cats;"
```

## Database Connection Info

Make sure your `.env` file has:

```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=kelseys_cats
```

## Still Not Working?

See [TROUBLESHOOTING.md](../../TROUBLESHOOTING.md) in project root.
