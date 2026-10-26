import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Global Tourism Platform",
  description:
    "Enterprise end-to-end tourism platform monorepo baseline and architecture.",
  openGraph: {
    title: "Global Tourism Platform",
    description:
      "Enterprise end-to-end tourism platform monorepo baseline and architecture.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
