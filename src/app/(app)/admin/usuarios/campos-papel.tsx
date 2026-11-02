import { Selecao } from "@/componentes/campos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function CamposPapel({ papel, coordenadorId }: { papel?: string; coordenadorId?: string | null }) {
  const supabase = await criarClienteServidor();
  const { data: coordenadores } = await supabase.from("usuarios").select("id, nome").eq("papel", "coordenador").eq("ativo", true).order("nome");
  return (
    <>
      <Selecao rotulo="Papel" nome="papel" valor={papel} obrigatorio vazio="Escolha..."
        opcoes={[
          { valor: "coordenador", texto: "Coordenador" },
          { valor: "montador", texto: "Montador" },
          { valor: "admin", texto: "Admin" },
        ]} />
      <Selecao rotulo="Coordenador (só para montador)" nome="coordenador_id" valor={coordenadorId} vazio="—"
        opcoes={(coordenadores ?? []).map((c) => ({ valor: c.id, texto: c.nome }))} />
    </>
  );
}
