# Technical Notes

## 2026-07-04 — Admin users, email verification flow, navbar banner
- **Admin Users page** (`/admin/users`):
  - Removed "Create Admin" button, modal, state, and handler — role management is done via dropdown
  - Added `emailVerified` to API response (`route.ts`) and `AdminUser` interface
  - Photo URL: displays `<img>` when available, falls back to initial-letter avatar
  - Added "Verified" column: green "Verified" / gray "Unverified" badge
  - Added detail modal: click any row to open card with large avatar, name, email, role/status/verified badges, phone, full address, creation date, UID
  - Action buttons (Disable/Enable, Confirm, Cancel, Delete) and role select now call `e.stopPropagation()` so they don't trigger the row's detail modal
- **Login page** (`/login?verified=true`):
  - Banner now uses `bg-accent text-dark` (pink bg, black text) matching the login button color scheme
  - Message is context-aware: "Your email has been verified." if already logged in, "You can now log in." otherwise
- **Navbar unverified banner** (`CustomerNavbar.tsx`):
  - Added animated banner below navbar when `needsVerification` is true: `bg-accent text-dark` with "Verify now →" link
  - Banner is wrapped in the same fixed container as the nav so it slides up/down with the scroll animation
  - Spacer dynamically adjusts height to prevent layout shift (`h-[calc(3.5rem+34px)]`)
- **Verify flow** (`/verify-email`):
  - Unauthenticated users are redirected to `/login` (nothing to verify)
  - After OTP success, forces Firebase token refresh (`getIdToken(true)`) and does a full page reload via `window.location.href` — guarantees `emailVerified` state is fresh on the next page load
  - Redirects to `/?verified=true` (homepage) instead of `/login?verified=true`
- **Profile redirect**: Navbar profile button (desktop + mobile) redirects unverified users to `/verify-email` instead of `/profile`
- **VerifiedToast**: New `src/components/VerifiedToast.tsx` — reads `?verified=true` on homepage, shows a success toast "Your email has been verified!", cleans the URL with `router.replace("/")`
- **ImagePlaceholder**: LCP images auto-set `loading="eager"` + `fetchPriority="high"` when `preload={true}`
- **Product detail page**: Graceful fallback when Firebase Admin SDK unavailable — client-side `ProductDetailFetcher` catches `FirebaseAdminNotConfigured`
- **WishlistButton**: Fixed heart color — `dark:text-red-500` keeps heart red in dark mode

## 2026-07-04 — Tailwind v4 canonical class migration
- Replaced `bg-gradient-to-*` → `bg-linear-to-*` across 9 files
- Replaced `bg-[var(--background)]` → `bg-background` across 5 files (18 instances)
- Replaced `w-[120px]` → `w-30`, `w-[80px]` → `w-20`, `w-[34px]` → `w-8.5` in AdminProductsPage
- Replaced `break-words` → `wrap-break-word` (ProductDetailPage, ProductReviews)
- Replaced `max-w-[120px]` → `max-w-30`, `min-w-[*px]` → `min-w-*` for arbitrary values matching design tokens
- Replaced `min-h-[400px]` → `min-h-100`, `z-[60|100]` → `z-60|100`, `-ml-[5px]` → `-ml-1.25`
- Replaced `via-primary/[0.05]` → `via-primary/5`
- Removed duplicate `text-sm` conflicting with `text-xs` (AdminProductsPage line 474)
- Removed duplicate `capitalize` conflicting with `uppercase` (ProductDetailPage line 212)
- Added `.vscode/settings.json` → `css.lint.unknownAtRules: "ignore"` (suppresses `@theme` CSS linter warning)

## Earlier
- Firebase services converted to lazy getter functions (`getApp()`, `getAuthClient()`, `getDb()`, etc.) — eliminates module-level side effects, enables Fast Refresh in all Firebase consumer files
- `AuthContext.tsx` uses `getFirebase()` helper called inside functions only — no module-level `auth`/`db`/`googleProvider` vars
- Profile photo upload: switched from dynamic `await import("firebase/storage")` to static import (Turbopack tree-shaking fix); error messages show real reason
- All Firestore admin queries wrapped with `withTimeout()` (10s) to prevent cold-start hangs
- `.limit(1000)` added to `fetchAllReviewStats()` in admin-product-store
- Deduplicated `fetchProducts()` in `page.tsx` — called once, shared between TrendingWrapper and BestSellingWrapper
- Logo PNGs compressed: PinayVictoriousLogo 1.5MB→8KB, TitleBarLogo 906KB→2.9KB
- Added `preload={true}` to navbar logo (LCP element) and first 2 carousel products
- Added `relative` to `<Image fill>` wrapper div in HeroBanner
- Phone field in register: auto-formats `+61 XXX XXX XXX`, digits-only input, `+61` pre-filled
- Contact info in `site.ts`: Gmail, WhatsApp `+61 413 504 424`, Facebook, Instagram URLs
- Footer: WhatsApp link in Support column, WhatsApp icon in Follow column, social link corrections
- WhatsApp bubble: `href="https://wa.me/61413504424"`
