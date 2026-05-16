import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { NewCustomerForm } from "@/components/customers/NewCustomerForm";
export const metadata: Metadata = { title: "Novo Cliente" };
export default function NewCustomerPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Link href="/dashboard/customers" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ChevronLeft size={16} /> Voltar para Clientes
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Novo Cliente</h1>
        <p className="text-gray-500 text-sm mt-0.5">Cadastre um remetente ou destinatário recorrente.</p>
      </div>
      <NewCustomerForm />
    </div>
  );
}
