import Link from "next/link";
import type { ReactNode } from "react";

export function Cabecalho({ titulo, voltar, acao }: { titulo: string; voltar?: string; acao?: ReactNode }) {
  return (
    <header className="flex items-center gap-3">
      {voltar && (
        <Link href={voltar} aria-label="Voltar" className="-ml-2 flex size-12 items-center justify-center rounded-full text-slate-600 active:bg-slate-200">
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
      )}
      <h1 className="flex-1 text-2xl font-bold text-slate-900">{titulo}</h1>
      {acao}
    </header>
  );
}

export function ListaVazia({ children }: { children: ReactNode }) {
  return <p className="cartao text-center text-slate-500">{children}</p>;
}

export function Aviso({ ok }: { ok?: string }) {
  if (!ok) return null;
  const textos: Record<string, string> = {
    salvo: "Salvo.",
    criado: "Cadastrado.",
    convidado: "Usuário cadastrado. Mande o convite para ele (botão abaixo).",
    pendente: "Ajudante cadastrado. Ele fica pendente até o admin validar.",
  };
  return (
    <p role="status" className="aviso-ok">
      {textos[ok] ?? "Feito."}
    </p>
  );
}

export function LinhaLista({ href, titulo, detalhe, etiqueta }: { href: string; titulo: string; detalhe?: string; etiqueta?: ReactNode }) {
  return (
    <li>
      <Link href={href} className="flex min-h-16 items-center gap-3 px-4 py-3 active:bg-slate-50">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">{titulo}</p>
          {detalhe && <p className="truncate text-sm text-slate-500">{detalhe}</p>}
        </div>
        {etiqueta}
        <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path d="M9 6l6 6-6 6" />
        </svg>
      </Link>
    </li>
  );
}

export function Lista({ children }: { children: ReactNode }) {
  return <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">{children}</ul>;
}

const CORES_SITUACAO: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-800",
  ativo: "bg-green-100 text-green-800",
  inativo: "bg-slate-200 text-slate-600",
};

export function EtiquetaSituacao({ situacao }: { situacao: string }) {
  const texto = { pendente: "Pendente", ativo: "Ativo", inativo: "Inativo" }[situacao] ?? situacao;
  return <span className={`etiqueta ${CORES_SITUACAO[situacao] ?? ""}`}>{texto}</span>;
}

export const NOME_PAPEL: Record<string, string> = {
  admin: "Admin",
  coordenador: "Coordenador",
  montador: "Montador",
};
