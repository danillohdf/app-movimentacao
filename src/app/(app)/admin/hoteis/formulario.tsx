import { salvarHotel } from "@/acoes/cadastros";
import { Campo, Selecao, UFS } from "@/componentes/campos";
import { Formulario } from "@/componentes/formulario";
import type { Tabela } from "@/lib/supabase/tipos";
import { formatarTelefone } from "@/lib/validacao/documentos";

export function FormularioHotel({ hotel }: { hotel?: Tabela<"hoteis"> }) {
  return (
    <Formulario acao={salvarHotel} textoBotao="Salvar hotel">
      {hotel && <input type="hidden" name="$id" value={hotel.id} />}
      <Campo rotulo="Nome do hotel" nome="nome" valor={hotel?.nome} obrigatorio />
      <Campo rotulo="Endereço" nome="endereco" valor={hotel?.endereco} />
      <div className="grid grid-cols-[1fr_6rem] gap-3">
        <Campo rotulo="Cidade" nome="cidade" valor={hotel?.cidade} />
        <Selecao rotulo="UF" nome="uf" valor={hotel?.uf} vazio="—" opcoes={UFS} />
      </div>
      <Campo rotulo="Telefone" nome="telefone" valor={formatarTelefone(hotel?.telefone)} tipo="tel" modo="tel" />
    </Formulario>
  );
}
