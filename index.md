# Firestore Indexes Required

## Existing (already created)

| Collection | Fields | Used by |
|-----------|--------|---------|
| `orders` | `userId` ↑, `paymentStatus` ↑, `paymentMethod` ↑ | OrdersPage user lookup |
| `orders` | `afterpayOrderId` ↑, `paymentStatus` ↑ | Afterpay webhook |
| `orders` | `paypalOrderId` ↑, `paymentStatus` ↑ | PayPal webhook |
| `orders` | `paymentMethod` ↑, `status` ↑, `expireAt` ↑ | Afterpay-specific cleanup (legacy) |
| `reviews` | `productId` ↑, `createdAt` ↑ | Product reviews page |

## Must Add (for auto-expiry cleanup to work)

| # | Collection | Fields | Query | Created? |
|---|-----------|--------|-------|----------|
| 1 | `orders` | **`status`** ↑, **`expireAt`** ↑ | `where("status", "==", "processing").where("expireAt", "<", now)` | ❌ |
| 2 | `orders` | **`paymentStatus`** ↑, **`status`** ↑ | `where("paymentStatus", "==", "pending").where("status", "in", ["cancelled", "rejected"])` | ❌ |

## How to create

Go to **Firebase Console** → **Firestore** → **Indexes** → **Add Index** and create both:

**Index 1:**
- Collection: `orders`
- Fields: `status` (Ascending), `expireAt` (Ascending)

**Index 2:**
- Collection: `orders`
- Fields: `paymentStatus` (Ascending), `status` (Ascending)
