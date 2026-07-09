const brandColor = "#B76E79";
const bgColor = "#FAF6F3";
const textColor = "#3A2E2A";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

import { site } from "@/data/site";

function baseTemplate(content: string, baseUrl: string = site.url) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:${bgColor};font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${bgColor};padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:40px 30px 20px;text-align:center;background:linear-gradient(135deg,${brandColor}15,#ffffff);">
              <img src="${baseUrl}/images/PinayVictoriousLogo.jpg" alt="Pinay Victorious Beauty" style="width:176px;height:auto;border-radius:8px;">
            </td>
          </tr>
          <tr>
            <td style="padding:0 30px 30px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 30px;background-color:${bgColor};text-align:center;border-top:1px solid ${brandColor}20;">
              <p style="margin:0;font-size:12px;color:${textColor}80;">
                &copy; ${new Date().getFullYear()} Pinay Victorious Beauty Australia &bull; Sydney, Australia
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:${textColor}60;">
                You received this email because you signed up on our website.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function verificationEmail(link: string, baseUrl?: string) {
  return baseTemplate(`
    <h1 style="color:${textColor};font-size:24px;margin:0 0 12px;">Verify Your Email</h1>
    <p style="color:${textColor};font-size:15px;line-height:1.6;margin:0 0 24px;">
      Welcome to Pinay Victorious Beauty! Please verify your email address to activate your account and start shopping.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
      <tr>
        <td style="background-color:${brandColor};border-radius:8px;padding:14px 32px;">
          <a href="${link}" style="color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;display:inline-block;">Verify Email Address</a>
        </td>
      </tr>
    </table>
    <p style="color:${textColor};font-size:13px;line-height:1.5;margin:0;">
      Or copy this link into your browser:<br>
      <a href="${link}" style="color:${brandColor};font-size:12px;word-break:break-all;">${link}</a>
    </p>
    <p style="color:${textColor}80;font-size:13px;line-height:1.5;margin:16px 0 0;">
      This link expires in 24 hours. If you didn't create an account, you can ignore this email.
    </p>
  `, baseUrl);
}

export function welcomeEmail(name: string, baseUrl?: string) {
  return baseTemplate(`
    <h1 style="color:${textColor};font-size:24px;margin:0 0 12px;">Welcome to the Glow Community!</h1>
    <p style="color:${textColor};font-size:15px;line-height:1.6;margin:0 0 8px;">
      Hi ${name},
    </p>
    <p style="color:${textColor};font-size:15px;line-height:1.6;margin:0 0 24px;">
      Thank you for subscribing! You'll now be the first to know about exclusive offers, beauty tips, and new arrivals from across Asia.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
      <tr>
        <td style="background-color:${brandColor};border-radius:8px;padding:14px 32px;">
          <a href="${baseUrl || site.url}/shop" style="color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;display:inline-block;">Shop Now</a>
        </td>
      </tr>
    </table>
    <p style="color:${textColor}80;font-size:13px;line-height:1.5;margin:0;">
      Stay glowing,<br>
      The Pinay Victorious Team
    </p>
  `, baseUrl);
}

export function contactNotification({ name, email, message }: { name: string; email: string; message: string }, baseUrl?: string) {
  return baseTemplate(`
    <h1 style="color:${textColor};font-size:24px;margin:0 0 12px;">New Contact Form Message</h1>
    <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;color:${textColor};line-height:1.6;">
      <tr>
        <td style="padding:4px 0;font-weight:bold;width:80px;vertical-align:top;">Name:</td>
        <td style="padding:4px 0;">${name}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-weight:bold;vertical-align:top;">Email:</td>
        <td style="padding:4px 0;"><a href="mailto:${email}" style="color:${brandColor};">${email}</a></td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-weight:bold;vertical-align:top;">Message:</td>
        <td style="padding:4px 0;white-space:pre-wrap;">${escapeHtml(message)}</td>
      </tr>
    </table>
  `);
}
