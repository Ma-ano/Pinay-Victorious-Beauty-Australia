"use client";

import { useState, useEffect } from "react";
import { getCookie, setCookie } from "@/lib/cookies";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = getCookie("beauty_store_cookies");
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    setCookie("beauty_store_cookies", "accepted", 365);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4">
      <div className="max-w-7xl mx-auto bg-card/90 backdrop-blur-lg border border-card-border rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6">
        <div className="text-sm text-foreground leading-relaxed">
          We use cookies to enhance your browsing experience and analyze site traffic.{' '}
          <span className="text-foreground">By clicking &ldquo;Accept&rdquo;, you consent to our use of cookies.</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={accept}
            className="px-5 py-2 bg-accent text-white rounded-full text-sm font-medium hover:bg-accent/80 transition-all whitespace-nowrap"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
