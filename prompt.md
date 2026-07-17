I have a PayPal integration in a Next.js (TypeScript) app using Firebase.

Problem:
A customer was charged twice, but my database only recorded one payment. In PayPal dashboard, I can see two payment records.

My goals:
1. Prevent duplicate payments
2. Ensure only one PayPal order is created per checkout
3. Properly store and sync all successful payments
4. Handle PayPal webhooks correctly

Please help me:

1. Add idempotency when creating PayPal orders (using PayPal-Request-Id)
2. Prevent duplicate API calls from frontend (double click / refresh)
3. Store and validate unique capture_id instead of just orderID
4. Implement webhook handler for:
   - PAYMENT.CAPTURE.COMPLETED
   - CHECKOUT.ORDER.APPROVED
5. Add backend validation to ignore duplicate transactions
6. Show correct way to update order status in Firestore
7. Ensure frontend and backend are properly synced

Here is my current setup:
- Next.js API routes for PayPal
- Firebase Firestore for orders
- PayPal Checkout (JavaScript SDK)

(Optional: I will paste my code below)

Please provide:
- Fixed backend code (create order + capture)
- Webhook example
- Firestore schema for payments
- Best practices to avoid double charge issues