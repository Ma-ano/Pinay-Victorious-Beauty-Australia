## Error Type
Runtime ReferenceError

## Error Message
loading is not defined


    at LoginPage (src/app/login/LoginPage.tsx:179:23)
    at Page (src\app\login\page.tsx:10:10)

## Code Frame
  177 |           <button
  178 |             type="submit"
> 179 |             disabled={loading}
      |                       ^
  180 |             className="w-full bg-accent text-white py-2.5 rounded-xl font-medium hover:bg-accent/80 transiti...
  181 |           >
  182 |             {loading ? "Logging in..." : "Login"}

Next.js version: 16.2.10 (Turbopack)
