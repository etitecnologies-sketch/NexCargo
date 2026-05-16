"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersService, type OrderFilters, type CreateOrderPayload, type UpdateStatusPayload } from "@/services/orders.service";

// Hook para listar pedidos com filtros
export function useOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () => ordersService.list(filters),
  });
}

// Hook para buscar um pedido específico
export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => ordersService.get(id),
    enabled: !!id,
  });
}

// Hook para criar pedido
export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersService.create(payload),
    onSuccess: () => {
      // Invalida o cache da listagem para recarregar
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

// Hook para atualizar status
export function useUpdateOrderStatus(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateStatusPayload) =>
      ordersService.updateStatus(orderId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
