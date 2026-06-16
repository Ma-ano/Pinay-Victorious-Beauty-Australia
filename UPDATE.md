# What's New — Pinay Victorious Beauty Australia

_Last updated: 16 June 2026_

Here's a summary of everything we've updated on the site.

---

## Brand Name
The site now shows **Pinay Victorious Beauty Australia** with the tagline **"Beauty Without Borders"** everywhere — the title, the about page, and behind the scenes.

---

## Top Navigation Bar
- **Solid background** — the menu bar is no longer see-through or frosted glass
- **Hides when you scroll down** — scroll down and the menu slides up out of the way. Scroll back up and it comes back with a smooth animation
- **No bottom line** — we removed the border line at the bottom for a cleaner look
- **Logo spot** — there's a square placeholder on the left where your logo will go. Drop your logo file into the website folder and it'll appear
- **Two-line title** — "Pinay Victorious" on the first line, "Beauty Australia" on the second
- **Login icon** — a small person icon on the right side (placeholder ready for when you add login/register)
- **Mobile menu now scrolls** — on phones, the menu slides up and you can scroll down to see all categories

### Categories Dropdown
- **Bigger and wider** — the categories panel is now wider with more space and larger text
- **Solid background** — no more transparency
- **Organised in columns** — categories with subcategories appear in a 3-column grid
- **No emojis** — we removed the emoji icons from all categories

---

## Homepage

### Hero Banner (Top Slideshow)
- **3 slides** featuring Medicube, COSRX, and Dr. Althea
- **Crossfade transition** — images blend smoothly into each other
- **Frosted glass text box** — product information sits in a semi-transparent bubble
- **Arrow buttons** — full-height gradient bars on the left and right edges (hidden until you hover)
- **Auto-rotates** — slides change automatically every few seconds

### Trending Now (Product Carousel)
- **Shows products ranked by rating** — highest rated products appear first
- **Smooth sliding** — products slide one at a time with a smoother animation
- **10 dots at the bottom** — click a dot to jump to that product
- **Full-width arrows** — hover anywhere on the carousel and the left/right arrow bars appear
- **Arrow bars at screen edges** — the gradient bars extend all the way to the left and right edges of your screen
- **Infinite loop** — keeps going in a circle, never hits a dead end
- **Responsive** — shows 4 products on desktop, 3 on tablet, 2 on phone
- **Fixed teleport glitch** — clicking "next" right after looping back to the first slide no longer skips the animation

### Best Selling (Product Carousel)
- Same style as Trending Now but shows products ranked by **how many have been sold**
- Was previously called "Featured Products"

### Product Cards
- **Image pops on hover** — only the product image scales up when you hover, the card stays in place
- **Pink border on hover** — card border turns pink (#E8CFCF) when you mouse over
- **No rounded corners** — cards have straight edges
- **Heart turns red** — clicking the wishlist heart icon turns it red
- **Sale badge and Quick Add** — uses dark text on light background for readability

---

## Categories
- **13 categories** with matching emojis and subcategories
- Categories include Skincare, Beauty & Cosmetics, Body Care, Soap Collection, Hair Care, Wellness Products, Korean Beauty, Thai Beauty, Filipino Favorites, Best Sellers, New Arrivals, Gift Sets & Bundles, and Sale & Promotions
- **Shop page filters** show category names (no emojis)
- Updated to match real product types

---

## About Page
Now tells the real brand story — how it started in Qatar during the 2020 pandemic and expanded to Australia. Includes the "Why Choose Us" section with three reasons: Curated Excellence, Community-Focused, and Beauty Without Borders.

---

## Checkout Toast
When you place an order, the confirmation message now says: **"Order placed — Thank you for your purchase!"**

---

## Colour Palette
- **Blush Pink (#E8CFCF)** — used for accents, sale badges, active links, and decorative elements
- **Rose Beige (#D8B8B8)** — used for the "Add to Cart" button
- **White (#FFFFFF)** and **Charcoal (#1F1F1F)** — light and dark backgrounds
- **Dark Gray (#4A4A4A)** — body text
- **Light Gray (#F5F5F5)** — muted backgrounds

---

## Behind the Scenes (For Your Developer)

### Data Layer Ready for Firebase
- Products now have a **sold count** field, ready for a real database
- Two new helper functions — `getTrendingProducts()` sorts by rating, `getBestSellingProducts()` sorts by sales
- To connect Firebase later: install the Firebase package, create a config file, and rewrite these two functions to query Firestore instead. The rest of the site doesn't need to change.

### Products Removed
We removed two products to match the 10-dot carousel limit:
- Retinol Night Serum
- Eyeshadow Palette - Sunset

### Fonts
The navigation title now uses **Belleza** font for an elegant, clean look.

### Bug Fixes
- **Carousel animation glitch** — after looping from the last slide back to the first, clicking "next" again no longer skips the animation (the timing was fixed so the slide duration is always ready)
- **Mobile menu cut off** — on phones, the categories accordion was clipped and couldn't be scrolled. Now the whole menu scrolls if it's taller than the screen
