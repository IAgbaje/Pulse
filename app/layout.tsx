import type { Metadata } from "next";
import { Bebas_Neue, Karla } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
  display: "swap",
});

const description =
  "Anonymous compensation data for Nigerian tech professionals. See what engineers, PMs, designers, and other roles earn by level, industry, and location.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Pulse | Nigerian Tech Compensation Index",
  description,
  openGraph: {
    title: "Pulse | Nigerian Tech Compensation Index",
    description,
    type: "website",
    siteName: "Pulse",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulse | Nigerian Tech Compensation Index",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${karla.variable}`}>
      <body className="bg-bg-primary text-cream font-body antialiased">
        <Script
          src="https://tally.so/widgets/embed.js"
          strategy="lazyOnload"
        />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
