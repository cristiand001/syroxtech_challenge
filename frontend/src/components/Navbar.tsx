"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/languageContext";

function getEmailFromToken(): string {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return "";
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.email ?? "";
  } catch {
    return "";
  }
}

export default function Navbar() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLanguage();
  const [email, setEmail] = useState("");

  useEffect(() => {
    setEmail(getEmailFromToken());
  }, []);

  const TITLES: Record<string, string> = {
    "/dashboard": t.dashboard,
    "/categories": t.categories,
    "/products": t.products,
    "/sales": t.sales,
  };

  const toggleLocale = () => setLocale(locale === "es" ? "en" : "es");

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card px-7">
      <h1 className="font-display text-xl font-bold tracking-tight">
        {TITLES[pathname] ?? "Admin"}
      </h1>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleLocale}
          className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
        >
          <span className="text-sm">{locale === "es" ? "🇦🇷" : "🇺🇸"}</span>
          {locale === "es" ? "ES" : "EN"}
        </button>

        {email && (
          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
              {email[0].toUpperCase()}
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {email}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
