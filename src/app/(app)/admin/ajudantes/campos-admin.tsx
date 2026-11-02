import { Selecao } from "@/componentes/campos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function CamposAdminAjudante({ coordenadorId, situacao }: { coordenadorId?: string; situacao?: string }) {
  const supabase = await criarClienteServidor();
  const { data: coordenadores } = await supabase.from("usuarios").select("id, nome").eq("papel", "coordenador").order("nome");
  return (
    <>
      <Selecao rotulo="Coordenador" nome="coordenador_id" valor={coordenadorId} obrigatorio vazio="Escolha..."
        opcoes={(coordenadores ?? []).map((c) => ({ valor: c.id, texto: c.nome }))} />
      <Selecao rotulo="Situação" nome="situacao" valor={situacao ?? "ativo"} obrigatorio
        opcoes={[
          { valor: "ativo", texto: "Ativo" },
          { valor: "pendente", texto: "Pendente" },
          { valor: "inativo", texto: "Inativo" },
        ]} />
    </>
  );
}
