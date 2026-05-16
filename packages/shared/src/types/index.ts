// ===========================================
// NEXCARGO — Tipos compartilhados
// Usados tanto no frontend quanto no backend
// ===========================================

export type OrderStatus =
  | "pending"
  | "collected"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "returned"
  | "cancelled";

export type UserRole = "owner" | "admin" | "operator" | "viewer";
export type TenantPlan = "trial" | "starter" | "pro" | "enterprise";

export interface Address {
  street: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: TenantPlan;
  is_active: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  tenant_id: string;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: Address;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  tenant_id: string;
  tracking_code: string;
  sender_id?: string;
  recipient_id?: string;
  sender_name: string;
  sender_phone?: string;
  recipient_name: string;
  recipient_phone?: string;
  origin_address: Address;
  destination_address: Address;
  description?: string;
  weight_kg?: number;
  declared_value?: number;
  freight_value: number;
  insurance_value: number;
  total_value: number;
  status: OrderStatus;
  estimated_delivery_date?: string;
  delivered_at?: string;
  created_by?: string;
  assigned_to?: string;
  events?: OrderEvent[];
  notes?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  tenant_id: string;
  status: OrderStatus;
  description: string;
  location?: string;
  occurred_at: string;
  created_by?: string;
}

// Tipos de resposta da API
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
