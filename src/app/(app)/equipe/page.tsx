import Link from "next/link";
import { Aviso, Cabecalho, EtiquetaSituacao, ListaVazia } from "@/componentes/pagina";
import { exigirUsuario } from "@/lib/auth";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { formatarTelefone } from "@/lib/validacao/documentos";

export const metadata = { title: "Minha equipe" };

export default async function Equipe({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const eu = await exigirUsuario("coordenador");
  const supabase = await criarClienteServidor();
  const [{ data: montadores }, { data: ajudantes }, { data: pix }] = await Promise.all([
    supabase.from("usuarios").select("id, nome, telefone").eq("papel", "montador").eq("coordenador_id", eu.id).eq("ativo", true).order("nome"),
    supabase.from("ajudantes").select("id, nome, telefone, situacao").neq("situacao", "inativo").order("nome"),
    supabase.rpc("dados_bancarios_da_equipe"),
  ]);
  const pixPorAjudante = new Map((pix ?? []).map((p) => [p.ajudante_id, p]));

  return (
    <>
      <Cabecalho titulo="Minha equipe" acao={<Link href="/equipe/ajudantes/novo" className="botao-primario">+ Ajudante</Link>} />
      <Aviso ok={ok} />

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Ajudantes</h2>
        {ajudantes?.length ? (
          <ul className="flex flex-col gap-2">
            {ajudantes.map((a) => {
              const p = pixPorAjudante.get(a.id);
              return (
                <li key={a.id} className="cartao flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{a.nome}</p>
                    <p className="text-sm text-slate-500">{formatarTelefone(a.telefone) || "Sem telefone"}</p>
                    <p className="text-sm text-slate-500">{p ? `Pix: ${p.chave_pix_mascarada}` : "Sem Pix cadastrado"}</p>
                  </div>
                  <EtiquetaSituacao situacao={a.situacao} />
                </li>
              );
            })}
          </ul>
        ) : (
          <ListaVazia>Nenhum ajudante ainda. Toque em “+ Ajudante”.</ListaVazia>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Montadores</h2>
        {montadores?.length ? (
          <ul className="flex flex-col gap-2">
            {montadores.map((m) => (
              <li key={m.id} className="cartao">
                <p className="font-semibold">{m.nome}</p>
                <p className="text-sm text-slate-500">{formatarTelefone(m.telefone) || "Sem telefone"}</p>
              </li>
            ))}
          </ul>
        ) : (
          <ListaVazia>Nenhum montador vinculado a você. Peça ao admin.</ListaVazia>
        )}
      </section>
    </>
  );
}
