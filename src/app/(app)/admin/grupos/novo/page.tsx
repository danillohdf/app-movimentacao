import { Cabecalho } from "@/componentes/pagina";
import { FormularioGrupo } from "../formulario";

export const metadata = { title: "Novo GP" };

export default function NovoGrupo() {
  return (
    <>
      <Cabecalho titulo="Novo GP" voltar="/admin/grupos" />
      <FormularioGrupo />
    </>
  );
}
