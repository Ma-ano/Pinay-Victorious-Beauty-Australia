"use client";

import { useState, useEffect } from "react";
import { getCookie, setCookie } from "@/lib/cookies";

export default function DemoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getCookie("demo_banner_dismissed") !== "true");
  }, []);

  const dismiss = () => {
    setCookie("demo_banner_dismissed", "true", 365);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-black text-white text-xs sm:text-sm text-center py-2.5 px-4 z-50">
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