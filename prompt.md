please make the UI of this fancy and using the color palette

Hello,

Follow this link to verify your email address.

https://pinay-victorious.firebaseapp.com/__/auth/action?mode=verifyEmail&oobCode=UxOb7uVN2X3riRyASSu964DBGSO6F71LvD9ge6enJJgAAAGe1svc4w&apiKey=AIzaSyAy_skrFRKL6r2d4nZ2xN7VFClVnWXCzT4&lang=en

If you didn’t ask to verify this address, you can ignore this email.

Thanks,

Your Pinay Victorious team

and 

https://pinay-victorious.firebaseapp.com/__/auth/action?mode=verifyEmail&oobCode=UxOb7uVN2X3riRyASSu964DBGSO6F71LvD9ge6enJJgAAAGe1svc4w&apiKey=AIzaSyAy_skrFRKL6r2d4nZ2xN7VFClVnWXCzT4&lang=en
Your email has been verified
You can now sign in with your new account

## Error Type
Console Error

## Error Message
Encountered two children with the same key, `/shop`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.


    at div (<anonymous>:null:null)
    at <unknown> (src/components/CustomerNavbar.tsx:141:25)
    at Array.map (<anonymous>:null:null)
    at CustomerNavbar (src/components/CustomerNavbar.tsx:138:29)
    at Navbar (src/components/Navbar.tsx:10:38)
    at RootLayout (src\app\layout.tsx:42:13)

## Code Frame
  139 |                     if (link.label === "Categories") {
  140 |                       return (
> 141 |                         <div key={link.href} ref={catRef} className="relative">
      |                         ^
  142 |                           <button
  143 |                             onClick={() => setCatOpen(!catOpen)}
  144 |                             className={`flex items-center gap-1 px-4 py-2 text-sm transition-color...

Next.js version: 16.2.9 (Turbopack)
