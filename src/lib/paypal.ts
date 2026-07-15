import { normalizeState } from "@/data/address-config";

function getApiBase(): string {
  if (process.env.PAYPAL_API_BASE_URL) return process.env.PAYPAL_API_BASE_URL;
  const env = process.env.PAYPAL_ENV || (process.env.PAYPAL_USE_SANDBOX === "true" ? "sandbox" : "live");
  return env === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
}

export function getPayPalEnv(): string {
  return process.env.PAYPAL_ENV || (process.env.PAYPAL_USE_SANDBOX === "true" ? "sandbox" : "live");
}

const API_BASE = getApiBase();

async function getAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !secret) {
    throw new Error("PayPal not configured — missing client ID or secret");
  }

  const res = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`PayPal auth failed (${res.status}): ${text}`);
    throw new Error("PayPal authentication failed");
  }

  const data = await res.json();
  return data.access_token as string;
}

export interface PayPalOrderItem {
  name: string;
  quantity: number;
  unitAmount: number;
}

function normalizeCountry(raw: string): string {
  const c = raw?.trim().toLowerCase() || "";
  if (c === "australia" || c === "au" || c === "australian") return "AU";
  return "AU";
}

function buildShipping(
  raw?: { street: string; suburb?: string; city: string; state: string; postcode: string; country: string },
): Record<string, unknown> | undefined {
  if (!raw) return undefined;

  const street = raw.street?.trim();
  const suburb = raw.suburb?.trim();
  const city = raw.city?.trim();
  const state = raw.state?.trim();
  const postcode = raw.postcode?.trim();
  const country = raw.country?.trim();

  if (!street || !city || !state || !postcode || !country) return undefined;

  const countryCode = normalizeCountry(country);
  const adminArea1 = normalizeState(state);

  const address: Record<string, unknown> = {
    address_line_1: street,
    address_line_2: suburb || undefined,
    admin_area_2: city,
    admin_area_1: adminArea1,
    postal_code: postcode,
    country_code: countryCode,
  };

  return {
    type: "SHIPPING",
    address,
  };
}

export async function createPayPalOrder(
  items: PayPalOrderItem[],
  total: number,
  shipping?: { street: string; suburb?: string; city: string; state: string; postcode: string; country: string },
  discount?: number,
  customId?: string,
) {
  const token = await getAccessToken();

  const computedTotal = items.reduce((sum, i) => sum + i.unitAmount * i.quantity, 0);
  const finalTotal = total > 0 ? total : computedTotal;
  const itemTotal = computedTotal > 0 ? computedTotal : finalTotal;

  const shippingObj = buildShipping(shipping);

  const body: Record<string, unknown> = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "AUD",
          value: finalTotal.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: "AUD",
              value: itemTotal.toFixed(2),
            },
          },
        },
        items: items.map((item) => ({
          name: item.name,
          quantity: String(item.quantity),
          unit_amount: {
            currency_code: "AUD",
            value: item.unitAmount.toFixed(2),
          },
        })),
      },
    ],
  };

  if (discount && discount > 0) {
    (body.purchase_units as Record<string, unknown>[])[0] = {
      ...(body.purchase_units as Record<string, unknown>[])[0] as Record<string, unknown>,
      amount: {
        ...((body.purchase_units as Record<string, unknown>[])[0] as Record<string, unknown>).amount as Record<string, unknown>,
        breakdown: {
          ...(((body.purchase_units as Record<string, unknown>[])[0] as Record<string, unknown>).amount as Record<string, unknown>).breakdown as Record<string, unknown>,
          discount: {
            currency_code: "AUD",
            value: discount.toFixed(2),
          },
        },
      },
    };
  }

  if (shippingObj) {
    (body.purchase_units as Record<string, unknown>[])[0].shipping = shippingObj;
  }

  if (customId) {
    (body.purchase_units as Record<string, unknown>[])[0].custom_id = customId;
  }

  const res = await fetch(`${API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`PayPal order creation failed (${res.status}): ${text}`);
    throw new Error(`PayPal order creation failed: ${text}`);
  }

  return res.json();
}

export async function refundPayPalOrder(captureId: string) {
  const token = await getAccessToken();

  const res = await fetch(`${API_BASE}/v2/payments/captures/${captureId}/refund`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`PayPal refund failed (${res.status}): ${text}`);
    throw new Error("PayPal refund failed");
  }

  return res.json();
}

export async function capturePayPalOrder(orderId: string) {
  const token = await getAccessToken();

  const res = await fetch(`${API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`PayPal capture failed (${res.status}): ${text}`);
    throw new Error(`PayPal capture failed: ${text}`);
  }

  return res.json();
}

export async function sendPayPalTracking(
  captureId: string,
  trackingNumber: string,
  courier: string
): Promise<void> {
  const token = await getAccessToken();

  const carrierMap: Record<string, string> = {
    JNT: "JNT",
    LBC: "LBC",
    DHL: "DHL",
  };

  const carrier = carrierMap[courier] || courier;

  const body = {
    trackers: [
      {
        capture_id: captureId,
        tracking_number: trackingNumber,
        carrier,
      },
    ],
  };

  const res = await fetch(`${API_BASE}/v1/shipping/trackers-batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`PayPal tracking failed (${res.status}): ${text}`);
  }
}

interface WebhookHeaders {
  "PAYPAL-AUTH-ALGO": string;
  "PAYPAL-CERT-URL": string;
  "PAYPAL-TRANSMISSION-ID": string;
  "PAYPAL-TRANSMISSION-SIG": string;
  "PAYPAL-TRANSMISSION-TIME": string;
}

export async function verifyPayPalWebhookSignature(
  headers: WebhookHeaders,
  body: string,
  webhookId: string,
): Promise<boolean> {
  const token = await getAccessToken();
  const verificationBody = {
    auth_algo: headers["PAYPAL-AUTH-ALGO"],
    cert_url: headers["PAYPAL-CERT-URL"],
    transmission_id: headers["PAYPAL-TRANSMISSION-ID"],
    transmission_sig: headers["PAYPAL-TRANSMISSION-SIG"],
    transmission_time: headers["PAYPAL-TRANSMISSION-TIME"],
    webhook_id: webhookId,
    webhook_event: JSON.parse(body),
  };

  const res = await fetch(`${API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(verificationBody),
  });

  if (!res.ok) {
    console.error("PayPal webhook verification failed", await res.text());
    return false;
  }

  const data = await res.json();
  return data.verification_status === "SUCCESS";
}

export function mapPayPalStatus(paypalStatus: string): string {
  const upper = paypalStatus.toUpperCase();
  if (["COMPLETED", "APPROVED"].includes(upper)) return "paid";
  if (["FAILED", "DENIED", "DECLINED", "VOIDED", "EXPIRED"].includes(upper)) return "declined";
  return "pending";
}
