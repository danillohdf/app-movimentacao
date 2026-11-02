"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Papel } from "@/lib/supabase/tipos";

type Item = { href: string; texto: string; icone: keyof typeof ICONES };

const ITENS: Record<Papel, Item[]> = {
  admin: [
    { href: "/inicio", texto: "Início", icone: "inicio" },
    { href: "/admin", texto: "Cadastros", icone: "cadastros" },
    { href: "/perfil", texto: "Perfil", icone: "perfil" },
  ],
  coordenador: [
    { href: "/inicio", texto: "Início", icone: "inicio" },
    { href: "/equipe", texto: "Equipe", icone: "equipe" },
    { href: "/perfil", texto: "Perfil", icone: "perfil" },
  ],
  montador: [
    { href: "/inicio", texto: "Roteiros", icone: "inicio" },
    { href: "/perfil", texto: "Perfil", icone: "perfil" },
  ],
};

const ICONES = {
  inicio: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  cadastros: "M4 5h16M4 12h16M4 19h16",
  equipe:
    "M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6M22 19v-1a4 4 0 0 0-3-3.9M16 4.1a3 3 0 0 1 0 5.8",
  perfil: "M20 21v-1a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v1M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
};

export function MenuInferior({ papel }: { papel: Papel }) {
  const caminho = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-2xl">
        {ITENS[papel].map((item) => {
          const ativo = caminho === item.href || caminho.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold ${
                  ativo ? "text-blue-700" : "text-slate-500"
                }`}
              >
                <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={ICONES[item.icone]} />
                </svg>
                {item.texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
