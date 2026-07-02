<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project conventions

## Next.js 16 specifics
- `<Image>` uses `fill` prop + `sizes` for responsive images. `priority` is deprecated; use `preload={true}` instead.
- `images.qualities` required in config (default `[75]`). Match `quality` prop to allowed values.
- `remotePatterns` uses `new URL()` or object syntax. `domains` deprecated.
- App Router only. Pages use `force-dynamic` export for uncached server data.

## Code patterns
- **Custom hooks**: Place in `src/hooks/`. Accept optional `initial*` props for server data. Return `{ data, loading }`.
- **Section components**: Each homepage section (Trending, BestSelling, Reviews) is its own component with dedicated skeleton from `Skeletons.tsx`.
- **React purity**: Never call `Math.random()`, `Date.now()`, or other impure functions inside `useMemo`/useEffect/component body. Use `localeCompare` for deterministic sort tiebreakers.
- **Firestore queries**: Use `limit(n)` for data-fetching on collection queries (e.g., `getAllProducts(20)` for homepage).
- **Skeleton naming**: Match skeleton name to section name (e.g., `TrendingSkeleton`, `BestSellingSkeleton`).
