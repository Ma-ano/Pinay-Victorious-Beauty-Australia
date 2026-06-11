"use client";

import { useState, useEffect } from "react";

export default function DemoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem("demo-banner-dismissed") !== "true");
  }, []);

  const dismiss = () => {
    localStorage.setItem("demo-banner-dismissed", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="bg-black text-white text-xs sm:text-sm text-center py-2.5 px-4">
      <span>
        This is a demo store — for demonstration purposes only
      </span>
      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
