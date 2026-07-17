# Fix PayPal AMOUNT_MISMATCH

## Bug 1 — Core rounding fix in `src/lib/paypal.ts`

**Problem:** `amount.value` is formatted from `finalTotal` (a raw float from frontend), but PayPal reconstructs the total from the formatted breakdown components. When individual components round differently than the total, they can diverge.

**Fix:** Compute all values with `.toFixed(2)` first, then derive `amount.value` from the rounded breakdown components.

Replace lines 87–158 (the `createPayPalOrder` function body up to `body` construction):

```typescript
export async function createPayPalOrder(
  items: PayPalOrderItem[],
  total: number,
  shipping?: { street: string; suburb?: string; city: string; state: string; postcode: string; country: string },
  discount?: number,
  customId?: string,
  shippingAmount?: number,
) {
  const token = await getAccessToken();

  const shippingObj = buildShipping(shipping);

  const computedItemTotal = items.reduce((sum, i) => sum + i.unitAmount * i.quantity, 0);
  const rawItemTotal = computedItemTotal > 0 ? computedItemTotal : (total > 0 ? total : 0);
  const rawShipping = shippingAmount && shippingAmount > 0 ? shippingAmount : 0;
  const rawDiscount = discount && discount > 0 ? discount : 0;

  // Round ALL components to 2 decimal places FIRST
  const itemTotal = parseFloat(rawItemTotal.toFixed(2));
  const shipping = parseFloat(rawShipping.toFixed(2));
  const discountVal = parseFloat(rawDiscount.toFixed(2));

  // Compute total from ROUNDED components only
  const totalVal = itemTotal + shipping - discountVal;

  const breakdown: Record<string, unknown> = {
    item_total: {
      currency_code: "AUD",
      value: itemTotal.toFixed(2),
    },
  };

  if (shipping > 0) {
    breakdown.shipping = {
      currency_code: "AUD",
      value: shipping.toFixed(2),
    };
  }

  if (discountVal > 0) {
    breakdown.discount = {
      currency_code: "AUD",
      value: discountVal.toFixed(2),
    };
  }

  // Debug log — mandatory before request
  console.log({
    itemTotal: itemTotal.toFixed(2),
    shipping: shipping.toFixed(2),
    discount: discountVal.toFixed(2),
    total: totalVal.toFixed(2),
    computed: itemTotal + shipping - discountVal,
  });

  const body: Record<string, unknown> = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "AUD",
          value: totalVal.toFixed(2),
          breakdown,
        },
        items: items.map((item) => ({
          name: item.name,
          quantity: String(item.quantity),
          unit_amount: {
            currency_code: "AUD",
            value: item.unitAmount.toFixed(2),
          },
          category: "PHYSICAL_GOODS",
        })),
      },
    ],
  };
```

## Bug 2 — `buildShipping` field name mismatch

**Problem:** Frontend sends `shipping.line1` but `buildShipping` reads `raw.street`.

**Fix:** Check `raw.line1` as fallback.

Replace `const street = raw.street?.trim();` with:
```typescript
const street = (raw.street || raw.line1)?.trim();
```

## Verification

All other pages listed (`/admin/products`, `/shop/product`, `/shop`, `/`, `/sale`) are browse/display pages. No PayPal order creation occurs from them.
