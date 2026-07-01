You are a senior full-stack developer.

I am building an ecommerce website using Next.js (App Router), TypeScript, React, and Firebase (Firestore + Firebase Storage).

My problem: Images are loading slowly, and I currently use a loading screen. I want to improve both actual performance and perceived performance (UX).

Please implement a complete, production-ready solution with the following:

IMAGE OPTIMIZATION (REAL PERFORMANCE):

1. Use Next.js `<Image />` component properly for all product images.
2. Configure `next.config.js` to allow Firebase Storage domains.
3. Ensure:

   * Correct width and height
   * Responsive images using `sizes`
   * Automatic lazy loading
   * Proper quality settings
4. Use `placeholder="blur"` with a blurDataURL.
5. Convert images to WebP format and compress them.

FIREBASE IMAGE PIPELINE:
6. Create an upload system that:

* Resizes images into multiple sizes (300px, 600px, 1200px)
* Compresses images
* Converts to WebP

7. Store optimized image URLs in Firestore.
8. Provide example code for uploading and retrieving images.

PERCEIVED PERFORMANCE (UX IMPROVEMENTS):
9. Improve loading experience:

* Replace or enhance loading screen with skeleton loaders
* Create a reusable skeleton component for product cards
* Ensure layout stability (no CLS)

10. Use blur-up technique:

* Show blurred image instantly
* Load full image progressively

LOADING SCREEN:
11. Keep a loading screen but optimize usage:

* Only show on initial app load or route transitions
* Avoid blocking image rendering

PERFORMANCE BEST PRACTICES:
12. Optimize for:

* LCP (Largest Contentful Paint)
* CLS (Cumulative Layout Shift)
* Fast mobile loading

13. Add caching strategies for images.
14. Suggest optional CDN improvements (e.g., Cloudflare).

OUTPUT:

* Clean, well-structured TypeScript code
* Next.js App Router structure
* Reusable components (Image wrapper, Skeleton loader)
* Comments explaining each part

GOAL:
Make images load extremely fast while also making the UI feel instant and smooth, even on slow internet.
