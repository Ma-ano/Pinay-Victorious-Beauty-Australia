# Technical Notes

## AdminUsersPage — API + Polling (Reverted)

The users page was initially rewritten to use Firestore `onSnapshot` with cursor pagination, but was reverted back to the original API-based polling pattern. The API route fetches users from Firebase Auth + Firestore and returns paginated results.

**Current architecture:**
- `fetch('/api/admin/users?search=...&role=...&status=...&page=...')` fetches paginated users
- `setInterval` polls every 10s with `fetchUsersRef` pattern to prevent stale closures
- `ListResponse` interface for API response typing
- Manual `fetchUsers()` calls after mutations (role change, status toggle, delete)
- `useCallback` wraps `fetchUsers` with `[search, roleFilter, statusFilter, page]` dependencies

## Verified Status — Firestore Sync

`emailVerified` was previously only stored in Firebase Auth, not in Firestore docs. Three changes fix this:

1. **`register/route.ts`** — New users get `emailVerified: false` written to their Firestore doc at signup
2. **`verify-otp/route.ts`** — After OTP verification, writes `emailVerified: true` to Firestore: `db.collection("users").doc(user.uid).update({ emailVerified: true })`
3. **`sync-verification/route.ts`** — POST endpoint that paginates through all Firebase Auth users (1000 at a time via `listUsers` with `pageToken`), batch-updates each Firestore doc with the real `emailVerified` value from Auth
4. **`AdminUsersPage.tsx`** — Calls `POST /api/admin/sync-verification` once on mount (silent, `.catch(() => {})`)

## AdminProductsPage — Cost-Optimized Fetching

Replaced `subscribeProducts` (onSnapshot with 200 limit) with direct Firestore `getDocs`:

**Data sources:**
- `products`: table display data — fetched via `getDocs` with `limit(15)` + cursor pagination (no filters) or `getDocs` all matching + client-side post-filter (filters active)
- `allProducts`: bundle form data — fetched once via `getAllProducts()` on mount, independent of table pagination

**Query modes:**
- No filters: `getDocs` with `orderBy("createdAt")`, `limit(15)`, `startAfter(cursor)` — 15 reads per page. Total count from `getCountFromServer`
- Search/filters active: `getDocs` with optional `where("category")` / `where("type")` + client-side filter for brand, price range, availability, images, variants. `hasFilters` boolean gates the mode

**Pagination:**
- `pageCursors` ref: `Map<number, DocumentSnapshot | null>` stores the last doc of each page
- `displayTotal` computed: `hasFilters ? ceil(products.length / pageSize) : ceil(total / pageSize)`
- `displayProducts` computed: `hasFilters ? products.slice(...) : products`

## Verify Email Redirect — Full Page Reload

`router.push("/")` was replaced with `window.location.href = "/"` on all three redirects:
1. Unauthenticated users → `/login`
2. Already verified users → `/`
3. Post-verification → `/` after 1.5s timeout

This forces a full page reload, re-initializing Firebase Auth so the verify email banner in the navbar correctly disappears.

Removed unused `useRouter` import and `router` dependency from `handleVerify` useCallback.

## Build Error Fix — `Set<unknown>` Type

**Error:** `Set<unknown>` not assignable to `Set<string>` in `AdminSettingsPage.tsx:63`

**Root cause:** `.filter(Boolean)` after `.map()` strips the generic type to `unknown[]`, making `new Set(...)` return `Set<unknown>`.

**Fix:** Added explicit generic: `new Set<string>(...)`

```typescript
// Before
const savedIds = new Set((data.reviews || []).map((r: any) => r._id).filter(Boolean));
// After
const savedIds = new Set<string>((data.reviews || []).map((r: any) => r._id).filter(Boolean));
```

## Bubble Button Styling

Action buttons on both `/admin/products` and `/admin/users` use consistent styling:

| Button | Classes |
|--------|---------|
| Edit | `px-2.5 py-1 text-xs font-medium rounded-full border border-accent/30 text-accent hover:bg-accent/10 transition-colors` |
| Delete | `px-2.5 py-1 text-xs font-medium rounded-full border border-red-300 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors` |
| Confirm | `px-2.5 py-1 text-xs font-medium rounded-full border border-red-400 text-red-500 hover:bg-red-50 ...` |
| Cancel | `px-2.5 py-1 text-xs font-medium rounded-full border border-primary/20 text-foreground hover:bg-primary/10 transition-colors` |
| Enable/Disable | `px-2.5 py-1 text-xs font-medium rounded-full border border-accent/30 text-accent hover:bg-accent/10 ...` |
| Prev/Next (users) | `px-3 py-1.5 rounded-full border border-card-border ...` |
| Page number | `w-8 h-8 rounded-full text-sm font-medium transition-all ...` |
| Prev/Next (products) | `px-3 py-1.5 text-sm rounded-full border border-primary/20 ...` |

Product count moved to the left side of Previous/Next buttons in a centered `gap-6` row.

## Vercel Environment Variables Sync

All 24 env vars from `.env` have been uploaded to Vercel **Production** and **Preview (testing branch)**:
- Old vars deleted first (from production, preview, development)
- New vars uploaded fresh from `.env` contents
- `FIREBASE_ADMIN_PRIVATE_KEY` handled with `\n`→actual newline conversion
- Preview vars scoped to `testing` branch

## Key Files

```
M src/app/admin/(dashboard)/products/AdminProductsPage.tsx  — getDocs cursor pagination, cost-optimized, bubble buttons
M src/app/admin/(dashboard)/users/AdminUsersPage.tsx        — API + polling (reverted), bubble buttons, auto-sync
M src/app/admin/(dashboard)/settings/AdminSettingsPage.tsx  — Set<string> build fix
M src/app/api/auth/register/route.ts                        — emailVerified: false in Firestore doc
M src/app/api/auth/verify-otp/route.ts                      — writes emailVerified: true to Firestore
A src/app/api/admin/sync-verification/route.ts              — backfills emailVerified from Auth to Firestore
M src/app/verify-email/VerifyEmailPage.tsx                   — window.location.href redirect, full page reload
```
