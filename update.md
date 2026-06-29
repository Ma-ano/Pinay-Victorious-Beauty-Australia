# Update — June 29, 2026

## What's New / Fixed

### 1. Browser Tab Icon
- The icon on your browser tab now shows **TitleBarLogo.png** instead of the old default favicon

### 2. Bundle / Gift Set System
- Products can now be marked as **"Bundle Set"** with a simple checkbox in the admin form
- When checked, you can select which products are included in the bundle
- The bundle price can be set manually, or it auto-calculates from the included products
- Bundle stock is **automatically calculated** — it shows the lowest stock count among all included items (so if Product A has 32 and Product B has 44, the bundle stock is 32)
- The "Type" column in the admin products table shows "Bundle" or "Single" so you can see at a glance

### 3. Smarter Admin Product Form
- When "Bundle Set" is checked:
  - **Category** automatically shows "Gift Sets & Bundles" (no need to pick)
  - **Subcategory** and **Type** are greyed out (not applicable for bundles)
  - **Pricing & Stock section** is disabled (managed through the bundle builder)
- When unchecking "Bundle Set", all pricing fields go back to normal
- **Selling Price** no longer blocks saving a bundle product
- The **Slug** now updates instantly as you type the product name, and is greyed out since it's auto-generated

### 4. Out-of-Stock Products Hidden from Bundle Picker
- Products that are out of stock don't appear in the bundle selection list
- Only in-stock products can be added to a bundle

### 5. Bundle Display on Product Page
- Bundle products show an **"Includes"** list with mini images and prices of each included item
- A green **"All in stock"** or red **"Some out of stock"** badge tells you the bundle's status
- The **"Add to Cart"** button is disabled with **"Out of Stock"** if any included product is out of stock

### 6. Bundle Badge on Product Cards
- Bundle products show a **"Bundle Set"** badge on product cards throughout the shop

### 7. Related Products
- Product pages now show up to **4 related products** from the same category at the bottom

### 8. Navbar Categories Restored & Reorganized
- The categories dropdown now shows **all 13 categories** including Best Sellers, New Arrivals, Gift Sets & Bundles, and Sale & Promotions
- Clicking **Sale & Promotions** goes directly to the `/sale` page (not the shop)
- Clicking **a regular category** filters the shop by that category
- Navbar shows categories + subcategories only (no product types)

### 9. Shop Page — Category Buttons
- The 4 meta-categories (Best Sellers, New Arrivals, Gift Sets & Bundles, Sale & Promotions) removed from the shop page filter buttons to avoid duplicate paths
- Each category click now sets URL params correctly and filters properly

### 10. Shop Page — Special Category Behaviors
- **Best Sellers**: Shows ALL products sorted by most sold (descending). User can override sort via the dropdown.
- **New Arrivals**: Shows only products marked as `isNew`
- **Gift Sets & Bundles**: Shows ALL products with bundles sorted to the top
- **Sale**: Only accessible via the navbar `/sale` link (dedicated page)

### 11. New Subcategory Filter on Shop Page
- Added a **subcategory filter row** between the category and type buttons
- When a specific category is selected, only its subcategories are shown
- When "All" is selected, all subcategories across all categories are shown (deduplicated)
- Switching categories automatically resets the subcategory to "All"
- Three-level filtering: **Category → Subcategory → Type**

### 12. New Categories Added
- **Underarm Care** (+ subcategory: Underarm Cream)
- **Dietary Supplement** (+ subcategories: Capsules ingestible, Coffee Mix, Beauty Drink, Fiber Drink)
- **Facial Serum** (+ subcategory: Facial Serum)
- **Face & Body Soap** (+ subcategory: Soap Face & Body)
- **Body Care** (existing) — added 2 subcategories: Body Capsules (topical), Body Booster / Lotion / Gel-Cream

### 13. New Product Types Added
- `coffee-mix`, `body-booster`, `sachet-drink-beauty`, `sachet-drink-detox`, `capsule-dietary`

### 14. Cleaner URL Scheme
- Navbar and category page subcategory links now use `&subcategory=` instead of `&type=`
- This avoids collision with the product-type filter, making URLs semantically correct

### 15. SEO Improvements
- Products now auto-generate:
  - **Meta title** ("Buy [Product Name] Philippines")
  - **Meta description** (from the first 160 characters of the short description)
  - **Meta keywords** (product name + relevant tags)
- Structured data (JSON-LD) is now injected on every product page — this helps Google show rich results with star ratings, prices, and availability
- **Breadcrumbs** structured data added so Google can display breadcrumb paths in search results
- Product review **star ratings** are included in the structured data
- **Sitemap** now includes all category pages for better search engine crawling

### 16. New / Updated Files
- `src/app/layout.tsx` — Favicon updated to TitleBarLogo.png
- `src/data/products.ts` — Added bundle & SEO fields to Product type
- `src/data/categories.ts` — 4 new categories, 2 new Body Care subcategories
- `src/data/productTypes.ts` — 5 new product types
- `src/lib/product-store.ts` — Bundle item fetching, SEO auto-generation on save
- `src/lib/slugify.ts` — New shared slug utility
- `src/app/admin/(dashboard)/products/AdminProductsPage.tsx` — Bundle builder, smart field behavior, Type column
- `src/app/shop/ShopPage.tsx` — Brands section removed, subcategory filter row, meta-category filter/sort logic
- `src/app/shop/[id]/ProductDetailPage.tsx` — Bundle display, stock check, related products
- `src/components/ProductCard.tsx` — Bundle badge
- `src/components/StructuredData.tsx` — New JSON-LD structured data component
- `src/app/category/[slug]/` — New category pages with SEO, updated subcategory links
- `src/components/CustomerNavbar.tsx` — Categories dropdown shows all 13, sale href → /sale, subcategory links use &subcategory=
- `src/app/sitemap.ts` — Category pages added to sitemap

### 17. Bug Fixes
- **Categories button not working**: Navbar categories now properly navigate to `/shop?category=slug` and the shop page reads URL params on mount, so clicking a category actually filters the products
- **Required field fix:** Selling Price was blocking bundle product creation — fixed so it only requires a price for non-bundle products
- **Build error fixed:** Missing `selectedBrand` reference after removing brands section

---

## Still Not Working

### Firestore ERR_BLOCKED_BY_CLIENT
If you see this in the browser console, it's **not a code issue** — browser ad-blockers or privacy extensions block Firebase connections. Try disabling the extension or adding the site to the allow list.

---

## Technical Notes
- Build passes with zero errors
- All existing features (shop, cart, checkout, orders, reviews, wishlist, profile, admin panel) remain functional
- Bundle stock is a snapshot at save time — if a product's stock changes later, edit the bundle to refresh
- Category pages: `/category/skincare`, `/category/body-care`, etc.
- Bundle products are automatically assigned to the "Gift Sets & Bundles" category
- Subcategory filter is dynamically computed — shows only relevant subcategories for the selected category
- Meta-categories (Best Sellers, New Arrivals, Gift Sets) are only accessible from the shop page filter buttons and navbar; Sale is only accessible via the navbar `/sale` link

---

*Generated from the work session on June 29, 2026*
