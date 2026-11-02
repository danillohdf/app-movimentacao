import { sair } from "@/acoes/login";
import { salvarPerfil } from "@/acoes/perfil";
import { Campo } from "@/componentes/campos";
import { Formulario } from "@/componentes/formulario";
import { Cabecalho, NOME_PAPEL } from "@/componentes/pagina";
import { exigirUsuario } from "@/lib/auth";
import { formatarTelefone } from "@/lib/validacao/documentos";

export const metadata = { title: "Perfil" };

export default async function Perfil() {
  const usuario = await exigirUsuario();
  return (
    <>
      <Cabecalho titulo="Meu perfil" />
      <div className="cartao flex flex-col gap-1">
        <p className="text-sm text-slate-500">E-mail de acesso</p>
        <p className="font-semibold break-all">{usuario.email}</p>
        <p className="mt-2 text-sm text-slate-500">Papel</p>
        <p className="font-semibold">{NOME_PAPEL[usuario.papel]}</p>
      </div>
      <Formulario acao={salvarPerfil} textoBotao="Salvar">
        <Campo rotulo="Nome" nome="nome" valor={usuario.nome} obrigatorio autoComplete="name" />
        <Campo rotulo="Telefone (WhatsApp)" nome="telefone" valor={formatarTelefone(usuario.telefone)} tipo="tel" modo="tel" autoComplete="tel" />
      </Formulario>
      <form action={sair}>
        <button type="submit" className="botao-perigo w-full">
          Sair
        </button>
      </form>
    </>
  );
}
