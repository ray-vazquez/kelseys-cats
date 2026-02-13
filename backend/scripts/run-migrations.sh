#!/bin/bash

# Migration runner for Kelsey's Cats database
# Usage: npm run migrate

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get database credentials from environment or use defaults
DB_USER=${DB_USER:-root}
DB_NAME=${DB_NAME:-kelseys_cats}

echo -e "${YELLOW}Kelsey's Cats - Database Migration Runner${NC}"
echo -e "${YELLOW}==========================================${NC}\n"

# Check if MySQL is available
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}Error: mysql command not found. Please install MySQL client.${NC}"
    exit 1
fi

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MIGRATIONS_DIR="$SCRIPT_DIR/../migrations"

# Check if migrations directory exists
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo -e "${RED}Error: Migrations directory not found at $MIGRATIONS_DIR${NC}"
    exit 1
fi

echo -e "${YELLOW}Database:${NC} $DB_NAME"
echo -e "${YELLOW}User:${NC} $DB_USER"
echo -e "${YELLOW}Migrations directory:${NC} $MIGRATIONS_DIR\n"

# Prompt for password
read -sp "Enter MySQL password for $DB_USER: " DB_PASS
echo -e "\n"

# Test database connection
echo -e "${YELLOW}Testing database connection...${NC}"
if ! mysql -u"$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME" 2>/dev/null; then
    echo -e "${RED}Error: Cannot connect to database $DB_NAME${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Connected successfully${NC}\n"

# List of migrations to run in order
MIGRATIONS=(
    "create_vfv_cats_table.sql"
    "add_featured_to_view.sql"
)

echo -e "${YELLOW}Running migrations...${NC}\n"

# Run each migration
for migration in "${MIGRATIONS[@]}"; do
    migration_file="$MIGRATIONS_DIR/$migration"
    
    if [ ! -f "$migration_file" ]; then
        echo -e "${RED}✗ Migration file not found: $migration${NC}"
        continue
    fi
    
    echo -e "${YELLOW}→${NC} Applying: $migration"
    
    if mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$migration_file" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Successfully applied: $migration\n"
    else
        echo -e "${RED}✗${NC} Failed to apply: $migration"
        echo -e "${RED}  This might be okay if the migration was already applied.${NC}\n"
    fi
done

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Migration process complete!${NC}"
echo -e "${GREEN}=========================================${NC}\n"

# Verify the view exists
echo -e "${YELLOW}Verifying all_available_cats view...${NC}"
if mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "DESCRIBE all_available_cats" &>/dev/null; then
    echo -e "${GREEN}✓ all_available_cats view exists${NC}\n"
    
    # Show view statistics
    echo -e "${YELLOW}View statistics:${NC}"
    mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SELECT source, COUNT(*) as count FROM all_available_cats GROUP BY source" 2>/dev/null
    echo ""
else
    echo -e "${RED}✗ all_available_cats view not found${NC}\n"
fi

echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Restart your backend server: ${GREEN}npm run dev${NC}"
echo -e "  2. Visit homepage: ${GREEN}http://localhost:5173${NC}"
echo -e "  3. Check featured cats are displayed\n"
