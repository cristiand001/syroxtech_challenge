import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/ContextLanguage";

export const metadata = {
  title: "SyroxTech",
  description: "Admin Panel",
  icons: {
    icon: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
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
