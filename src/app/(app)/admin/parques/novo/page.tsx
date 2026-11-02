import { Cabecalho } from "@/componentes/pagina";
import { FormularioParque } from "../formulario";

export const metadata = { title: "Novo parque" };

export default function NovoParque() {
  return (
    <>
      <Cabecalho titulo="Novo parque" voltar="/admin/parques" />
      <FormularioParque />
    </>
  );
}
