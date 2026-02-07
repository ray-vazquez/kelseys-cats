# Database-Backed Shelter Cat Scraper

## 🎉 What's Different?

We've upgraded from **in-memory caching** to **database storage** for Voice shelter cats!

### Before (In-Memory Cache)
- ❌ Cards took ~10 seconds to load (scraping on every first request)
- ❌ Cache lost on server restart
- ❌ No persistence

### After (Database Storage)
- ✅ **Instant loading** (~5ms from database)
- ✅ **Persistent storage** (survives restarts)
- ✅ **Manual scraping** (run when YOU want)
- ✅ **Correct badges** (🏠 Our Foster vs 🐾 Voice Shelter)

---

## 🚀 Quick Setup

### Option 1: Automated Script

```bash
cd backend
chmod +x scripts/setup-shelter-cats.sh
./scripts/setup-shelter-cats.sh
```

### Option 2: Manual Setup

#### 1. Run Database Migration

```bash
cd backend
mysql -u root -p kelseys_cats < migrations/create_vfv_cats_table.sql
```

This creates the `vfv_cats` table:
```sql
CREATE TABLE vfv_cats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  petfinder_id VARCHAR(50) UNIQUE,
  name VARCHAR(100) NOT NULL,
  age_text VARCHAR(20),
  age_years DECIMAL(3,1),
  breed VARCHAR(100),
  gender VARCHAR(20),
  main_image_url TEXT,
  petfinder_url TEXT,
  scraped_at TIMESTAMP,
  updated_at TIMESTAMP,
  ...
);
```

#### 2. Install Dependencies

```bash
npm install  # Installs puppeteer
```

#### 3. Start Server

```bash
npm start
```

#### 4. Run Initial Scrape (Admin Only)

**Login to get JWT token:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'
```

**Copy the token and scrape:**
```bash
curl -X POST http://localhost:3000/api/cats/scrape-shelter \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected output:**
```json
{
  "success": true,
  "message": "Shelter cats updated",
  "scraping": {
    "success": true,
    "added": 17,
    "updated": 0,
    "errors": 0,
    "total": 17
  },
  "cleanup": {
    "success": true,
    "deleted": 0
  }
}
```

---

## 📊 How It Works

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Frontend Request                   │
│            GET /api/cats/all-available              │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                Backend Controller                   │
│   1. Query foster cats from `cats` table            │
│   2. Query shelter cats from `vfv_cats` table       │
│   3. Deduplicate by name                            │
│   4. Return merged list                             │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                Response (< 10ms!)                   │
│   { foster_cats: [...], shelter_cats: [...] }       │
└─────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────┐
│         Separate Admin Scrape Process               │
│      POST /api/cats/scrape-shelter (admin)          │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              Puppeteer Scraper (~10s)               │
│   1. Launch headless Chrome                         │
│   2. Visit Petfinder search page                    │
│   3. Extract cat data from HTML                     │
│   4. Save/update in `vfv_cats` table                │
│   5. Cleanup old cats (adopted)                     │
└─────────────────────────────────────────────────────┘
```

### Database Storage Benefits

| Feature | In-Memory Cache | Database |
|---------|----------------|----------|
| **Load Time** | ~10s (scraping) | ~5ms (query) |
| **Persistence** | ❌ Lost on restart | ✅ Permanent |
| **Manual Control** | ❌ Auto-refresh | ✅ Admin triggered |
| **Development** | ❌ Slow iteration | ✅ Fast |
| **Reliability** | ⚠️ Flaky | ✅ Stable |

---

## 🔧 API Endpoints

### Public Endpoints

#### `GET /api/cats/all-available`
**Returns:** Foster + shelter cats (deduplicated)

```bash
curl http://localhost:3000/api/cats/all-available
```

**Response:**
```json
{
  "foster_cats": [
    {
      "id": 52,
      "name": "Felix",
      "age_years": 3,
      "source": "foster",
      "is_foster": true,
      ...
    }
  ],
  "shelter_cats": [
    {
      "id": 1,
      "name": "Mittens",
      "age_years": 5,
      "source": "voice_shelter",
      ...
    }
  ],
  "total": 25,
  "duplicates_removed": 2
}
```

#### `GET /api/cats/shelter`
**Returns:** Only shelter cats (no deduplication)

```bash
curl http://localhost:3000/api/cats/shelter
```

#### `GET /api/cats/shelter-info`
**Returns:** Database statistics

```bash
curl http://localhost:3000/api/cats/shelter-info
```

**Response:**
```json
{
  "total_cats": 17,
  "last_updated": "2026-02-07T21:45:00.000Z",
  "oldest_update": "2026-02-07T21:45:00.000Z",
  "needs_refresh": false
}
```

### Admin Endpoints (Require JWT)

#### `POST /api/cats/scrape-shelter`
**Action:** Scrape Petfinder and update database

```bash
curl -X POST http://localhost:3000/api/cats/scrape-shelter \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Shelter cats updated",
  "scraping": {
    "added": 3,
    "updated": 14,
    "errors": 0,
    "total": 17
  },
  "cleanup": {
    "deleted": 2
  }
}
```

---

## 📅 Maintenance Workflow

### When to Scrape

**Recommended:** Once per week

**Trigger scraping when:**
- Voice adds new cats to Petfinder
- Voice updates cat info (age, breed, photos)
- You want to remove adopted cats

### How to Scrape

**Option 1: Admin Panel** (Future Enhancement)
- Add a "Refresh Shelter Cats" button in admin UI

**Option 2: cURL Command** (Current)
```bash
curl -X POST http://localhost:3000/api/cats/scrape-shelter \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Option 3: Cron Job** (Production)
```bash
# Add to crontab (runs weekly on Sundays at 2 AM)
0 2 * * 0 curl -X POST https://yourdomain.com/api/cats/scrape-shelter -H "Authorization: Bearer $JWT_TOKEN"
```

