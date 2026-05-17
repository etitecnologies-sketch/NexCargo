"use client";

import { Bell, Search, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

const pageMeta: Record<string, { title: string; subtitle: string; action?: { label: string; href: string } }> = {
  "/dashboard":  { title: "Dashboard",     subtitle: "Visão geral das operações" },
  "/orders":     { title: "Pedidos",        subtitle: "Gerencie todos os pedidos", action: { label: "Novo Pedido", href: "/orders/new" } },
  "/customers":  { title: "Clientes",       subtitle: "Base de clientes", action: { label: "Novo Cliente", href: "/customers/new" } },
  "/tracking":   { title: "Rastreamento",   subtitle: "Entregas em tempo real" },
  "/whatsapp":   { title: "WhatsApp",       subtitle: "Notificações automáticas" },
  "/reports":    { title: "Relatórios",     subtitle: "Análises e exportações" },
  "/settings":   { title: "Configurações",  subtitle: "Preferências do sistema" },
};

export function Header() {
  const pathname = usePathname();
  const key = Object.keys(pageMeta).find(k => k !== "/dashboard" ? pathname.startsWith(k) : pathname === k) ?? "/dashboard";
  const page = pageMeta[key] ?? { title: "NexCargo", subtitle: "" };

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-shrink-0 h-16 flex items-center justify-between px-6 z-10"
      style={{ background: "#fff", borderBottom: "1px solid #f1f5f9" }}
    >
      <div>
        <h1 className="text-[15px] font-bold leading-tight" style={{ color: "#0f172a" }}>{page.title}</h1>
        {page.subtitle && (
          <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>{page.subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#94a3b8" }} />
          <input
            type="search"
            placeholder="Buscar pedido, cliente..."
            className="w-64 pl-9 pr-4 py-2 text-[13px] rounded-xl outline-none transition-all"
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#0f172a",
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = "#3b82f6";
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.background = "#f8fafc";
              e.currentTarget.style.boxShadow = "";
            }}
          />
        </div>

        <button
          className="relative p-2 rounded-xl transition-all"
          style={{ color: "#64748b" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f1f5f9"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ring-2 ring-white" style={{ background: "#ef4444" }} />
        </button>

        {page.action && (
          <Link
            href={page.action.href}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg, #2563eb, #4f46e5)" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.9"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
          >
            <Plus size={15} />
            {page.action.label}
          </Link>
        )}

        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 cursor-pointer"
          style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
          title="Admin Demo"
        >
          A
        </div>
      </div>
    </motion.header>
  );
}
