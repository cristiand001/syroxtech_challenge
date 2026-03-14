"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Tag,
  Package,
  ShoppingCart,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/ContextLanguage";

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { t } = useLanguage();

  const NAV = [
    { href: "/dashboard", label: t.dashboard, icon: LayoutDashboard },
    { href: "/categories", label: t.categories, icon: Tag },
    { href: "/products", label: t.products, icon: Package },
    { href: "/orders", icon: ShoppingCart, label: t.orders },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-[220px] flex flex-col border-r border-border bg-card z-50">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted overflow-hidden">
          <img
            src="/logo2.jpg"
            alt="SyroxTech"
            className="h-7 w-7 object-contain"
          />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-display font-bold text-[14px] tracking-tight">
            <span className="text-foreground">Syrox</span>
            <span className="text-primary">Tech</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {t.menu}
        </p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-primary/12 text-primary border-l-2 border-primary pl-[10px]"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground border-l-2 border-transparent",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="h-4 w-4" />
          {t.logout}
        </button>
      </div>
    </aside>
  );
}
