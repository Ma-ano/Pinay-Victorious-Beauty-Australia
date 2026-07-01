# What's New — July 1, 2026

Here are the latest changes to your website, explained simply.

---

## 1. Heart Button Now Turns Red When Clicked
On the product detail page, clicking the heart button to save an item to your wishlist now correctly turns it red. Previously the heart stayed dark because of a styling conflict — that's fixed.

## 2. Buttons Feel Like Real Buttons
Every button on the site now gives a tiny "press down" effect when you click it (it shrinks slightly for a split second). This makes clicking feel more responsive and satisfying.

## 3. Reviews Show 10 at a Time
If a product has a lot of reviews, only the first 10 are shown. A "Show more reviews" button appears below so you can load more in batches of 10. Changing the sort order resets back to 10.

## 4. About Page Numbers Are Now Real
The stats on your About page (Happy Customers, Asian Beauty Brands, Countries Reached) used to be made-up placeholder numbers. They now pull from your actual database — customer counts, product brand counts, and countries from real orders.

## 5. Google Sign-In No Longer Shows Your Photo
When signing in with Google, your profile picture is no longer saved or displayed. Instead, your initials appear in a colored circle, keeping the design consistent for all users.

## 6. Admin Sidebar Stays in Place While Scrolling
The sidebar in the admin panel now stays fixed on the left side of the screen even when you scroll down a long list of products or orders. The navigation buttons and theme toggle are always visible.

## 7. Product Forms Got Better
- **Text areas** (for Description, Ingredients, etc.) are now bigger — 5 lines tall instead of 2, so you can see more of what you're typing.
- **Modal headers** (title and X button) now stay pinned at the top when scrolling through a long product form — no more losing the close button.

## 8. Product Names Truncated in Admin Table
In the admin products list, long product names now wrap to a maximum of 2 lines and show an ellipsis (...) instead of expanding awkwardly.

## 9. About Page Redesigned
The About page got a full makeover with 6 sections: a hero banner, the brand story, "Why Choose Us" with icons, core values, real statistics, and a call-to-action. No emojis — all icons are clean inline SVGs.

## 10. Category Images in Admin Settings
In the admin settings page, category images now always show a preview box (even before one is uploaded). The preview is a perfect square so you can see exactly how it will look.

## 11. Pages Load With Glowing Gray Boxes
Major pages (Home, Shop, Sale, Wishlist, Orders, Checkout, Profile) now show gray placeholder shapes while content loads, instead of a spinning circle. This makes the page feel faster and avoids layout jumps.

## 12. Footer Spacing Tightened
The footer's spacing has been reduced so the copyright text sits closer to the content above it — less wasted space at the bottom of the page.

---

## Technical Notes (for reference)
- All changes compile successfully (zero build errors)
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
