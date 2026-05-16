import { Metadata } from "next";
import { OrdersListView } from "@/components/orders/OrdersListView";

export const metadata: Metadata = { title: "Pedidos" };

export default function OrdersPage() {
  return <OrdersListView />;
}
