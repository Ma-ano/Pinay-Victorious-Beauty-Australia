# What's New — July 2, 2026

Here are the latest changes to your website, explained simply.

---

## 1. Website Loads Much Faster (Homepage)

The homepage now shows a full-page branded loader while everything loads, then reveals all content at once — no more pieces popping in one by one. Product images are preloaded in the background so they appear instantly when the page shows.

## 2. Auth Session & Navbar Fixed

**Two bugs fixed:**
- **Endless session requests** — The browser was making `POST /api/auth/session` calls repeatedly in a loop (sometimes thousands). This is now stopped by removing the forced token refresh inside the auth listener.
- **Navbar re-rendering** — The navbar was refreshing its user state twice on every auth change, causing visual flicker. Now it updates once and stays stable.

**Bonus:** Your Google profile photo now shows when you sign in (it was being discarded before — your photo will now appear in the navbar).

## 3. PayPal Integrated (Pay Now + Cards)

You can now accept PayPal and credit/debit card payments at checkout. Three button slots always show — PayPal, Pay Later placeholder, and Card — and PayPal decides which ones are available for each transaction. No more redirecting to PayPal; everything happens right on your checkout page.

## 4. Order Statuses Simplified

The admin order panel now uses only 5 statuses: **Processing → Approved → Completed** for the happy path, with **Rejected** and **Cancelled** for problem orders. Old orders with "delivered", "shipped", "pending", or "paid" statuses are automatically displayed in the correct category — no data lost.

## 5. COD Orders Auto-Pay on Completion

When you mark a Cash on Delivery order as **Completed**, the payment status is automatically set to **Paid** — no extra step needed. There's also a **Mark as Paid** button for edge cases where the customer paid outside the system.

## 6. PayPal Refunds on Rejection

When you **Reject** a paid PayPal order, the system automatically processes a refund through PayPal before marking it as rejected. No more manual refunds.

## 7. Colored Badges Everywhere

Payment methods, payment statuses, and order statuses now show colored badges at-a-glance:
- **Payment**: PayPal (blue), COD (orange)
- **Payment Status**: Paid (green), Pending (yellow), Failed (red)
- **Order Status**: Processing (blue), Approved (purple), Completed (green), Cancelled (red), Rejected (red)

## 8. Simplified Payment Data

The system no longer tracks "Card" as a separate payment method or "Pay Later" / "Pay Now" as payment types. Everything is simply **PayPal** or **COD** — keeping the admin panel clean and easy to understand.

## 9. Admin Filters Cleaned Up

The Payment Type filter row is gone. Payment filters now show just **All**, **COD**, and **PayPal** — no more confusing extra options.

## 10. 404 Page Added

If someone visits a page that doesn't exist, they'll see a clean "Page Not Found" page with a button to go home instead of a blank error screen.

## 11. Faster Checkout Load

The PayPal SDK was updated to the latest version and unnecessary libraries were removed, making the checkout page load faster.

---

## Important Notes
- **Pay Later**: Removed from checkout for now. Will be added back in a future update with Afterpay integration.
- **Afterpay**: Integration was started but rolled back. Coming in Phase 2.
- **Old orders**: All previous orders still display correctly with their original data preserved in the database.

---

## Technical Notes (for reference)
- AuthContext.tsx: removed `getIdToken(true)` from `syncSession` and `onIdTokenChanged` listener — breaks recursive session sync loop. Added `syncSession` to `login()` only. Merged two `setUser` calls into one (fixes double navbar re-render). Memoized context value with `useMemo`. Preserved `photoURL` from Firebase user object.
- HomePage.tsx: uses `useHomeData()` hook with 400ms minimum loader + image preloading.
- FullPageLoader.tsx: branded full-screen loader with logo + shimmer bar.
- HomeContent.tsx: extracted content component with fade-in transition.
- TrendingSection.tsx / BestSellingSection.tsx: per-section data isolation, own skeleton components.
- Skeletons.tsx: added TrendingSkeleton, BestSellingSkeleton, ReviewsSectionSkeleton.
- ReviewCard.tsx: uses Next.js `<Image>` for profile photos with letter-avatar fallback.
- ImagePlaceholder.tsx: `unoptimized` prop to match preloaded image URLs, responsive `sizes`.
- useHomeData.ts: enforces 400ms min loader, preloads first 8 product images via `new Image()`.
- AdminOrdersPage.tsx: simplified statuses, transitions, colored badges, COD auto-payment, Mark as Paid.
- OrdersPage.tsx: simplified status display, backward compat mapping.
- approve/route.ts: COD auto-payment logic.
- reject/route.ts: PayPal refund on reject, sets rejected status.
- CheckoutPage.tsx: PayPal radio + sticky Order Summary.
- PayPalProvider.tsx / PayPalButtonGroup.tsx: v6 SDK with vanilla rendering.
- not-found.tsx: custom 404 page.
- package.json: removed @paypal/react-paypal-js.
- AGENTS.md: updated with project conventions.

