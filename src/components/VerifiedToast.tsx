"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

export default function VerifiedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const shown = useRef(false);

  useEffect(() => {
    if (searchParams.get("verified") === "true" && !shown.current) {
      shown.current = true;
      showToast("Your email has been verified!", "success");
      router.replace("/");
    }
  }, [searchParams, router, showToast]);

  return null;
}
