# Petfinder API Integration Setup Guide

## 🎉 What You're Getting

A **beautiful, unified cat grid** that merges:
- ✅ Your foster cats (custom design, full control)
- ✅ Voice for the Voiceless shelter cats (via Petfinder API)
- ✅ **Automatic deduplication** (no duplicate cats!)
- ✅ **Smart badges** (🏠 Our Foster vs 🐾 Voice Shelter)
- ✅ **Single seamless experience** (no clunky iframe!)

---

## 📋 Prerequisites

1. Voice for the Voiceless is already on Petfinder
   - Organization ID: **NY1296**
   - URL: https://www.petfinder.com/member/us/ny/syracuse/voice4thevoiceless-ny1296/

2. You need a FREE Petfinder API account

---

## 🔑 Step 1: Get Petfinder API Credentials

### 1.1 Create Petfinder Developer Account

1. Go to **https://www.petfinder.com/developers/**
2. Click **"Get an API Key"**
3. Sign up with your email
4. Fill out the application form:
   - **Organization Name**: Kelsey's Cats Foster Home
   - **Website URL**: https://kelseys-cats.com (or your actual URL)
   - **Application Name**: Kelsey's Cats Website Integration
   - **Description**: 
     ```
     Integration to display adoptable cats from Voice for the Voiceless 
     (Organization ID: NY1296) on our foster home website. We are fostering 
     cats on behalf of Voice for the Voiceless and want to show both our 
     foster cats and other available shelter cats in a unified interface.
     ```

5. Submit application
6. **You'll receive your API keys via email** (usually within 24 hours)

### 1.2 Save Your API Keys

You'll receive:
- **API Key** (Client ID) - e.g., `AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`
- **Secret** - e.g., `1234567890AbCdEfGhIjKlMnOpQrStUvWxYz`

⚠️ **Keep these SECRET!** Never commit them to GitHub.

---

## ⚙️ Step 2: Configure Backend

### 2.1 Update `.env` File

Add your Petfinder credentials to `backend/.env`:

```bash
# Database
DB_URL=mysql://root:root@localhost:3306/kelseys_cats

# JWT
JWT_SECRET=your-secret-key

# Petfinder API
PETFINDER_API_KEY=your_actual_api_key_here
PETFINDER_SECRET=your_actual_secret_here
```

### 2.2 Verify Configuration

Check that `backend/src/config/env.js` includes:

```javascript
export const env = {
  // ...
  PETFINDER_API_KEY: process.env.PETFINDER_API_KEY || '',
  PETFINDER_SECRET: process.env.PETFINDER_SECRET || ''
};
```

✅ Already done in the codebase!

---

## 🚀 Step 3: Test the Integration

### 3.1 Start Backend

```bash
cd backend
npm install  # if you haven't already
npm start
```

### 3.2 Test API Endpoints

**Test 1: Get all available cats (foster + shelter)**
```bash
curl http://localhost:3000/api/cats/all-available
```

**Expected response:**
```json
{
  "foster_cats": [
    {
      "id": 52,
      "name": "Felix",
      "age_years": 3,
      "breed": "Tabby",
      "source": "foster",
      "is_foster": true,
      ...
    }
  ],
  "shelter_cats": [
    {
      "petfinder_id": "12345678",
      "name": "Mittens",
      "age_years": 5,
      "breed": "Domestic Shorthair",
      "source": "voice_shelter",
      "adoptapet_url": "https://www.petfinder.com/cat/...",
      ...
    }
  ],
  "total": 15,
  "duplicates_removed": 2
}
```

**Test 2: Get shelter cats only**
```bash
curl http://localhost:3000/api/cats/shelter
```

**Test 3: Check cache status** (admin only)
```bash
curl http://localhost:3000/api/cats/cache-info \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3.3 Start Frontend

```bash
cd frontend
npm install  # if you haven't already
npm start
```

Visit **http://localhost:3001/cats** (or your dev port)

---

## ✅ What You Should See

### Stats Bar (Top of page)
```
┌─────────────────────────────────────────────────┐
│   10              15              25            │
│ 🏠 Our Foster   🐾 Voice Shelter   Total        │
└─────────────────────────────────────────────────┘
```

### Unified Cat Grid
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 🏠 Our Foster│  │ 🐾 Shelter   │  │ 🏠 Our Foster│
│              │  │              │  │              │
│   Felix      │  │   Mittens    │  │   Whiskers   │
│   3 years    │  │   5 years    │  │   12 years   │
│              │  │              │  │              │
│ [View Details]  │ [View on     │  │ [View Details]
│              │  │  Petfinder→] │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Filters
- ☑️ Show senior cats only
- ☑️ Include cats from Voice for the Voiceless shelter

---

## 🎨 How It Works

### Backend Flow

```mermaid
sequenceDiagram
    participant Frontend
    participant Backend
    participant Database
    participant Petfinder
    participant Cache

    Frontend->>Backend: GET /api/cats/all-available
    Backend->>Database: SELECT * FROM cats WHERE status='available'
    Database-->>Backend: Your foster cats [10]
    
    Backend->>Cache: Check cached shelter cats
    alt Cache valid (< 6 hours)
        Cache-->>Backend: Cached shelter cats [17]
    else Cache expired
        Backend->>Petfinder: GET /animals?organization=NY1296
        Petfinder-->>Backend: Voice shelter cats [17]
        Backend->>Cache: Store for 6 hours
    end
    
    Backend->>Backend: Deduplicate by name
    Note over Backend: Removed 2 duplicates
    Backend-->>Frontend: foster_cats[10] + shelter_cats[15]
    
    Frontend->>Frontend: Merge & render unified grid
