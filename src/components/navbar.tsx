"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/volunteer", label: "Volunteer" },
  { href: "/membership", label: "Membership" },
  { href: "/stories", label: "Articles" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/12 bg-background/92 backdrop-blur-xl shadow-sm">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Viksit Chetna"
              width={40}
              height={40}
              className="rounded-full ring-2 ring-primary/25 group-hover:ring-primary/70 transition-all duration-300 shadow-sm"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <span className="text-[17px] font-extrabold gradient-text leading-tight tracking-tight">Viksit Chetna</span>
            <p className="text-[10px] text-muted-foreground leading-none tracking-widest uppercase">Intellectual Club</p>
          </div>
        </Link>

        {/* Desktop */}
        <ul className="hidden gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`nav-link px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                  pathname === link.href
                    ? "text-primary bg-primary/8 active"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/membership"
          className="hidden md:inline-flex btn-shimmer items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg transition-all duration-200"
        >
          🧠 Join Club
        </Link>

        <button
          className="md:hidden rounded-md p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <ul className="animate-fade-in border-t border-primary/10 bg-background px-4 pb-4 md:hidden">
          {navLinks.map((link) => (
            <li key={link.href} className="py-1">
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="mt-2">
            <Link
              href="/membership"
              onClick={() => setOpen(false)}
              className="btn-shimmer block rounded-full bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground"
            >
              🧠 Join Club
            </Link>
          </li>
        </ul>
      )}
    </header>
  );
}
