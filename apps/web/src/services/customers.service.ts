import type { Customer, PaginatedResponse } from "@nexcargo/shared";

export interface CustomerFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CustomerWithOrders extends Customer {
  orders: Array<{
    id: string;
    tracking_code: string;
    status: string;
    recipient_name: string;
    sender_name: string;
    destination_address: Customer["address"];
    created_at: string;
    total_value: number;
  }>;
}

async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...init });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Erro ${res.status}`);
  }
  return res.json();
}

export const customersService = {
  list(filters: CustomerFilters = {}): Promise<PaginatedResponse<Customer>> {
    const params = new URLSearchParams();
    if (filters.page)     params.set("page", String(filters.page));
    if (filters.per_page) params.set("per_page", String(filters.per_page));
    if (filters.search)   params.set("search", filters.search);
    return fetchApi(`/api/customers?${params}`);
  },
  get(id: string): Promise<{ data: CustomerWithOrders }> {
    return fetchApi(`/api/customers/${id}`);
  },
  create(payload: Partial<Customer>): Promise<{ data: Customer; message: string }> {
    return fetchApi("/api/customers", { method: "POST", body: JSON.stringify(payload) });
  },
  update(id: string, payload: Partial<Customer>): Promise<{ data: Customer }> {
    return fetchApi(`/api/customers/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
  },
  remove(id: string): Promise<{ message: string }> {
    return fetchApi(`/api/customers/${id}`, { method: "DELETE" });
  },
};
