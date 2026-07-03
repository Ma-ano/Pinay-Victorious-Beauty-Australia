"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { applyActionCode } from "firebase/auth";
import { getAuthClient } from "@/lib/firebase";

const _auth = getAuthClient();
if (!_auth) throw new Error("Firebase Auth not configured");
const auth = _auth;
import { site } from "@/data/site";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const oobCode = searchParams.get("oobCode");
    const mode = searchParams.get("mode");

    if (mode !== "verifyEmail" || !oobCode) {
      setStatus("error");
      setErrorMsg("Invalid verification link.");
      return;
    }

    applyActionCode(auth, oobCode)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        const code = (err as { code?: string })?.code;
        if (code === "auth/invalid-action-code") {
          setErrorMsg("This verification link has expired or already been used.");
        } else {
          setErrorMsg("Something went wrong. Please try requesting a new verification email.");
        }
      });
  }, [searchParams]);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-card rounded-2xl p-8 shadow-lg border border-primary/10 text-center">
          <Image
            src="/images/PinayVictoriousLogo.jpg"
            alt={site.name}
            width={0}
            height={0}
            className="h-14 w-auto mx-auto mb-6 rounded-lg object-contain"
            sizes="160px"
          />

          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              <p className="text-sm text-foreground">Verifying your email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-dark">Email Verified!</h1>
              <p className="text-sm text-foreground">
                Your email has been successfully verified. Your account is now active.
              </p>
              <Link
                href="/"
                className="w-full mt-2 bg-accent text-white py-2.5 rounded-xl font-medium text-center text-sm hover:bg-accent/80 transition-all"
              >
                Continue to Homepage
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-dark">Verification Failed</h1>
              <p className="text-sm text-foreground">{errorMsg}</p>
              <div className="flex flex-col w-full gap-2 mt-2">
                <Link
                  href="/login"
                  className="w-full bg-accent text-white py-2.5 rounded-xl font-medium text-center text-sm hover:bg-accent/80 transition-all"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
