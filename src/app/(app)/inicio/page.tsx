import Link from "next/link";
import { exigirUsuario } from "@/lib/auth";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata = { title: "Início" };

export default async function Inicio() {
  const usuario = await exigirUsuario();
  const primeiroNome = usuario.nome.split(" ")[0];

  return (
    <>
      <header>
        <p className="text-sm text-slate-500">Olá,</p>
        <h1 className="text-2xl font-bold text-slate-900">{primeiroNome}</h1>
      </header>
      {usuario.papel === "admin" && <InicioAdmin />}
      {usuario.papel === "coordenador" && <InicioCoordenador />}
      {usuario.papel === "montador" && <InicioMontador />}
    </>
  );
}

async function contar(consulta: PromiseLike<{ count: number | null }>) {
  return (await consulta).count ?? 0;
}

const SO_CONTAGEM = { count: "exact", head: true } as const;

function Contador({ numero, texto, href, destaque }: { numero: number; texto: string; href: string; destaque?: boolean }) {
  return (
    <Link href={href} className={`cartao flex flex-col gap-1 active:bg-slate-50 ${destaque && numero > 0 ? "ring-2 ring-amber-400" : ""}`}>
      <span className="text-3xl font-bold text-slate-900">{numero}</span>
      <span className="text-sm text-slate-600">{texto}</span>
    </Link>
  );
}

async function InicioAdmin() {
  const supabase = await criarClienteServidor();
  const [pendentes, usuarios, parques] = await Promise.all([
    contar(supabase.from("ajudantes").select("id", SO_CONTAGEM).eq("situacao", "pendente")),
    contar(supabase.from("usuarios").select("id", SO_CONTAGEM).eq("ativo", true)),
    contar(supabase.from("parques").select("id", SO_CONTAGEM).eq("ativo", true)),
  ]);
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Contador numero={pendentes} texto="Ajudantes para validar" href="/admin/ajudantes?situacao=pendente" destaque />
        <Contador numero={parques} texto="Parques ativos" href="/admin/parques" />
        <Contador numero={usuarios} texto="Usuários ativos" href="/admin/usuarios" />
      </div>
      <p className="cartao text-sm text-slate-600">
        Pagamentos e reembolsos para aprovar vão aparecer aqui nas próximas etapas.
      </p>
    </>
  );
}

async function InicioCoordenador() {
  const supabase = await criarClienteServidor();
  const [{ data: parques }, ajudantes, pendentes, montadores] = await Promise.all([
    supabase.from("parques").select("id, nome, shopping_atual, cidade, uf").eq("ativo", true).order("nome"),
    contar(supabase.from("ajudantes").select("id", SO_CONTAGEM).eq("situacao", "ativo")),
    contar(supabase.from("ajudantes").select("id", SO_CONTAGEM).eq("situacao", "pendente")),
    contar(supabase.from("usuarios").select("id", SO_CONTAGEM).eq("papel", "montador").eq("ativo", true)),
  ]);
  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        <Contador numero={montadores} texto="Montadores" href="/equipe" />
        <Contador numero={ajudantes} texto="Ajudantes" href="/equipe" />
        <Contador numero={pendentes} texto="Aguardando validação" href="/equipe" />
      </div>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Meus parques</h2>
        {parques && parques.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {parques.map((p) => (
              <li key={p.id} className="cartao">
                <p className="font-semibold">{p.nome}</p>
                <p className="text-sm text-slate-500">
                  {[p.shopping_atual, p.cidade && `${p.cidade}${p.uf ? `/${p.uf}` : ""}`].filter(Boolean).join(" · ") || "Sem shopping definido"}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="cartao text-slate-500">Nenhum parque vinculado a você ainda.</p>
        )}
      </section>
      <Link href="/equipe/ajudantes/novo" className="botao-primario">
        Cadastrar ajudante
      </Link>
    </>
  );
}

function InicioMontador() {
  return (
    <section className="cartao flex flex-col gap-2 text-center">
      <p className="text-lg font-semibold">Seus roteiros aparecerão aqui</p>
      <p className="text-sm text-slate-500">
        Quando você for escalado para uma montagem ou desmontagem, o próximo roteiro aparece primeiro nesta tela.
      </p>
    </section>
  );
}
