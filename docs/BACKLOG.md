# Project Backlog - Kelsey's Cats

**Last Updated:** February 14, 2026  
**Launch Date:** March 6, 2026 (20 days)  
**Team:** 2 people (Technical Lead + Non-Technical Admin)

---

## Priority Legend

🔴 **PRIORITY 0 - LAUNCH BLOCKER**: Must be complete before 3/6/2026  
🟡 **PRIORITY 1 - POST-LAUNCH**: Deferred to post-launch iterations  
🟢 **PRIORITY 2 - FUTURE**: Nice-to-have enhancements

---

## 🔴 PRIORITY 0: Launch Blockers (Must Complete by 3/6)

### LB-001: Image Upload Feature
**Story Points:** 8  
**Owner:** Developer  
**Timeline:** Feb 14-16 (3 days)

**User Story:**
> As an admin user, I need to upload images directly from my computer so that I don't have to manually host images elsewhere and copy URLs.

**Acceptance Criteria:**
- [ ] File picker accepts JPG, PNG, WEBP formats
- [ ] Maximum file size: 10MB per image
- [ ] Shows upload progress indicator
- [ ] Displays preview before form submission
- [ ] Auto-inserts uploaded URL into form field
- [ ] Supports both main image and additional images
- [ ] Handles upload failures gracefully with error messages
- [ ] Works on desktop and mobile browsers

**Technical Implementation:**
```javascript
// Backend: POST /api/upload/image
// Service: ImgBB or Cloudinary
// Frontend: File input with drag-drop support
// Response: { url: "https://...", thumbnail: "https://..." }
```

**Dependencies:**
- ImgBB or Cloudinary account setup
- Backend multer middleware
- Frontend file handling component

**Testing Requirements:**
- [ ] Upload single image
- [ ] Upload multiple images (additional gallery)
- [ ] File size validation works
- [ ] File type validation works
- [ ] Error handling for network failures
- [ ] Kelsey successfully uploads 5 test images

**Definition of Done:**
- Code merged to main
- Deployed to production
- Kelsey trained and can upload images independently
- No console errors during upload process

---

### LB-002: Production Deployment
**Story Points:** 13  
**Owner:** Developer  
**Timeline:** Feb 17-19 (3 days)

**User Story:**
> As the development team, we need the application deployed to production hosting so that it's accessible to the public at launch.

**Acceptance Criteria:**
- [ ] Frontend deployed to Vercel/Netlify
- [ ] Backend deployed to Railway/Render
- [ ] Production database provisioned (PlanetScale/Railway)
- [ ] Environment variables configured correctly
- [ ] SSL certificates active (HTTPS)
- [ ] Custom domain configured and DNS propagated
- [ ] Production build passes all health checks
- [ ] No CORS errors in production

**Technical Checklist:**

**Frontend (Vercel/Netlify):**
- [ ] GitHub repository connected
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variables set:
  - `VITE_API_URL=https://api.kelseys-cats.com`
  - Other frontend env vars

**Backend (Railway/Render):**
- [ ] GitHub repository connected
- [ ] Start command: `npm start`
- [ ] Health check endpoint: `/api/health`
- [ ] Environment variables set:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `IMAGE_UPLOAD_KEY`
  - `CORS_ORIGIN`
  - `NODE_ENV=production`

**Database:**
- [ ] Production database created
- [ ] Migration scripts executed
- [ ] Schema validation passed
- [ ] Initial admin user seeded
- [ ] Backup strategy configured

**Domain & DNS:**
- [ ] Domain purchased/configured
- [ ] A/CNAME records set
- [ ] DNS propagation verified (24-48 hrs)
- [ ] SSL certificate issued

**Dependencies:**
- Hosting account approvals (can take 24-48 hours)
- Domain registration
- DNS propagation time

**Risk Mitigation:**
- Start hosting setup early (Feb 17)
- Have backup hosting options ready
- Test deployment to staging first

**Definition of Done:**
- Application accessible at production URL
- All API endpoints responding correctly
- Admin can log in and perform all CRUD operations
- No errors in production logs
- Rollback procedure documented and tested

---

### LB-003: Database Migration to Production
**Story Points:** 5  
**Owner:** Developer  
**Timeline:** Feb 18 (1 day, during deployment)

**User Story:**
> As the development team, we need to migrate the database schema to production safely so that all features work correctly at launch.

**Acceptance Criteria:**
- [ ] Schema migration script created and tested
- [ ] All tables created with correct structure
- [ ] Indexes applied for performance
- [ ] Foreign key constraints validated
- [ ] Initial seed data loaded (admin users, test data removed)
- [ ] Backup taken before migration
- [ ] Rollback script ready and tested

