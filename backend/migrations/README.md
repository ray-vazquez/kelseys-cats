# Database Migrations

## Current Migration Files

This folder contains **clean, safe migrations** that are tracked and won't run multiple times.

### Active Migrations

1. **01_create_base_schema.sql** - Creates all core tables (cats, users, tags, alumni)
2. **create_vfv_cats_table.sql** - Creates Voice for the Voiceless partner cats table
3. **create_all_available_cats_view.sql** - Creates unified view of all available cats

### Supporting Files

- **TEMPLATE.sql** - Template for creating new migrations
- **MIGRATION_GUIDE.md** - Detailed guide for creating migrations

## Running Migrations

### Safe Migration Runner (RECOMMENDED)

```bash
# Run all pending migrations
npm run migrate

# This uses scripts/run-migrations-safe.js which:
# ✅ Tracks which migrations have run
# ✅ Only runs new migrations
# ✅ Won't break your database
```

### Other Migration Commands

```bash
# Reset migration tracking (if needed)
npm run migrate:reset

# List all users
npm run list-users

# Create admin user
npm run create-admin
```

## Fresh Database Setup

If you need to start completely fresh:

```bash
# WARNING: This drops ALL tables and data!
mysql -u root -p kelseys_cats < scripts/fresh-start.sql
node scripts/create-admin.js
```

## Migration Tracking

Migrations are tracked in the `schema_migrations` table. Once a migration runs successfully, it won't run again.

### Check Migration Status

```bash
node scripts/run-migrations-safe.js
```

This will show:
- ✅ Applied migrations (already run)
- ⏳ Pending migrations (will be run)

## Creating New Migrations

1. Copy `TEMPLATE.sql`
2. Name it descriptively: `add_feature_name.sql`
3. Write your migration SQL
4. Run `npm run migrate`

## What Was Cleaned Up

The following old/unsafe migrations were removed:
- ❌ `00_cleanup_view.sql` - Dropped view every time (dangerous)
- ❌ `add_additional_images_column.sql` - Already in base schema
- ❌ `add_adoptapet_id_to_vfv_cats.sql` - Already in vfv_cats table
- ❌ `add_adoptapet_url.sql` - Already in base schema
- ❌ `add_featured_to_view.sql` - Superseded by create_all_available_cats_view
- ❌ `add_vfv_to_view.sql` - Superseded by create_all_available_cats_view

## Notes

- ✅ All migrations are MySQL-compatible
- ✅ No Petfinder references (uses Adopt-a-Pet)
- ✅ Safe to run multiple times (idempotent where possible)
- ✅ Tracked in `schema_migrations` table

## Troubleshooting

If a migration fails:

1. Check the error message
2. Fix the migration file
3. Run `npm run migrate:reset` to mark it as not applied
4. Run `npm run migrate` again

Or use the fresh start script if needed.
