"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const path = usePathname();

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
      backgroundColor: "oklch(0.18 0.04 256 / 0.82)",
      borderBottom: "1px solid var(--border-soft)",
    }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 20px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div className="logo-mark">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" rx="1.5" fill="oklch(0.12 0.04 258)" opacity="0.9"/>
              <rect x="9" y="2" width="5" height="5" rx="1.5" fill="oklch(0.12 0.04 258)" opacity="0.6"/>
              <rect x="2" y="9" width="5" height="5" rx="1.5" fill="oklch(0.12 0.04 258)" opacity="0.6"/>
              <rect x="9" y="9" width="5" height="5" rx="1.5" fill="oklch(0.12 0.04 258)" opacity="0.35"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>
            <span style={{ color: "var(--text)" }}>Publi</span>
            <span style={{ color: "var(--accent-bright)" }}>Gen</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <NavLink href="/" label="Nueva publicación" active={path === "/"} />
          <NavLink href="/history" label="Historial" active={path === "/history"} />
          <NavLink href="/settings" active={path === "/settings"} isIcon />
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, label, active, isIcon }: {
  href: string; label?: string; active: boolean; isIcon?: boolean;
}) {
  const base: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center",
    textDecoration: "none", transition: "color 0.14s, background 0.14s",
    borderRadius: "var(--r-sm)",
    color: active ? "var(--accent-bright)" : "var(--text-mute)",
    background: active ? "oklch(0.72 0.15 245 / 0.08)" : "transparent",
  };

  if (isIcon) {
    return (
      <Link href={href} style={{ ...base, width: 36, height: 36 }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </Link>
    );
  }

  return (
    <Link href={href} style={{ ...base, padding: "7px 14px", fontSize: 13.5, fontWeight: 500,
      letterSpacing: "-0.01em" }}>
      {label}
    </Link>
  );
}