**Migration Checklist:**
```sql
-- Tables to migrate:
- cats (with additional_images as TEXT)
- tags
- cat_tags
- users (admin accounts only)
- sessions (optional)

-- Indexes to create:
- cats: (status, deleted_at, featured)
- cats: (name) for search
- cat_tags: (cat_id, tag_id)
```

**Pre-Migration:**
- [ ] Export development data (backup)
- [ ] Document current schema
- [ ] Test migration on staging database
- [ ] Verify data integrity checks

**Post-Migration:**
- [ ] Verify table counts
- [ ] Test all CRUD operations
- [ ] Validate foreign keys
- [ ] Check query performance

**Rollback Procedure:**
```bash
# If migration fails:
1. Restore from backup
2. Revert to previous schema
3. Document failure reason
4. Fix issue in development
5. Re-test migration on staging
```

**Dependencies:**
- Production database provisioned (LB-002)
- Migration scripts tested in staging

**Definition of Done:**
- All tables exist in production
- Sample data queries return expected results
- No schema validation errors
- Backup strategy documented

---

### LB-004: Essential Bug Fixes & Testing
**Story Points:** 8  
**Owner:** Developer + Kelsey  
**Timeline:** Feb 20-26 (ongoing during content population)

**User Story:**
> As the launch team, we need all critical functionality tested and bugs fixed so that users have a smooth experience.

**Test Scenarios:**

**Admin Workflows (Kelsey Testing):**
- [ ] Log in to admin panel
- [ ] Add new cat with images
- [ ] Edit existing cat (change bio, status, images)
- [ ] Delete cat (soft delete)
- [ ] Mark cat as adopted (status change to alumni)
- [ ] Add/remove additional images
- [ ] Toggle featured status
- [ ] Test on desktop Chrome
- [ ] Test on mobile Safari/Chrome
- [ ] Test on tablet

**Public Pages (Both Testing):**
- [ ] Homepage loads featured cats
- [ ] Current Cats page shows available cats
- [ ] Alumni page shows adopted cats
- [ ] Cat detail page displays correctly
- [ ] Image gallery modal works (click thumbnails)
- [ ] Modal navigation (prev/next arrows)
- [ ] Adoption info page loads
- [ ] Mobile responsive on all pages
- [ ] No JavaScript console errors

**Edge Cases:**
- [ ] No cats available (empty state)
- [ ] Cat with no images (placeholder shown)
- [ ] Very long cat names/bios (text wrapping)
- [ ] Special characters in cat names
- [ ] Form validation (required fields)
- [ ] Network error handling

**Performance:**
- [ ] Page load times < 3 seconds
- [ ] Images lazy load properly
- [ ] No memory leaks on long sessions

**Bug Tracking:**
```markdown
| ID | Description | Severity | Status | Owner | Resolved |
|----|-------------|----------|--------|-------|----------|
| B-001 | Example bug | High | Open | Dev | - |
```

**Definition of Done:**
- All critical bugs resolved
- No show-stopper issues remain
- Kelsey can complete all admin tasks without errors
- Public pages display correctly on mobile/desktop

---

### LB-005: Content Population
**Story Points:** 13  
**Owner:** Kelsey  
**Timeline:** Feb 21-27 (7 days)

**User Story:**
> As Kelsey, I need to add all current cats to the system with photos and complete bios so that the site is ready for public viewing at launch.

**Acceptance Criteria:**
- [ ] All current cats added (exact count: TBD)
- [ ] Each cat has:
  - [ ] Name
  - [ ] Age (if known)
  - [ ] Sex
  - [ ] Breed
  - [ ] Bio (2-3 paragraphs)
  - [ ] Temperament description
  - [ ] Main image
  - [ ] 2-4 additional images
  - [ ] Good with kids/cats/dogs checkboxes
  - [ ] Special needs/senior tags (if applicable)
  - [ ] Correct status (available/pending/alumni)
- [ ] Featured cats selected (3-5 cats)
- [ ] All images high quality and properly cropped
- [ ] Bios proofread (no typos)
- [ ] Contact information verified
- [ ] Adoption process page complete

**Time Estimates:**
- Per cat: 20-30 minutes
- 10 cats: ~5 hours
- 20 cats: ~10 hours
- Buffer time: 20% for revisions

**Daily Target:**
- 3-4 cats per day
- Review previous day's additions each morning

**Support from Developer:**
- Available for technical issues
- Can bulk-update fields if needed
- Will fix any form bugs immediately

**Definition of Done:**
- All current cats in production database
- Kelsey approves all content
- No placeholder content remains
- Public pages look professional and complete

---

## 🟡 PRIORITY 1: Post-Launch Features (After 3/6)

### PL-001: Basic Analytics Dashboard
**Story Points:** 8  
**Deferred Until:** Week of March 9

