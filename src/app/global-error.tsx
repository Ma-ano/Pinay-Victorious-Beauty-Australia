"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <h1 className="text-2xl font-bold text-dark mb-2">Something went wrong</h1>
            <p className="text-sm text-foreground mb-6">
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={() => reset()}
              className="bg-accent text-white py-2.5 px-6 rounded-xl font-medium hover:bg-accent/80 transition-all text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