```

### Caching Strategy

- **Token cache**: 1 hour (Petfinder access token)
- **Cats cache**: 6 hours (shelter cats data)
- **Deduplication**: Real-time (compares names)

**Why caching?**
- ✅ Faster page loads
- ✅ Reduces API calls (Petfinder has rate limits)
- ✅ Shelter cats don't change frequently

---

## 🔧 Admin Features

### Manual Cache Refresh

If Voice adds a new cat and you want it to show immediately:

```bash
POST /api/cats/refresh-cache
Authorization: Bearer YOUR_ADMIN_JWT
```

**Response:**
```json
{
  "success": true,
  "message": "Cache refreshed",
  "cats_fetched": 17
}
```

### Cache Status

Check when cache expires:

```bash
GET /api/cats/cache-info
Authorization: Bearer YOUR_ADMIN_JWT
```

**Response:**
```json
{
  "hasCachedCats": true,
  "catsCount": 17,
  "catsExpiresIn": 18234000,  // milliseconds (5 hours)
  "hasToken": true,
  "tokenExpiresIn": 3234000    // milliseconds (54 minutes)
}
```

---

## 🐛 Troubleshooting

### Issue: "Petfinder auth failed: 401"

**Cause:** Invalid API credentials

**Solution:**
1. Double-check your `.env` file
2. Verify credentials at https://www.petfinder.com/developers/
3. Make sure no extra spaces in `.env`:
   ```bash
   # ❌ WRONG
   PETFINDER_API_KEY = abc123
   
   # ✅ CORRECT
   PETFINDER_API_KEY=abc123
   ```

### Issue: "No shelter cats appearing"

**Cause:** Voice for the Voiceless has no cats on Petfinder, or org ID wrong

**Solution:**
1. Verify org exists: https://www.petfinder.com/member/us/ny/syracuse/voice4thevoiceless-ny1296/
2. Check if they have active cats listed
3. Test API directly:
   ```bash
   curl "https://api.petfinder.com/v2/animals?organization=NY1296&type=cat" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Issue: "Duplicates still showing"

**Cause:** Name mismatch (e.g., "Felix" vs "Felix the Cat")

**Solution:**
Deduplication compares names case-insensitively. If a cat appears twice:
1. Check exact names in database vs Petfinder
2. Manually adjust name in your database to match Petfinder exactly
3. Or, update `petfinderService.js` deduplication logic for fuzzy matching

### Issue: "Cache not refreshing"

**Cause:** In-memory cache resets on server restart

**Solution:**
1. For production, implement **Redis caching**:
   ```bash
   npm install redis
   ```
2. Update `petfinderService.js` to use Redis instead of `cache` object

---

## 🚀 Production Deployment

### Environment Variables

Add to your production hosting (Heroku, Vercel, Railway, etc.):

```bash
PETFINDER_API_KEY=your_actual_key
PETFINDER_SECRET=your_actual_secret
```

### Recommended: Redis for Caching

For multi-instance deployments (load balancing), use Redis:

```bash
# Install Redis client
npm install redis

# Add to .env
REDIS_URL=redis://localhost:6379
```

Update `petfinderService.js` to use Redis instead of in-memory cache.

---

## 📊 API Endpoints Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/cats/all-available` | GET | Public | Foster + shelter cats (deduplicated) |
| `/api/cats/shelter` | GET | Public | Shelter cats only |
| `/api/cats/refresh-cache` | POST | Admin | Force cache refresh |
| `/api/cats/cache-info` | GET | Admin | Cache status |

### Query Parameters

**`/api/cats/all-available?forceRefresh=true`**
- Bypass cache and fetch fresh data

---

## 🎁 Benefits Over iframe Widget

| Feature | iframe Widget | Petfinder API |
|---------|---------------|---------------|
| **Design Control** | ❌ No | ✅ Full |
| **Deduplication** | ❌ Manual | ✅ Automatic |
| **Unified Grid** | ❌ Separate sections | ✅ Single grid |
| **Mobile Responsive** | ⚠️ Limited | ✅ Perfect |
| **Filtering** | ❌ No | ✅ Yes (senior, source) |
| **Performance** | ⚠️ Slow iframe | ✅ Fast cached API |
| **Custom Badges** | ❌ No | ✅ Yes (🏠 vs 🐾) |
| **Future-proof** | ⚠️ Deprecated | ✅ Official API |

---

## 📚 Resources

- **Petfinder API Docs**: https://www.petfinder.com/developers/v2/docs/
- **Voice for the Voiceless**: https://www.petfinder.com/member/us/ny/syracuse/voice4thevoiceless-ny1296/
- **API Status**: https://status.petfinder.com/
- **Rate Limits**: 1000 requests/day (free tier)

---

## ✅ Checklist

- [ ] Created Petfinder developer account
- [ ] Received API key and secret
- [ ] Added credentials to `backend/.env`
- [ ] Started backend server
- [ ] Tested `/api/cats/all-available` endpoint
- [ ] Started frontend
- [ ] Visited `/cats` page
- [ ] Verified both foster and shelter cats appear
- [ ] Confirmed deduplication working
- [ ] Tested filters (senior cats, shelter toggle)
- [ ] Deployed to production with environment variables

---

## 🎉 You're Done!

Your site now displays a **beautiful, unified cat grid** with:
- ✅ Your foster cats (featured with custom design)
- ✅ Voice for the Voiceless shelter cats (via Petfinder)
- ✅ No duplicates (automatic deduplication)
- ✅ Smart badges (🏠 Our Foster vs 🐾 Voice Shelter)
- ✅ Zero maintenance (6-hour cache auto-refreshes)

**Questions?** Check the troubleshooting section or open an issue!

**Last Updated**: February 7, 2026
