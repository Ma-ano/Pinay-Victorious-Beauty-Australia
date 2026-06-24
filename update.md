# Update — June 23, 2026

## What's New

### 1. Prices Now Show in Australian Dollars (AU$)
- Every price on the site now shows as **AU$15.99** instead of just **$15.99**
- This applies everywhere: shop, cart, checkout, orders, admin panel
- The Terms page now says "All prices are listed in AUD" instead of USD

### 2. Cart Prices Update Automatically
- If you change a product's price in the admin panel, the cart will **automatically update** to show the new price
- Customers won't see old prices anymore — the cart always shows what you set
- Works for both regular products and product variants

### 3. Admin Can Approve and Reject Orders
- In the admin Orders page, you can now **approve** or **reject** an order
- If you reject an order that was paid with PayPal, the system will **automatically process a refund**
- The refund goes through PayPal's system (server-side, secure)

### 4. PayPal Capture ID Saved for Refunds
- When a customer pays with PayPal, the system now saves the capture ID
- This is needed so refunds can actually work when you reject a paid order

### 5. User Orders Page Shows Total Amount
- Customers now see the **total amount** they paid (or need to pay) on their orders page
- Payment status is also tracked (paid / unpaid)

### 6. Contact Form Has Spam Protection
- The contact form now has **rate limiting** (3 messages per hour per IP address)
- It also has a **hidden "honeypot" field** that catches bots without real users noticing

### 7. Admins Must Use the Admin Login Page
- Admin accounts can no longer log in at the regular `/login` page
- If an admin tries, they get a message saying "Admins must use the admin login page"
- Admins should log in at `/admin/login` instead

---

## Missing Pieces (You Need to Do These)

### 1. PayPal Sandbox Test Account """"""DONE"""""
**Problem:** When testing PayPal payments, you see: "You are logging into the account of the seller for this purchase."

**Fix:** You need a separate **buyer account** to test payments. 
1. Go to https://developer.paypal.com/dashboard/accounts
2. Click **Sandbox → Accounts**
3. If a **Personal** (buyer) account already exists, use its email/password
4. If not, click **Create Account** → choose **Personal** → note the email and password
5. At checkout, log into PayPal with the **buyer** account, not your own

A detailed guide is in **paypal-fix.md**

### 2. Gmail App Password for Contact Form """"""DONE"""""
**Problem:** The contact form sends emails but needs your Gmail password.

**Fix:**
1. Go to your Google Account → Security → **App Passwords**
2. Create a new app password for "Mail"
3. Set it as `SMTP_PASS` in your `.env` file and on Vercel

### 3. PayPal Credentials Must Match """"""DONE"""""
**Problem:** PayPal payments may fail with "invalid_client"

**Fix:** Make sure these two settings come from the **same** PayPal app:
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (in `.env` and Vercel)
- `PAYPAL_CLIENT_SECRET` (in `.env` and Vercel)

Both should be from either your Sandbox app or your Live app — don't mix them.

### 4. Promote Your First Admin =====NEED TO CHECK=====
**Problem:** You can't log in at `/admin/login` until someone is made an admin.

**Fix:**
- Go to `/admin/users` (as the master admin / the email in `ADMIN_EMAIL`)
- Click **Create Admin** and enter the user's email
- That user can then log in at `/admin/login`

---

## Still Not Working

### Firestore ERR_BLOCKED_BY_CLIENT
If you see this error in the browser console, it's **not a code issue** — browser ad-blockers or privacy extensions are blocking Firebase connections. Try disabling the extension or adding the site to the allow list.

---

## Technical Notes
- Build passes with zero errors
- All existing features (shop, cart, checkout, orders, reviews, wishlist, profile, admin panel) are unchanged
- Admin orders now calls server-side API for approve/reject (with admin verification + PayPal refund)
- Sub-admins (non-master) cannot see the Users page in admin panel

---

*Generated from the work session on June 23, 2026*
