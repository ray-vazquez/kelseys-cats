# Kelsey's Cats - Product Backlog
**Launch Date:** March 6, 2026 | **Days to Launch:** 20 | **Last Updated:** February 14, 2026

---

## 🔴 PRIORITY 0: LAUNCH BLOCKERS

### LB-001: Image Upload Feature
**Story Points:** 5 | **Owner:** Developer | **Due:** Feb 15

> As Kelsey, I need to upload cat images directly so I don't manually paste URLs.

**Acceptance Criteria:**
- [ ] File picker in admin form (.jpg/.png, 10MB max)
- [ ] Preview + progress indicator
- [ ] Auto-insert URL into main_image_url and additional_images
- [ ] Support 1 main + 9 additional images
- [ ] Error handling for failed uploads

**Tech:** ImgBB API (free, unlimited) | Backend: `POST /api/upload/image` | Frontend: `ImageUploader.jsx`

---

### LB-002: Production Deployment
**Story Points:** 8 | **Owner:** Developer | **Due:** Feb 17

> As a user, I need to access the site at kelseyscats.org so I can browse cats.

**Acceptance Criteria:**
- [ ] Frontend on Vercel (HTTPS, custom domain)
- [ ] Backend on Railway (HTTPS API)
- [ ] MySQL on Railway (connection pooling)
- [ ] SSL valid, CORS configured
- [ ] Daily backups at 2 AM EST

**Risk:** Railway approval 24-48hrs | **Backup:** Render.com

---

### LB-003: Database Migration
**Story Points:** 3 | **Owner:** Developer | **Due:** Feb 17

> As a developer, I need production DB with clean schema so the app has stable data.

**Dependencies:** LB-002 (production DB must exist)

**Acceptance Criteria:**
- [ ] Schema migrated (cats, users, tags, cat_tags)
- [ ] Admin users seeded (you + Kelsey)
- [ ] Backup before migration
- [ ] CRUD operations tested

---

### LB-004: Content Population
**Story Points:** 8 | **Owner:** Kelsey | **Due:** Feb 23

> As Kelsey, I need to add all adoptable cats so the site is complete at launch.

**Dependencies:** LB-001, LB-002, LB-003

**Acceptance Criteria:**
- [ ] Min 10 cats with main image + 2-5 gallery images
- [ ] Bios (100-300 words each)
- [ ] Tags accurate (good with kids/cats/dogs)
- [ ] 4-6 featured cats selected

**Time:** 30min/cat × 15 cats = 8 hours over 3 days

---

### LB-005: Critical Bug Testing
**Story Points:** 5 | **Owner:** Both | **Due:** Feb 26

> As a user, I need the site to work reliably without errors.

**Test Checklist:**
- [ ] All CRUD in production
- [ ] Mobile responsive (iOS/Android)
- [ ] Image galleries + modal work
- [ ] No console errors
- [ ] Contact info correct

---

## 🟡 PRIORITY 1: POST-LAUNCH (Defer to Mar 7+)

| Feature | Story Points | Est. Launch |
|---------|--------------|-------------|
| Analytics dashboard | 5 | Mar 20 |
| Checkbox filters | 3 | Apr 1 |
| Adopt-a-Pet export | 2 | Mar 15 |
| Email notifications | 8 | TBD |

---

## ✅ RESOLVED (No Action Needed)

- [x] Additional images JSON parsing (2/13)
- [x] Gallery modal functionality (2/13)
- [x] Form validation UX (2/10)
- [x] Mobile responsive design (2/8)

---

## 🔵 TECHNICAL DEBT (Non-Blocking)

- Debug console.logs in `catImages.controller.js` (5 min fix, defer)
- No centralized error logging (add Sentry post-launch)
