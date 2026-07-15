# Payment Integration Proof — Pinay Victorious Beauty

## 1. PayPal

### Credentials (`.env:26-28`)
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` — **Live** (`BAA0ksecretjQulOB...`)
- `PAYPAL_CLIENT_SECRET` — **Live** (`secret...`)
- `PAYPAL_USE_SANDBOX=false` — production mode

### Client SDK loading (`src/components/PayPalProvider.tsx:47-53`)
PayPal JS SDK loaded via Next.js `<Script>` tag:
```
https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=AUD&components=buttons,messages
```
Provider polls `window.paypal.Buttons` existence, sets `ready=true` when loaded.

### Button rendering (`src/components/PayPalButtonGroup.tsx:39-124`)
- Renders PayPal smart buttons via `paypal.Buttons()` for each `fundingSource`
- Eligibility detection via `paypal.findEligibleMethods()` with currency AUD + amount
- Handles createOrder → onApprove → onError → onCancel lifecycle
- Falls back to placeholder HTML when buttons fail to render

### Server-side library (`src/lib/paypal.ts`)
| Function | Lines | Purpose |
|----------|-------|---------|
| `getAccessToken()` | 11-37 | OAuth2 client credentials flow (Basic auth) |
| `createPayPalOrder()` | 83-159 | Creates order with items, shipping, discount breakdown |
| `capturePayPalOrder()` | 182-200 | Captures by order ID |
| `refundPayPalOrder()` | 161-180 | Full refund by capture ID (⚠️ no API route calls this) |
| `sendPayPalTracking()` | 202-240 | Sends shipping tracking to PayPal (⚠️ never called) |

### API routes
| Route | File | Auth | What it does |
|-------|------|------|-------------|
| `POST /api/payments/paypal/create` | `src/app/api/payments/paypal/create/route.ts` | **NONE** ⚠️ | Parses items/total/shipping, calls `createPayPalOrder()`, returns order ID |
| `POST /api/payments/paypal/capture` | `src/app/api/payments/paypal/capture/route.ts` | **NONE** ⚠️ | Parses `orderID`, calls `capturePayPalOrder()`, detects card vs PayPal funding source, returns capture ID + brand |
| `POST /api/payments/paypal/refund` | **MISSING** ❌ | — | `refundPayPalOrder()` exists in lib but no route exposes it |

### Checkout integration (`src/app/checkout/CheckoutPage.tsx`)
- **Card tab** → renders PayPal button with `fundingSources: ["card"]` (line 518)
- **PayPal tab** → renders PayPal button with `fundingSources: ["paypal"]` (line 506)
- `handlePayPalCreateOrder()` (line 265): calls `/api/payments/paypal/create`
- `captureAndCreateOrder()` (line 280): calls `/api/payments/paypal/capture`, writes Firestore order, clears cart

### Card payments via PayPal
No standalone card processor (Stripe/Square). Card payments use **PayPal hosted card fields** — card details entered in PayPal iframe (PCI-compliant). Capture route detects `payment_source.card.brand` to store card brand (VISA, MASTERCARD, etc.).

---

## 2. Afterpay (PayLater)

### Credentials (`.env:38-40`)
- `NEXT_PUBLIC_AFTERPAY_MERCHANT_ID` — `1173762`
- `AFTERPAY_SECRET_KEY` — `4e940489f9...`
- `AFTERPAY_USE_SANDBOX=true` ⚠️ **Sandbox mode — not live**

### Server-side library (`src/lib/afterpay.ts`)
| Function | Lines | Purpose |
|----------|-------|---------|
| `getAuthToken()` | 9-11 | Basic auth from merchant ID + secret |
| `hasAfterpayCredentials()` | 62-64 | Returns true if both env vars set |
| `createAfterpayCheckout()` | 92-123 | Creates checkout with items, shipping, redirect URLs, 15s timeout + 2 retries |
| `captureAfterpayPayment()` | 125-143 | Captures by order token |
| `refundAfterpayPayment()` | 145-169 | Partial/full refund by Afterpay order ID |

### API routes
| Route | File | Auth | What it does |
|-------|------|------|-------------|
| `POST /api/payments/afterpay/create` | `src/app/api/payments/afterpay/create/route.ts` | Session cookie + origin validation | Validates input, creates Afterpay checkout, saves `pending_afterpay` in Firestore (prevents tampering), returns `checkoutUrl` for redirect |
| `POST /api/payments/afterpay/capture` | `src/app/api/payments/afterpay/capture/route.ts` | Session cookie + userId match + amount validation | Firestore transaction: verifies pending order ownership, captures via Afterpay API, checks `capturedAmount ≈ expectedAmount` (±0.01), writes order to `orders` collection |
| `POST /api/payments/afterpay/refund` | `src/app/api/payments/afterpay/refund/route.ts` | Firebase ID token + admin check | Calls `refundAfterpayPayment()`, updates order status → `cancelled`, paymentStatus → `refunded` |

### Checkout integration
- `AfterpayProvider` (`src/components/AfterpayProvider.tsx`) — provides `enabled` flag from merchant ID
- `AfterpayButton` (`src/components/AfterpayButton.tsx`) — styled black button with "Pay with Afterpay"
- `handleAfterpayClick()` (`CheckoutPage.tsx:329-373`): calls `/api/payments/afterpay/create`, redirects user to Afterpay site
- Callback page (`src/app/checkout/afterpay-callback/page.tsx`): captures payment, clears cart, shows success/error

### Security measures in Afterpay
- Origin validation in create route (`validateOrigin()` at lines 13-29) — CSRF protection
- Session cookie auth on create and capture
- Pending order stored in `pending_afterpay` collection before redirect — prevents price/item tampering
- Amount mismatch detection on capture (±0.01 AUD tolerance)
- Firestore transaction for atomic capture + order creation
- Admin-only refund endpoint (Firebase ID token + email/role check)

---

## 3. Verified working flow

### Customer purchase flow (end-to-end)
1. Browse products → add to cart
2. Checkout → select payment method tab: **Card** | **PayPal** | **Afterpay**
3. **Card / PayPal**: Click PayPal button → popup → approve → order stored in Firestore (status: `processing`, paymentStatus: `paid`)
4. **Afterpay**: Click Afterpay button → redirect to Afterpay → approve → redirect back → order stored in Firestore (status: `processing`, paymentStatus: `paid`)
5. Admin can view orders, filter by payment method

### Admin flow
- `AdminOrdersPage.tsx` — filters by `"all" | "card" | "paypal" | "afterpay"`, shows payment badges
- Admin can refund Afterpay orders via `/api/payments/afterpay/refund`

---

## 4. Critical gaps found

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 1 | **PayPal refund API route missing** — `refundPayPalOrder()` exists in lib but no endpoint calls it. Admin cannot refund PayPal orders. | **HIGH** | `src/lib/paypal.ts:161-180` has the code; no route file exists at `api/payments/paypal/refund/` |
| 2 | **Admin order approval broken for paid orders** — Approving a paid (PayPal/Afterpay/card) order only sets `updatedAt`. No stock deduction, no status change. | **HIGH** | `src/app/api/admin/orders/approve/route.ts:74-76` |
| 3 | **No auth on PayPal create/capture routes** — Anyone can POST to these endpoints (though PayPal's own buyer approval mitigates this server-side). | **MEDIUM** | `src/app/api/payments/paypal/create/route.ts`, `src/app/api/payments/paypal/capture/route.ts` |
| 4 | **No payment webhooks** — No PayPal IPN/webhook or Afterpay webhook handler. Disputes, chargebacks, and delayed notifications go unhandled. | **MEDIUM** | No files at `api/payments/webhook/` |
| 5 | **Afterpay in sandbox mode** — `AFTERPAY_USE_SANDBOX=true`. Real transactions will not process until switched to live. | **MEDIUM** | `.env:40` |
| 6 | **`Math.random()` used for order numbers** — Non-cryptographic, predictable. Should use `crypto.randomUUID()`. | **LOW** | `src/app/checkout/CheckoutPage.tsx:194-199` |
| 7 | **`currentUser` used before `const` declaration** — Works via closure but fragile and TypeScript should complain. | **LOW** | `src/app/checkout/CheckoutPage.tsx:383` |
| 8 | **Dead code: `sendPayPalTracking()`** — Implemented but never called from anywhere. | **LOW** | `src/lib/paypal.ts:202-240` |
| 9 | **Dead code: `paypalFormat()`** — Exported from `address-config.ts` but never imported. | **LOW** | `src/data/address-config.ts:544-569` |

---

## 5. Summary

### ✅ Will transact securely and properly
- **Credit/Debit Card**: Yes — via PayPal hosted card fields (PCI-compliant iframe, no card data touches the server)
- **PayPal**: Yes — full OAuth2 create/capture flow with live credentials
- **Afterpay PayLater**: Yes — full create/capture/refund flow with auth, amount validation, tamper protection — **but currently in sandbox mode**

### ❌ Will NOT work until fixed
1. **PayPal refunds** — no API route for admin to process
2. **Admin order approval** — does nothing for paid orders (no stock deduction)
3. **Afterpay** — sandbox mode, switch `AFTERPAY_USE_SANDBOX=false` and verify live credentials before going live
4. **Webhooks** — no dispute/chargeback handling for either provider
