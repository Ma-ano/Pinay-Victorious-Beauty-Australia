"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <span className="text-3xl font-bold text-foreground">?</span>
        </div>
        <h1 className="text-xl font-semibold text-dark mb-2">Page Not Found</h1>
        <p className="text-sm text-foreground mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block w-full bg-accent text-white py-2.5 rounded-xl font-medium hover:bg-accent/80 transition-all text-sm"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
