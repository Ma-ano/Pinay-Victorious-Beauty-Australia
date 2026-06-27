# Update — June 25, 2026

## What's New / Fixed

### 1. PayPal Debit / Credit Card Payments
- "Debit / Credit Card" option at checkout is handled via PayPal (no separate gateway needed)
- `fundingSource` (`"card"` or `"paypal"`) is extracted from PayPal's capture response via `payment_source`
- Stored on Firestore orders so the admin panel shows "via Debit / Credit Card" or "via PayPal"
- Customer orders page also shows the funding source next to the payment method

### 2. Order Summary Stays Light Mode (Always)
- The Order Summary on checkout is permanently forced to light mode — white background, gray/dark text
- Unaffected by the site's dark mode toggle
- All text uses `text-gray-900` / `text-gray-500` / `text-gray-600` instead of theme variables

### 3. Promo Code Input Text Fixed in Dark Mode
- Global CSS rule `.dark input { -webkit-text-fill-color: #ffffff }` was overriding promo code input text to white
- Added inline `style` with explicit `color` and `WebkitTextFillColor: #111827` so it stays black in light + dark mode

### 4. Firestore Rules Updated & Deployed
- Products: `allow delete` added (was missing before)
- Orders: status transitions now allow `["received", "completed"]` from `"delivered"`
- Deployed via `firebase deploy --only firestore`

### 5. Admin Products Page — Better Form & UX
- **"Pricing" and "Stock & Variants" sections merged** into "Pricing & Stock" with a clear radio toggle ("Simple product" / "Product with options")
- **Required attributes** added to all 7 fields marked with `*` (name, category, type, selling price, description, detail, ingredients)
- All 4 price labels/column headers now show **"(AUD)"**
- Variant price columns widened from 100px → 120px
- Modal width increased from `max-w-xl` → `max-w-3xl`
- Price table now displays `originalPrice` for strikethrough (not `salePrice`)
- `handleSave` uses `effectivePrice` (first variant price) when variants exist
- Price validation skips main price when variants exist, validates per-variant instead

### 6. Admin Orders Page — Refined
- Courier `<select>` dropdown replaced with a plain `<input type="text">` (so any courier name can be entered)
- Deprecated `COURIERS` constant removed
- Added `fundingSource` to `FirestoreOrder` interface — displays "via Debit / Credit Card" on the order modal
- All modal labels/headings changed from `text-dark` → `text-foreground` so they invert properly in dark mode

### 7. Customer Orders Page — Better Tracking
- Tracking info shown for **any courier name** (not just JNT)
- When a tracking URL is present, it's rendered as a clickable link
- Added `fundingSource` to `CustomerOrder` interface

### 8. HomePage Cleanup
- Removed `PromotionCards` section
- Removed "On Sale" section
- Removed `Newsletter` ("Join Our Glow Community")
- Cleaned up unused `saleProducts` state and `setSaleProducts` calls (fixed a ReferenceError)

### 9. Bug Fixes
- **Promotions save bug:** `createdAt: undefined` was being passed to Firestore on updates — fixed with conditional object spread
- **`deleteImage`:** Now calls `getMetadata` before `deleteObject` to avoid 404 network noise in console
- **`product-store.ts`:** `deleteProduct` catches `permission-denied` and re-throws as a simple error so the UI can show a helpful toast

### 10. Checkout Page — Visual Polish
- Page width expanded from `max-w-4xl` → `max-w-7xl` (matches home/shop pages)
- Staggered fade-in animations on all sections (heading, shipping, payment, order summary)
- `shadow-sm` added to all section cards for subtle depth
- Payment option radio cards now have `hover:border-accent/30` for a subtle highlight on hover

### 11. New Backend APIs & Infrastructure
- **PayPal integration:** Server-side `create` and `capture` routes (`src/app/api/payments/paypal/`)
- **PayPal client library:** `src/lib/paypal.ts` — generates access tokens, creates/captures orders
- **Rate limiting:** `src/lib/rate-limit.ts` — used by contact form (3 messages/hour/IP)
- **Admin login API:** `src/app/api/auth/admin-login/` — separate auth endpoint for admins
- **Create admin API:** `src/app/api/admin/users/create-admin/` — promotes a user to admin
- **Order approve/reject APIs:** `src/app/api/admin/orders/` — approve and reject with PayPal refund
- **Debug endpoint:** `src/app/api/debug/check-env/` — checks environment variables
- **Firebase deployment scripts:** `scripts/deploy-rules.mjs` — deploys Firestore rules via Firebase CLI
- **Format utility:** `src/lib/format.ts` — centralized `formatPrice()` using `en-AU` locale

### 12. Other Minor Changes
- `.env.example` cleaned up with clearer PayPal/Firebase/SMTP sections
- Admin sidebar tweaks, footer adjustments, cart context fixes
- Various `text-dark` → `text-foreground` replacements across the site for consistent dark mode

---

## Still Not Working

### Firestore ERR_BLOCKED_BY_CLIENT
If you see this in the browser console, it's **not a code issue** — browser ad-blockers or privacy extensions block Firebase connections. Try disabling the extension or adding the site to the allow list.

---

## Technical Notes
- Build passes with zero errors
- All existing features (shop, cart, checkout, orders, reviews, wishlist, profile, admin panel) remain functional
- PayPal sandbox testing requires a separate buyer account (see `paypal-fix.md`)
- `formatPrice()` uses `en-AU` locale and `"AUD"` currency, outputs `AU$`
- Firebase deploy: `firebase deploy --only firestore`
- Firestore rules require admin auth: `request.auth.token.isAdmin == true`

---

*Generated from the work session on June 25, 2026*
