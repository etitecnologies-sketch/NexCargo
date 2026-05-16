import type { Order, PaginatedResponse } from "@nexcargo/shared";

export interface OrderFilters {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
}

export interface CreateOrderPayload {
  sender_name: string;
  sender_phone?: string;
  recipient_name: string;
  recipient_phone?: string;
  origin_address: {
    street: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city: string;
    state: string;
    zip: string;
  };
  destination_address: {
    street: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city: string;
    state: string;
    zip: string;
  };
  description?: string;
  weight_kg?: number;
  declared_value?: number;
  freight_value: number;
  estimated_delivery_date?: string;
  notes?: string;
}

export interface UpdateStatusPayload {
  status: Order["status"];
  description: string;
  location?: string;
}

async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Erro ${res.status}`);
  }

  return res.json();
}

export const ordersService = {
  list(filters: OrderFilters = {}): Promise<PaginatedResponse<Order>> {
    const params = new URLSearchParams();
    if (filters.page)     params.set("page", String(filters.page));
    if (filters.per_page) params.set("per_page", String(filters.per_page));
    if (filters.status)   params.set("status", filters.status);
    if (filters.search)   params.set("search", filters.search);
    return fetchApi(`/api/orders?${params.toString()}`);
  },

  get(id: string): Promise<{ data: Order }> {
    return fetchApi(`/api/orders/${id}`);
  },

  create(payload: CreateOrderPayload): Promise<{ data: Order; message: string }> {
    return fetchApi("/api/orders", { method: "POST", body: JSON.stringify(payload) });
  },

  updateStatus(id: string, payload: UpdateStatusPayload): Promise<{ message: string }> {
    return fetchApi(`/api/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
