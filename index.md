# Firebase Firestore Composite Indexes

This document tracks all required composite indexes for the application. Indexes are deployed via:

```bash
firebase deploy --only firestore:indexes
```

---

## Current Indexes

| # | Collection | Fields | Used By |
|---|------------|--------|---------|
| 1 | `orders` | `paymentMethod` ASC, `status` ASC, `expireAt` ASC | Admin cleanup-afterpay (expired Afterpay orders) |
| 2 | `orders` | `userId` ASC, `paymentStatus` ASC, `paymentMethod` ASC | PayPal & Afterpay create routes (duplicate prevention) |
| 3 | `orders` | `paypalOrderId` ASC, `paymentStatus` ASC | PayPal capture route (dedup check) |
| 4 | `orders` | `afterpayOrderId` ASC, `paymentStatus` ASC | Afterpay capture route (dedup check) |
| 5 | `reviews` | `productId` ASC, `createdAt` DESC | ProductReviews component (fetch reviews for product) |

---

## Query-to-Index Mapping

| Location | Query | Index |
|----------|-------|-------|
| `src/app/api/payments/paypal/create/route.ts:43-47` | `.where("userId", "==").where("paymentStatus", "==").where("paymentMethod", "==")` | Index #2 |
| `src/app/api/payments/afterpay/create/route.ts:136-140` | Same as above | Index #2 |
| `src/app/api/payments/paypal/capture/route.ts:69-72` | `.where("paypalOrderId", "==").where("paymentStatus", "==")` | Index #3 |
| `src/app/api/payments/afterpay/capture/route.ts:72-75` | `.where("afterpayOrderId", "==").where("paymentStatus", "==")` | Index #4 |
| `src/app/api/admin/orders/cleanup-afterpay/route.ts:30-34` | `.where("paymentMethod", "==").where("status", "==").where("expireAt", "<")` | Index #1 |
| `src/components/ProductReviews.tsx:72-77` | `.where("productId", "==").orderBy("createdAt", "desc")` | Index #5 |

---

## Deployment Notes

1. **Run locally** to create indexes in development:
   ```bash
   firebase deploy --only firestore:indexes --project <dev-project>
   ```

2. **Indexes take time** to build (several minutes). Check status in Firebase Console > Firestore > Indexes.

3. **Afterpay 15-min expiry** is now configured:
   - `expireAt` set to `Date.now() + 15 * 60 * 1000` in `afterpay/create/route.ts`
   - Capture route and admin cleanup both check `expireAt` automatically