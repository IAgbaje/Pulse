import Link from "next/link";
import { getAllData } from "@/lib/server-data";

export default async function Footer() {
  const data = await getAllData();
  const latestYear = Math.max(...data.map((r) => r.year));

  return (
    <footer className="border-t border-gold mt-24">
      <div className="max-w-content mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-2">
            <p className="font-body font-bold uppercase tracking-wide text-xl text-content-primary">
              PULSE
            </p>
            <p className="text-sm text-content-secondary max-w-xs leading-relaxed">
              An anonymous compensation index for Nigerian tech professionals.
            </p>
            <p className="text-xs text-content-tertiary">Created by Ibraheem Agbaje</p>
            <p className="text-xs text-content-tertiary">
              Community data compiled by{" "}
              <a
                href="https://www.linkedin.com/in/lolasoleye/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-600 hover:text-content-accent transition-colors duration-fast ease-standard underline underline-offset-2"
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
                  className="text-sm text-content-secondary hover:text-content-primary transition-colors duration-fast ease-standard"
                >
                  {label}
                </Link>
              ))}
            </div>
            <p className="text-xs text-content-tertiary">
              Latest dataset: {latestYear}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
