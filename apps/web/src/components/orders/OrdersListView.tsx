"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Download, RefreshCw } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { OrdersTable } from "./OrdersTable";
import { OrderFilters } from "./OrderFilters";
import { Pagination } from "./Pagination";
import { useDebounce } from "@/hooks/useDebounce";

export function OrdersListView() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
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
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {data ? `${data.total} pedido${data.total !== 1 ? "s" : ""} encontrado${data.total !== 1 ? "s" : ""}` : "Carregando..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="btn-secondary p-2"
            title="Atualizar"
          >
            <RefreshCw size={16} />
          </button>
          <button className="btn-secondary gap-2 hidden sm:flex">
            <Download size={16} />
            Exportar
          </button>
          <Link href="/dashboard/orders/new" className="btn-primary">
            <Plus size={16} />
            Novo Pedido
          </Link>
        </div>
      </div>

      {/* Card principal */}
      <div className="card p-0 overflow-hidden">
        {/* Barra de busca e filtros */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="relative max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar por rastreio, remetente, destinatário..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
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
      </div>
    </div>
  );
}
