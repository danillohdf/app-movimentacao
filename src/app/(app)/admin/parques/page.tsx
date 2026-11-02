import Link from "next/link";
import { Aviso, Cabecalho, Lista, LinhaLista, ListaVazia } from "@/componentes/pagina";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata = { title: "Parques" };

export default async function Parques({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const supabase = await criarClienteServidor();
  const { data: parques } = await supabase
    .from("parques")
    .select("id, nome, ativo, shopping_atual, grupos(codigo), coordenador:usuarios!parques_coordenador_id_fkey(nome)")
    .order("nome");
  return (
    <>
      <Cabecalho titulo="Parques" voltar="/admin" acao={<Link href="/admin/parques/novo" className="botao-primario">Novo</Link>} />
      <Aviso ok={ok} />
      {parques?.length ? (
        <Lista>
          {parques.map((p) => (
            <LinhaLista key={p.id} href={`/admin/parques/${p.id}`} titulo={p.nome}
              detalhe={[p.grupos?.codigo, p.coordenador?.nome ?? "Sem coordenador", p.shopping_atual].filter(Boolean).join(" · ")}
              etiqueta={!p.ativo && <span className="etiqueta bg-slate-200 text-slate-600">Inativo</span>} />
          ))}
        </Lista>
      ) : (
        <ListaVazia>Nenhum parque cadastrado. Cadastre os GPs primeiro.</ListaVazia>
      )}
    </>
  );
}
