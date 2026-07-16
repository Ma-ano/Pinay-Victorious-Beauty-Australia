# Image Optimization — Verification Checklist

## Configuration

- [/] `next.config.ts` has `images.unoptimized: true`
  - **How:** Open `next.config.ts` — confirm `unoptimized: true` is under the `images` key. This disables Vercel's image optimization, so no server-side transforms happen at request time.

- [/] `next.config.ts` has `minimumCacheTTL: 2592000`
  - **How:** Look for `minimumCacheTTL: 2592000` — this sets browser `Cache-Control: max-age=2592000` (30 days) on all optimized images.

- [/] `next.config.ts` has `qualities: [75, 85]`
  - **How:** Confirm `qualities: [75, 85]` exists — this restricts allowed quality values. Every `<Image quality={...}>` must match one of these (e.g. `quality={75}` or `quality={85}`).

- [/] All `<Image>` components have explicit `width`, `height`, `quality`
  - **How:** `grep -rn "next/image"` or `grep -rn "<Image"` — each usage should have `width={N}`, `height={N}`, `quality={75|85}`. Logos/icons should have `unoptimized={true}`.

## Cache & CDN

- [I only see no-cache, must-revalidate] Public pages have `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`
  - **How:** In browser DevTools → Network tab, load any public page (e.g. `/shop`). Click the first HTML document request → Response Headers. Look for `Cache-Control`. Expected values: `public, max-age=3600, stale-while-revalidate=86400` for public pages, `private` or `no-cache` for auth pages.

- [/] `cookies()` removed from root `layout.tsx`
  - **How:** Open `src/app/layout.tsx` — confirm no `import { cookies } from "next/headers"` and no `cookies()` call. This ensures the root layout can be statically cached at the edge.

- [/] `sameSite: "lax"` on all cookies
  - **How:** Open `src/proxy.ts` — confirm all `response.cookies.set(...)` calls include `sameSite: "lax"`. Use DevTools → Application → Storage → Cookies to verify the `__session` cookie has SameSite=Lax.

## Firestore Query Limits

- [/] All `getAllProducts()` calls bounded with `.limit(N)`
  - **How:** `grep -rn "getAllProducts"` — confirm every call passes a limit (e.g. `getAllProducts(20)` for admin, `getAllProducts(8)` for homepage). No unbounded fetches.

- [ ] `getSaleProducts()` uses `where()` + `.limit(8)`
  - **How:** Open the file defining `getSaleProducts` — look for `where("onSale", "==", true)` and `.limit(8)`.

- [ ] `getProductBySlug()` uses `where("slug")` + `.limit(1)`
  - **How:** Open `src/lib/product-store.ts` — confirm `getProductBySlug` uses `where("slug", "==", slug)` and `.limit(1)`, not `getDocs(query(collection(db, "products")))`.

- [ ] `getProductsByIds()` uses batched `getDoc()` (not full scan)
  - **How:** Confirm it calls individual `getDoc(docRef)` for each ID or uses `getAll()` with `documentReferences()`, not a collection query.

- [ ] All promo/stats queries bounded with `.limit()`
  - **How:** Grep for `.limit(` in `src/lib/promotions-store.ts`, `src/lib/stats-store.ts`, admin pages — every Firestore query should have a cap.

## Sharp Pipeline (Server-side)

- [ ] `sharp` installed as dependency
  - **How:** Run `npm ls sharp` — should show `sharp@0.33.x` in the tree.

- [ ] `src/lib/firebase-admin.ts` exports `getAdminBucket()`
  - **How:** Open the file — confirm `import { getStorage } from "firebase-admin/storage"` is present and `export function getAdminBucket()` returns `getStorage(getAdminApp()).bucket()`.

- [ ] `src/app/api/admin/optimize-image/route.ts` exists and accepts POST with `{ downloadUrl, slug }`
  - **How:** Open the file. Confirm it's a Next.js Route Handler with `export async function POST(request: Request)`. Verify it parses the JSON body for `downloadUrl` and `slug`.

- [ ] API route generates 4 WebP sizes: 200, 400, 800, 1200 @ quality 80
  - **How:** In the route file, look for `const SIZES = [200, 400, 800, 1200]` and `sharp(buffer).resize(size, size).webp({ quality: 80 })`. Confirm `fit: "cover"` and `position: "centre"` are set.

- [ ] API route uploads to Firebase Storage with `cacheControl: "public, max-age=31536000, immutable"`
  - **How:** Look for `file.save(webpBuffer, { metadata: { ..., cacheControl: "public, max-age=31536000, immutable" } })` in the route.

- [ ] API route is auth-guarded
  - **How:** Look for `getAdminAuth().verifySessionCookie(session, true)` and `claims.isAdmin` check. Unauthorized requests should return 401/403.

