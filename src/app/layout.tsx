import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Movimentação", template: "%s · Movimentação" },
  description: "Roteiros, reembolsos e pagamentos da movimentação dos parques.",
  applicationName: "Movimentação",
  appleWebApp: { capable: true, title: "Movimentação", statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/icones/icone-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icones/apple-touch-icon.png", sizes: "180x180" }],
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Ler os headers torna todas as páginas dinâmicas, o que o nonce da CSP exige.
  await headers();
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
