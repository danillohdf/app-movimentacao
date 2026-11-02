import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Movimentação dos Parques",
    short_name: "Movimentação",
    description: "Roteiros, reembolsos e pagamentos da movimentação dos parques.",
    start_url: "/inicio",
    display: "standalone",
    background_color: "#f1f5f9",
    theme_color: "#1d4ed8",
    lang: "pt-BR",
    icons: [
      { src: "/icones/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icones/icone-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icones/icone-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
