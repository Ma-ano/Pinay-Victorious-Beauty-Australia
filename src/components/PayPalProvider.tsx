"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import Script from "next/script";
import { CURRENCY } from "@/lib/constants";

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

interface PayPalContextType {
  ready: boolean;
}

const PayPalContext = createContext<PayPalContextType>({ ready: false });

export function usePayPalReady() {
  return useContext(PayPalContext);
}

export default function PayPalProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).paypal) {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      let attempts = 0;
      const id = setInterval(() => {
        attempts++;
        if (typeof window !== "undefined" && (window as any).paypal?.Buttons) {
          setReady(true);
          clearInterval(id);
        }
        if (attempts > 60) clearInterval(id);
      }, 100);
      return () => clearInterval(id);
    }
  }, [loaded]);

  if (!paypalClientId) return <>{children}</>;

  return (
    <PayPalContext.Provider value={{ ready }}>
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=${CURRENCY}&components=buttons,messages&enable-funding=card`}
        strategy="afterInteractive"
        data-sdk-integration-source="developer-library"
        onLoad={() => setLoaded(true)}
        onError={() => console.error("Failed to load PayPal SDK")}
      />
      {children}
    </PayPalContext.Provider>
  );
}
