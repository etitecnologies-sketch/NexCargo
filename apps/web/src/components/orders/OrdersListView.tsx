"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Download, RefreshCw, LayoutGrid, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { useOrders } from "@/hooks/useOrders";
import { OrdersTable } from "./OrdersTable";
import { OrderFilters } from "./OrderFilters";
import { Pagination } from "./Pagination";
import { KanbanBoard } from "./KanbanBoard";
import { useDebounce } from "@/hooks/useDebounce";

type ViewMode = "list" | "kanban";

export function OrdersListView() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isError, refetch } = useOrders({
    page,
    per_page: 20,
    status: status || undefined,
    search: debouncedSearch || undefined,
  });

  const handleStatusChange = useCallback((newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pedidos</h1>
          <p className="text-slate-400 text-[13px] mt-0.5">
            {data
              ? `${data.total} pedido${data.total !== 1 ? "s" : ""} encontrado${data.total !== 1 ? "s" : ""}`
              : "Carregando..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle Lista / Kanban */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
            <button
              onClick={() => setViewMode("list")}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200",
                viewMode === "list"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <List size={14} />
              Lista
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200",
                viewMode === "kanban"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LayoutGrid size={14} />
              Kanban
            </button>
          </div>

          <button
            onClick={() => refetch()}
            className="btn-secondary !p-2.5"
            title="Atualizar"
          >
            <RefreshCw size={15} />
          </button>
          <button className="btn-secondary hidden sm:flex">
            <Download size={15} />
            Exportar
          </button>
          <Link href="/dashboard/orders/new" className="btn-primary">
            <Plus size={15} />
            Novo Pedido
          </Link>
        </div>
      </div>

      {/* Vista Kanban */}
      <AnimatePresence mode="wait">
        {viewMode === "kanban" ? (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <KanbanBoard />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden"
          >
            {/* Filtros */}
            <div className="p-4 border-b border-slate-50 space-y-3">
              <div className="relative max-w-md">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Buscar rastreio, remetente, destinatário..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all placeholder:text-slate-400"
                />
              </div>
              <OrderFilters selected={status} onChange={handleStatusChange} />
            </div>

            {/* Tabela */}
            <OrdersTable
              orders={data?.data ?? []}
              isLoading={isLoading}
              isError={isError}
            />

            {/* Paginação */}
            {data && data.total_pages > 1 && (
              <Pagination
                page={page}
                total_pages={data.total_pages}
                total={data.total}
                per_page={20}
                onChange={setPage}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
