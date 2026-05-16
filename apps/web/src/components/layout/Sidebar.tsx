"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Truck,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Pedidos",
    href: "/dashboard/orders",
    icon: Package,
  },
  {
    label: "Rastreamento",
    href: "/dashboard/tracking",
    icon: Truck,
  },
  {
    label: "Clientes",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    label: "WhatsApp",
    href: "/dashboard/whatsapp",
    icon: MessageSquare,
  },
  {
    label: "Relatórios",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    label: "Configurações",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col bg-brand-950 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-brand-800">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-600">
          <span className="text-xl">📦</span>
        </div>
        <div>
          <span className="font-bold text-lg">NexCargo</span>
          <p className="text-brand-400 text-xs">v0.1.0</p>
        </div>
      </div>

      {/* Menu de navegação */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-700 text-white"
                  : "text-brand-300 hover:bg-brand-800 hover:text-white"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé do sidebar com info do usuário */}
      <div className="border-t border-brand-800 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin Demo</p>
            <p className="text-xs text-brand-400 truncate">admin@demo.nexcargo.com.br</p>
          </div>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="flex items-center gap-2 text-brand-400 hover:text-white text-sm transition-colors w-full">
            <LogOut size={16} />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
