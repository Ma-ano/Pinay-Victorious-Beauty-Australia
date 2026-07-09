## Error Type
Console Error

## Error Message
Please fill in all shipping address fields


    at Object.handlePayPalCreateOrder [as current] (src/app/checkout/CheckoutPage.tsx:196:35)
    at PayPalButtonGroup.useEffect.btn (src/components/PayPalButtonGroup.tsx:93:53)
    at JSON.parse (<anonymous>:null:null)
    at JSON.parse (<anonymous>:null:null)

## Code Frame
  194 |
  195 |   async function handlePayPalCreateOrder() {
> 196 |     if (!validateAddress()) throw new Error("Please fill in all shipping address fields");
      |                                   ^
  197 |     setPaypalError("");
  198 |     try {
  199 |       const res = await fetch("/api/payments/paypal/create", {

Next.js version: 16.2.9 (Turbopack)
