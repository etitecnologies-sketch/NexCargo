"use client";

import { useState, useEffect } from "react";

// Debounce: espera o usuário parar de digitar antes de buscar
// Evita uma chamada ao banco a cada letra digitada
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
