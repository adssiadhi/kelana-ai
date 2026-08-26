import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KelanaAI — AI Travel Planner",
  description: "Plan your perfect trip with an AI-powered itinerary generator.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-text-primary">
        {/* main content grows to push footer to the bottom */}
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────── */

const NAV_SECTIONS = [
  {
    heading: "Product",
    links: [
      { label: "Plan a Trip", href: "/" },
      { label: "My Trips",    href: "#"  },
      { label: "Pricing",     href: "#"  },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About",    href: "#" },
      { label: "Blog",     href: "#" },
      { label: "Careers",  href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy",    href: "#" },
      { label: "Terms of Service",  href: "#" },
      { label: "Cookie Policy",     href: "#" },
    ],
  },
] as const;

function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border mt-16">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 md:px-8 py-12">

        {/*
         * Navigation grid:
         * mobile  → 1 column, sections stacked
         * md+     → 3 columns, sections side by side
         */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
          {NAV_SECTIONS.map((section) => (
            <div key={section.heading} className="flex flex-col gap-4">
              <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-text-muted">
                {section.heading}
              </h4>
              <ul className="flex flex-col gap-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-150"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar: brand + copyright */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 border-t border-border-subtle">
          <span className="text-sm font-semibold tracking-tight text-text-primary">
            KelanaAI
          </span>
          <p className="text-sm text-slate-500">
            &copy; {year} KelanaAI. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
