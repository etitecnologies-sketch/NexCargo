import { Metadata } from "next";
import { PublicTrackingView } from "@/components/tracking/PublicTrackingView";

export const metadata: Metadata = {
  title: "Rastreamento de Pedido | NexCargo",
  description: "Acompanhe sua encomenda em tempo real.",
};

export default function PublicTrackingPage({
  params,
}: {
  params: { code: string };
}) {
  return <PublicTrackingView code={params.code.toUpperCase()} />;
}
