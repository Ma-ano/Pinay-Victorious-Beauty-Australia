Fix my broken AI chat API in Next.js (App Router, TypeScript) that fails with 404 on Vercel.

Tasks:
- Create a working /app/api/chat/route.ts
- Implement POST handler
- Return JSON or streaming response
- Fix frontend fetch to call /api/chat correctly
- Ensure compatibility with Vercel (no Node-only APIs unless configured)
- Handle errors properly (return 500 JSON)

Also:
- Show correct deployment behavior on Vercel
- Make sure no "endpoint not found" happens
- Keep code clean and minimal

Output:
- route.ts (fixed)
- frontend function (fixed)
- explanation of what caused the 404