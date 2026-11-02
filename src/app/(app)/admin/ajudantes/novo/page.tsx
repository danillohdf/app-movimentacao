import { cadastrarAjudante } from "@/acoes/ajudantes";
import { CamposAjudante } from "@/componentes/campos-ajudante";
import { Formulario } from "@/componentes/formulario";
import { Cabecalho } from "@/componentes/pagina";
import { CamposAdminAjudante } from "../campos-admin";

export const metadata = { title: "Novo ajudante" };

export default function NovoAjudanteAdmin() {
  return (
    <>
      <Cabecalho titulo="Novo ajudante" voltar="/admin/ajudantes" />
      <Formulario acao={cadastrarAjudante} textoBotao="Cadastrar">
        <CamposAdminAjudante />
        <CamposAjudante />
      </Formulario>
    </>
  );
}
