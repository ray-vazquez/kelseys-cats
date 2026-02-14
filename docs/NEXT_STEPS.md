# Kelsey's Cats - Daily Action Plan
**Launch Countdown:** 20 days to March 6, 2026 | **Today:** Saturday, February 14, 2026

---

## Week 1: Technical Foundation (Feb 14-20)

| Date | Developer Tasks | Kelsey Tasks | Checkpoint |
|------|----------------|--------------|------------|
| **Sat 2/14** | Choose ImgBB/Cloudinary (9am)<br>Backend upload endpoint (10am-12pm)<br>Frontend ImageUploader (1-3pm)<br>Integrate AdminCatEditPage (3-5pm) | — | ✓ Image upload works |
| **Sun 2/15** | Test with Kelsey (12pm call)<br>Fix bugs (1-3pm)<br>Signup: Vercel + Railway (3-4pm) | Test upload 5 images (12pm)<br>Provide feedback | ✓ Kelsey can upload independently |
| **Mon 2/16** | Deploy frontend to Vercel (9-10am)<br>Deploy backend to Railway (10-12pm)<br>Configure DNS (1-2pm)<br>Test production (2-3pm) | — | ✓ Site accessible (subdomain if DNS pending) |
| **Tue 2/17** | Check DNS propagation (9am)<br>Export dev schema (9-10am)<br>Run migration (10-11am)<br>Seed admin users (11-12pm)<br>Test CRUD (1-2pm)<br>Configure backups (2-3pm) | — | ✓ Production DB live, Kelsey can log in |
| **Wed 2/18** | Verify SSL (9-10am)<br>Kelsey onboarding call (12pm) | Join onboarding (12pm)<br>Add first real cat (practice) | ✓ Kelsey confident using admin |
| **Thu 2/19** | Buffer: Catch up delays<br>Security review (optional) | — | ✓ Week 1 complete |
| **Fri 2/20** | Retrospective call (11am)<br>Prep Week 2 checklist | Retrospective (11am)<br>Gather cat photos | ✓ Ready for content sprint |

**Risks:** Railway approval delay → Use Render.com | DNS propagation 24-48hrs → Configure early (2/16)

---

## Week 2: Content & QA (Feb 21-27)

| Date | Developer Tasks | Kelsey Tasks | Checkpoint |
|------|----------------|--------------|------------|
| **Sat 2/21** | On-call for bugs | Add cats 1-5 (9am-1pm) | ✓ 5 cats live |
| **Sun 2/22** | Fix Saturday bugs (11am-1pm) | Add cats 6-10 (10am-2pm) | ✓ 10 cats live |
| **Mon 2/23** | Available for support | Add cats 11-15+ (9am-1pm) | ✓ All cats live |
| **Tue 2/24** | Monitor | Polish bios, select featured cats | ✓ Content complete |
| **Wed 2/25** | Joint QA call (10am-12pm)<br>Fix critical bugs (1-4pm) | QA testing (10am-12pm) | ✓ Critical bugs identified |
| **Thu 2/26** | Fix major bugs (9am-1pm)<br>Deploy fixes (2pm) | Final content review | ✓ Major bugs fixed |
| **Fri 2/27** | Retrospective (2pm)<br>Prep launch checklist | Retrospective (2pm)<br>Draft launch posts | ✓ Ready for freeze |

**Risk:** Content velocity slow → Min 10 cats acceptable for launch

---

## Week 3: Launch Prep (Feb 28-Mar 6)

| Date | Developer Tasks | Kelsey Tasks | Checkpoint |
|------|----------------|--------------|------------|
| **Sat 2/28** | Buffer: Complete any overruns | Buffer: Content polish | — |
| **Sun 3/1** | **FEATURE FREEZE** (10am call)<br>Production health check<br>Create backup | FEATURE FREEZE<br>Final content proofread | ✓ Code freeze declared |
| **Mon 3/2** | Final QA (10am-1pm) | QA testing (10am-1pm) | ✓ Show-stoppers identified |
| **Tue 3/3** | Fix show-stoppers ONLY | Smoke test after fixes | ✓ All critical bugs resolved |
| **Wed 3/4** | Final security review | **CONTENT FREEZE**<br>Schedule social posts | ✓ Launch ready |
| **Thu 3/5** | Pre-launch call (10am)<br>Test rollback procedure | Pre-launch call (10am)<br>Finalize announcements | **Go/No-Go decision (5pm)** |
| **Fri 3/6** | Monitor (9am health check) | **🚀 LAUNCH 12pm EST**<br>Post announcements | ✓ LIVE |

---

## 🚨 Blocker Protocol

**If blocked:**
1. Document: What/why/what's needed
2. Notify other team member within 1 hour
3. Assess launch impact within 24 hours
4. Decide: Fix/workaround/delay

**Critical blockers:** Image upload broken, deployment fails, migration fails, critical security issue
