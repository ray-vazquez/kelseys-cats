# Kelsey's Cats - Product Backlog

This document tracks earmarked features, enhancements, and technical improvements for future consideration.

---

## 🔍 Web Scraper Improvements

### Priority: High
**Category**: Data Quality & User Experience

#### 1. Cat-Only Filtering
**Status**: Earmarked  
**Current State**: Scraper erroneously captures dogs along with cats  
**Proposed Enhancement**:
- Add species/animal type filtering in scraper logic
- Parse HTML/API responses for cat-specific indicators
- Filter by keywords: "cat", "feline", "kitten" vs "dog", "canine", "puppy"
- Add post-scrape validation to exclude non-cat entries
- Implement species classification if API provides it

**Benefits**:
- Clean, accurate cat-only database
- Better user trust and experience
- Reduced manual cleanup work
- Professional data quality

**Technical Considerations**:
- Review adoptAPetScraper.js and petfinderScraper.js
- Check API response structure for species/type field
- Add filtering at data collection point
- Implement validation before database insert
- Reference previous chat instructions for specific implementation

---

#### 2. Live Scrape Progress Display
**Status**: Earmarked  
**Current State**: No visibility into scraping progress  
**Proposed Enhancement**:
- Add real-time progress indicators during scrape
- Show: pages scraped, cats found, errors encountered
- Display ETA for completion
- WebSocket or polling for live updates
- Progress bar in admin interface
- Log significant events (start, page complete, finish)

**Benefits**:
- Admin knows scraper is working
- Can estimate completion time
- Early detection of failures
- Better debugging capabilities

**Technical Considerations**:
- Implement WebSocket connection for real-time updates
- Or use Server-Sent Events (SSE) for one-way streaming
- Add progress tracking in scraper service
- Create admin UI component for progress display
- Store scrape metadata (start time, status, counts)

---

#### 3. Scraped Results Display
**Status**: Earmarked  
**Current State**: No visibility into what was scraped  
**Proposed Enhancement**:
- Add results page showing newly scraped cats
- Display preview cards with key info
- Show: name, image, source, status (new/updated/skipped)
- Filter by scrape session/date
- Bulk actions: approve, edit, delete
- Export results to CSV

**Benefits**:
- Review scraped data before going live
- Quality control checkpoint
- Identify scraping issues quickly
- Audit trail for data sources

**Technical Considerations**:
- Create scrape_sessions table to track runs
- Link cats to scrape_session_id
- Build admin results page component
- Add filtering and sorting capabilities
- Consider auto-approval vs manual review workflow

---

## 🃏 Cat Cards Bug Fix

### Priority: High
**Category**: Bug Fix / Data Display

#### 1. Investigate "00" and "0" Display Issue
**Status**: Earmarked - Requires Investigation  
**Current State**: Cat cards show "00" and "0" values that are unclear/meaningless  
**Proposed Investigation**:
- Identify which fields are displaying these values
- Determine what data these numbers represent (age? ID? placeholder?)
- Check if these are: null values, default values, missing data, formatting errors
- Review CatCard component and data mapping

**Proposed Fix**:
- Hide fields with null/0/empty values
- Show "Age unknown" instead of "0 years"
- Format data appropriately (e.g., "6 months" not "0.5 years")
- Only display meaningful, complete information
- Add conditional rendering for optional fields

**Benefits**:
- Cleaner, more professional appearance
- No confusing placeholder data
- Better user experience
- Honest representation of available information

**Technical Considerations**:
- Review frontend/src/components/CatCard.jsx
- Check data structure from API response
- Add conditional rendering logic
- Consider default/fallback values for missing data
- Test with cats that have incomplete profiles

---

## 📄 Cat Detail Page Enhancement

### Priority: Medium
**Category**: User Experience

#### 1. Add Bio Section
**Status**: Earmarked  
**Current State**: Cat detail page missing dedicated bio section  
**Proposed Enhancement**:
- Add prominent bio/description section on cat detail page
- Display cat's personality, background story, special notes
- Rich text formatting support (paragraphs, lists)
- Position near top of page for visibility
- Style as prominent content area

**Benefits**:
- Tell each cat's unique story
- Help adopters connect emotionally
- Provide context beyond basic stats
- Improve adoption success rate

**Technical Considerations**:
- Bio field already exists in database schema
- Update CatDetailPage.jsx to display bio prominently
- Add styled section with proper typography
- Ensure mobile-responsive layout
- May already be implemented - verify current state first

---

## 🔎 Cats Page Search Feature

