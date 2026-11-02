import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { sair } from "@/acoes/login";
import { usuarioAtual } from "@/lib/auth";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FormularioLogin } from "./formulario-login";

export const metadata: Metadata = { title: "Entrar" };

export default async function PaginaEntrar({
  searchParams,
}: {
  searchParams: Promise<{ motivo?: string }>;
}) {
  const { motivo } = await searchParams;
  if (await usuarioAtual()) redirect("/inicio");

  // Logado no Supabase, mas sem cadastro ativo no app (ex.: desativado pelo admin).
  const supabase = await criarClienteServidor();
  const { data } = await supabase.auth.getClaims();
  const logadoSemAcesso = Boolean(data?.claims?.sub);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900">Movimentação</h1>
        <p className="text-slate-600">Roteiros, reembolsos e pagamentos dos parques.</p>
      </div>

      {logadoSemAcesso || motivo === "sem-acesso" ? (
        <div className="flex flex-col gap-4">
          <p role="alert" className="aviso-erro">
            Seu acesso não está ativo. Fale com o administrador.
          </p>
          {logadoSemAcesso && (
            <form action={sair}>
              <button type="submit" className="botao-secundario w-full">
                Sair e entrar com outro e-mail
              </button>
            </form>
          )}
        </div>
      ) : null}

      {!logadoSemAcesso && <FormularioLogin />}
    </main>
  );
}
