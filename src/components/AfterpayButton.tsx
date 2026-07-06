"use client";

interface AfterpayButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}

export default function AfterpayButton({ onClick, disabled, loading }: AfterpayButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full bg-[#2D2D2D] text-white py-3 rounded-xl font-medium hover:bg-[#1a1a1a] transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 relative"
    >
      {loading ? (
        <span>Redirecting to Afterpay...</span>
      ) : (
        <>
          <span>Pay with</span>
          <span className="font-bold tracking-wide">Afterpay</span>
        </>
      )}
    </button>
  );
}
