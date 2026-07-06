"use client";

import { createContext, useContext, type ReactNode } from "react";

const afterpayMerchantId = process.env.NEXT_PUBLIC_AFTERPAY_MERCHANT_ID || "";

interface AfterpayContextType {
  enabled: boolean;
}

const AfterpayContext = createContext<AfterpayContextType>({
  enabled: !!afterpayMerchantId,
});

export function useAfterpayEnabled() {
  return useContext(AfterpayContext);
}

export default function AfterpayProvider({ children }: { children: ReactNode }) {
  return (
    <AfterpayContext.Provider value={{ enabled: !!afterpayMerchantId }}>
      {children}
    </AfterpayContext.Provider>
  );
}
