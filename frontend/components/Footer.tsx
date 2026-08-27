import Link from "next/link";
import { Compass } from "lucide-react";

const NAV_SECTIONS = [
  {
    heading: "Product",
    links: [
      { label: "Plan a Trip", href: "/"       },
      { label: "My Trips",    href: "/trips"  },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About",   href: "#" },
      { label: "Blog",    href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy",   href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
] as const;

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 mt-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 py-12">

        {/* Nav grid: 1-col mobile → 3-col md+ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-10">
          {NAV_SECTIONS.map((section) => (
            <div key={section.heading} className="flex flex-col gap-4">
              <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 dark:text-slate-500">
                {section.heading}
              </h4>
              <ul className="flex flex-col gap-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 border-t border-slate-100 dark:border-slate-800/60">
          <Link href="/" className="flex items-center gap-2 group" aria-label="KelanaAI home">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-700 text-white group-hover:bg-amber-600 transition-colors">
              <Compass size={14} strokeWidth={2.3} />
            </span>
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-50">
              KelanaAI
            </span>
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {year} KelanaAI. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
