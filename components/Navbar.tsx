"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { PulseFormTrigger } from "@/components/PulseForm";

const navLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/insights", label: "Insights" },
  { href: "/compare", label: "Compare" },
  { href: "/contribute", label: "Contribute" },
];

/* EKG heartbeat mark — static glyph, per design-system Navbar spec.
   Distinct from components/EKGLine.tsx (the animated hero trace). */
function EKGMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="stroke-gold-400 shrink-0"
      aria-hidden="true"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="sticky top-0 z-50 h-16 bg-surface-canvas border-b border-subtle">
        <div className="max-w-content mx-auto px-6 h-full flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2"
            aria-label="Pulse home"
          >
            <EKGMark />
            {/* Wordmark below the 2rem display-scale floor — Karla, not Bebas */}
            <span className="font-body font-bold uppercase tracking-wide text-lg text-content-primary group-hover:text-content-accent transition-colors duration-fast ease-standard">
              PULSE
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`font-body text-sm tracking-wide pb-0.5 border-b-2 transition-colors duration-fast ease-standard ${
                  pathname === href
                    ? "text-content-accent font-bold border-gold-400"
                    : "text-content-secondary font-normal border-transparent hover:text-content-primary"
                }`}
              >
                {label}
              </Link>
            ))}
            <PulseFormTrigger variant="nav" />
          </div>

          {/* Mobile hamburger: 44px hit target for thumbs (p-3 + 22px icon) */}
          <button
            className="md:hidden text-content-secondary hover:text-content-primary transition-colors duration-fast ease-standard p-3 -mr-2"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-surface-canvas flex flex-col items-center justify-center">
          <button
            className="absolute top-3 right-3 text-content-secondary hover:text-content-primary transition-colors duration-fast ease-standard p-3"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
          <div className="flex flex-col items-center gap-8">
            <Link href="/" className="group flex items-center gap-2">
              <EKGMark size={32} />
              <span className="font-body font-bold uppercase tracking-wide text-2xl text-content-primary group-hover:text-content-accent transition-colors duration-fast ease-standard">
                PULSE
              </span>
            </Link>
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`font-body text-xl transition-colors duration-fast ease-standard ${
                  pathname === href
                    ? "text-content-accent font-bold"
                    : "text-content-secondary hover:text-content-primary"
                }`}
              >
                {label}
              </Link>
            ))}
            <PulseFormTrigger variant="primary" />
          </div>
        </div>
      )}
    </>
  );
}
