"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PackageX } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <PackageX className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-6xl font-bold tracking-tight text-primary">
            404
          </h1>
          <p className="mt-2 text-xl font-semibold">Página no encontrada</p>
          <p className="mt-1 text-sm text-muted-foreground">
            La página que buscás no existe o fue movida.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => router.back()} variant="outline">
            Volver
          </Button>
          <Button onClick={() => router.push("/dashboard")}>
            Ir al Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
