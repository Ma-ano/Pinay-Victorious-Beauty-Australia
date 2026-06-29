# What's New — June 29, 2026

Here are the latest changes to your website, explained simply.

---

## 1. Product Sorting Fixed
Products without any sales or ratings used to get randomly scattered in "Best Sellers" view because the website couldn't handle the empty values. Now they're treated as zero sales/ratings, so everything sorts properly.

## 2. Wishlist Heart Moved (Product Cards)
The heart button to save items to your wishlist used to sit on top of the product photo (top-right corner). Now it's moved to the bottom of the photo, right next to the "Quick Add" button as a matching square button. When you add/remove items from the wishlist on a product card, the wishlist page automatically updates too.

## 3. Wishlist Heart Moved (Product Detail Page)
On the individual product page, the heart button was on the product photo as well. Now it sits right beside the "Add to Cart" button, so you can see it while you're about to buy.

## 4. Heart Color
The outline of the heart icon is now pure black (instead of dark gray), making it more visible.

## 5. Price Range — No More Slider
The price range slider was replaced with simple "From" and "To" text boxes where you type the numbers directly. No more up/down spinner buttons, no more layout shifting when the slider moves. Just type a minimum and maximum price.

## 6. "Price Range" Label Added
A "Price Range" label now sits next to the from/to boxes, and the whole thing is pushed to the right side of the filter bar on desktop.

## 7. Navbar Works on All Screen Sizes
A major overhaul to make sure the top navigation bar works perfectly at every browser size from phone to giant monitor.

**What changed:**
- **Desktop nav** now starts showing at 1024px width (instead of 768px). Tablets in portrait mode will see the hamburger menu instead of cramped nav links.
- The **Categories dropdown** used to fly off the left side of the screen on smaller laptops — now it always stays visible and grows/shrinks to fit the screen width. On short screens the dropdown scrolls instead of going off the bottom.
- **Nav links** (Home, Shop, Sale, About, Contact) are now in a scrollable area — if they don't all fit, you can scroll horizontally to see the rest. The scrollbar is hidden so it still looks clean.
- The **Categories button** is placed outside the scroll area so the dropdown can't be accidentally clipped.

**How it behaves at every screen size:**

| Device | Width | What you see |
|--------|-------|-------------|
| Small phone | 320-400px | Hamburger menu, categories inside mobile menu |
| Phone | 400-640px | Same |
| Large phone | 640-768px | Same |
| Tablet | 768-1024px | Same (hamburger menu) |
| Small laptop | 1024-1280px | Full desktop nav, compact spacing, scrollable if needed |
| Standard laptop | 1280-1536px | Full desktop nav, comfortable spacing |
| Large monitor | 1536px+ | Full desktop nav, plenty of room |

## 8. Categories Dropdown — Cleaner Design
The dropdown when you click "Categories" in the navbar has been tidied up — less padding, smaller text, more compact spacing, and two columns instead of three on smaller laptop screens. It looks cleaner and fits better.

---

## Technical Notes (for reference)
- All changes compile successfully (zero build errors)
- Everything in update.md from previous sessions still applies
- The responsive navbar changes affect CustomerNavbar.tsx (nav links restructured, Categories moved outside scrollable wrapper, dropdown compacted)
- The price range changes affect ShopPage.tsx (slider replaced with text inputs)
- Wishlist changes affect ProductCard.tsx, WishlistButton.tsx, ProductDetailPage.tsx, and ProductVariantSelector.tsx
