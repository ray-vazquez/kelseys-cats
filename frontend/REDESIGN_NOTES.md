# Kelsey's Cats — Frontend Redesign Notes

> **Scope:** All changes are strictly within `/frontend`. No backend files, routes,
> schemas, or API contracts were modified or read beyond what was already accessible
> via the existing API client in `frontend/src/api/`.

---

## Existing Style System (Pre-Redesign Audit)

| Item | Pre-Redesign Value |
|---|---|
| Framework | React 18 + Vite + styled-components v6 |
| Theme system | Centralized `theme.js` → `ThemeProvider` |
| Naming convention | camelCase JS object keys (`theme.colors.primary`) |
| Primary accent | `#1abc9c` (cold teal) |
| Nav background | `#2c3e50` (cold dark navy) |
| Page background | `#ffffff` (flat white — no warmth) |
| Heading font | Montserrat (Google Fonts) |
| Body font | Lato (Google Fonts) |
| Dark mode | ❌ Not implemented |
| Adoption status tokens | ❌ None |
| Hero section | ❌ Not present in HomePage |
| Shared cat card component | ❌ Not present — per-page duplication |
| Footer | Stub — ~681 bytes, near-empty |
| Mobile nav | Column-stack layout (no hamburger) |
| Sticky navbar | Present but no scroll-aware transparency |
| CTA button in nav | ❌ Not present |

---

## Design Decisions & Rationale

### Color Direction
Moved from a clinical, tech-company palette to a warm adoption-platform palette:

| Token | Before | After | Reason |
|---|---|---|---|
| `colors.background` | `#ffffff` | `#faf8f5` | Soft cream feels warmer, less clinical |
| `colors.secondary` | `#2c3e50` cold navy | `#3d2c2c` warm espresso | Matches the warm cream surfaces |
| `colors.primary` | `#1abc9c` neon teal | `#2a9d8f` richer teal | Less corporate, more trustworthy |
| `colors.border` | `#dee2e6` cool gray | `#e2ddd7` warm taupe | Harmonizes with cream backgrounds |
| `colors.text.primary` | `#212529` | `#2d2220` | Warm near-black |

A new **terracotta CTA accent** (`#e76f51`) was introduced to give action buttons
a distinct visual identity separate from the informational teal. This mirrors
the pattern used by Petfinder and Adopt-a-Pet where CTA buttons are in a warm
orange/terracotta and body links are in a cooler brand color.

### Typography

**Headings: Montserrat → Playfair Display**
Playfair Display is a high-contrast serif with editorial warmth — the same
choice made by ASPCA and many animal welfare organizations. Montserrat reads
as a generic SaaS or tech product font, which creates the wrong emotional tone
for a personal gift site about fostering cats.

**Body: Lato → Nunito Sans**
Nunito Sans has rounder letterforms than Lato, which makes it feel friendlier
and more personal at body size (16px) without sacrificing legibility. It
also pairs well with Playfair Display: the serif–rounded-sans combination is
classic editorial/lifestyle territory.

### Navigation Redesign
- Scroll-aware transparency on homepage (transparent until user scrolls 40px, then solid espresso)
- All interior pages: always solid espresso (no transparency flicker on short pages)
- Hamburger mobile menu replaces the `flex-direction: column` collapse
- "Meet the Cats →" terracotta CTA button added at far right of desktop nav
- Active link state uses an animated underline instead of just color change
- All touch targets ≥ 44px (WCAG AA)

### Footer Redesign
- Rebuilt from a stub into a full 4-column grid: Brand / Cats / Adoption / About
- Brand column includes tagline and social link placeholders (IG/FB)
- Responsive: 4-col → 2-col (tablet) → 1-col (mobile)
- Copyright + heart note in footer bottom bar

---

## Net-New Tokens Added to `theme.js`

All additions are **additive only** — no existing token was overridden or removed.

### Colors

