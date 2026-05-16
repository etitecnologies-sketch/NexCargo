import { Metadata } from "next";
import { CustomerDetailView } from "@/components/customers/CustomerDetailView";
export const metadata: Metadata = { title: "Detalhe do Cliente" };
export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  return <CustomerDetailView customerId={params.id} />;
}
