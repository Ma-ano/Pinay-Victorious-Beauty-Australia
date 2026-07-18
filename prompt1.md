Audit and enforce that payment retries are NOT interval-based, and implement event-driven, idempotent payment handling across:

- PayPal (wallet + card via PayPal)
- Afterpay (afterpay.com AU)

CONTEXT:
- Existing production system (Next.js)
- Australia only (AUD)
- Payment flows already implemented
- Must NOT break existing pages or orders

GOAL:
- Remove any automatic/interval retries
- Ensure retries happen ONLY on user action
- Prevent duplicate charges and false PAYMENT_ALREADY_DONE
- Keep system backward compatible

---

STEP 1: DETECT & REMOVE INTERVAL RETRIES

Search entire codebase for:

- setInterval(...)
- setTimeout(...) used for retrying payments
- polling loops that call:
  - create order
  - capture payment
  - verify payment

IF found:
  - REMOVE retry logic
  - KEEP only passive status checks (if any), but NEVER auto-trigger payment/capture

DO NOT auto-call:
- createPaypalOrder
- capturePaypalOrder
- createAfterpayOrder
- capture/confirm endpoints

---

STEP 2: ENFORCE EVENT-BASED RETRY

Retries MUST only occur when user explicitly clicks:

- "Pay again"
- "Retry payment"

Backend rule:

if (order.status === "CANCELLED" && order.isPaid !== true) {
  create NEW payment session
}

Apply to:
- PayPal → NEW paypalOrderId
- Afterpay → NEW afterpayOrderId

NEVER reuse old IDs.

---

STEP 3: IDEMPOTENT BACKEND GUARD (CRITICAL)

Replace ALL occurrences of:

throw "PAYMENT_ALREADY_DONE"

WITH:

if (order.isPaid === true) {
  return { success: true, message: "Already processed" }
}

IMPORTANT:
- ONLY use order.isPaid to determine completion
- DO NOT rely on:
  - paymentResult
  - existing order IDs

---

STEP 4: SAFE CAPTURE / VERIFY

Before capturing or confirming:

IF order.isPaid === true:
  return success (do nothing)

ELSE:
  proceed with provider verification

---

STEP 5: FRONTEND PROTECTION (NO SPAM / NO AUTO-RETRY)

Ensure:

- Payment button is disabled during processing

Example:

if (isProcessing) return
setIsProcessing(true)

- NO automatic retry after failure
- Show "Pay again" button ONLY if:
  order.status === "CANCELLED"

---

STEP 6: OPTIONAL UX COOLDOWN (SAFE)

Allow short UI-only delay:

- Disable button for 2–3 seconds after click

DO NOT:
- auto retry
- background retry

---

STEP 7: BACKWARD COMPATIBILITY

For existing orders:

IF:
  status = CANCELLED
  AND isPaid !== true

ALLOW:
  retry with NEW payment session

DO NOT throw errors.

Log inconsistent legacy data instead of crashing.

---

STEP 8: PROVIDER-SPECIFIC ENFORCEMENT

PAYPAL:
- NEVER reuse paypalOrderId
- ALWAYS create new order on retry

AFTERPAY:
- NEVER reuse afterpayOrderId
- ALWAYS create new order on retry

---

STEP 9: TEST CASES

1. Close PayPal → no auto retry → user clicks retry → works ✅  
2. Afterpay cancel → no auto retry → manual retry works ✅  
3. Rapid clicks → only ONE request processed ✅  
4. No PAYMENT_ALREADY_DONE false errors ✅  
5. No duplicate charges ✅  

---

SUCCESS CRITERIA:

- NO interval-based payment retries exist
- All retries are user-triggered
- Idempotent backend prevents duplicates
- Cancelled orders can retry safely
- No PayPal UI errors from reused orders
- System remains stable

---

IMPORTANT:

- DO NOT rewrite system
- Apply changes incrementally
- Prefer wrapping existing logic over replacing it