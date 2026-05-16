import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { NewOrderForm } from "@/components/orders/NewOrderForm";

export const metadata: Metadata = { title: "Novo Pedido" };

export default function NewOrderPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/orders"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          <ChevronLeft size={16} />
          Voltar para Pedidos
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Novo Pedido</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Preencha os dados para criar um novo pedido de entrega.
        </p>
      </div>

      <NewOrderForm />
    </div>
  );
}
