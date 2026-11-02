import type { NextRequest } from "next/server";
import { atualizarSessao } from "@/lib/supabase/sessao";

export async function proxy(request: NextRequest) {
  return atualizarSessao(request);
}

export const config = {
  matcher: [
    // Tudo, menos arquivos estáticos e ícones do app.
    "/((?!_next/static|_next/image|favicon.ico|icones/|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
