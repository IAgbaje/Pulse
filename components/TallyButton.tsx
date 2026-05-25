"use client";

declare global {
  interface Window {
    Tally?: {
      openPopup: (formId: string, options?: Record<string, unknown>) => void;
    };
  }
}

const TALLY_FORM_ID = "44PlyB";

interface TallyButtonProps {
  variant?: "primary" | "ghost" | "nav";
  label?: string;
  className?: string;
}

export default function TallyButton({
  variant = "primary",
  label,
  className = "",
}: TallyButtonProps) {
  const handleClick = () => {
    if (typeof window !== "undefined" && window.Tally) {
      window.Tally.openPopup(TALLY_FORM_ID, {
        width: 700,
        hideTitle: true,
        overlay: true,
        emoji: { text: "📊", animation: "none" },
      });
    } else {
      window.open(`https://tally.so/r/${TALLY_FORM_ID}`, "_blank");
    }
  };

  const defaultLabel =
    variant === "nav" ? "Add your numbers" : variant === "ghost" ? "Add your numbers" : "Add your numbers";
  const displayLabel = label ?? defaultLabel;

  if (variant === "nav") {
    return (
      <button
        onClick={handleClick}
        className={`bg-gold hover:bg-gold-hover text-bg-primary font-body font-semibold text-xs tracking-[0.05em] px-4 py-2 rounded-md transition-colors ${className}`}
      >
        {displayLabel}
      </button>
    );
  }

  if (variant === "ghost") {
    return (
      <button
        onClick={handleClick}
        className={`border border-[rgba(200,150,42,0.25)] text-gold hover:bg-[rgba(200,150,42,0.08)] font-body font-medium text-sm px-5 py-2.5 rounded-md transition-colors ${className}`}
      >
        {displayLabel}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`bg-gold hover:bg-gold-hover text-bg-primary font-body font-semibold text-sm tracking-[0.05em] px-6 py-3 rounded-md transition-colors ${className}`}
    >
      {displayLabel}
    </button>
  );
}
