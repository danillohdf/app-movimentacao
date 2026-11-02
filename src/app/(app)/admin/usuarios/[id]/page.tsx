import { notFound } from "next/navigation";
import { editarUsuario } from "@/acoes/usuarios";
import { Campo, Interruptor } from "@/componentes/campos";
import { BotaoCopiar } from "@/componentes/copiar";
import { Formulario } from "@/componentes/formulario";
import { Aviso, Cabecalho } from "@/componentes/pagina";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { formatarTelefone } from "@/lib/validacao/documentos";
import { CamposPapel } from "../campos-papel";

export const metadata = { title: "Usuário" };

export default async function EditarUsuario({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string }>;
}) {
  const [{ id }, { ok }] = await Promise.all([params, searchParams]);
  const supabase = await criarClienteServidor();
  const { data: usuario } = await supabase.from("usuarios").select("*").eq("id", id).maybeSingle();
  if (!usuario) notFound();

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const convite =
    `Olá, ${usuario.nome.split(" ")[0]}! Seu acesso ao app de Movimentação está pronto.\n\n` +
    `1. Abra ${site || "o link do app"}\n` +
    `2. Digite o e-mail ${usuario.email}\n` +
    `3. Digite o código de 6 números que chegar no seu e-mail\n\n` +
    `Dica: no celular, use "Adicionar à tela inicial" para abrir como aplicativo.`;

  return (
    <>
      <Cabecalho titulo={usuario.nome} voltar="/admin/usuarios" />
      <Aviso ok={ok} />
      <div className="cartao flex flex-col gap-3">
        <p className="text-sm text-slate-500">E-mail de acesso</p>
        <p className="font-semibold break-all">{usuario.email}</p>
        <BotaoCopiar texto={convite} rotulo="Copiar mensagem de convite (WhatsApp)" />
      </div>
      <Formulario acao={editarUsuario} textoBotao="Salvar">
        <input type="hidden" name="$id" value={usuario.id} />
        <Campo rotulo="Nome" nome="nome" valor={usuario.nome} obrigatorio />
        <Campo rotulo="Telefone (WhatsApp)" nome="telefone" valor={formatarTelefone(usuario.telefone)} tipo="tel" modo="tel" />
        <CamposPapel papel={usuario.papel} coordenadorId={usuario.coordenador_id} />
        <Interruptor rotulo="Acesso ativo (desmarque para bloquear na hora)" nome="ativo" marcado={usuario.ativo} />
      </Formulario>
    </>
  );
}
