const AFTERPAY_MERCHANT_ID = process.env.NEXT_PUBLIC_AFTERPAY_MERCHANT_ID || "";
const AFTERPAY_SECRET_KEY = process.env.AFTERPAY_SECRET_KEY || "";

const API_BASE =
  process.env.AFTERPAY_USE_SANDBOX === "true"
    ? "https://api-sandbox.afterpay.com/v2"
    : "https://api.afterpay.com/v2";

function getAuthToken(): string {
  return Buffer.from(`${AFTERPAY_MERCHANT_ID}:${AFTERPAY_SECRET_KEY}`).toString("base64");
}

interface AfterpayAmount {
  amount: string;
  currency: string;
}

interface AfterpayItem {
  name: string;
  quantity: number;
  price: AfterpayAmount;
}

interface AfterpayAddress {
  name: string;
  line1: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phoneNumber?: string;
}

interface CreateCheckoutParams {
  items: AfterpayItem[];
  total: string;
  shipping: AfterpayAddress;
  redirectConfirmUrl: string;
  redirectCancelUrl: string;
  email: string;
}

export interface AfterpayCheckoutResponse {
  token: string;
  checkoutUrl: string;
  expiresAt: string;
}

interface AfterpayCaptureResponse {
  id: string;
  status: string;
  totalAmount: AfterpayAmount;
  paymentLog?: Record<string, unknown>[];
}

interface AfterpayRefundResponse {
  id: string;
  status: string;
  refundAmount: AfterpayAmount;
}

export function hasAfterpayCredentials(): boolean {
  return !!(AFTERPAY_MERCHANT_ID && AFTERPAY_SECRET_KEY);
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetchWithTimeout(url, options);
    } catch (err) {
      if (i === retries) throw err;
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new Error("Afterpay API request timed out");
      }
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error("Afterpay API request failed");
}

export async function createAfterpayCheckout(
  params: CreateCheckoutParams
): Promise<AfterpayCheckoutResponse> {
  const body = {
    amount: { amount: params.total, currency: "AUD" },
    items: params.items,
    consumer: { givenNames: "", surname: "", email: params.email },
    shipping: params.shipping,
    billing: params.shipping,
    merchant: {
      redirectConfirmUrl: params.redirectConfirmUrl,
      redirectCancelUrl: params.redirectCancelUrl,
    },
  };

  const res = await fetchWithRetry(`${API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${getAuthToken()}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Afterpay create checkout failed: ${err}`);
  }

  return res.json();
}

export async function captureAfterpayPayment(
  token: string
): Promise<AfterpayCaptureResponse> {
  const res = await fetchWithRetry(`${API_BASE}/checkouts/${token}/capture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${getAuthToken()}`,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Afterpay capture failed: ${err}`);
  }

  return res.json();
}

export async function refundAfterpayPayment(
  afterpayOrderId: string,
  amount: string
): Promise<AfterpayRefundResponse> {
  const res = await fetchWithRetry(
    `${API_BASE}/payments/${afterpayOrderId}/refund`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${getAuthToken()}`,
      },
      body: JSON.stringify({
        amount: { amount, currency: "AUD" },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Afterpay refund failed: ${err}`);
  }

  return res.json();
}
