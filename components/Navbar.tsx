"use client";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "Explore", href: "#salary" },
  { label: "Insights", href: "#insights" },
  { label: "Compare", href: "#compare" },
  { label: "Contribute", href: "#contribute" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(8,28,15,0.95)"
          : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(200,150,42,0.12)" : "none",
      }}
    >
      <div className="section-container flex items-center justify-between h-16">
        <a
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="cursor-pointer select-none"
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "28px",
            color: "#C8962A",
            letterSpacing: "0.1em",
          }}
        >
          PULSE
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNav(link.href)}
              className="transition-colors duration-200 hover:text-[#C8962A]"
              style={{
                fontFamily: "var(--font-karla)",
                fontWeight: 700,
                fontSize: "13px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(240,235,225,0.7)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className="block w-6 h-0.5 transition-all duration-300"
            style={{
              background: "#C8962A",
              transform: menuOpen ? "rotate(45deg) translate(4px, 4px)" : "none",
            }}
          />
          <span
            className="block w-6 h-0.5 transition-all duration-300"
            style={{
              background: "#C8962A",
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            className="block w-6 h-0.5 transition-all duration-300"
            style={{
              background: "#C8962A",
              transform: menuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none",
            }}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden flex flex-col gap-0"
          style={{
            background: "rgba(8,28,15,0.98)",
            borderTop: "1px solid rgba(200,150,42,0.16)",
          }}
        >
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNav(link.href)}
              className="px-6 py-4 text-left hover:bg-[rgba(200,150,42,0.06)] transition-colors"
              style={{
                fontFamily: "var(--font-karla)",
                fontWeight: 700,
                fontSize: "13px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(240,235,225,0.8)",
                background: "none",
                border: "none",
                cursor: "pointer",
                borderBottom: "1px solid rgba(200,150,42,0.08)",
              }}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
