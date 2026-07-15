YOU FIX MY PAYPAL SYSTEM FOR VERCEL DEPLOY.

🪨 GOAL:
- Webhook works on Vercel (preview/testing branch)
- Payment status updates correctly
- No localhost / no ngrok
- Uses Vercel URL

---

🪨 PART 1 — WEBHOOK URL (VERCEL)

Use my Vercel preview domain:

https://<my-project>-git-testing-<username>.vercel.app/api/paypal/webhook

OR if auto preview:
https://<project>.vercel.app/api/paypal/webhook

👉 MUST be HTTPS
👉 MUST be POST route

---

🪨 PART 2 — BACKEND (API ROUTE)

Create:

/api/paypal/webhook

Requirements:

- Accept POST
- Parse JSON body
- Log full event

Handle events:

IF event == PAYMENT.CAPTURE.COMPLETED:
  → payment_status = "paid"
  → order_status = "approved"

IF event == PAYMENT.CAPTURE.PENDING:
  → payment_status = "pending"
  → order_status = "processing"

IF event == PAYMENT.CAPTURE.DENIED OR DECLINED:
  → payment_status = "declined"
  → order_status = "rejected"

IF event == CHECKOUT.ORDER.APPROVED:
  → order_status = "processing"

ALWAYS return:
200 OK

---

🪨 PART 3 — IMPORTANT (VERCEL SERVERLESS ⚠️)

- Disable body parser if needed (raw body for verification)
- No sessions (stateless)
- Must respond fast (<10s)

---

🪨 PART 4 — ENV VARIABLES

Use .env:

PAYPAL_MODE=sandbox or live
PAYPAL_CLIENT_ID=xxx
PAYPAL_SECRET=xxx

Switch ONLY via .env

---

🪨 PART 5 — VERCEL ENV SETUP

Run:

vercel env add PAYPAL_MODE
vercel env add PAYPAL_CLIENT_ID
vercel env add PAYPAL_SECRET

Select:
→ Preview (for testing branch)

---

🪨 PART 6 — GITHUB FLOW

git checkout -b testing
git add .
git commit -m "fix: paypal webhook vercel"
git push origin testing

---

🪨 PART 7 — DEPLOY

vercel

OR auto deploy via GitHub

---

🪨 PART 8 — PAYPAL DASHBOARD

Set webhook:

https://<vercel-url>/api/paypal/webhook

Events:

- CHECKOUT.ORDER.APPROVED
- PAYMENT.CAPTURE.COMPLETED
- PAYMENT.CAPTURE.DENIED
- PAYMENT.CAPTURE.DECLINED
- PAYMENT.CAPTURE.PENDING

---

🪨 PART 9 — TEST FLOW

1. Deploy to Vercel preview
2. Copy preview URL
3. Set PayPal webhook
4. Make sandbox payment
5. Check logs (vercel logs)
6. Verify:

pending → processing → approved

OR

declined → rejected

---

🪨 DONE CONDITION

- Webhook hits Vercel successfully
- Orders auto update
- No "undefined" error
- Works in sandbox + live via env switch