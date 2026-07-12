when i tried to put discount code on /checkout 
it says
PayPal order creation failed: {"name":"UNPROCESSABLE_ENTITY","details":[{"field":"/purchase_units/@reference_id=='default'/amount/value","value":"2.00","issue":"AMOUNT_MISMATCH","description":"Should equal item_total + tax_total + shipping + handling + insurance + gratuity - shipping_discount - discount."}],"message":"The requested action could not be performed, semantically incorrect, or failed business validation.","debug_id":"ca19ccaf4b939","links":[{"href":"https://developer.paypal.com/api/rest/reference/orders/v2/errors/#AMOUNT_MISMATCH","rel":"information_link","method":"GET"}]}

## Error Type
Console Error

## Error Message
PayPal order creation failed: {"name":"UNPROCESSABLE_ENTITY","details":[{"field":"/purchase_units/@reference_id=='default'/amount/value","value":"2.00","issue":"AMOUNT_MISMATCH","description":"Should equal item_total + tax_total + shipping + handling + insurance + gratuity - shipping_discount - discount."}],"message":"The requested action could not be performed, semantically incorrect, or failed business validation.","debug_id":"ca19ccaf4b939","links":[{"href":"https://developer.paypal.com/api/rest/reference/orders/v2/errors/#AMOUNT_MISMATCH","rel":"information_link","method":"GET"}]}


    at Object.handlePayPalCreateOrder [as current] (src/app/checkout/CheckoutPage.tsx:268:26)
    at JSON.parse (<anonymous>:null:null)
    at JSON.parse (<anonymous>:null:null)

## Code Frame
  266 |       });
  267 |       const responseData = await res.json();
> 268 |       if (!res.ok) throw new Error(responseData.error || "Failed to create PayPal order");
      |                          ^
  269 |       if (!responseData.id) throw new Error("PayPal order ID missing from response");
  270 |       return responseData.id as string;
  271 |     } catch (err) {

Next.js version: 16.2.10 (Turbopack)

please fix this