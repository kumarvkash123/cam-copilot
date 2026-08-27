"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Folder,
  FileText,
  Shield,
  Bot,
  Wallet,
  AlertTriangle,
  FileCheck2,
  Link2,
  Search,
  Settings,
} from "lucide-react";

// Matches the mockup's full nav — only Dashboard and AI Copilot (renamed "CAM")
// are wired up in this build. The rest are placeholders for what's next.
const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, active: true },
  { href: "#", label: "Proposals", icon: Folder, active: false },
  { href: "#", label: "Documents", icon: FileText, active: false },
  { href: "#", label: "Policies", icon: Shield, active: false },
  { href: "/cam", label: "AI Copilot (CAM)", icon: Bot, active: true },
  { href: "#", label: "Financial", icon: Wallet, active: false },
  { href: "#", label: "Risk", icon: AlertTriangle, active: false },
  { href: "#", label: "CAM", icon: FileCheck2, active: false },
  { href: "#", label: "Relations", icon: Link2, active: false },
  { href: "#", label: "Audit", icon: Search, active: false },
  { href: "#", label: "Settings", icon: Settings, active: false },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-ink text-white min-h-screen flex flex-col">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="text-sm font-bold tracking-wide">CREDIT AI</div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon, active }) => {
          const isCurrent = pathname === href;
          return (
            <Link
              key={label}
              href={active ? href : "#"}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isCurrent
                  ? "bg-white/10 text-white font-medium"
                  : active
                  ? "text-white/80 hover:bg-white/5 hover:text-white"
                  : "text-white/30 cursor-not-allowed"
              }`}
              onClick={(e) => !active && e.preventDefault()}
            >
              <Icon size={15} />
              {label}
              {!active && <span className="ml-auto text-[9px] text-white/25">soon</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
