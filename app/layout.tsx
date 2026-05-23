import type { Metadata } from "next";
import { Bebas_Neue, Karla } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const karla = Karla({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-karla",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pulse | Nigerian Tech Compensation Index",
  description:
    "Anonymous compensation data for Nigerian tech professionals. See what engineers, PMs, designers, and other roles actually earn by level, industry, and location.",
  openGraph: {
    title: "Pulse | Nigerian Tech Compensation Index",
    description:
      "Anonymous compensation data for Nigerian tech professionals. See what engineers, PMs, designers, and other roles actually earn by level, industry, and location.",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulse | Nigerian Tech Compensation Index",
    description:
      "Anonymous compensation data for Nigerian tech professionals.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${karla.variable}`}>
      <head>
        <Script
          src="https://tally.so/widgets/embed.js"
          strategy="lazyOnload"
        />
      </head>
      <body className="antialiased bg-[#081C0F] text-[#F0EBE1]">
        {children}
      </body>
    </html>
  );
}
