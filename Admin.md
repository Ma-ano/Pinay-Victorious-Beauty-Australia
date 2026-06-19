# Admin Access

## Default Admin Account

- Email: `admin@glowmuse.com`
- Password: `Admin123!`

You can override the configured admin email with `ADMIN_EMAIL` in `.env.local`.

## Setup Instructions

1. Go to `/register` and create the admin account.
2. Verify the account email with the OTP flow.
3. Promote the configured admin email:

```bash
curl -X POST http://localhost:3000/api/auth/set-admin \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@glowmuse.com\"}"
```

If `ADMIN_SETUP_SECRET` is set, include it:

```bash
curl -X POST http://localhost:3000/api/auth/set-admin \
  -H "Content-Type: application/json" \
  -H "x-admin-setup-secret: YOUR_SECRET" \
  -d "{\"email\":\"admin@glowmuse.com\"}"
```

4. Log out and log back in so Firebase refreshes the custom claim.
5. Visit `/admin`.

## How It Works

- Admin access uses the Firebase Auth custom claim `isAdmin: true`.
- `src/proxy.ts` redirects unauthenticated users away from `/admin`, `/profile`, and `/orders`.
- `src/app/admin/layout.tsx` verifies the session cookie server-side before rendering admin pages.
- `src/app/admin/AdminLayoutContent.tsx` keeps a client-side admin guard in place after hydration.
- The claim setup route only promotes the configured admin email.
