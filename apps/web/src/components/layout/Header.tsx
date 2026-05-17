"use client";

import { Bell, Search, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

const pageTitles: Record<string, { title: string; subtitle: string; action?: { label: string; href: string } }> = {
  "/dashboard":           { title: "Dashboard",      subtitle: "Visão geral das operações" },
  "/dashboard/orders":    { title: "Pedidos",         subtitle: "Gerencie todos os pedidos", action: { label: "Novo Pedido", href: "/dashboard/orders/new" } },
  "/dashboard/customers": { title: "Clientes",        subtitle: "Base de clientes cadastrados", action: { label: "Novo Cliente", href: "/dashboard/customers/new" } },
  "/dashboard/tracking":  { title: "Rastreamento",    subtitle: "Acompanhe entregas em tempo real" },
  "/dashboard/whatsapp":  { title: "WhatsApp",        subtitle: "Notificações automáticas" },
  "/dashboard/reports":   { title: "Relatórios",      subtitle: "Análises e exportações" },
  "/dashboard/settings":  { title: "Configurações",   subtitle: "Preferências do sistema" },
};

export function Header() {
  const pathname = usePathname();
  const page = pageTitles[pathname] ?? { title: "NexCargo", subtitle: "" };

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-shrink-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-10"
    >
      {/* Título dinâmico da página */}
      <div>
        <h1 className="text-[15px] font-bold text-slate-900 leading-tight">{page.title}</h1>
        {page.subtitle && (
          <p className="text-[11px] text-slate-400 mt-0.5">{page.subtitle}</p>
        )}
      </div>

      {/* Lado direito */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Buscar pedido, cliente..."
            className="w-64 pl-9 pr-4 py-2 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Notificações */}
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Ação rápida */}
        {page.action && (
          <Link href={page.action.href} className="btn-primary">
            <Plus size={15} />
            {page.action.label}
          </Link>
        )}

        {/* Avatar */}
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
          title="Admin Demo"
        >
          A
        </div>
      </div>
    </motion.header>
  );
}
