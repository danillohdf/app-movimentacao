import { salvarParque } from "@/acoes/cadastros";
import { Campo, Interruptor, Selecao, UFS } from "@/componentes/campos";
import { Formulario } from "@/componentes/formulario";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { Tabela } from "@/lib/supabase/tipos";

export async function FormularioParque({ parque }: { parque?: Tabela<"parques"> }) {
  const supabase = await criarClienteServidor();
  const [{ data: grupos }, { data: coordenadores }] = await Promise.all([
    supabase.from("grupos").select("id, codigo, razao_social").eq("ativo", true).order("codigo"),
    supabase.from("usuarios").select("id, nome").eq("papel", "coordenador").eq("ativo", true).order("nome"),
  ]);
  return (
    <Formulario acao={salvarParque} textoBotao="Salvar parque">
      {parque && <input type="hidden" name="$id" value={parque.id} />}
      <Campo rotulo="Nome do parque" nome="nome" valor={parque?.nome} obrigatorio />
      <Selecao rotulo="GP" nome="grupo_id" valor={parque?.grupo_id} obrigatorio vazio="Escolha..."
        opcoes={(grupos ?? []).map((g) => ({ valor: g.id, texto: `${g.codigo} · ${g.razao_social}` }))} />
      <Selecao rotulo="Coordenador" nome="coordenador_id" valor={parque?.coordenador_id} vazio="Sem coordenador"
        opcoes={(coordenadores ?? []).map((c) => ({ valor: c.id, texto: c.nome }))} />
      <Campo rotulo="Shopping atual" nome="shopping_atual" valor={parque?.shopping_atual} />
      <div className="grid grid-cols-[1fr_6rem] gap-3">
        <Campo rotulo="Cidade" nome="cidade" valor={parque?.cidade} />
        <Selecao rotulo="UF" nome="uf" valor={parque?.uf} vazio="—" opcoes={UFS} />
      </div>
      <Interruptor rotulo="Ativo" nome="ativo" marcado={parque?.ativo ?? true} />
    </Formulario>
  );
}
