#!/bin/bash
# Setup script for Voice shelter cats database integration
# Run this after pulling the latest changes

set -e

echo "🐾 Setting up Voice Shelter Cats Database..."
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Please run this script from the backend/ directory"
  exit 1
fi

# Step 1: Run database migration
echo "📊 Step 1: Creating vfv_cats table..."
mysql -u root -p kelseys_cats < migrations/create_vfv_cats_table.sql

if [ $? -eq 0 ]; then
  echo "✅ Table created successfully"
else
  echo "❌ Failed to create table"
  exit 1
fi

echo ""

# Step 2: Install dependencies
echo "📦 Step 2: Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
  echo "✅ Dependencies installed"
else
  echo "❌ Failed to install dependencies"
  exit 1
fi

echo ""

# Step 3: Start server
echo "🚀 Step 3: Starting server..."
echo "   (Server will start in background)"
npm start &
SERVER_PID=$!

# Wait for server to start
echo "   Waiting for server to start..."
sleep 5

echo ""

# Step 4: Run initial scrape
echo "🔍 Step 4: Scraping initial shelter cat data..."
echo "   (This may take 10-15 seconds)"
echo ""

curl -X POST http://localhost:3000/api/cats/scrape-shelter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  --silent --show-error | jq '.'

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Initial scrape complete!"
else
  echo ""
  echo "⚠️  Scrape failed - you may need to run it manually with admin credentials"
  echo "   See instructions below."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. ✅ vfv_cats table created"
echo "2. ✅ Puppeteer installed"
echo "3. ✅ Server running (PID: $SERVER_PID)"
echo ""
echo "🔧 To manually scrape shelter cats (admin only):"
echo ""
echo "   curl -X POST http://localhost:3000/api/cats/scrape-shelter \\"
echo "     -H 'Authorization: Bearer YOUR_ADMIN_JWT_TOKEN'"
echo ""
echo "📊 To check shelter cat database:"
echo ""
echo "   curl http://localhost:3000/api/cats/shelter-info"
echo ""
echo "🌐 Frontend: http://localhost:3001/cats"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
