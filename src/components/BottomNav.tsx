"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Brief", icon: "M4 6h16M4 12h16M4 18h10" },
  { href: "/deals", label: "Deals", icon: "M4 19V9m6 10V5m6 14v-7m4 7H2" },
  { href: "/learn", label: "Learn", icon: "M12 4 2 9l10 5 10-5-10-5Zm-6 7.5V16c2 2 10 2 12 0v-4.5" },
  { href: "/saved", label: "Saved", icon: "M6 3h12v18l-6-4-6 4V3Z" },
  { href: "/profile", label: "Profile", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0" },
];

function isActive(path: string, href: string) {
  return href === "/" ? path === "/" || path.startsWith("/story") : path.startsWith(href);
}

function Icon({ d }: { d: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

/** Phones and tablets: floating dark pill at the bottom, as in the inspo. */
export function BottomNav() {
  const path = usePathname();
  if (path.startsWith("/onboarding")) return null;
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(16px,env(safe-area-inset-bottom))] lg:hidden"
    >
      <ul className="flex w-full max-w-[460px] items-center justify-between rounded-pill bg-ink px-3 py-2 text-[11px] text-white/55 shadow-lg">
        {ITEMS.map((it) => {
          const active = isActive(path, it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 rounded-pill px-3 py-1.5 ${active ? "text-white" : ""}`}
              >
                <Icon d={it.icon} />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Large screens: the same dark pill turned vertical, pinned to the left. */
export function SideNav() {
  const path = usePathname();
  if (path.startsWith("/onboarding")) return null;
  return (
    <nav aria-label="Main" className="sticky top-0 hidden h-dvh w-[220px] shrink-0 flex-col p-5 lg:flex">
      <Link href="/" className="mb-6 flex items-center gap-2 px-3 text-[18px] font-semibold">
        <svg width="28" height="28" viewBox="0 0 512 512" aria-hidden>
          <rect width="512" height="512" rx="112" fill="#4352d6" />
          <circle cx="200" cy="256" r="104" fill="#d9c8f5" />
          <circle cx="312" cy="256" r="104" fill="#e4f08e" opacity=".92" />
        </svg>
        VC Brief
      </Link>
      <ul className="flex flex-col gap-1 rounded-[var(--radius-card)] bg-ink p-2 text-[15px] text-white/60">
        {ITEMS.map((it) => {
          const active = isActive(path, it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-pill px-4 py-2.5 ${active ? "bg-white/12 text-white" : "hover:text-white"}`}
              >
                <Icon d={it.icon} />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
