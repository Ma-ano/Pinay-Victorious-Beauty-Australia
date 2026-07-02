# Website Update Summary — July 2, 2026

## What Changed

**Performance overhaul.** The homepage now streams in sections instead of loading everything at once — hero image shows immediately, then products and reviews appear as they're ready. No more blank screen with a loading spinner.

**Images optimized.** Product cards, category icons, and logos are served as smaller WebP files. The hero banner keeps direct delivery from Firebase Storage (faster for large images).

**Layout shifts fixed.** Login error messages, shop product grids, the hero banner, footer, and category icons all reserve their space before loading — nothing jumps around anymore.

**First paint faster.** Removed fade-in delays, theme-switch animations, and redundant image preloading. Content is visible on the first frame.

**Caching enabled.** Homepage and shop page now cache for 60 seconds — returning visitors get instant loads.

**PayPal moved to checkout only.** The PayPal SDK (25KB) no longer loads on every page — just the checkout page.

**Bug fixes.** Fixed an endless loop of session requests that could fire thousands of times. Fixed the navbar flashing twice on login/logout. Google profile photos now display correctly.

**PayPal integrated.** Customers can pay with PayPal or credit/debit cards directly on the checkout page — no redirect.

**Order management improved.** Order statuses simplified to 5: Processing → Approved → Completed / Rejected / Cancelled. COD orders auto-mark as paid when completed. PayPal refunds process automatically on rejection.

**Admin panel cleaner.** Colored badges for payment methods and order statuses. Payment filters simplified. 404 page added. Textareas enlarged, modal headers pinned, product names truncated.

---

## Technical Notes

### Architecture — Homepage Streaming
- `src/app/page.tsx` (server component, `revalidate = 60`): fetches settings only, renders Hero immediately, then streams each section via `<Suspense>` with matching skeleton fallbacks
- `TrendingWrapper` (inline server component): fetches products + reviewStats via admin SDK, renders `<TrendingSection products reviewStats />`
- `BestSellingWrapper` (inline server component): fetches products via admin SDK, renders `<BestSellingSection products />`
- `ReviewSection`: uses `settings.reviews` fetched at page level, no Suspense needed
- **Deleted**: `HomePage.tsx`, `HomeContent.tsx`, `useHomeData.ts`, `FullPageLoader.tsx` — monolithic full-page blocking loader replaced with streaming

### Firebase Query Optimization
- `admin-product-store.ts`: added `fetchProducts({limit})` with `.select(LIST_FIELDS)` — excludes `description`, `detail`, `shippingReturns`, `ingredients` from home/shop carousel queries; uses `.limit(n)` to cap reads
- Fields selected: `name`, `slug`, `category`, `subcategory`, `type`, `brand`, `price`, `originalPrice`, `salePrice`, `images`, `rating`, `reviews`, `sold`, `isNew`, `isSale`, `discount`, `stock`, `variants`, `isBundle`, `bundleItems`, `bundlePrice`
- Existing `fetchAllProducts()` (no select, no limit) kept for admin pages that need full product data
- Client-side `getAllProducts()` in `product-store.ts` still uses `.limit()` constraint when `max` arg provided

### Auth Fix
- `AuthContext.tsx`: removed `getIdToken(true)` from `syncSession` and `onIdTokenChanged` listener — stops recursive session sync loop. Merged two `setUser` calls into one. Memoized context value with `useMemo`. Preserved `photoURL` from Firebase user object.

### Image Optimization
- `HeroBanner.tsx`: `unoptimized` (CDN direct), `preload={current === 0}`, `fetchPriority="high"`, `h-[50vh] min-h-[400px]` (fixed height)
- `ImagePlaceholder.tsx`: `quality={75}`, optional `preload` prop, responsive `sizes`
- `CategoryPreview.tsx`: `quality={75}`, `width={36} height={36}` (matches mobile container)
- `CustomerNavbar.tsx` / `Footer.tsx`: explicit `width={160} height={56}` / `width={200} height={70}` on logos
- `next.config.ts`: `images.qualities: [75]`, `remotePatterns` for Firebase Storage, Google, Unsplash
- `ProductCard.tsx`: `aspect-square` container, passes `preload` from parent

### CLS Fixes
- `Footer.tsx`: removed `mt-auto`
- `LoginPage.tsx`: error wrapped in `min-h-[20px]`, verified banner in `min-h-[52px]`
- `ShopPageSkeleton`: renders only `ProductGridSkeleton` (no extra wrapper div)
- `globals.css`: removed `transition: background-color 0.3s, color 0.3s` from `body` — theme switch is instant
- `HeroBanner.tsx`: `min-h-[50vh]` → `h-[50vh] min-h-[400px]`
- `CategoryPreview.tsx`: image dimensions 44→36px match container

### CLS Prevention Patterns
- `useSearchParams()` → wrap in `<Suspense>` boundary
- Dynamic banners → reserve space with `min-h` wrappers
- Skeleton dimensions → match real content exactly (same grid, same gap, same border-radius)
- Images → always explicit `width`/`height` or `aspect-ratio` container

### ISR Configuration
- Homepage (`page.tsx`): `revalidate = 60`
- Shop page (`shop/page.tsx`): `revalidate = 60`
- Both replaced `force-dynamic`

### LCP Optimization
- Shop first product card: `preload={true}` on `<Image>`
- `animate-fade-in-up` removed from product cards (hid content for 700ms)
- No opacity fade-in on homepage sections
- `fetchPriority="high"` on hero image
- Preconnect `https://firebasestorage.googleapis.com` in root `layout.tsx`

### PayPal Integration
- `CheckoutPage.tsx`: PayPal radio + sticky Order Summary
- `PayPalProvider.tsx` / `PayPalButtonGroup.tsx`: v6 SDK with vanilla rendering (no `@paypal/react-paypal-js`)
- `checkout/page.tsx`: `<PayPalProvider>` wrapper — SDK loads only on checkout
- `package.json`: removed `@paypal/react-paypal-js`

### Order Management
- `AdminOrdersPage.tsx`: 5 statuses (Processing/Approved/Completed/Rejected/Cancelled), colored badges, COD auto-payment on complete, Mark as Paid button
- `OrdersPage.tsx`: backward-compatible status mapping
- `approve/route.ts`: COD auto-payment logic
- `reject/route.ts`: PayPal refund on reject

### Other
- `layout.tsx`: added `<SpeedInsights />`, removed `<PayPalProvider>`
- `not-found.tsx`: custom 404 page
- `Skeletons.tsx`: `TrendingSkeleton`, `BestSellingSkeleton`, `ReviewsSectionSkeleton`, `ShopPageSkeleton`
- `ReviewCard.tsx`: `<Image>` for profile photos with letter-avatar fallback
- `ReviewSection.tsx`: animated carousel, 10s auto-advance, hover-pause
- `SalePage.tsx` / `WishlistPage.tsx` / `OrdersPage.tsx`: skeleton loading patterns
- `AdminProductsPage.tsx`: larger textareas, sticky modal header, truncated names (line-clamp-2)
- `AdminSettingsPage.tsx`: always-rendered square preview for category images
- `AdminSidebar.tsx`: `sticky` positioning
- `AboutPage.tsx`: stats from Firestore, redesign with SVG icons and glass cards
- `WishlistButton.tsx`: className reordering fixes heart color
- `globals.css`: `button:active` scale transform for click feedback
- `ProductReviews.tsx`: paginated (10 per batch), "Show more" button
