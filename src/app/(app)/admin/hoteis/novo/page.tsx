import { Cabecalho } from "@/componentes/pagina";
import { FormularioHotel } from "../formulario";

export const metadata = { title: "Novo hotel" };

export default function NovoHotel() {
  return (
    <>
      <Cabecalho titulo="Novo hotel" voltar="/admin/hoteis" />
      <FormularioHotel />
    </>
  );
}
