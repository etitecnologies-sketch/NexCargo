import { Metadata } from "next";
import { CustomersListView } from "@/components/customers/CustomersListView";
export const metadata: Metadata = { title: "Clientes" };
export default function CustomersPage() { return <CustomersListView />; }
