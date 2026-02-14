# Kelsey's Cats - Critical Path to Launch
**Launch Date:** March 6, 2026 | **Days Remaining:** 20 | **Document Date:** February 14, 2026

---

## Timeline (20 Days to Launch)

```
Feb 14-16: Image Upload (CP-1) → 17: Deploy+Migration (CP-2,3) → 18-20: Buffer
          ↓
Feb 21-23: Content Population (CP-4) → 25-26: QA+Fixes (CP-5) → 27: Buffer
          ↓
Mar 1: FREEZE → 2-3: Final QA → 4: Content Freeze → 5: Go/No-Go → 6: LAUNCH
```

---

## 🔴 Critical Path (Any Delay = Launch Delay)

### CP-1: Image Upload (Feb 14-16)
**Duration:** 2-3 days | **Float:** 0 days  
**Why Critical:** Blocks Kelsey's content work (Week 2)

**Gate:** ✅ Kelsey uploads 5 images without help

**Rollback:** If blocked past Feb 16 → Manual URLs (NOT RECOMMENDED)

---

### CP-2: Production Deploy (Feb 16-18)
**Duration:** 2-3 days | **Float:** 0 days  
**Why Critical:** Blocks database migration and content population

**Gate:** ✅ https://kelseyscats.org loads (or subdomain if DNS pending)

**Risk:** DNS 24-48hrs → Configure Feb 16 for 10-day buffer  
**Rollback:** If Railway fails → Render.com (+1 day)

---

### CP-3: Database Migration (Feb 17)
**Duration:** 1 day | **Float:** 0 days  
**Why Critical:** Kelsey can't add cats without production DB

**Gate:** ✅ Kelsey logs in to prod admin, adds test cat

**Rollback:** Restore dev DB backup, retry migration

---

### CP-4: Content Population (Feb 21-24)
**Duration:** 3-4 days | **Float:** 0 days  
**Why Critical:** Can't launch with 0 cats (longest task, no buffer)

**Gate:** ✅ Min 10 cats live with photos + complete bios

**Rollback:** If only 10 by Feb 24 → Launch with 10, add more post-launch

---

### CP-5: Final QA (Feb 25-26)
**Duration:** 2 days | **Float:** 1 day  
**Why Critical:** Last chance to catch launch-blockers

**Gate:** ✅ All critical paths tested, no show-stoppers

**Rollback:** Critical bug unfixable by Feb 27 → Delay 1 week to Mar 13

---

### CP-6: Feature Freeze & Launch (Mar 1-6)
**Duration:** 6 days | **Float:** 0 days

**Milestones:**
- **Mar 1:** Feature freeze (no code changes unless critical)
- **Mar 4:** Content freeze (no bio edits except typos)
- **Mar 5 5pm:** Go/No-Go decision
- **Mar 6 12pm:** 🚀 LAUNCH

---

## 🟢 Non-Critical (Can Slip Without Launch Delay)

- Kelsey testing/training (Feb 15, 18): 1-day float → Can reschedule
- Security review (Feb 19 or Mar 2): 10-day float → Core security already solid
- Minor UX polish (Feb 26): Infinite float → Defer post-launch
- Documentation (ongoing): Infinite float → Write during downtime

---

## Dependencies Map

```
CP-1 (Image Upload) ──→ CP-4 (Content Population)
CP-2 (Deploy) ──→ CP-3 (DB Migration) ──→ CP-4 (Content)
CP-4 (Content) ──→ CP-5 (QA) ──→ CP-6 (Launch)
```

**Parallel Work:**
- Developer: Image Upload (Feb 14-16) || Deploy (Feb 16-18)
- Week 2: Kelsey adds content || Developer fixes bugs as reported

---

## Launch Checklist (March 5)

### Technical
- [ ] All services running (Vercel, Railway, MySQL)
- [ ] No critical bugs (Severity 1)
- [ ] SSL valid on both domains
- [ ] Database backups confirmed
- [ ] Rollback procedure documented
- [ ] Developer available Mar 6 (12-4pm)

### Content
- [ ] Min 10 cats with photos/bios
- [ ] Contact info correct
- [ ] Featured cats selected (4-6)
- [ ] Kelsey available Mar 6 (12-4pm)

### Admin
- [ ] Kelsey can add/edit/delete cats independently
- [ ] Social posts scheduled for 12pm
- [ ] Both agree: "We are GO for launch"
