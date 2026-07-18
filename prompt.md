You are a senior frontend engineer working on an existing Next.js (App Router) + TypeScript + Tailwind + Framer Motion eCommerce site using PayPal JS SDK buttons.

🎯 Problem

On mobile devices, the PayPal debit/credit card button is not clickable, while it works on desktop.

⚠️ Important Context
PayPal buttons render inside an iframe
This is almost always caused by UI layering issues (z-index / overlays / pointer-events)
The project already has:
Sticky/fixed navbar
Animated search dropdown (Framer Motion)
Mobile menu overlays
Do NOT redesign UI
Do NOT change payment logic
ONLY fix clickability issue safely
✅ Tasks
1. Fix Overlay Blocking (CRITICAL)

Audit and update all overlays (navbar, dropdown, modals, animated layers):

Ensure non-interactive layers do NOT block clicks:
style={{ pointerEvents: "none" }}
Only enable pointer events when actually interactive:
className={isOpen ? "pointer-events-auto" : "pointer-events-none"}
2. Fix PayPal Container Layering

Wrap PayPal buttons properly:

<div className="relative z-10">
  <div id="paypal-button-container" />
</div>

Ensure NO parent has:

overflow: hidden
pointer-events: none
lower z-index than overlays
3. Fix Framer Motion Blocking Layers

For any full-screen or absolute motion elements:

<motion.div
  className="absolute inset-0"
  style={{ pointerEvents: "none" }}
/>

If interactive:

style={{ pointerEvents: isOpen ? "auto" : "none" }}
4. Fix Tailwind Issues

Search and REMOVE or adjust:

pointer-events-none on parent containers of PayPal
overflow-hidden on checkout/payment sections
5. Ensure PayPal Card Funding Enabled

Verify PayPal SDK script includes card:

<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&components=buttons&enable-funding=card"></script>
6. Mobile Touch Fix

Ensure no global CSS disables touch:

/* REMOVE if exists */
touch-action: none;
7. Add Debug Helper (TEMP)

Add this to detect blockers:

document.addEventListener("click", (e) => {
  console.log(document.elementFromPoint(e.clientX, e.clientY));
});
✅ Expected Result
PayPal debit/credit card button is fully clickable on mobile
No regression on desktop
No UI redesign
No payment logic changes
🚫 Do NOT
Modify backend
Change PayPal API logic
Replace PayPal buttons
Break animations
✅ Output Format
Show EXACT code changes
Highlight what was blocking clicks
Keep solution minimal and production-safe