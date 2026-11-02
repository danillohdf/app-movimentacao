import Link from "next/link";
import { Aviso, Cabecalho, Lista, LinhaLista, ListaVazia, NOME_PAPEL } from "@/componentes/pagina";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata = { title: "Usuários" };

export default async function Usuarios({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const supabase = await criarClienteServidor();
  const { data: usuarios } = await supabase.from("usuarios").select("id, nome, email, papel, ativo").order("papel").order("nome");
  return (
    <>
      <Cabecalho titulo="Usuários" voltar="/admin" acao={<Link href="/admin/usuarios/novo" className="botao-primario">Convidar</Link>} />
      <Aviso ok={ok} />
      {usuarios?.length ? (
        <Lista>
          {usuarios.map((u) => (
            <LinhaLista key={u.id} href={`/admin/usuarios/${u.id}`} titulo={u.nome} detalhe={`${NOME_PAPEL[u.papel]} · ${u.email}`}
              etiqueta={!u.ativo && <span className="etiqueta bg-slate-200 text-slate-600">Desativado</span>} />
          ))}
        </Lista>
      ) : (
        <ListaVazia>Nenhum usuário.</ListaVazia>
      )}
    </>
  );
}
