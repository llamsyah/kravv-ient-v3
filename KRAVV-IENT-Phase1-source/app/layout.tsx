import type { Metadata } from "next";
import "./globals.css";
import "./surface.css";
import "./analysis.css";
import "./assistant.css";

export const metadata: Metadata = {
  title: "KRAVV-IENT | Investment Workspace",
  description: "Evidence, diligence, and human judgment in one investment workspace.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
