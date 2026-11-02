import { cadastrarAjudante } from "@/acoes/ajudantes";
import { CamposAjudante } from "@/componentes/campos-ajudante";
import { Formulario } from "@/componentes/formulario";
import { Cabecalho } from "@/componentes/pagina";

export const metadata = { title: "Cadastrar ajudante" };

export default function NovoAjudante() {
  return (
    <>
      <Cabecalho titulo="Cadastrar ajudante" voltar="/equipe" />
      <p className="text-sm text-slate-600">O ajudante fica “pendente” até o admin validar. Já dá para cadastrar o Pix agora.</p>
      <Formulario acao={cadastrarAjudante} textoBotao="Cadastrar ajudante">
        <CamposAjudante />
      </Formulario>
    </>
  );
}
