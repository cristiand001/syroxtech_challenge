"use client";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "./toast";

interface ToasterProps {
  toasts: {
    id: number;
    title: string;
    description?: string;
    variant?: "default" | "success" | "destructive";
  }[];
  dismiss: (id: number) => void;
}

export function Toaster({ toasts, dismiss }: ToasterProps) {
  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, variant }) => (
        <Toast
          key={id}
          variant={variant}
          onOpenChange={(open) => !open && dismiss(id)}
        >
          <div className="flex-1">
            <ToastTitle>{title}</ToastTitle>
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