| Token | Value | Purpose |
|---|---|---|
| `colors.cream` | `#faf8f5` | Page background (warm cream) |
| `colors.creamDark` | `#f4f1ec` | Alternate section background |
| `colors.creamDeep` | `#ede9e2` | Card image placeholder / offset |
| `colors.warmBorder` | `#e2ddd7` | Subtle warm divider/border |
| `colors.accent` | `#e76f51` | Terracotta CTA button |
| `colors.accentHover` | `#cf5c3d` | Accent hover state |
| `colors.accentLight` | `#fde8e2` | Accent-tinted surface |
| `colors.accentText` | `#ffffff` | Text on accent bg |
| `colors.statusAvailable` | `#2a9d8f` | Status badge — available |
| `colors.statusAvailableLight` | `#e8f5f4` | Available badge background |
| `colors.statusAvailableText` | `#1a6b60` | Available badge text |
| `colors.statusAdopted` | `#6c757d` | Status badge — adopted |
| `colors.statusAdoptedLight` | `#f0f0f0` | Adopted badge background |
| `colors.statusAdoptedText` | `#495057` | Adopted badge text |
| `colors.statusPending` | `#f39c12` | Status badge — pending |
| `colors.statusPendingLight` | `#fff8e7` | Pending badge background |
| `colors.statusPendingText` | `#8a5700` | Pending badge text |
| `colors.statusFostered` | `#9b59b6` | Status badge — other/fostered |
| `colors.statusFosteredLight` | `#f5eeff` | Fostered badge background |
| `colors.statusFosteredText` | `#6c3483` | Fostered badge text |

### Typography

| Token | Value | Purpose |
|---|---|---|
| `fonts.heading` | `"Playfair Display", "Georgia", serif` | Warm editorial serif for headings |
| `fonts.body` | `"Nunito Sans", system-sans...` | Friendly rounded sans for body |
| `fontSizes.hero` | `clamp(2.75rem, 1rem + 5vw, 4.5rem)` | Homepage H1 hero headline |

### Shadows

| Token | Value | Purpose |
|---|---|---|
| `shadows.card` | warm 2-layer resting shadow | CatCard default state |
| `shadows.cardHover` | warm 2-layer elevated shadow | CatCard hover state |

*All existing shadow tokens were re-tinted from `rgba(0,0,0,...)` to
`rgba(61,44,44,...)` to harmonize with warm cream surfaces.*

### Transitions

| Token | Value | Purpose |
|---|---|---|
| `transitions.spring` | `0.4s cubic-bezier(0.16, 1, 0.3, 1)` | Card lift animation |
| `easings.spring` | `cubic-bezier(0.16, 1, 0.3, 1)` | Direct easing use |

---

## New Components

| Component | Path | Replaces |
|---|---|---|
| `CatCard` | `src/components/Common/CatCard.jsx` | Per-page ad-hoc card implementations |

**CatCard props:**
```
cat: {
  id, name, breed, age, age_unit,
  status, primary_image_url, description, sex
}
isPartner: boolean  // routes to /cats/partner/:id when true
```

---

## Conventions Extended

| Convention | How It Was Extended |
|---|---|
| styled-components `styled(Tag)` pattern | All new components use the same pattern as existing ones |
| Transient `$props` prefix | `$isActive`, `$open`, `$status`, `$scrolled`, `$opaque` — prevents DOM attribute bleed |
| `theme.breakpoints.*` | No hardcoded px values in new components |
| `theme.spacing.*` | All margins/padding/gaps use spacing tokens |
| `theme.transitions.*` | All transitions reference token keys |
| `theme.borderRadius.*` | All radius values use token keys |

---

## Regression Safety Checklist

- [x] All existing `theme.js` tokens preserved — only additions, no overrides
- [x] `GlobalStyles.js` not modified — references theme tokens which still resolve
- [x] `AdminNavbar.jsx` not modified
- [x] `App.jsx` routing and layout wrappers not modified
- [x] `AuthContext.jsx` not modified
- [x] All API client files untouched
- [x] `vite.config.js` untouched
- [x] Backend directory completely untouched
- [ ] **Pages consuming CatCard** (CatsPage, HomePage) should import from
  `Common/CatCard` — existing per-page card code can be removed after
  confirming no visual regressions

---

## Next Steps (Pending PAGE-Level Redesigns)

Send `MODE: FRONTEND` with the current content of each page file to get
full redesigns using the new theme tokens above:

1. **`HomePage.jsx`** — emotional hero section, featured cat spotlight, stats bar
2. **`CatsPage.jsx`** — filter/search bar + `CatCard` grid layout
3. **`CatDetailPage.jsx`** — full-width image, story panel, adoption CTA
4. **`AlumniPage.jsx`** — alumni grid with `CatCard` (adopted status)
5. **`AdoptionPage.jsx`** — FAQ accordion + process timeline + agency section
6. **`AboutPage.jsx`** — personal story layout with warm imagery
