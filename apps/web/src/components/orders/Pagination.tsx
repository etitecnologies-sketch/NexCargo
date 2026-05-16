"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";

interface Props {
  page: number;
  total_pages: number;
  total: number;
  per_page: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, total_pages, total, per_page, onChange }: Props) {
  const from = (page - 1) * per_page + 1;
  const to = Math.min(page * per_page, total);

  if (total_pages <= 1) return null;

  const pages = Array.from({ length: Math.min(total_pages, 7) }, (_, i) => {
    if (total_pages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= total_pages - 3) return total_pages - 6 + i;
    return page - 3 + i;
  });

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        Mostrando <span className="font-medium text-gray-700">{from}–{to}</span> de{" "}
        <span className="font-medium text-gray-700">{total}</span> pedidos
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={clsx(
              "w-8 h-8 rounded-lg text-sm font-medium transition",
              p === page
                ? "bg-brand-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page === total_pages}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
