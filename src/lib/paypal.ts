function getApiBase(): string {
  if (process.env.PAYPAL_API_BASE_URL) return process.env.PAYPAL_API_BASE_URL;
  if (process.env.PAYPAL_USE_SANDBOX === "true") return "https://api-m.sandbox.paypal.com";
  return "https://api-m.paypal.com";
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

export async function createPayPalOrder(items: PayPalOrderItem[], total: number) {
  const token = await getAccessToken();

  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "AUD",
          value: total.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: "AUD",
              value: total.toFixed(2),
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
    throw new Error("PayPal order creation failed");
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
    throw new Error("PayPal capture failed");
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
