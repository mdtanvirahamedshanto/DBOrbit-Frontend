import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: {
    default: "DBOrbit – Multi-Database Admin Panel | MongoDB · PostgreSQL · MySQL",
    template: "%s | DBOrbit",
  },
  description:
    "DBOrbit is a production-grade, open-source web GUI for MongoDB, PostgreSQL and MySQL. Explore databases, run queries, manage schemas and indexes – all from one beautiful dashboard.",
  keywords: [
    "database admin panel",
    "mongodb gui",
    "postgresql admin",
    "mysql admin",
    "database management tool",
    "open source database ui",
    "next.js database dashboard",
    "db orbit",
    "sql client web",
    "nosql gui",
  ],
  authors: [{ name: "DBOrbit" }],
  robots: { index: true, follow: true },
  metadataBase: new URL("https://dborbit.app"),
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
