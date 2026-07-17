# Image & Search Optimization — Technical Notes

## Image Optimization

### Objective
Eliminate Vercel Image Optimization transforms entirely. Replace request-time resizing with a pre-upload sharp pipeline that generates fixed WebP variants stored in Firebase Storage with aggressive caching. Maximize browser + CDN + edge cache hit rates.

### Config — `next.config.ts`

```ts
images: {
  unoptimized: true,                    // zero Vercel image transforms
  minimumCacheTTL: 60 * 60 * 24 * 30,   // 30-day browser cache
  qualities: [75, 85],                  // only these values allowed
}
```

**Why `unoptimized: true`?**
- Vercel Image Optimization runs per-request, costs $0.30–$0.50 per 1k transforms, and cannot set aggressive cache headers (optimizer bypasses CDN cache for resized images).
- With `unoptimized`, all `<Image>` components serve the exact file stored in Firebase — no server-side processing at request time.

### Sharp Pipeline — `src/app/api/admin/optimize-image/route.ts`

**Flow:**
1. Admin uploads original JPG/PNG via client-side `uploadImage()`
2. Client POSTs `{ downloadUrl, slug }` to `/api/admin/optimize-image`
3. Route fetches original from Firebase, generates 4 WebP variants via `sharp`:

| Variant | Size | Format | Quality | Use case |
|---------|------|--------|---------|----------|
| 200 | 200×200 cover | WebP | 80 | Thumbnails, search results |
| 400 | 400×400 cover | WebP | 80 | Product cards, category grids |
| 800 | 800×800 cover | WebP | 80 | Product detail page hero |
| 1200 | 1200×1200 cover | WebP | 80 | Full-width, zoom-ready |

4. Uploads to `products/{slug}/{size}.webp` with:
   ```
   Cache-Control: public, max-age=31536000, immutable
   ```
5. Returns `{ variants: { "200": "<url>", "400": "<url>", ... } }`

**Security:** Route is auth-guarded — requires valid admin session cookie + `isAdmin` custom claim.

### Client Upload — `src/lib/storage.ts`

New functions:

| Function | Purpose |
|----------|---------|
| `uploadOptimizedImage(file, slug)` | Uploads original, POSTs to optimize-image API, returns `{ url, variants }` |
| `deleteImageWithVariants(url, variants?)` | Deletes original + all variant files |
| `setImageCacheControl(url)` | Retroactively sets 1-year immutable cache on existing files |

### Rendering — `src/components/ImagePlaceholder.tsx`

When `variants` are present (non-empty `Record<string, string>`):
- Renders native `<img>` with `srcset` attribute
- Serves correct size for viewport via `sizes` attribute
- Browser caches aggressively (immutable URL = never re-fetched)
- Example output:
  ```html
  <img
    src="https://.../products/lip-gloss/1200.webp"
    srcset=".../200.webp 200w, .../400.webp 400w, .../800.webp 800w, .../1200.webp 1200w"
    sizes="(max-width: 768px) 100vw, 800px"
    loading="lazy"
    fetchpriority="auto"
  />
  ```

When no `variants` (old products / backward compat):
- Falls back to `<Image>` component with existing behaviour

### Cache Architecture

| Layer | TTL | Mechanism |
|-------|-----|-----------|
| Firebase Storage | 1 year immutable | `cacheControl` metadata on upload |
| Browser | 30 days | `minimumCacheTTL` in config |
| Next.js Edge | 1 hour | `Cache-Control: public, s-maxage=3600` |
| Stale-while-revalidate | 10 days | `stale-while-revalidate=864000` |

**Prerequisites for edge caching:**
- `cookies()` removed from root `layout.tsx` — layout is now fully static
- `sameSite: "lax"` on all cookies in `proxy.ts` (was `"strict"`, which broke edge cache)
- `force-dynamic` only on routes that need it (admin pages, check-out)

---

## Search Fix

### Problem
Navbar search navigated to `/shop?search=lipstick` but `ShopPage.tsx` initialized `search` state as `""` and never read `searchParams.get("search")`. Result: landing page showed all products unfiltered.

### Secondary Issues
1. Navbar only fetched first 20 products — products beyond #20 never appeared in dropdown
2. Search matched only `name` + `brand`, missing `category` / `subcategory`
3. No loading state — if fetch hadn't completed, dropdown said "No products found"

### Fixes Applied

**ShopPage.tsx**
- Search initializes from URL: `useState(searchParams.get("search") || "")`
- OnChange now syncs back to URL via `router.replace`

**CustomerNavbar.tsx**
- Product fetch: `getAllProducts(20)` → `getAllProducts(500)` (300+ products in catalog)
- Search fields expanded: now matches `name`, `brand`, `category`, `subcategory`
- Loading state: `productsLoaded` flag — shows "Searching..." while fetching

### Limit Bumps (200 → 500)

All Firestore collection queries bumped to accommodate 300+ products and orders:

| File | Function | Old Limit | New Limit |
|------|----------|-----------|-----------|
| `product-store.ts` | `getAllProducts` (default) | 200 | 500 |
| `product-store.ts` | `getSaleProducts` | 200 | 500 |
| `product-store.ts` | `getProductsByCategory` | 200 | 500 |
| `product-store.ts` | `getProductsByBrand` | 200 | 500 |
| `stats-store.ts` | `getSiteStats` (products query) | 200 | 500 |
| `CustomerNavbar.tsx` | navbar product fetch | 200 | 500 |

---

## Vercel Cost Impact

| Feature | Before | After | Savings |
|---------|--------|-------|---------|
| Image Optimization | ~$0.30–0.50/1k transforms | **$0** | 100% reduction |
| Serverless function reads | Build-time + per-visitor CDN | Same | No change |
| Firebase Storage bandwidth | ~$0.12/GB | Same (+ variant files) | Marginal increase |
| Firebase Storage storage | Original files only | +4 WebP variants per image | ~50–100KB per image |

Total: **~$5–15/month saved** depending on traffic, with <$0.50/month additional Firebase Storage cost.

---

## Commit History

```
ec7f8bb fix: bump product limits 200→500 and fix navbar search flow
20cfa73 feat: pre-upload sharp pipeline generating WebP variants with 1yr cache
217bdc7 perf: disable Vercel optimizer, add Cache-Control, fix Firestore queries
3c7f775 perf: reduce Vercel image transformations with explicit dimensions + cache
```

---

## Verification

- Upload a product image → check DevTools Network tab for `200.webp`, `400.webp`, etc.
- Firebase Console → Storage → `products/{slug}/` — confirm all 4 variants exist
- Product page → Inspect element → `<img srcset="...">` with WebP URLs
- Type in navbar search → should find products by name, brand, category, subcategory
- Search → Enter → `/shop?search=...` → page shows filtered results
