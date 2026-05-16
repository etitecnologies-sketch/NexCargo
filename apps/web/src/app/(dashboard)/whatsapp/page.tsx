import { Metadata } from "next";
import { WhatsAppPanel } from "@/components/whatsapp/WhatsAppPanel";

export const metadata: Metadata = { title: "WhatsApp" };

export default function WhatsAppPage() {
  return <WhatsAppPanel />;
}
