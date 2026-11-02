import { convidarUsuario } from "@/acoes/usuarios";
import { Campo } from "@/componentes/campos";
import { Formulario } from "@/componentes/formulario";
import { Cabecalho } from "@/componentes/pagina";
import { CamposPapel } from "../campos-papel";

export const metadata = { title: "Convidar usuário" };

export default function NovoUsuario() {
  return (
    <>
      <Cabecalho titulo="Convidar usuário" voltar="/admin/usuarios" />
      <p className="text-sm text-slate-600">
        A pessoa entra no app com este e-mail e recebe um código de 6 números a cada acesso. Ninguém consegue criar conta sozinho.
      </p>
      <Formulario acao={convidarUsuario} textoBotao="Cadastrar acesso">
        <Campo rotulo="Nome" nome="nome" obrigatorio />
        <Campo rotulo="E-mail" nome="email" tipo="email" modo="email" obrigatorio />
        <Campo rotulo="Telefone (WhatsApp)" nome="telefone" tipo="tel" modo="tel" />
        <CamposPapel />
      </Formulario>
    </>
  );
}
