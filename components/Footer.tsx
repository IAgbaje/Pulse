import Link from "next/link";
import { getAllData } from "@/lib/data";

export default function Footer() {
  const data = getAllData();
  const latestYear = Math.max(...data.map((r) => r.year));

  return (
    <footer className="border-t border-[rgba(200,150,42,0.10)] mt-24">
      <div className="max-w-content mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-2">
            <p className="font-display text-xl text-cream tracking-widest">PULSE</p>
            <p className="text-sm text-cream-60 max-w-xs leading-relaxed">
              An anonymous compensation index for Nigerian tech professionals.
            </p>
            <p className="text-xs text-cream-40">Created by Ibraheem Agbaje</p>
            <p className="text-xs text-cream-40">
              Community data compiled by{" "}
              <a
                href="https://www.linkedin.com/in/lolasoleye/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold/70 hover:text-gold transition-colors underline underline-offset-2"
              >
                Lola Soleye
              </a>
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {[
                { href: "/explore", label: "Explore" },
                { href: "/insights", label: "Insights" },
                { href: "/compare", label: "Compare" },
                { href: "/contribute", label: "Contribute" },
                { href: "/methodology", label: "Methodology" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-cream-60 hover:text-cream transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
            <p className="text-xs text-cream-40">
              Latest dataset: {latestYear}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
