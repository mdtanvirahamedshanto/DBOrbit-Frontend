import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: "DBOrbit | Multi-Database Admin Panel",
  description:
    "Production-grade web database GUI for MongoDB, PostgreSQL, and MySQL with explorer, CRUD, query builder, schema viewer, and index management.",
  keywords: [
    "database admin panel",
    "mongodb gui",
    "postgres admin",
    "mysql admin",
    "next.js dashboard"
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
