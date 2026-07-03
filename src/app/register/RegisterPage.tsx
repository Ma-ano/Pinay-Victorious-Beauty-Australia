"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import type { Address } from "@/components/AuthContext";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function formatPhone(value: string): string {
  const cleaned = value.replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+61")) {
    const digits = cleaned.slice(3).replace(/\D/g, "").slice(0, 9);
    let result = "+61";
    if (digits.length > 0) result += " " + digits.slice(0, 3);
    if (digits.length > 3) result += " " + digits.slice(3, 6);
    if (digits.length > 6) result += " " + digits.slice(6, 9);
    return result;
  }

  const digits = cleaned.replace(/\D/g, "");
  if (!digits) return cleaned;
  if (digits === "6") return "+6";

  let result = "+61";
  if (digits.length > 0) result += " " + digits.slice(0, 3);
  if (digits.length > 3) result += " " + digits.slice(3, 6);
  if (digits.length > 6) result += " " + digits.slice(6, 9);
  return result;
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+61 ");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("Australia");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  function validate(): boolean {
    const errs: Record<string, string> = {};

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      errs.name = "Name must be at least 2 characters";
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      errs.email = "Please enter a valid email address";
    }

    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      errs.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-()]{7,20}$/.test(trimmedPhone)) {
      errs.phone = "Please enter a valid phone number";
    }

    if (!street.trim()) errs.street = "Street is required";
    if (!city.trim()) errs.city = "City is required";
    if (!state.trim()) errs.state = "State is required";
    if (!postcode.trim()) errs.postcode = "Postcode is required";
    if (postcode.trim() && !/^\d{4,5}$/.test(postcode.trim())) {
      errs.postcode = "Enter a valid postcode";
    }
    if (!country.trim()) errs.country = "Country is required";

    if (!password) {
      errs.password = "Password is required";
    } else if (!passwordRegex.test(password)) {
      errs.password = "Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number";
    }

    if (!confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const address: Address = {
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        postcode: postcode.trim(),
        country: country.trim(),
      };
      await register(name.trim(), email.trim(), password, phone.trim(), address);
      router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/email-already-in-use") {
        setErrors({ email: "An account with this email already exists" });
      } else if (code === "auth/weak-password") {
        setErrors({ password: "Password is too weak" });
      } else {
        setErrors({ form: "Registration failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      router.push("/");
    } catch (err: unknown) {
      setErrors({ form: err instanceof Error ? err.message : "Google sign-in failed. Please try again." });
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        <div className="bg-card border border-primary/10 rounded-2xl p-6 md:p-8 shadow-xl">
          <h1 className="text-2xl font-semibold text-dark mb-6 text-center">Register</h1>

          {errors.form && (
            <p className="text-sm text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-2.5 mb-4">{errors.form}</p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 relative">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-primary/20 -translate-x-px" />
              <div className="space-y-4">
                <p className="text-sm font-semibold text-dark border-b border-primary/10 pb-2">Personal Details</p>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors ${errors.name ? "border-red-400" : "border-primary/20"}`}
                    placeholder="Your name" />
                  {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors ${errors.email ? "border-red-400" : "border-primary/20"}`}
                    placeholder="you@example.com" />
                  {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
                    Phone <span className="text-red-400">*</span>
                  </label>
                  <input id="phone" type="tel" value={phone} onChange={handlePhoneChange}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors ${errors.phone ? "border-red-400" : "border-primary/20"}`}
                    placeholder="+61 400 000 000" />
                  {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
                </div>

                <div className="pt-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                        className={`w-full px-4 py-2.5 pr-10 rounded-xl border bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors ${errors.password ? "border-red-400" : "border-primary/20"}`}
                        placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground hover:text-dark transition-colors" tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}>
                        <EyeIcon open={showPassword} />
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
                  </div>

                  <div className="mt-4">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                      Confirm Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input id="confirmPassword" type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full px-4 py-2.5 pr-10 rounded-xl border bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors ${errors.confirmPassword ? "border-red-400" : "border-primary/20"}`}
                        placeholder="••••••••" />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground hover:text-dark transition-colors" tabIndex={-1}
                        aria-label={showConfirm ? "Hide password" : "Show password"}>
                        <EyeIcon open={showConfirm} />
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-semibold text-dark border-b border-primary/10 pb-2">Shipping Address</p>

                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-foreground mb-1">
                    Street <span className="text-red-400">*</span>
                  </label>
                  <input id="street" type="text" value={street} onChange={(e) => setStreet(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors ${errors.street ? "border-red-400" : "border-primary/20"}`}
                    placeholder="123 Beauty Lane" />
                  {errors.street && <p className="text-xs text-red-400 mt-1">{errors.street}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-foreground mb-1">
                      City <span className="text-red-400">*</span>
                    </label>
                    <input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors ${errors.city ? "border-red-400" : "border-primary/20"}`}
                      placeholder="Sydney" />
                    {errors.city && <p className="text-xs text-red-400 mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-foreground mb-1">
                      State <span className="text-red-400">*</span>
                    </label>
                    <input id="state" type="text" value={state} onChange={(e) => setState(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors ${errors.state ? "border-red-400" : "border-primary/20"}`}
                      placeholder="NSW" />
                    {errors.state && <p className="text-xs text-red-400 mt-1">{errors.state}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="postcode" className="block text-sm font-medium text-foreground mb-1">
                      Postcode <span className="text-red-400">*</span>
                    </label>
                    <input id="postcode" type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors ${errors.postcode ? "border-red-400" : "border-primary/20"}`}
                      placeholder="2000" />
                    {errors.postcode && <p className="text-xs text-red-400 mt-1">{errors.postcode}</p>}
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-foreground mb-1">
                      Country <span className="text-red-400">*</span>
                    </label>
                    <input id="country" type="text" value={country} onChange={(e) => setCountry(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors ${errors.country ? "border-red-400" : "border-primary/20"}`}
                      placeholder="Australia" />
                    {errors.country && <p className="text-xs text-red-400 mt-1">{errors.country}</p>}
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-accent text-white py-2.5 rounded-xl font-medium hover:bg-accent/80 transition-all text-sm disabled:opacity-50 mt-6">
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary/20" />
            </div>
            <div className="relative flex justify-center text-xs text-foreground">
              <span className="bg-card px-2">or</span>
            </div>
          </div>

          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary/20 text-sm text-foreground hover:bg-primary/10 hover:border-accent/50 transition-all">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </button>

          <p className="text-sm text-foreground text-center mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
