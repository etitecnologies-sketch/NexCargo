"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Phone, Mail, ChevronRight, Loader2, Users, Trash2 } from "lucide-react";
import { useCustomers, useDeleteCustomer } from "@/hooks/useCustomers";
import { useDebounce } from "@/hooks/useDebounce";
import { Pagination } from "@/components/orders/Pagination";
import type { Customer } from "@nexcargo/shared";

export function CustomersListView() {
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState("");
  const debouncedSearch       = useDebounce(search, 400);
  const { data, isLoading }   = useCustomers({ page, per_page: 20, search: debouncedSearch || undefined });
  const { mutate: remove }    = useDeleteCustomer();

  const handleSearch = useCallback((v: string) => { setSearch(v); setPage(1); }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {data ? `${data.total} cliente${data.total !== 1 ? "s" : ""} cadastrado${data.total !== 1 ? "s" : ""}` : "Carregando..."}
          </p>
        </div>
        <Link href="/dashboard/customers/new" className="btn-primary">
          <Plus size={16} /> Novo Cliente
        </Link>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar por nome, e-mail, telefone ou CPF/CNPJ..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-brand-500" />
          </div>
        ) : data?.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="p-4 rounded-full bg-gray-50"><Users size={32} className="text-gray-300" /></div>
            <p className="text-gray-500 font-medium">Nenhum cliente encontrado</p>
            <Link href="/dashboard/customers/new" className="btn-primary text-sm">Cadastrar primeiro cliente</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {(data?.data ?? []).map((customer) => (
              <CustomerRow key={customer.id} customer={customer} onDelete={() => remove(customer.id)} />
            ))}
          </div>
        )}

        {data && data.total_pages > 1 && (
          <Pagination page={page} total_pages={data.total_pages} total={data.total} per_page={20} onChange={setPage} />
        )}
      </div>
    </div>
  );
}

function CustomerRow({ customer, onDelete }: { customer: Customer; onDelete: () => void }) {
  const initials = customer.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors group">
      {/* Avatar com iniciais */}
      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm flex-shrink-0">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate">{customer.name}</p>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          {customer.phone && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Phone size={11} /> {customer.phone}
            </span>
          )}
          {customer.email && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Mail size={11} /> {customer.email}
            </span>
          )}
          {customer.document && (
            <span className="text-xs text-gray-400">{customer.document}</span>
          )}
        </div>
      </div>

      {customer.address?.city && (
        <p className="text-sm text-gray-400 hidden sm:block flex-shrink-0">
          {customer.address.city} - {customer.address.state}
        </p>
      )}

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.preventDefault(); if (confirm("Remover cliente?")) onDelete(); }}
          className="p-1.5 rounded-lg text-gray-400 hover:text-danger-500 hover:bg-danger-50 transition"
        >
          <Trash2 size={15} />
        </button>
        <Link href={`/dashboard/customers/${customer.id}`}
          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition">
          <ChevronRight size={15} />
        </Link>
      </div>
    </div>
  );
}
