"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// Providers é como um "envelope" que embrulha toda a aplicação
// e disponibiliza funcionalidades globais pra todas as telas
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // dados ficam "frescos" por 1 minuto
            retry: 1,             // tenta 1 vez em caso de erro
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
