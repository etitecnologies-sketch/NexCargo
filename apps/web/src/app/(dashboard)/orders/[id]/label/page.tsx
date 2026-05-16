import { Metadata } from "next";
import { LabelPrintView } from "@/components/orders/LabelPrintView";

export const metadata: Metadata = { title: "Etiqueta de Envio" };

export default function LabelPage({ params }: { params: { id: string } }) {
  return <LabelPrintView orderId={params.id} />;
}
