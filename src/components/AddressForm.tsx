"use client";

import { useCallback } from "react";
import {
  type Address,
  type StateCode,
  STATE_OPTIONS,
  validateAddress,
} from "@/components/address";

const borderBase = "border-dark/20";
const borderError = "border-red-400";

const inputClass =
  `w-full px-4 py-2.5 rounded-xl border bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors ${borderBase}`;
const inputErrorClass =
  `w-full px-4 py-2.5 rounded-xl border bg-transparent text-dark text-sm focus:outline-none focus:border-red-400 transition-colors ${borderError}`;
const selectClass =
  `w-full px-4 py-2.5 rounded-xl border bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer ${borderBase}`;
const selectErrorClass =
  `w-full px-4 py-2.5 rounded-xl border bg-transparent text-dark text-sm focus:outline-none focus:border-red-400 transition-colors appearance-none cursor-pointer ${borderError}`;

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, required, error, children }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">
        {label}{required && <span className="text-red-400"> *</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

interface AddressFormProps {
  value: Address;
  onChange: (address: Address) => void;
  errors?: Partial<Record<keyof Address, string>>;
  showAddressLine2?: boolean;
  label?: string;
}

export default function AddressForm({
  value,
  onChange,
  errors = {},
  showAddressLine2 = true,
  label,
}: AddressFormProps) {
  const set = useCallback(
    (field: keyof Address, raw: string) => {
      let v: string = raw;
      if (field === "state") v = raw.toUpperCase();
      if (field === "postcode") v = raw.replace(/\D/g, "").slice(0, 4);
      onChange({ ...value, [field]: v });
    },
    [value, onChange],
  );

  return (
    <div className="space-y-4">
      {label && (
        <p className="text-sm font-semibold text-dark border-b border-dark/10 pb-2">{label}</p>
      )}

      <Field label="Street Address" required error={errors.addressLine1}>
        <input
          type="text"
          value={value.addressLine1}
          onChange={(e) => set("addressLine1", e.target.value)}
          className={errors.addressLine1 ? inputErrorClass : inputClass}
          placeholder="123 Beauty Lane"
        />
      </Field>

      {showAddressLine2 && (
        <Field label="Address Line 2 (optional)" error={errors.addressLine2}>
          <input
            type="text"
            value={value.addressLine2 || ""}
            onChange={(e) => set("addressLine2", e.target.value)}
            className={errors.addressLine2 ? inputErrorClass : inputClass}
            placeholder="Apartment, suite, unit, etc."
          />
        </Field>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Suburb / City" required error={errors.suburb}>
          <input
            type="text"
            value={value.suburb}
            onChange={(e) => set("suburb", e.target.value)}
            className={errors.suburb ? inputErrorClass : inputClass}
            placeholder="Surry Hills"
          />
        </Field>

        <Field label="State" required error={errors.state}>
          <select
            value={value.state}
            onChange={(e) => set("state", e.target.value)}
            className={errors.state ? selectErrorClass : selectClass}
          >
            {STATE_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Postcode" required error={errors.postcode}>
        <input
          type="text"
          value={value.postcode}
          onChange={(e) => set("postcode", e.target.value)}
          className={errors.postcode ? inputErrorClass : inputClass}
          placeholder="2000"
          inputMode="numeric"
          maxLength={4}
        />
      </Field>
    </div>
  );
}
