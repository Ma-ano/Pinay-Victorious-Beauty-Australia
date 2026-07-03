# Performance Fix Plan

## Problem
Score dropped from 85 to 75 after removing `unoptimized` from hero banner. LCP is 4.82s (target <2.5s), FCP is 2.33s.

## Root Cause
Without `unoptimized`, the hero image goes through Next.js Image Optimization server pipeline on every first visit: download from Firebase Storage → resize → WebP encode. This adds 2-4s to LCP.

## Fixes

### Fix 1 — HeroBanner.tsx:69
Add `unoptimized` back + `fetchPriority="high"` to the hero Image component:

Current code at line 69:
```
                preload={current === 0}
                sizes="100vw"
```
Replace with:
```
                unoptimized
                preload={current === 0}
                fetchPriority="high"
                sizes="100vw"
```

### Fix 2 — page.tsx:4
Replace `force-dynamic` with ISR caching:
- Remove line 4: `export const dynamic = "force-dynamic";`
- Add: `export const revalidate = 60;`

### Fix 3 — layout.tsx
Add preconnect to Firebase Storage in the `<head>`:
Add this line after the `<html>` tag or use the metadata export:
```tsx
export const metadata: Metadata = {
  // ... existing metadata ...
  other: {
    "link:preconnect": '<link rel="preconnect" href="https://firebasestorage.googleapis.com">',
  },
};
```
Or add directly in the `<head>` via the `metadata` other field.

### Fix 4 — HomeContent.tsx
Remove the fade-in delay that makes hero invisible for 500ms:

Current:
```
export default function HomeContent({ products, reviewStats, reviews, settings }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={`space-y-24 pb-24 transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
```

Replace with:
```
export default function HomeContent({ products, reviewStats, reviews, settings }: Props) {
  return (
    <div className="space-y-24 pb-24">
```

## Files Changed
1. `src/components/HeroBanner.tsx` — add `unoptimized`, `fetchPriority="high"`
2. `src/app/page.tsx` — `force-dynamic` → `revalidate = 60`
3. `src/app/layout.tsx` — add `preconnect` for Firebase Storage
4. `src/components/HomeContent.tsx` — remove fade-in `useEffect` + opacity transition

## Verification
Run: `npx tsc --noEmit && npx next build`
