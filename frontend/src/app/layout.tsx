import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/ContextLanguage";

export const metadata: Metadata = {
  title: "Ecommerce Admin",
  description: "Admin panel for ecommerce management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
