"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LineChart,
  Settings,
  Send,
  Key,
  Wallet,
  BookUser,
  MessageCircle,
  Headset,
} from "lucide-react";

const links = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/bulk-sms", icon: MessageCircle, label: "SMS" },
  { href: "/contacts", icon: BookUser, label: "Contacts" },
  { href: "/api-keys", icon: Key, label: "API Keys" },
  { href: "/sender-ids", icon: Send, label: "Sender IDs" },
  { href: "/top-up", icon: Wallet, label: "Top Up" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/reports", icon: LineChart, label: "Reports" },
  { href: "/support", icon: Headset, label: "Support" },
];

export default function MainLinks() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
      {links.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary hover:bg-zinc-200 dark:hover:bg-zinc-700/50 ${
              isActive
                ? "text-primary bg-zinc-200 dark:bg-zinc-700/50"
                : "text-muted-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
