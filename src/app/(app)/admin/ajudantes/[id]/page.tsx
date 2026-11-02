import { notFound } from "next/navigation";
import { editarAjudante } from "@/acoes/ajudantes";
import { CamposAjudante } from "@/componentes/campos-ajudante";
import { Formulario } from "@/componentes/formulario";
import { Cabecalho } from "@/componentes/pagina";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { formatarCpf, formatarTelefone } from "@/lib/validacao/documentos";
import { CamposAdminAjudante } from "../campos-admin";

export const metadata = { title: "Ajudante" };

export default async function EditarAjudante({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await criarClienteServidor();
  const { data: ajudante } = await supabase
    .from("ajudantes")
    .select("id, nome, telefone, situacao, coordenador_id, dados_bancarios(cpf, tipo_chave_pix, chave_pix)")
    .eq("id", id)
    .maybeSingle();
  if (!ajudante) notFound();
  const pix = ajudante.dados_bancarios;

  return (
    <>
      <Cabecalho titulo={ajudante.nome} voltar={`/admin/ajudantes?situacao=${ajudante.situacao}`} />
      <Formulario acao={editarAjudante} textoBotao="Salvar">
        <input type="hidden" name="$id" value={ajudante.id} />
        <CamposAdminAjudante coordenadorId={ajudante.coordenador_id} situacao={ajudante.situacao} />
        <CamposAjudante
          ajudante={{ nome: ajudante.nome, telefone: formatarTelefone(ajudante.telefone) }}
          pix={pix && { ...pix, cpf: pix.cpf ? formatarCpf(pix.cpf) : null }}
        />
      </Formulario>
    </>
  );
}
