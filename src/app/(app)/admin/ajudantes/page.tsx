import Link from "next/link";
import { validarAjudante } from "@/acoes/ajudantes";
import { Aviso, Cabecalho, EtiquetaSituacao, ListaVazia } from "@/componentes/pagina";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { formatarTelefone } from "@/lib/validacao/documentos";

export const metadata = { title: "Ajudantes" };

const ABAS = [
  { valor: "pendente", texto: "Para validar" },
  { valor: "ativo", texto: "Ativos" },
  { valor: "inativo", texto: "Inativos" },
] as const;

export default async function Ajudantes({ searchParams }: { searchParams: Promise<{ ok?: string; situacao?: string }> }) {
  const { ok, situacao: s } = await searchParams;
  const situacao = ABAS.find((a) => a.valor === s)?.valor ?? "pendente";
  const supabase = await criarClienteServidor();
  const { data: ajudantes } = await supabase
    .from("ajudantes")
    .select("id, nome, telefone, situacao, coordenador:usuarios!ajudantes_coordenador_id_fkey(nome), dados_bancarios(id)")
    .eq("situacao", situacao)
    .order("nome");

  return (
    <>
      <Cabecalho titulo="Ajudantes" voltar="/admin" acao={<Link href="/admin/ajudantes/novo" className="botao-primario">Novo</Link>} />
      <Aviso ok={ok} />
      <nav className="grid grid-cols-3 gap-1 rounded-xl bg-slate-200 p-1">
        {ABAS.map((a) => (
          <Link key={a.valor} href={`/admin/ajudantes?situacao=${a.valor}`}
            className={`flex min-h-11 items-center justify-center rounded-lg text-sm font-semibold ${a.valor === situacao ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}>
            {a.texto}
          </Link>
        ))}
      </nav>
      {ajudantes?.length ? (
        <ul className="flex flex-col gap-2">
          {ajudantes.map((a) => (
            <li key={a.id} className="cartao flex flex-col gap-3">
              <Link href={`/admin/ajudantes/${a.id}`} className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{a.nome}</p>
                  <p className="text-sm text-slate-500">
                    {[a.coordenador?.nome && `Coord.: ${a.coordenador.nome}`, formatarTelefone(a.telefone)].filter(Boolean).join(" · ")}
                  </p>
                  {!a.dados_bancarios && <p className="text-sm font-medium text-amber-700">Sem Pix cadastrado</p>}
                </div>
                <EtiquetaSituacao situacao={a.situacao} />
              </Link>
              {a.situacao === "pendente" && (
                <form action={validarAjudante}>
                  <input type="hidden" name="id" value={a.id} />
                  <button type="submit" className="botao-primario w-full">Validar</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <ListaVazia>Nenhum ajudante nesta lista.</ListaVazia>
      )}
    </>
  );
}
