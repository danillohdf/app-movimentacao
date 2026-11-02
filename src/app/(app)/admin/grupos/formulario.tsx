import { salvarGrupo } from "@/acoes/cadastros";
import { Campo, Interruptor } from "@/componentes/campos";
import { Formulario } from "@/componentes/formulario";
import type { Tabela } from "@/lib/supabase/tipos";
import { formatarCnpj } from "@/lib/validacao/documentos";

export function FormularioGrupo({ grupo }: { grupo?: Tabela<"grupos"> }) {
  return (
    <Formulario acao={salvarGrupo} textoBotao="Salvar GP">
      {grupo && <input type="hidden" name="$id" value={grupo.id} />}
      <Campo rotulo="Código" nome="codigo" valor={grupo?.codigo} obrigatorio dica="Ex.: GP1" max={6} />
      <Campo rotulo="Razão social" nome="razao_social" valor={grupo?.razao_social} obrigatorio />
      <Campo rotulo="CNPJ" nome="cnpj" valor={grupo ? formatarCnpj(grupo.cnpj) : ""} obrigatorio modo="numeric" />
      <Interruptor rotulo="Ativo" nome="ativo" marcado={grupo?.ativo ?? true} />
    </Formulario>
  );
}
