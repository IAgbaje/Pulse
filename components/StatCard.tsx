interface StatCardProps {
  value: string;
  label: string;
  className?: string;
}

export default function StatCard({ value, label, className = "" }: StatCardProps) {
  return (
    <div
      className={`card flex flex-col items-center justify-center p-6 text-center ${className}`}
      style={{
        background: "rgba(200,150,42,0.06)",
        border: "1px solid rgba(200,150,42,0.16)",
        borderRadius: "8px",
      }}
    >
      <span
        className="text-[#C8962A] leading-none mb-2"
        style={{
          fontFamily: "var(--font-bebas)",
          fontSize: "clamp(40px, 5vw, 56px)",
          letterSpacing: "0.04em",
        }}
      >
        {value}
      </span>
      <span
        className="uppercase tracking-widest text-[rgba(240,235,225,0.46)]"
        style={{
          fontFamily: "var(--font-karla)",
          fontWeight: 700,
          fontSize: "10px",
          letterSpacing: "0.2em",
        }}
      >
        {label}
      </span>
    </div>
  );
}
