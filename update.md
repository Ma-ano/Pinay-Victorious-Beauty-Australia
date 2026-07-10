# What's New — Address Dropdowns, Pagination & More

---

# Previous Updates

## ✨ Auto Logout When Idle

The site now automatically logs you out if you're not using it for a while. This keeps your account secure if you step away or forget to log out.

### How long before auto-logout?

| Who | Time before logout |
|-----|-------------------|
| **Admin** users | 30 minutes |
| **Customer** users | 4 hours |

### Before you're logged out, you'll see a warning

60 seconds before auto-logout, a popup appears:
> **"Your session will expire in 60 seconds due to inactivity"**

You can click **"Stay Logged In"** to reset the timer and keep using the site.

> **Even if you close your browser or shut down your computer**, the timer keeps counting. When you come back, if the time has passed, you'll be logged out automatically on the first page you visit.

---

## 🛠️ Admin Login Redirect Fixed

**The problem:** After an admin logged in, the page didn't properly take them to the dashboard. They'd end up back on the login screen or the home page.

**The fix:** The login process now properly refreshes your security token before redirecting, so the system correctly recognises you as an admin and takes you straight to the dashboard.

---

## 📋 For Developers

### How auto-logout works (two layers)

| Layer | What it does | Where |
|-------|-------------|-------|
| **Client-side timer** | Tracks mouse movements, clicks, key presses. Shows warning popup, then logs out after the idle time. Works while the browser tab is open. | `useIdleTimeout` hook + `IdleTimeoutProvider` component |
| **Server-side middleware** | Checks a timestamp cookie on every page load. If the idle time is exceeded (even if the browser was closed), it clears the session and redirects to login. | `src/proxy.ts` |

The client periodically stamps a `lastActivityAt` cookie (every 2 minutes + on activity). The middleware reads this cookie and compares against the timeout for the route (30min for `/admin/*`, 4hr for everything else).

### Key files

| File | What it does |
|------|-------------|
| `src/hooks/useIdleTimeout.ts` | Custom hook: listens for user activity, fires warning then timeout. Uses refs to prevent stale closures and ignores activity during the warning phase. |
| `src/components/IdleTimeoutProvider.tsx` | Global provider: picks timeout duration based on role (admin 30min / customer 4hr), shows countdown modal, calls `logout()` on timeout. Also stamps the `lastActivityAt` cookie for server-side enforcement. |
| `src/proxy.ts` | Runs on every request. If `__session` exists but `lastActivityAt` is older than the timeout, clears session and redirects to login. Excludes login pages, API routes, and static assets. |
| `src/app/admin/login/AdminLoginPage.tsx` | After server sets admin claims, force-refreshes the Firebase ID token and creates a new session cookie so the dashboard recognises the user as admin. |

### Files changed

```
M src/app/admin/login/AdminLoginPage.tsx     — login redirect fix
M src/app/layout.tsx                          — added IdleTimeoutProvider
A src/components/IdleTimeoutProvider.tsx       — new: idle timeout UI + heartbeat
A src/hooks/useIdleTimeout.ts                  — new: idle detection hook
A src/middleware.ts                            — new: server-side timeout check
R src/middleware.ts → src/proxy.ts             — renamed for Next.js 16
```
