import { Metadata } from "next";
import { OrderDetailView } from "@/components/orders/OrderDetailView";

export const metadata: Metadata = { title: "Detalhe do Pedido" };

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <OrderDetailView orderId={params.id} />;
}
