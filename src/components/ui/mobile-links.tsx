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
  Package2,
} from "lucide-react";

const links = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/bulk-sms", icon: MessageCircle, label: "Skool CRM" },
  { href: "/contacts", icon: BookUser, label: "Contacts" },
  { href: "/api-keys", icon: Key, label: "API Keys" },
  { href: "/sender-ids", icon: Send, label: "Sender IDs" },
  { href: "/top-up", icon: Wallet, label: "Top Up" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/reports", icon: LineChart, label: "Reports" },
  { href: "/support", icon: Headset, label: "Support" },
];

export default function MobileLinks({
  onLinkClick,
}: {
  onLinkClick: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="grid gap-2 text-lg font-medium">
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-semibold"
        onClick={onLinkClick}
      >
        {" "}
        {/* Add onClick */}
        <Package2 className="h-6 w-6" />
        <span className="sr-only">Skool CRM</span>
      </Link>
      {links.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 transition-all hover:text-foreground ${
              isActive ? "text-foreground bg-muted" : "text-muted-foreground"
            }`}
            onClick={onLinkClick} // Add onClick
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
