import Link from "next/link";
import { Cabecalho } from "@/componentes/pagina";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata = { title: "Cadastros" };

export default async function Cadastros() {
  const supabase = await criarClienteServidor();
  const contar = async (t: "grupos" | "parques" | "usuarios" | "ajudantes" | "hoteis") =>
    (await supabase.from(t).select("id", { count: "exact", head: true })).count ?? 0;
  const [grupos, parques, usuarios, ajudantes, hoteis, pendentes] = await Promise.all([
    contar("grupos"),
    contar("parques"),
    contar("usuarios"),
    contar("ajudantes"),
    contar("hoteis"),
    supabase.from("ajudantes").select("id", { count: "exact", head: true }).eq("situacao", "pendente").then((r) => r.count ?? 0),
  ]);

  const itens = [
    { href: "/admin/usuarios", titulo: "Usuários", detalhe: "Admins, coordenadores e montadores", n: usuarios },
    { href: "/admin/ajudantes", titulo: "Ajudantes", detalhe: pendentes > 0 ? `${pendentes} para validar` : "Com dados de Pix", n: ajudantes, alerta: pendentes > 0 },
    { href: "/admin/parques", titulo: "Parques", detalhe: "Com GP e coordenador", n: parques },
    { href: "/admin/grupos", titulo: "GPs (empresas)", detalhe: "Razão social e CNPJ", n: grupos },
    { href: "/admin/hoteis", titulo: "Hotéis", detalhe: "Para reaproveitar nos roteiros", n: hoteis },
  ];

  return (
    <>
      <Cabecalho titulo="Cadastros" />
      <ul className="flex flex-col gap-3">
        {itens.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className={`cartao flex min-h-16 items-center gap-4 active:bg-slate-50 ${i.alerta ? "ring-2 ring-amber-400" : ""}`}>
              <span className="w-10 text-center text-2xl font-bold text-blue-700">{i.n}</span>
              <span className="flex-1">
                <span className="block font-semibold">{i.titulo}</span>
                <span className={`block text-sm ${i.alerta ? "font-semibold text-amber-700" : "text-slate-500"}`}>{i.detalhe}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
