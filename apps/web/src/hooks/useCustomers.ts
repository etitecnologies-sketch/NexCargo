"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customersService, type CustomerFilters } from "@/services/customers.service";
import type { Customer } from "@nexcargo/shared";

export function useCustomers(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: ["customers", filters],
    queryFn: () => customersService.list(filters),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => customersService.get(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Customer>) => customersService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useUpdateCustomer(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Customer>) => customersService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers", id] });
      qc.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}
