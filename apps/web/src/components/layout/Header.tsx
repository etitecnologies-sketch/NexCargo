"use client";

import { Bell, Search } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      {/* Barra de busca */}
      <div className="relative w-96">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Buscar pedido, cliente, código..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      {/* Ações do lado direito */}
      <div className="flex items-center gap-3">
        {/* Notificações */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
          <Bell size={20} />
          {/* Badge de notificações não lidas */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
