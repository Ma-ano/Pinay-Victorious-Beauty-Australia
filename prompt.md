Build a production-ready real-time admin users page using Next.js (App Router), React, TypeScript, and Firebase Firestore.

Requirements:

1. Use Firestore `onSnapshot` for real-time updates (no polling, no repeated API calls).
2. Implement pagination:

   * Limit results to 10–20 users per page
   * Use `startAfter` for next page
   * Store and manage `lastDoc`
3. Optimize performance:

   * Avoid loading entire collection
   * Only subscribe to currently visible page
   * Clean up listeners using unsubscribe in `useEffect`
4. Data structure:

   * Collection: `users`
   * Fields: id, name, email, role, createdAt
5. UI behavior:

   * Display list of users
   * Show loading state
   * Show empty state if no users
   * Auto-update UI when a user is added/edited/deleted (real-time)
6. Add search:

   * Filter by email or name using Firestore `where`
   * Optional: disable real-time when searching and use `getDocs`
7. Code quality:

   * Use modular Firebase v9+
   * Use clean TypeScript types
   * Separate logic into hooks if needed
8. Do NOT use Next.js API routes for fetching users
9. Ensure no memory leaks (unsubscribe on unmount)
10. Keep it optimized for large datasets (1000+ users)

Output:

* Full React component
* Firebase query logic
* Pagination logic
* Clean, readable, production-level code
