import DOMPurify from "isomorphic-dompurify";

export function sanitizeText(str: string, maxLength = 256): string {
  if (!str) return str;
  const stripped = str.replace(/<[^>]*>/g, "").trim();
  return stripped.slice(0, maxLength);
}

export function sanitizeAddressField(str: string, maxLength = 128): string {
  if (!str) return str;
  const stripped = str.replace(/<[^>]*>/g, "").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "").trim();
  return stripped.slice(0, maxLength);
}

export function sanitizeItemName(name: string): string {
  return sanitizeText(name, 200);
}

export function sanitizePhone(phone: string): string {
  if (!phone) return phone;
  return phone.replace(/<[^>]*>/g, "").replace(/[^\d\s\+\-\(\)]/g, "").trim().slice(0, 30);
}

export function sanitizeEmail(email: string): string {
  if (!email) return email;
  return email.replace(/<[^>]*>/g, "").trim().toLowerCase().slice(0, 254);
}

export function sanitizeHTML(html: string): string {
  if (!html) return html;
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

export function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}