### Priority: High
**Category**: User Experience

#### 1. Live Search Bar with Real-Time Results
**Status**: Earmarked  
**Current State**: No search functionality on cats listing page  
**Proposed Enhancement**:
- Add search bar at top of cats page
- Live filtering as user types (similar to Google)
- Search across: name, breed, temperament, bio
- Debounced input (300ms delay) to reduce API calls
- Highlight matching text in results
- Show "No results found" state
- Clear search button (X icon)

**Benefits**:
- Quickly find specific cats
- Better user experience for large catalogs
- Reduced time to adoption (easier discovery)
- Modern, expected functionality

**Technical Considerations**:
- Add search input component to cats listing page
- Implement debounced onChange handler
- Backend: Add search parameter to GET /cats endpoint
- SQL: Use LIKE queries or full-text search
- Frontend: Filter results client-side or server-side?
- Consider pagination with search results
- Index database fields for search performance

---

## 🗑️ Soft Delete Investigation & Fix

### Priority: High
**Category**: Bug Fix / Data Integrity

#### 1. Investigate Count Discrepancy
**Status**: Earmarked - Requires Investigation  
**Current State**: 
- Total shows 72 cats
- "At partner homes" count doesn't match
- Database has 15 cats in cats table
- Numbers don't add up - possible soft delete issue

**Proposed Investigation**:
1. Check soft delete implementation:
   - Review `deleted_at` column usage
   - Verify queries filter `deleted_at IS NULL`
   - Check if frontend counts include deleted cats
2. Audit database:
   - Count cats by status (available, pending, hold, alumni)
   - Count cats with `deleted_at IS NOT NULL`
   - Identify source of discrepancy
3. Review counting logic:
   - Frontend statistics calculation
   - Backend aggregation queries
   - Cache issues?

**Proposed Fix Option A - If Soft Delete Working Correctly**:
- Verify all queries properly exclude soft-deleted cats
- Fix any count calculations that include deleted records
- Add proper WHERE clauses: `deleted_at IS NULL`

**Proposed Fix Option B - If Soft Delete Broken**:
- Fix soft delete implementation
- Add "Deleted" view in admin to show soft-deleted cats
- Add "Restore" button to undelete cats
- Implement restore endpoint: `POST /cats/:id/restore`
- Update soft delete to preserve data integrity

**Benefits**:
- Accurate cat counts
- Reliable statistics
- Ability to recover accidentally deleted cats
- Better data management

**Technical Considerations**:
- **⚠️ New endpoints may be required - ask before proceeding**
- Review CatModel.js `softDelete()` method
- Check all queries use `deleted_at IS NULL` filter
- Add restore functionality if needed
- Consider audit log for delete/restore actions
- Test with various cat statuses

**Next Steps**:
1. Run database audit queries to identify issue
2. Report findings
3. Propose specific fix based on root cause
4. Request approval if new endpoints needed

---

## 💰 Advertisement Placeholders

### Priority: Low
**Category**: Monetization / User Experience

#### 1. Non-Obtrusive Ad Placements
**Status**: Earmarked  
**Current State**: No ad support  
**Proposed Enhancement**:
- Add strategic ad placeholder areas
- Locations:
  - Sidebar on cat listings page
  - Between cat listings (every 6-8 cats)
  - Bottom of cat detail pages
  - Below fold on homepage
- Style as subtle, non-intrusive components
- Clearly labeled as "Sponsored" or "Advertisement"
- Responsive sizing for mobile/desktop

**Benefits**:
- Revenue generation to support rescue operations
- Sustainable funding model
- Professional appearance
- Non-disruptive to user experience

**Technical Considerations**:
- Create AdPlaceholder component
- Integrate with ad network (Google AdSense, etc.)
- Lazy load ads to maintain page performance
- Add ad blocker detection (optional)
- GDPR/privacy compliance for ad tracking
- A/B test placement and frequency
- Monitor impact on user engagement metrics

**Ad Placement Strategy**:
- **Homepage**: 1 ad below hero, 1 in footer
- **Cats Listing**: 1 sidebar ad, 1 in-feed ad per 8 cats
- **Cat Detail**: 1 ad at bottom of content
- **Alumni Page**: 1 sidebar ad
- **Avoid**: Pop-ups, interstitials, auto-play video

**Privacy Considerations**:
- Cookie consent banner required
- Privacy policy update
- Opt-out mechanism
- COPPA compliance (if children may visit)

---

## 🖼️ Image Gallery Enhancements

### Priority: Medium
**Category**: User Experience