**User Story:**
> As an admin, I want to see basic statistics about cat adoptions so I can track progress and popular cats.

**Scope:**
- Total cats (available, pending, adopted)
- Most viewed cats (top 5)
- Recent activity timeline
- Quick stats cards

**Why Deferred:**
Not critical for launch; data collection can start post-launch.

---

### PL-002: Checkbox Filters on Current Cats Page
**Story Points:** 5  
**Deferred Until:** Week of March 16

**User Story:**
> As a site visitor, I want to filter cats by characteristics so I can find cats that match my household.

**Scope:**
- Good with Kids
- Good with Cats
- Good with Dogs
- Special Needs
- Senior (7+ years)

**Why Deferred:**
Current filtering by status works; this is UX enhancement only.

---

### PL-003: Adopt-a-Pet Export Tool
**Story Points:** 3  
**Deferred Until:** Week of March 23

**User Story:**
> As Kelsey, I want to export cat data in Adopt-a-Pet format so I can avoid duplicate data entry.

**Scope:**
- Export button in admin
- CSV download with Adopt-a-Pet fields
- No API integration needed

**Why Deferred:**
Manual workaround exists; not launch-critical.

---

### PL-004: Admin Activity Log
**Story Points:** 5  
**Deferred Until:** April

**User Story:**
> As a super admin, I want to see who changed what and when so I can audit changes and troubleshoot issues.

**Scope:**
- Log all create/update/delete actions
- Show user, timestamp, entity, changes
- Simple table view in admin

**Why Deferred:**
Only 2 users; low risk of unauthorized changes.

---

### PL-005: Remember Me / Password Reset
**Story Points:** 5  
**Deferred Until:** April

**User Story:**
> As an admin, I want to stay logged in for 30 days and reset my password if I forget it.

**Scope:**
- Remember me checkbox (30-day token)
- Password reset via email
- Token expiration handling

**Why Deferred:**
Current auth works; password can be reset manually via database.

---

## 🟢 PRIORITY 2: Future Enhancements (No Timeline)

### Future Scope (Not Prioritized):
- Advanced search with autocomplete
- Email notifications for new cats
- Social media auto-posting
- Visitor analytics (Google Analytics)
- SEO optimization
- Automated backups UI
- Bulk edit operations
- Cat matching quiz
- Success stories submission form

---

## Technical Debt Summary

### ✅ RESOLVED UI/UX Issues (Pre-Launch)
- Image gallery modal not opening → **FIXED** (Feb 13)
- Additional images not displaying → **FIXED** (Feb 13)
- JSON parsing issues in frontend → **FIXED** (Feb 13)
- Admin form not saving additional_images → **FIXED** (Feb 13)
- Responsive design inconsistencies → **RESOLVED**
- Form validation UX → **FINALIZED**

### 🔧 Current Technical Debt (Non-Blocking)
- No automated tests (unit/integration/E2E)
- No error tracking service (Sentry)
- No structured logging
- No API documentation
- Debug console.logs still in code (minor)

**Post-Launch Technical Debt Prioritization:**
1. Add error tracking (Sentry) - Week 1 post-launch
2. Remove debug logs - Week 1 post-launch
3. Add basic tests for critical paths - Week 2-3 post-launch
4. API documentation - Month 2

---

## Definition of Done

### Launch Ready (3/6/2026):
- [ ] All Priority 0 items complete
- [ ] No critical bugs remain
- [ ] Kelsey can perform all admin tasks independently
- [ ] Public site displays correctly on mobile/desktop
- [ ] All content loaded and proofread
- [ ] Production deployment stable
- [ ] Backup/rollback procedure tested
- [ ] Launch checklist 100% complete

### Post-Launch Item Ready:
- [ ] Feature fully implemented
- [ ] Tested by both users
- [ ] Documented for future reference
- [ ] Deployed to production
- [ ] No regression bugs introduced

---

## Sprint Velocity Tracking

**Week 1 (Feb 14-20):** Target 26 story points  
**Week 2 (Feb 21-27):** Target 21 story points  
**Week 3 (Feb 28-Mar 6):** Buffer only (0 new points)

**Total Launch Sprint:** 47 story points

---

## Risk Register

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| Hosting approval delays | High | Medium | Start early, have backup options | Dev |
| DNS propagation slow | High | Low | Configure DNS on Feb 17-18 | Dev |
| Content creation velocity | High | Medium | Daily progress checks with Kelsey | Both |
| Critical bug found late | High | Low | Daily testing starting Feb 20 | Both |
| Image upload service downtime | Medium | Low | Have 2 provider options configured | Dev |

---

**Last Review:** February 14, 2026  
**Next Review:** February 21, 2026 (Weekly sprint review)
