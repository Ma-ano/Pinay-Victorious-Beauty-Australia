I have an eCommerce website built with Next.js (TypeScript) and Firebase Firestore.
I am using PayPal and Afterpay for payments.

I want to implement production-level payment security and prevent issues like:
- Double charges
- Fake payment confirmations
- Duplicate transactions
- Incorrect payment status

Please help me implement a secure payment system with the following requirements:

CORE SECURITY:
1. Never trust frontend — all payment verification must happen in backend
2. Verify payments using provider APIs:
   - PayPal: GET /v2/checkout/orders/{orderID}
   - Afterpay: GET /v2/payments/{orderId}
3. Validate:
   - payment status (COMPLETED / APPROVED / CAPTURED)
   - amount matches database
   - currency is correct

DUPLICATE PROTECTION:
4. Use idempotency keys:
   - PayPal-Request-Id
   - Afterpay Idempotency-Key
5. Store unique transaction IDs:
   - PayPal capture_id
   - Afterpay orderId
6. Prevent duplicate processing:
   - If transaction already exists → ignore

WEBHOOK SECURITY:
7. Implement webhook handlers:
   - PayPal: PAYMENT.CAPTURE.COMPLETED
   - Afterpay: PAYMENT_APPROVED, PAYMENT_CAPTURED
8. Verify webhook authenticity:
   - PayPal webhook signature verification
   - Afterpay signature validation
9. Use webhook as source of truth for updating order status

DATABASE DESIGN:
10. Design Firestore collections:
   - orders
   - payments (with unique transaction IDs)
11. Ensure:
   - No client-side writes to payments
   - Orders are updated only by backend

API SECURITY:
12. Secure Next.js API routes:
   - Validate request body
   - Authenticate users where needed
   - Never expose secrets

STATE MANAGEMENT:
13. Proper order lifecycle:
   - pending → approved → captured → paid
14. Lock order after successful payment

FRONTEND SAFETY:
15. Prevent double clicks / multiple submissions
16. Handle cancel / failed payments properly

DELIVERABLES:
Please provide:
- Secure backend code (create order, capture, verify)
- Webhook implementation with verification
- Firestore schema
- Best practices for production
- Common mistakes to avoid

(Optional: I will paste my current code for review)