---

# Previous Updates

## 1. Heart Button Now Turns Red When Clicked
On the product detail page, clicking the heart button to save an item to your wishlist now correctly turns it red. Previously the heart stayed dark because of a styling conflict — that's fixed.

## 2. Buttons Feel Like Real Buttons
Every button on the site now gives a tiny "press down" effect when you click it (it shrinks slightly for a split second). This makes clicking feel more responsive and satisfying.

## 3. Reviews Show 10 at a Time
If a product has a lot of reviews, only the first 10 are shown. A "Show more reviews" button appears below so you can load more in batches of 10. Changing the sort order resets back to 10.

## 4. About Page Numbers Are Now Real
The stats on your About page (Happy Customers, Asian Beauty Brands, Countries Reached) used to be made-up placeholder numbers. They now pull from your actual database — customer counts, product brand counts, and countries from real orders.

## 5. About Page Redesigned
The About page got a full makeover with 6 sections: a hero banner, the brand story, "Why Choose Us" with icons, core values, real statistics, and a call-to-action.

## 6. Admin Sidebar Stays in Place While Scrolling
The sidebar in the admin panel now stays fixed on the left side of the screen even when you scroll down a long list of products or orders. The navigation buttons and theme toggle are always visible.

## 7. Product Forms Got Better
- **Text areas** (for Description, Ingredients, etc.) are now bigger — 5 lines tall instead of 2, so you can see more of what you're typing.
- **Modal headers** (title and X button) now stay pinned at the top when scrolling through a long product form — no more losing the close button.

## 8. Product Names Truncated in Admin Table
In the admin products list, long product names now wrap to a maximum of 2 lines and show an ellipsis (...) instead of expanding awkwardly.

## 9. Category Images in Admin Settings
In the admin settings page, category images now always show a preview box (even before one is uploaded). The preview is a perfect square so you can see exactly how it will look.

## 10. Pages Load With Glowing Gray Boxes
Major pages (Home, Shop, Sale, Wishlist, Orders, Checkout, Profile) now show gray placeholder shapes while content loads, instead of a spinning circle. This makes the page feel faster and avoids layout jumps.

## 11. Footer Spacing Tightened
The footer's spacing has been reduced so the copyright text sits closer to the content above it — less wasted space at the bottom of the page.

## 12. Google Sign-In No Longer Shows Your Photo
When signing in with Google, your profile picture is no longer saved or displayed. Instead, your initials appear in a colored circle, keeping the design consistent for all users.

---

## Technical Notes (for reference, previous updates)
- WishlistButton.tsx: className reordering fixes heart color on product detail page
- globals.css: added button:active for click feedback
- ProductReviews.tsx: added visibleCount state and "Show more" button
- AboutPage.tsx: now fetches stats from Firestore via lib/stats-store.ts
- AuthContext.tsx: Google photo URL no longer saved to user profile
- AdminSidebar.tsx: added sticky positioning
- AdminProductsPage.tsx: larger textareas, sticky modal header, truncated names
- AdminSettingsPage.tsx: always-rendered square preview for category images
- ProductCardSkeleton, ProductGridSkeleton, etc. — new components under Skeletons.tsx
- Footer.tsx: reduced vertical padding
- AboutPage.tsx: full redesign with SVG icons and glass-card values section