#### 1. Image Upload Support
**Status**: Earmarked  
**Current State**: Admin must paste image URLs manually  
**Proposed Enhancement**:
- Add file upload capability in admin panel
- Support drag-and-drop interface
- Implement image storage solution (S3, Cloudinary, local storage)
- Auto-generate responsive image sizes
- Validate file types (JPEG, PNG, WebP) and sizes

**Benefits**:
- Easier for admins (no need to host images elsewhere)
- Better control over image quality and format
- Consistent image hosting

**Technical Considerations**:
- Requires file storage setup (AWS S3, Azure Blob, or local)
- Need multer or similar upload middleware
- Consider image processing library (sharp, jimp)
- Storage costs for hosting images

---

#### 2. Drag-to-Reorder Thumbnails
**Status**: Earmarked  
**Current State**: Images display in order added  
**Proposed Enhancement**:
- Add drag-and-drop reordering in admin Additional Images Gallery
- Use react-beautiful-dnd or react-dnd library
- Visual feedback during drag (ghost element, drop zones)
- Persist order in database (keep array order)

**Benefits**:
- Control which images appear first in gallery
- Better storytelling with image sequence
- Improved admin UX

**Technical Considerations**:
- Add drag-and-drop library dependency
- Update admin UI component
- No backend changes needed (array order is preserved)

---

#### 3. Image URL Validation
**Status**: Earmarked  
**Current State**: Any URL can be entered, broken images possible  
**Proposed Enhancement**:
- Validate URL format before saving
- Optional: Ping URL to verify image exists
- Check for valid image extensions (.jpg, .jpeg, .png, .webp, .gif)
- Show preview thumbnail before adding
- Display error if URL is invalid or unreachable

**Benefits**:
- Prevent broken images on frontend
- Better admin experience with immediate feedback
- Reduce support issues from bad URLs

**Technical Considerations**:
- Frontend validation: URL regex pattern
- Backend validation: HEAD request to check if resource exists
- Consider rate limiting for URL checks
- Handle CORS issues for external images

---

#### 4. Thumbnail Optimization
**Status**: Earmarked  
**Current State**: Full-size images loaded as thumbnails  
**Proposed Enhancement**:
- Implement lazy loading for thumbnails
- Use WebP format with JPEG fallback
- Generate thumbnail sizes (150x150) separate from full images
- Add loading skeletons/placeholders
- Use `loading="lazy"` attribute on images
- Consider Intersection Observer for scroll-based loading

**Benefits**:
- Faster page load times
- Reduced bandwidth usage
- Better mobile performance
- Improved Lighthouse scores

**Technical Considerations**:
- Requires image processing on upload (if #1 is implemented)
- Add lazy loading library or use native `loading="lazy"`
- Update ImageGallery component
- Consider CDN for image delivery

---

#### 5. Zoom on Hover
**Status**: Earmarked  
**Current State**: Thumbnails scale slightly on hover  
**Proposed Enhancement**:
- Add magnifying glass effect on thumbnail hover
- Show larger preview in tooltip/popover
- Smooth zoom animation
- Optional: Preview main image without clicking

**Benefits**:
- Better preview before clicking
- Enhanced interactivity
- More polished user experience

**Technical Considerations**:
- CSS transform: scale() with overflow handling
- Or use react-image-magnify library
- Test performance on mobile devices
- Ensure doesn't interfere with click behavior

---

## 📝 How to Use This Backlog

1. **Earmarked**: Idea captured, not yet prioritized
2. **Prioritized**: Moved to sprint planning, has priority assigned
3. **In Progress**: Actively being developed
4. **Completed**: Implemented and deployed

### Adding New Items

When earmarking new enhancements, include:
- **Title**: Brief, descriptive name
- **Status**: Always start as "Earmarked"
- **Current State**: What exists today
- **Proposed Enhancement**: Detailed description
- **Benefits**: Why this matters (user/business value)
- **Technical Considerations**: Implementation notes, dependencies, risks

---

## 🗂️ Other Backlog Categories

### 🔐 Security & Authentication
_(Future enhancements go here)_

### 📊 Analytics & Reporting  
_(Future enhancements go here)_

### 🐱 Cat Management Features
_(Future enhancements go here)_

### 🎨 UI/UX Improvements
_(Future enhancements go here)_

### ⚡ Performance Optimization
_(Future enhancements go here)_

### 🧪 Testing & Quality
_(Future enhancements go here)_

---

**Last Updated**: February 12, 2026  
**Maintainer**: Development Team