## Client Upload Flow

- [ ] `src/lib/storage.ts` has `uploadOptimizedImage()`
  - **How:** Open the file — confirm `export async function uploadOptimizedImage(file, slug)` uploads the original, then POSTs to `/api/admin/optimize-image` to generate variants. Returns `{ url, variants }`.

- [ ] `src/lib/storage.ts` has `deleteImageWithVariants()`
  - **How:** Look for `export async function deleteImageWithVariants(downloadUrl, variants?)` — should delete the original and variant files.

- [ ] `src/lib/storage.ts` has `setImageCacheControl()`
  - **How:** Look for `export async function setImageCacheControl(downloadUrl)` — should call `updateMetadata()` to set `cacheControl: "public, max-age=31536000, immutable"`.

- [ ] Admin product upload page calls `uploadOptimizedImage()` instead of `uploadImage()`
  - **How:** Open `AdminProductsPage.tsx` — confirm `handleImageUpload` calls `uploadOptimizedImage(file, form.slug || file.name)` not `uploadImage(file, path)`.

- [ ] Admin product upload page stores `variants` in product data
  - **How:** Look for `images[index] = { ...images[index], url, variants }` in the upload handler.

- [ ] Admin delete product handler calls `deleteImageWithVariants()`
  - **How:** Find `handleDelete` — confirm it maps over `product.images` calling `deleteImageWithVariants(img.url, img.variants)`.

## ImagePlaceholder Component

- [ ] `ImagePlaceholder` accepts `variants?: Record<string, string>` prop
  - **How:** Open `ImagePlaceholder.tsx` — check the interface includes `variants?: Record<string, string>`.

- [ ] When `variants` exist, renders `<img>` + `srcset` instead of `<Image>`
  - **How:** In DevTools → Elements tab, view a product page image. Right-click → Inspect. If variants are saved, you should see `<img srcset="...200w, ...400w, ...800w, ...1200w" sizes="...">`. If not, you'll see `<img>` with the standard Next.js `<Image>` component.

- [ ] When `variants` are absent, falls back to `<Image>`
  - **How:** Upload a product without variants (or test on old products that lack the `variants` field). Inspect the image element — should render `<img>` with `srcset` absent.

- [ ] Skeleton components exist
  - **How:** Open `src/components/Skeletons.tsx` — confirm `TrendingSkeleton`, `BestSellingSkeleton`, etc. exist and match section names.

## Live Verification Walkthrough

### 1. Upload a product image via admin
   - Go to `/admin/products`, add a product, upload a JPG/PNG image.
   - Open DevTools → Network tab → filter by `optimize-image`.
   - You should see a POST to `/api/admin/optimize-image` with status **200**.
   - The response JSON should show `variants` with 4 URLs (200.webp, 400.webp, 800.webp, 1200.webp).

### 2. Check Firebase Storage
   - Go to [Firebase Console → Storage](https://console.firebase.google.com/).
   - Navigate to `products/{slug}/` — you should see:
     - `original.jpg` (or .png)
     - `200.webp`
     - `400.webp`
     - `800.webp`
     - `1200.webp`
   - Click any `.webp` file → Metadata tab → confirm `Cache-Control: public, max-age=31536000, immutable`.

### 3. Verify product page renders WebP variants
   - Open the product page in the browser (e.g. `/shop/{slug}`).
   - DevTools → Elements → find the product image element.
   - You should see `<img srcset="https://firebasestorage.googleapis.com/...200.webp 200w, ...400.webp 400w, ...800.webp 800w, ...1200.webp 1200w" ...>`.
   - Hover over the element — the browser should have loaded a `.webp` file (check Network tab, filter by `.webp`).

### 4. Run build
   ```powershell
   npm run build
   ```
   - Must complete with ✓ Compiled successfully and no TypeScript errors.

### 5. Verify Vercel Image Transformation usage drops
   - After deploying, go to [Vercel Dashboard → your project → Usage](https://vercel.com/).
   - Select "Image Optimization" tab.
   - With `unoptimized: true`, the count should be **0** (or negligible from any remaining non-admin `<Image>` tags that don't pass through the optimizer).

## Common Issues

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| API route returns 401 | Missing/expired `__session` cookie | Re-login as admin, check `sameSite: "lax"` |
| API route returns 500, `sharp` error | `sharp` not installed or native binary mismatch | Run `npm install sharp` or `npx sharp rebuild` |
| No variants in response | Admin page not calling `uploadOptimizedImage` | Check `handleImageUpload` imports and call |
| `<img>` renders without srcset | Product `images[variants]` field is empty | Upload new image (old products lack variants) |
| Build fails on missing `getStorage` import | `firebase-admin` version too old | `npm install firebase-admin@latest` |
