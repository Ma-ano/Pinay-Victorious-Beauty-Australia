"use client";

import { useEffect, useState } from "react";
import { getSettings, type SiteSettings } from "@/lib/settings-store";

interface UseReviewsResult {
  reviews: SiteSettings["reviews"];
  settings: SiteSettings | null;
  loading: boolean;
}

export function useReviews(initialSettings?: SiteSettings | null): UseReviewsResult {
  const [settings, setSettings] = useState<SiteSettings | null>(initialSettings ?? null);
  const [loading, setLoading] = useState(!initialSettings);

  useEffect(() => {
    if (initialSettings) return;

    let cancelled = false;

    getSettings()
      .then((s) => {
        if (cancelled) return;
        setSettings(s);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { reviews: settings?.reviews, settings, loading };
}
