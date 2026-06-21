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

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled
            ? "bg-bg-primary border-b border-[rgba(200,150,42,0.12)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-content mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl text-cream tracking-widest hover:text-gold transition-colors">
            PULSE
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-body transition-colors relative ${
                  pathname === href
                    ? "text-cream after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[1px] after:bg-gold"
                    : "text-cream-60 hover:text-cream"
                }`}
              >
                {label}
              </Link>
            ))}
            <PulseFormTrigger variant="nav" />
          </div>

          {/* Mobile hamburger: 44px hit target for thumbs */}
          <button
            className="md:hidden text-cream-60 hover:text-cream transition-colors p-3 -mr-2"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-bg-primary flex flex-col items-center justify-center">
          <button
            className="absolute top-3 right-3 text-cream-60 hover:text-cream transition-colors p-3"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
          <div className="flex flex-col items-center gap-8">
            <Link href="/" className="font-display text-3xl text-cream tracking-widest">
              PULSE
            </Link>
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-xl font-body transition-colors ${
                  pathname === href ? "text-gold" : "text-cream-60 hover:text-cream"
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