### Cleanup Strategy

The scraper automatically:
1. **Updates existing cats** (if name/petfinder_id matches)
2. **Adds new cats**
3. **Deletes cats older than 7 days** (likely adopted)

---

## 🐛 Troubleshooting

### Issue: "Table doesn't exist"

**Cause:** Migration not run

**Solution:**
```bash
cd backend
mysql -u root -p kelseys_cats < migrations/create_vfv_cats_table.sql
```

### Issue: "Scraping returns 0 cats"

**Cause:** Petfinder HTML changed or network issue

**Solution:**
1. Check Petfinder manually: https://www.petfinder.com/search/pets-for-adoption/?shelter_id=NY1296&type=cat
2. Update selectors in `petfinderScraper.js` if needed
3. Check server logs for errors

### Issue: "Cards still show wrong badges"

**Cause:** Frontend caching

**Solution:**
```bash
# Clear browser cache or hard refresh
Chrome: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
```

### Issue: "Scraping takes too long"

**Cause:** Many cats or slow network

**Solution:** This is normal! Scraping takes 10-15 seconds. But since it's stored in database, **users never experience the slowness**.

---

## 📦 Database Schema

```sql
DESC vfv_cats;
```

| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | int | NO | PRI | NULL | auto_increment |
| petfinder_id | varchar(50) | YES | UNI | NULL | |
| name | varchar(100) | NO | MUL | NULL | |
| age_text | varchar(20) | YES | | NULL | |
| age_years | decimal(3,1) | YES | | NULL | |
| breed | varchar(100) | YES | | NULL | |
| gender | varchar(20) | YES | | NULL | |
| main_image_url | text | YES | | NULL | |
| petfinder_url | text | YES | | NULL | |
| description | text | YES | | NULL | |
| scraped_at | timestamp | YES | MUL | CURRENT_TIMESTAMP | |
| updated_at | timestamp | YES | | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |

---

## ✅ Badge Logic Fix

### Problem (Before)

Every card showed "🏠 Our Foster" because the logic was checking `cat.is_foster` which was undefined for shelter cats.

### Solution (After)

**Frontend (`CatsPage.jsx` line 259-262):**
```jsx
<SourceBadge 
  $variant={cat.source === 'foster' ? 'success' : 'info'}
>
  {cat.source === 'foster' ? '🏠 Our Foster' : '🐾 Voice Shelter'}
</SourceBadge>
```

**Backend:**
- Foster cats: `source: 'foster'`
- Shelter cats: `source: 'voice_shelter'`

---

## 📊 Comparison

| Metric | Before (Cache) | After (Database) |
|--------|---------------|------------------|
| **First load** | 10s | <10ms |
| **Subsequent loads** | 5ms (cached) | <10ms (always fast) |
| **Restart behavior** | Re-scrape (10s) | Instant (from DB) |
| **Development** | Slow iteration | Fast iteration |
| **Production** | Auto-refresh (6h) | Manual control |
| **Badge accuracy** | ❌ Wrong | ✅ Correct |

---

## 🚀 Production Deployment

### 1. Run Migration on Production DB

```bash
mysql -u $DB_USER -p $DB_NAME < migrations/create_vfv_cats_table.sql
```

### 2. Deploy Backend

```bash
git pull origin main
npm install
npm start
```

### 3. Initial Scrape

```bash
curl -X POST https://yourdomain.com/api/cats/scrape-shelter \
  -H "Authorization: Bearer $ADMIN_JWT"
```

### 4. Set Up Weekly Cron (Optional)

```bash
# Add to crontab
0 2 * * 0 curl -X POST https://yourdomain.com/api/cats/scrape-shelter -H "Authorization: Bearer $JWT_TOKEN"
```

---

## ✅ Checklist

- [ ] Pulled latest changes from repo
- [ ] Ran database migration
- [ ] Installed dependencies (`npm install`)
- [ ] Started server
- [ ] Ran initial scrape (admin)
- [ ] Verified `/api/cats/all-available` returns cats quickly
- [ ] Checked frontend shows correct badges
- [ ] Foster cats show "🏠 Our Foster"
- [ ] Shelter cats show "🐾 Voice Shelter"
- [ ] Page loads instantly

---

## 📚 Resources

- **Migration SQL:** `backend/migrations/create_vfv_cats_table.sql`
- **Scraper Service:** `backend/src/services/petfinderScraper.js`
- **Controller:** `backend/src/controllers/shelterCats.controller.js`
- **Frontend:** `frontend/src/pages/CatsPage.jsx`
- **Setup Script:** `backend/scripts/setup-shelter-cats.sh`

---

**Last Updated:** February 7, 2026
