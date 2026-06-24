# PayPal Sandbox Fix

## The Problem

When testing PayPal at checkout, you see:

> "You are logging into the account of the seller for this purchase. Please change your login information and try again."

This means you are logged into the **seller's** PayPal sandbox account (the one tied to your `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET`). PayPal sandbox payments require a **separate buyer account** to complete the purchase.

## Fix

### 1. Create a sandbox buyer account

Go to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/accounts) → **Sandbox** → **Accounts**.

- If a **Personal** (buyer) account already exists, use its credentials.
- If not, click **Create Account** → choose **Personal** → note the email and password.

### 2. Use the buyer account at checkout

When the PayPal login popup appears during checkout:

- Log out of any existing PayPal session.
- Sign in with the **buyer** account's email and password (not your own / not the seller account).
- Complete the payment.

### 3. (Optional) View transactions

You can view test payments under the same Sandbox → Accounts section, or under **Sandbox** → **Transactions** in the Developer Dashboard.

## Production

When you go live, replace `NEXT_PUBLIC_PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` in `.env` with your **live** PayPal app credentials, and set `PAYPAL_USE_SANDBOX=false` (or remove it). Real customers will then pay with their own PayPal accounts — no login conflict.
