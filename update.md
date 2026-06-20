# Update — June 21, 2026

Here's everything we changed on the site today, explained in plain language.

---

## What's New

### 1. Website Shows Up Better on Google & Social Media
- **Tab titles** now display correctly on every page (e.g., "Shop | Pinay Victorious Beauty Australia")
- **Google preview** — when someone searches for the site, Google shows a proper title and description
- **Social media previews** — sharing a link on Facebook, Messenger, or Twitter now shows a nice image, title, and description instead of just a plain URL
- **Sitemap** — tells Google exactly which pages to index so products show up in search results
- **Robots rules** — private pages (login, checkout, profile, orders, wishlist, admin) are hidden from Google

### 2. Images Load Faster and Look Better
- All product images, banners, and category icons now use Next.js Image optimization — they load in the correct size, lazy-load off-screen images, and prioritize the main banner
- The **main banner slideshow** now loads its first image immediately (no waiting)

### 3. Homepage Loads Faster
- The homepage used to load data in 4 separate steps — now it loads everything in **one go**, which means trending products, best-sellers, and sale items all appear at the same time
- For logged-in users, products are ready **before the page even shows up** — no loading spinner

### 4. Shop & Sale Pages Load Faster Too
- Same speed boost applied — products appear instantly instead of showing a spinner

### 5. Visual Cleanup
- Removed rounded corners from category cards, sale banner, recruitment section, and newsletter to match the site's cleaner look
- **Footer background** — now white in light mode, dark in dark mode (was see-through before)

### 6. Proper Headings
- Fixed the page headings so Google and accessibility tools understand the layout correctly (e.g., "Contact Details" and modal titles are now proper headings)

### 7. Fixed Banner & Category Images Not Loading
- Fixed a bug where the **featured banner slides** and **category images** saved in the admin panel weren't loading on the homepage. They now appear immediately instead of showing default placeholders.

### 8. Image Uploads Now JPG/PNG Only
- Only **JPG and PNG** picture files can now be uploaded anywhere on the site (banner, category images, product images, profile photos)
- The file picker will only show these types, and the system will reject anything else automatically

### 9. Admin Pages Now Have Helpful Explanations
- **Orders page** — added plain-English note explaining what each status button does and that Shipped/Delivered automatically deducts stock
- **Promotions page** — added helpful tips next to each field: what the Code field is for, how Discount works with Percentage vs Fixed Amount, what each Type does, that Expires is when the code stops working, and that Active can be unchecked to pause a code without deleting it
- **Settings page** — added small notes under Brand Name, Title, Description, and Category Image fields explaining what they are and where they appear
- All notes are in small gray text so they don't clutter the layout

### 10. Products Can Now Have Variant Pricing
- Each product variant (e.g., different sizes) can now have its **own price** instead of sharing one product price
- The **Add to Cart** button, **cart dropdown**, **checkout summary**, and **order history** all show the correct variant price
- If a variant doesn't have its own price, it falls back to the product's base price (backward-compatible)

### 11. Order & Cart Display Improvements
- Cart, checkout, and orders now show clear labels like **"Product:"**, **"Variant:"**, and **"Qty:"** so it's easy to read
- The **orders page** now shows a small product picture next to each item
- Checkout saves the variant price to the order so it shows up correctly in your history

### 12. Orders Page Cleaned Up
- Removed the per-item price (e.g., "$15.00 each") from each product row — now each row just shows the product name, variant, and quantity
- The total amount is now labeled **"Total to pay:"** so it's obvious what you actually owe
- This makes the order page cleaner and easier to scan

---

## Technical Notes
- Build passes with zero errors
- All existing features (cart, checkout, orders, reviews, admin panel, wishlist, profile) remain unchanged
- If the speed-boost system (server-side rendering) ever has trouble, pages will automatically switch back to the normal loading behavior — nothing breaks

---

*Generated from the work session on June 21, 2026*
