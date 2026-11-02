import Link from "next/link";
import { Aviso, Cabecalho, Lista, LinhaLista, ListaVazia } from "@/componentes/pagina";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { formatarCnpj } from "@/lib/validacao/documentos";

export const metadata = { title: "GPs" };

export default async function Grupos({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const supabase = await criarClienteServidor();
  const { data: grupos } = await supabase.from("grupos").select("id, codigo, razao_social, cnpj, ativo").order("codigo");
  return (
    <>
      <Cabecalho titulo="GPs" voltar="/admin" acao={<Link href="/admin/grupos/novo" className="botao-primario">Novo</Link>} />
      <Aviso ok={ok} />
      {grupos?.length ? (
        <Lista>
          {grupos.map((g) => (
            <LinhaLista key={g.id} href={`/admin/grupos/${g.id}`} titulo={`${g.codigo} · ${g.razao_social}`} detalhe={formatarCnpj(g.cnpj)}
              etiqueta={!g.ativo && <span className="etiqueta bg-slate-200 text-slate-600">Inativo</span>} />
          ))}
        </Lista>
      ) : (
        <ListaVazia>Nenhum GP cadastrado.</ListaVazia>
      )}
    </>
  );
}
