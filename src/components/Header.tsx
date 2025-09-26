"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showGreen = mounted && scrolled;

  return (
    <header
      suppressHydrationWarning
      className={`sticky top-0 z-50 transition-colors ${
        showGreen
          ? "bg-[var(--flex-green)] text-white"
          : "bg-[var(--flex-cream)] text-gray-900"
      }`}
    >
      <div
        suppressHydrationWarning
        className="mx-auto flex h-14 md:h-16 max-w-[1120px] items-center justify-between px-4 md:px-6 lg:px-8"
      >
        <Link href="/" className="text-lg font-semibold leading-none">
          the flex.
        </Link>

        <nav aria-label="primary">
          <ul className="flex items-center gap-6 text-sm font-medium">
            <li><Link href="#">Landlords</Link></li>
            <li><Link href="#">About Us</Link></li>
            <li><Link href="#">Careers</Link></li>
            <li><Link href="#">Contact</Link></li>

            <li>
              <Link
                href="/reviews"
                className={`rounded-full px-4 py-2 transition-colors ${
                  showGreen
                    ? "bg-white text-[var(--flex-green)] hover:bg-gray-100"
                    : "bg-[var(--flex-green)] text-white hover:bg-emerald-700"
                }`}
              >
                Manager Dashboard
              </Link>
            </li>

            <li>
              <Link
                href="/properties"
                className={`rounded-full px-4 py-2 transition-colors ${
                  showGreen
                    ? "bg-white text-[var(--flex-green)] hover:bg-gray-100"
                    : "bg-[var(--flex-green)] text-white hover:bg-emerald-700"
                }`}
              >
                Book now
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
