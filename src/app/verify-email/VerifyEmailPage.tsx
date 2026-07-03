"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getAuthClient } from "@/lib/firebase";
import { useAuth } from "@/components/AuthContext";

export default function VerifyEmailPage() {
  const { user, emailVerified, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && emailVerified) {
      router.push("/");
    }
  }, [loading, emailVerified, router]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const email = user?.email || emailParam || "";

  const handleVerify = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Invalid code");
      }

      const auth = getAuthClient();
      await auth?.currentUser?.getIdToken(true);

      window.location.href = "/?verified=true";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setSubmitting(false);
    }
  }, [code, email, router]);

  const handleResend = useCallback(async () => {
    if (sending || countdown > 0) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to resend");
      setCountdown(60);
    } catch {
      setError("Failed to resend verification code. Please try again.");
    } finally {
      setSending(false);
    }
  }, [email, sending, countdown]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-accent/15 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-dark mb-2">Verify Your Email</h1>
        <p className="text-sm text-foreground mb-1">
          Enter the 6-digit code sent to
        </p>
        <p className="text-sm font-medium text-dark mb-6">{email}</p>

        {error && (
          <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/20 text-red-500 text-sm px-4 py-2.5 rounded-xl mb-4 text-left">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, ""));
                setError("");
              }}
              placeholder="000000"
              className="w-full text-center text-2xl tracking-[0.5em] px-4 py-3 rounded-xl border border-primary/20 bg-transparent text-dark font-mono focus:outline-none focus:border-accent transition-colors"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={submitting || code.length !== 6}
            className="w-full bg-accent text-white py-2.5 rounded-xl font-medium hover:bg-accent/80 transition-all text-sm disabled:opacity-50"
          >
            {submitting ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <button
          onClick={handleResend}
          disabled={sending || countdown > 0}
          className="w-full mt-3 py-2.5 rounded-xl border border-primary/20 text-sm text-foreground hover:bg-primary/10 transition-all disabled:opacity-50"
        >
          {sending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
        </button>

        <p className="text-xs text-foreground/60 mt-6">
          Didn&apos;t receive it? Check your spam folder or{" "}
          <Link href="/register" className="text-accent hover:underline">
            try a different email
          </Link>
        </p>
      </div>
    </div>
  );
}
