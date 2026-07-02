"use client";

import { useEffect, useState } from "react";

export default function FullPageLoader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Brand logo area */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div className="absolute -inset-2 rounded-2xl border-2 border-accent/20 animate-pulse" />
        </div>

        <div className="text-center">
          <h1 className="text-xl font-bold text-dark tracking-tight">Pinay Victorious</h1>
          <p className="text-sm text-foreground/60 mt-1">Beauty Australia</p>
        </div>
      </div>

      {/* Shimmer bar */}
      <div className="mt-10 w-48 h-1 rounded-full bg-primary/20 overflow-hidden">
        <div className="h-full w-full skeleton" />
      </div>

      <p className="mt-4 text-xs text-foreground/40 animate-pulse">Loading...</p>
    </div>
  );
}
