"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Truck, Users,
  MessageSquare, BarChart3, Settings, LogOut,
  ChevronRight,
} from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";

const navSections = [
  {
    label: "Principal",
    items: [
      { label: "Dashboard",    href: "/dashboard",  icon: LayoutDashboard },
    ],
  },
  {
    label: "Operações",
    items: [
      { label: "Pedidos",      href: "/orders",     icon: Package },
      { label: "Rastreamento", href: "/tracking",   icon: Truck },
      { label: "Clientes",     href: "/customers",  icon: Users },
      { label: "WhatsApp",     href: "/whatsapp",   icon: MessageSquare },
      { label: "Relatórios",   href: "/reports",    icon: BarChart3 },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Configurações", href: "/settings",  icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  let idx = 0;

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex h-full w-64 flex-col flex-shrink-0"
      style={{ background: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #172554 100%)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
        >
          <Package size={18} className="text-white" />
        </div>
        <div>
          <span className="font-bold text-white text-[15px] tracking-tight">NexCargo</span>
          <p className="text-[10px] font-mono mt-0.5" style={{ color: "#64748b" }}>v0.1.0</p>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest select-none" style={{ color: "#475569" }}>
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const currentIdx = idx++;

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: currentIdx * 0.04, duration: 0.25 }}
                  >
                    <Link
                      href={item.href}
                      className={clsx(
                        "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive ? "text-white" : "hover:text-slate-200"
                      )}
                      style={isActive
                        ? { background: "rgba(255,255,255,0.1)" }
                        : undefined
                      }
                      onMouseEnter={e => {
                        if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                      }}
                      onMouseLeave={e => {
                        if (!isActive) (e.currentTarget as HTMLElement).style.background = "";
                      }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-pill"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                          style={{ background: "#60a5fa" }}
                        />
                      )}
                      <Icon
                        size={17}
                        className="flex-shrink-0 transition-colors"
                        style={{ color: isActive ? "#60a5fa" : "#64748b" }}
                      />
                      <span className="flex-1" style={{ color: isActive ? "#fff" : "#94a3b8" }}>{item.label}</span>
                      {isActive && <ChevronRight size={13} style={{ color: "#475569" }} />}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Usuário */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 p-2 rounded-xl mb-1" style={{ cursor: "default" }}>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
          >
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">Admin Demo</p>
            <p className="text-[11px] truncate" style={{ color: "#475569" }}>admin@nexcargo.com.br</p>
          </div>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200"
            style={{ color: "#64748b" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = "#f87171";
              (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.1)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = "#64748b";
              (e.currentTarget as HTMLElement).style.background = "";
            }}
          >
            <LogOut size={14} />
            Sair da conta
          </button>
        </form>
      </div>
    </motion.aside>
  );
}
