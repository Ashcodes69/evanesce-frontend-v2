"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, User } from "lucide-react";
import clsx from "clsx";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Chat", href: "/messages", icon: MessageSquare },
    { name: "Home", href: "/", icon: Home },
    { name: "Profile", href: "/settings", icon: User },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      {/* Applied bg-surface and border-border for the container */}
      <div className="flex items-center gap-8 bg-surface border border-border px-8 py-4 rounded-full shadow-2xl hover:surface-hover">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative group transition-transform hover:scale-110 active:scale-95"
              aria-label={item.name}
            >
              <Icon
                size={28}
                className={clsx(
                  "transition-all duration-200",
                  isActive
                    ? "text-primary stroke-[2.5px]" // Electric blue for the active page
                    : "text-text-muted stroke-[1.5px] hover:text-primary-glow", // Muted gray that brightens on hover
                )}
              />

              {isActive && (
                // The active dot now uses the primary color with a subtle glow
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_var(--primary)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
