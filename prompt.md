YOU ARE BACKEND PAYMENT ENGINEER

GOAL:
CHECK MY SYSTEM AND MAKE SURE PAYPAL WEBHOOK IS FULLY IMPLEMENTED AND CORRECT

---

CURRENT SYSTEM:

Webhook URL:
/api/webhooks/paypal

Events subscribed:
- Checkout order approved
- Checkout order voided
- Payment capture completed
- Payment capture declined
- Payment capture denied
- Payment capture pending

---

MY ORDER STATUS (ADMIN):

Processing = checking details
Approved = payment paid + approved by admin
Completed = delivered
Cancelled = cancelled by customer
Rejected = rejected by admin

---

MY PAYMENT STATUS:

Pending
Paid
Declined

---

REQUIRED LOGIC (VERY IMPORTANT):

1. WHEN webhook = Payment capture completed
   → SET payment_status = Paid
   → SET order_status = Approved

2. WHEN webhook = Payment capture declined OR denied
   → SET payment_status = Declined
   → DO NOT auto approve order

3. WHEN webhook = Payment capture pending
   → SET payment_status = Pending

4. WHEN webhook = Checkout order voided
   → SET order_status = Cancelled

5. WHEN webhook = Checkout order approved
   → DO NOTHING (NOT PAID YET)

---

CRITICAL RULES:

- NEVER mark as Paid unless event = Payment capture completed
- NEVER trust frontend redirect
- ALWAYS trust webhook only
- MUST verify PayPal webhook signature
- MUST log all webhook events
- MUST prevent duplicate processing (idempotency)

---

CHECK MY SYSTEM:

1. Verify webhook route exists and works
2. Verify PayPal signature validation is implemented
3. Verify event parsing is correct
4. Verify database update logic matches REQUIRED LOGIC
5. Verify no status is incorrectly set to Paid
6. Verify duplicate webhook calls do not duplicate updates
7. Verify errors are handled properly
8. Verify logs exist for debugging

---

IF SOMETHING IS MISSING:
→ IMPLEMENT IT

---

OUTPUT:

1. List of problems found
2. Fixed code (Node.js / Next.js API route)
3. Clean webhook handler
4. Status mapping logic
5. Example test cases

---

DO NOT EXPLAIN TOO MUCH
FOCUS ON CORRECT IMPLEMENTATION