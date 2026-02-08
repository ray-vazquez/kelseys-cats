# Adopt-a-Pet Integration Guide
## Featured Foster vs Partner Foster System

---

## 🎉 What's New?

We've implemented a complete **Featured Foster vs Partner Foster** system that:

- ✅ Scrapes Voice for the Voiceless cats from **Adopt-a-Pet** (not Petfinder)
- ✅ Uses **MySQL database view** for unified cat listing
- ✅ **Automatic deduplication** (if a cat is in your `cats` table, it won't appear in partner fosters)
- ✅ **Clear badge distinction**:
  - ⭐ **Featured Foster** - Cats at Kelsey's home
  - 🏘️ **Partner Foster** - Cats at other VFV foster homes

---

## 📊 System Architecture

```
┌────────────────────────────────────────────────────┐
│                Frontend Request                      │
│           GET /api/cats/all-available               │
└────────────────────────┬───────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────┐
│            Backend Controller                       │
│   Query: SELECT * FROM all_available_cats          │
└────────────────────────┬───────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────┐
│            MySQL Database View                      │
│   all_available_cats (auto-deduplication)          │
│                                                      │
│   SELECT FROM cats (status='available')            │
│   WHERE adoptapet_url IS NOT NULL                  │
│   → source: 'featured_foster'                     │
│                                                      │
│   UNION ALL                                         │
│                                                      │
│   SELECT FROM vfv_cats                              │
│   WHERE NOT IN (cats.adoptapet_id)                 │
│   → source: 'partner_foster'                      │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│       Separate Admin Scrape Process                │
│   POST /api/cats/scrape-partner-fosters (admin)    │
└──────────────────────┬─────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────┐
│         Puppeteer Scraper (~15s)                    │
│   1. Launch headless Chrome                        │
│   2. Visit Adopt-a-Pet VFV page                    │
│   3. Extract cat data from HTML                    │
│   4. Skip if already in cats table                 │
│   5. Save/update in vfv_cats table                 │
│   6. Cleanup old cats (adopted)                    │
└────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Setup

### **1. Run Database Migrations**

```bash
cd backend

# Step 1: Add adoptapet_id column to vfv_cats
mysql -u root -p kelseys_cats < migrations/add_adoptapet_id_to_vfv_cats.sql

# Step 2: Create unified view
mysql -u root -p kelseys_cats < migrations/create_all_available_cats_view.sql
```

### **2. Install Dependencies**

```bash
npm install  # Puppeteer already in package.json
```

### **3. Start Server**

```bash
npm start
```

### **4. Run Initial Scrape (Admin)**

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'

# Scrape (use token from login)
curl -X POST http://localhost:3000/api/cats/scrape-partner-fosters \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected output:**
```json
{
  "success": true,
  "message": "Partner foster cats updated from Adopt-a-Pet",
  "scraping": {
    "added": 12,
    "updated": 0,
    "skipped": 3,
    "errors": 0,
    "total": 15
  },
  "cleanup": {
    "deleted": 0
  }
}
```

---

## 🏷️ Badge System

### **Featured Foster** (⭐ Green Badge)

**Criteria:** Cat exists in `cats` table with `status = 'available'`

**Meaning:**
- Cat is physically at Kelsey's home
- Personal knowledge of cat's personality
- Can arrange meet-and-greets at home (by appointment)
- Direct communication with Kelsey

**Frontend Display:**
```jsx
<Badge $variant="success">⭐ Featured Foster</Badge>
```

### **Partner Foster** (🏘️ Blue Badge)

**Criteria:** Cat exists in `vfv_cats` table (NOT in `cats` table)

**Meaning:**
- Cat is at another VFV foster home
- Contact coordinated through VFV
- Meet-and-greets arranged by foster parent
- Same adoption standards

**Frontend Display:**
```jsx
<Badge $variant="info">🏘️ Partner Foster</Badge>
```

---

## 🔄 Deduplication Logic

### **How It Works**

The database view automatically deduplicates cats using Adopt-a-Pet IDs:

```sql
-- In the view
WHERE NOT EXISTS (
  SELECT 1 FROM cats c 
  WHERE c.status = 'available' 
  AND c.adoptapet_url IS NOT NULL
  AND SUBSTRING_INDEX(SUBSTRING_INDEX(c.adoptapet_url, '/pet/', -1), '-', 1) = v.adoptapet_id
)
```

### **Example Scenario**

**Adopt-a-Pet has:**
- Felix (ID: 12345)
- Whiskers (ID: 67890)
- Luna (ID: 11111)

**Your `cats` table:**
- Felix (adoptapet_url: `https://www.adoptapet.com/pet/12345-felix-...`)
- Shadow (no adoptapet_url)

**Result from view:**
```json
{
  "featured_foster_cats": [
    {"name": "Felix", "is_featured_foster": true},
    {"name": "Shadow", "is_featured_foster": true}
  ],
  "partner_foster_cats": [
    {"name": "Whiskers", "is_partner_foster": true},
    {"name": "Luna", "is_partner_foster": true}
  ]
}
```

**Felix is NOT duplicated** because the view detects matching Adopt-a-Pet ID!

---

## 📝 Workflow: Adding a Cat to Your Home

### **Scenario:** You receive a new foster cat from VFV

**Step 1:** Cat appears on website as **Partner Foster** (from scraper)

**Step 2:** Cat arrives at your home

**Step 3:** Add to your `cats` table:
```sql
INSERT INTO cats (
  name, 
  adoptapet_url, 
  age_years, 
  breed, 
  status, 
  main_image_url
) VALUES (
  'Felix',
  'https://www.adoptapet.com/pet/12345-felix-schenectady-ny',
  2,
  'Domestic Shorthair',
  'available',
  'https://...'
);
```

**Step 4:** Next page load:
- View detects `adoptapet_id` match (12345)
- Removes Felix from `vfv_cats` results
- Shows Felix only as **Featured Foster** ✅

---

## 📊 API Endpoints

### **Public Endpoints**

#### `GET /api/cats/all-available`
**Returns:** Featured + partner fosters (deduplicated via view)

```bash
curl http://localhost:3000/api/cats/all-available
```

**Response:**
```json
{
  "featured_foster_cats": [
    {
      "id": 52,
      "name": "Felix",
      "is_featured_foster": true,
      "is_partner_foster": false,
      "source": "featured_foster",
      "from_table": "cats"
    }
  ],
  "partner_foster_cats": [
    {
      "id": 1,
      "name": "Whiskers",
      "is_featured_foster": false,
      "is_partner_foster": true,
      "source": "partner_foster",
      "from_table": "vfv_cats"
    }
  ],
  "total": 25,
  "featured_count": 8,
  "partner_count": 17
}
```

#### `GET /api/cats/partner-fosters`
**Returns:** Only partner fosters

#### `GET /api/cats/partner-fosters-info`
**Returns:** Database statistics

### **Admin Endpoints**

#### `POST /api/cats/scrape-partner-fosters`
**Action:** Scrape Adopt-a-Pet and update database

```bash
curl -X POST http://localhost:3000/api/cats/scrape-partner-fosters \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🌐 Frontend Changes

### **Hero Subtitle**
Updated from:
> "Find your perfect feline companion from our foster home and Voice for the Voiceless"

To:
> "Find your perfect feline companion from cats in our care and other VFV foster homes"

### **Stats Bar**
```jsx
<StatsBar>
  <StatItem>
    <span className="stat-value">8</span>
    <span className="stat-label">⭐ Featured Fosters</span>
  </StatItem>
  <StatItem>
    <span className="stat-value">17</span>
    <span className="stat-label">🏘️ Partner Fosters</span>
  </StatItem>
</StatsBar>
```

### **Badge Logic**
```jsx
<SourceBadge 
  $variant={cat.is_featured_foster ? 'success' : 'info'}
>
  {cat.is_featured_foster ? '⭐ Featured Foster' : '🏘️ Partner Foster'}
</SourceBadge>
```

---

## 📚 About Page

Created `/about` page explaining:
- Voice for the Voiceless relationship
- Badge distinction
- Benefits of Featured Fosters
- How to meet cats
- Kelsey's brand as trusted foster home

**Key sections:**
1. Mission statement
2. Badge explanations with visual examples
3. Benefits of Featured Fosters
4. VFV commitment
5. How to schedule meet-and-greets

---

## 🛠️ Database Schema

### **cats table** (Unchanged)
```sql
CREATE TABLE cats (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  adoptapet_url VARCHAR(500),  -- For deduplication
  status ENUM('available', 'adopted'),
  ...
);
```

### **vfv_cats table** (Updated)
```sql
CREATE TABLE vfv_cats (
  id INT PRIMARY KEY,
  adoptapet_id VARCHAR(50) UNIQUE,  -- NEW: For deduplication
  adoptapet_url TEXT,
  name VARCHAR(100),
  age_years DECIMAL(3,1),
  breed VARCHAR(100),
  ...
);
```

### **all_available_cats view** (New)
```sql
CREATE VIEW all_available_cats AS
SELECT 
  *,
  'featured_foster' as source,
  TRUE as is_featured_foster
FROM cats WHERE status = 'available'

UNION ALL

SELECT 
  *,
  'partner_foster' as source,
  TRUE as is_partner_foster
FROM vfv_cats
WHERE NOT EXISTS (
  SELECT 1 FROM cats 
  WHERE adoptapet_id matches
);
```

---

## ✅ Testing Checklist

- [ ] Run migrations successfully
- [ ] Scrape Adopt-a-Pet (should return 10-20 cats)
- [ ] Check `/api/cats/all-available` returns both types
- [ ] Add a cat to `cats` table with `adoptapet_url`
- [ ] Verify cat only shows as Featured Foster (not duplicated)
- [ ] Check frontend badges display correctly
- [ ] Verify stats bar shows correct counts
- [ ] Visit `/about` page
- [ ] Test meet-and-greet info in About page

---

## 🐛 Troubleshooting

### Issue: "View doesn't exist"
**Solution:** Run `create_all_available_cats_view.sql`

### Issue: "Scraper returns 0 cats"
**Solution:** 
1. Check Adopt-a-Pet URL still works
2. Update selectors in `adoptAPetScraper.js` if page structure changed
3. Check server logs for errors

### Issue: "Cats are duplicated"
**Solution:** 
1. Check `adoptapet_url` format in `cats` table
2. Verify Adopt-a-Pet ID extraction logic
3. Re-run view creation migration

---

## 📌 Future Enhancements (Earmarked)

### **Ads Disclaimer**
Add to footer:
> "Small commissions earned from ads are used to cover the cost of fostering, including food, litter, and veterinary care."

---

**Last Updated:** February 7, 2026
