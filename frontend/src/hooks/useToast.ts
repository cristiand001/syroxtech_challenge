"use client";
import { useState, useCallback } from "react";

type ToastVariant = "default" | "success" | "destructive";

interface ToastData {
  id: number;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const toast = useCallback(
    ({ title, description, variant = "default" }: Omit<ToastData, "id">) => {
      const id = toastId++;
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    [],
  );

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, toast, dismiss };
}
