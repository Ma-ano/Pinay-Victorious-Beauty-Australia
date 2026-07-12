# Update Notes

## Order Numbers (Admin + Your Orders Page)
Orders now have a clean order number like `ORD-XY8K3M2Z` instead of showing the raw database ID. You'll see this everywhere — in admin order details, the orders page, and order notifications.

## Admin Order Management
- **Search orders** — Type a name, email, phone, or address to instantly filter orders. No button to click, no page reload.
- **Status changes** — Marking an order as "Completed" now shows a confirmation popup before it updates stock.
- **Auto-refresh** — Orders page refreshes automatically when you switch back to the browser tab, so you always see the latest.
- **Payment filters** — Buttons to show only Card, PayPal, or Afterpay orders.

## Admin Products
- **Instant search** — Typing in the search box filters products immediately without reloading the page or showing a loading spinner.
- **Fixed pagination** — No more empty "extra page" at the end when there are fewer products than expected.
- **Fixed product count** — The count now shows how many products exist, not the total stock quantity.

## Admin Sidebar (Mobile)
The admin sidebar now works on phones — tap the hamburger menu to open it, and tap the backdrop or X to close.

## Payment Method Displays
- **Shopping cart** — Instead of "Cash on Delivery", you'll see proper logos for Debit/Credit Card, PayPal, and Afterpay.
- **Contact page** — The payment methods card now shows all three options.

## Email Notifications
- Subject line now says "Pinay Victorious Beauty Website - Contact Form Message from [Name]"
- Logo updated in email templates.

## Discount Codes with PayPal
Fixed a bug where discount codes caused a payment error (amount mismatch) when paying with PayPal. Discounts now work correctly with all payment methods.

## Behind the Scenes
- Reduced database reads by switching from real-time listeners to on-demand data fetching on admin settings and reviews.
- Fixed a rare error when saving admin settings with customer reviews enabled.
