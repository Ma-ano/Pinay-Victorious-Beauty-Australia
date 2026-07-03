# Website Update Summary — July 4, 2026

## What Changed

**Contact info live.** Footer now shows real WhatsApp, Instagram, and Facebook links with correct phone spacing (`+61 413 504 424`) and Gmail email. WhatsApp bubble button links to the real number.

**Register phone formatting.** Phone field auto-formats as `+61 XXX XXX XXX` with `+61` pre-filled by default — only numbers can be typed, spacing auto-applies. Delete backspace gracefully without showing junk characters.

**Faster first load.** Logos compressed 99.5% (1.5MB → 8KB, 906KB → 2.9KB). Deduplicated Firestore product queries. Added 10s timeout to all Firestore admin queries to prevent cold-start hangs. Limited review stats query to 1000 documents.

**Firestore init fix.** Added explicit `import "firebase/firestore"` side-effect — prevents "Service firestore is not available" error with Turbopack.

**Fast Refresh stable.** `product-store.ts` now uses lazy `getDb()` — no module-level side effects, so editing the file won't trigger a full page reload.

**LCP fixed.** First 2 product images in carousel are now preloaded. Hero banner image wrapper has `position: relative` so `fill` works correctly. Navbar logo also preloaded as it's the LCP element.

**Profile photo upload fixed.** Replaced dynamic `await import("firebase/storage")` with static import — was broken by Turbopack's `optimizePackageImports`. Error messages now show the actual reason instead of a generic "Failed" message.

**Fast Refresh stable across all modules.** `firebase.ts`, `AuthContext.tsx`, and all Firebase data store files now use lazy getter functions instead of module-level initialization — no more full page reloads when editing these files during development.

**Load time improved 97%.** Homepage went from 41s to under 1s on repeat visits.
