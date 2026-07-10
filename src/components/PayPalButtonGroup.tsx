"use client";

import { useEffect, useRef } from "react";

interface PayPalButtonGroupProps {
  createOrder: () => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void>;
  onError: (err: Record<string, unknown>) => void;
  onCancel: () => void;
  disabled: boolean;
  isReady: boolean;
  amount: number;
  fundingSources?: Array<"paypal" | "paylater" | "card">;
}

function placeholderHtml(fundingSource: string) {
  const label = fundingSource === "card" ? "Debit or Credit Card" : "PayPal";
  const icon = fundingSource === "card" ? "💳" : "🅿️";
  return `<div class="w-full py-4 px-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
    <div class="text-base mb-1">${icon}</div>
    <div class="text-sm font-semibold text-gray-700">${label}</div>
    <div class="text-xs text-gray-400 mt-0.5">Not available for this transaction</div>
  </div>`;
}

export default function PayPalButtonGroup({ createOrder, onApprove, onError, onCancel, disabled, isReady, amount, fundingSources }: PayPalButtonGroupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const createOrderRef = useRef(createOrder);
  const onApproveRef = useRef(onApprove);
  const onErrorRef = useRef(onError);
  const onCancelRef = useRef(onCancel);
  const buttonsRef = useRef<Array<{ close?: () => void }>>([]);

  useEffect(() => { createOrderRef.current = createOrder; }, [createOrder]);
  useEffect(() => { onApproveRef.current = onApprove; }, [onApprove]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);
  useEffect(() => { onCancelRef.current = onCancel; }, [onCancel]);

  useEffect(() => {
    if (!isReady) return;

    const paypal = (window as any).paypal;
    if (!paypal?.Buttons) return;

    const container = containerRef.current;
    if (!container) return;

    const activeSources = fundingSources ?? ["paypal", "card"];
    const controller = new AbortController();

    (async () => {
      let eligibleSources: string[] | null = null;

      if (!fundingSources) {
        try {
          if (paypal.findEligibleMethods) {
            const methods = await paypal.findEligibleMethods({
              currencyCode: "AUD",
              amount: String(amount),
            });
            if (controller.signal.aborted) return;
            eligibleSources = activeSources.filter((fs) => methods.isEligible(fs));
          } else if (paypal.createInstance) {
            const instance = await paypal.createInstance({
              components: ["buttons"],
              pageType: "checkout",
            });
            const methods = await instance.findEligibleMethods({
              currencyCode: "AUD",
              amount: String(amount),
            });
            if (controller.signal.aborted) return;
            eligibleSources = activeSources.filter((fs) => methods.isEligible(fs));
          }
        } catch {
          // Fall back to showing all sources
        }
      }

      if (controller.signal.aborted) return;

      const enabledSources = eligibleSources ?? activeSources;
      const newButtons: Array<{ close?: () => void }> = [];

      container.innerHTML = "";

      activeSources.forEach((fundingSource) => {
        const wrapper = document.createElement("div");
        wrapper.id = "paypal-button-container-" + fundingSource;
        container.appendChild(wrapper);

        if (enabledSources.includes(fundingSource)) {
          const btn = paypal.Buttons({
            fundingSource,
            style: { layout: "vertical", shape: "rect" },
            createOrder: async () => createOrderRef.current(),
            onApprove: async (data: { orderID: string }) => onApproveRef.current(data),
            onError: (err: Record<string, unknown>) => {
              console.error("PayPal SDK error (" + fundingSource + "):", err);
              onErrorRef.current(err);
            },
            onCancel: () => onCancelRef.current(),
          });
          newButtons.push(btn);
          btn.render("#paypal-button-container-" + fundingSource).catch(() => {
            wrapper.innerHTML = placeholderHtml(fundingSource);
          });
        } else {
          wrapper.innerHTML = placeholderHtml(fundingSource);
        }
      });

      buttonsRef.current = newButtons;
    })();

    return () => {
      controller.abort();
      buttonsRef.current.forEach((btn) => {
        try { btn.close?.(); } catch { /* ignore */ }
      });
      buttonsRef.current = [];
      if (container) container.innerHTML = "";
    };
  }, [isReady, amount]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center py-6">
        <p className="text-sm text-foreground">Loading PayPal...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={containerRef} className="space-y-2" />
      {disabled && (
        <div className="absolute inset-0 bg-white/60 rounded-xl z-10" />
      )}
    </div>
  );
}
