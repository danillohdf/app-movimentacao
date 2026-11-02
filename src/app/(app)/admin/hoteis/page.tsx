import Link from "next/link";
import { Aviso, Cabecalho, Lista, LinhaLista, ListaVazia } from "@/componentes/pagina";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata = { title: "Hotéis" };

export default async function Hoteis({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const supabase = await criarClienteServidor();
  const { data: hoteis } = await supabase.from("hoteis").select("id, nome, cidade, uf").order("nome");
  return (
    <>
      <Cabecalho titulo="Hotéis" voltar="/admin" acao={<Link href="/admin/hoteis/novo" className="botao-primario">Novo</Link>} />
      <Aviso ok={ok} />
      {hoteis?.length ? (
        <Lista>
          {hoteis.map((h) => (
            <LinhaLista key={h.id} href={`/admin/hoteis/${h.id}`} titulo={h.nome} detalhe={[h.cidade, h.uf].filter(Boolean).join("/")} />
          ))}
        </Lista>
      ) : (
        <ListaVazia>Nenhum hotel cadastrado.</ListaVazia>
      )}
    </>
  );
}
