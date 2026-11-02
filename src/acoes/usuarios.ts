"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { exigirUsuario } from "@/lib/auth";
import { dadosDoFormulario, erroDoBanco, type Estado } from "@/lib/formulario";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaConvite, esquemaUsuarioAdmin, mensagemDeErro } from "@/lib/validacao/esquemas";

const BLOQUEIO = "876000h"; // ~100 anos: login bloqueado até o admin reativar

/** Admin cadastra uma pessoa. Ela entra no app com o próprio e-mail (código de 6 dígitos). */
export async function convidarUsuario(_: Estado, fd: FormData): Promise<Estado> {
  const admin = await exigirUsuario("admin");
  const dados = esquemaConvite.safeParse(dadosDoFormulario(fd));
  if (!dados.success) return { erro: mensagemDeErro(dados.error) };
  const { email, nome, telefone, papel, coordenador_id } = dados.data;

  let supabaseAdmin;
  try {
    supabaseAdmin = criarClienteAdmin();
  } catch {
    return { erro: "O servidor ainda não tem a chave secreta do Supabase configurada." };
  }

  const { data: criado, error: erroAuth } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (erroAuth || !criado.user) {
    const jaExiste = erroAuth?.code === "email_exists" || erroAuth?.status === 422;
    return { erro: jaExiste ? "Já existe um acesso com esse e-mail." : "Não foi possível cadastrar o acesso." };
  }

  const { error } = await supabaseAdmin.from("usuarios").insert({
    id: criado.user.id,
    nome,
    email,
    telefone,
    papel,
    coordenador_id: papel === "montador" ? coordenador_id : null,
    criado_por: admin.id,
  });
  if (error) {
    await supabaseAdmin.auth.admin.deleteUser(criado.user.id); // desfaz o login criado
    return { erro: erroDoBanco(error) };
  }

  revalidatePath("/admin/usuarios");
  redirect(`/admin/usuarios/${criado.user.id}?ok=convidado`);
}

export async function editarUsuario(_: Estado, fd: FormData): Promise<Estado> {
  const admin = await exigirUsuario("admin");
  const usuarioId = z.uuid().safeParse(fd.get("$id"));
  if (!usuarioId.success) return { erro: "Usuário inválido." };
  const dados = esquemaUsuarioAdmin.safeParse(dadosDoFormulario(fd));
  if (!dados.success) return { erro: mensagemDeErro(dados.error) };

  if (usuarioId.data === admin.id && (!dados.data.ativo || dados.data.papel !== "admin")) {
    return { erro: "Você não pode tirar o seu próprio acesso de admin." };
  }

  const supabase = await criarClienteServidor();
  const { data: antes } = await supabase.from("usuarios").select("ativo").eq("id", usuarioId.data).single();

  const { papel, coordenador_id, ...resto } = dados.data;
  const { error } = await supabase
    .from("usuarios")
    .update({ ...resto, papel, coordenador_id: papel === "montador" ? coordenador_id : null })
    .eq("id", usuarioId.data);
  if (error) return { erro: erroDoBanco(error) };

  // Bloqueia/libera também o login, além do bloqueio no banco (RLS só aceita usuário ativo).
  if (antes && antes.ativo !== dados.data.ativo) {
    try {
      await criarClienteAdmin().auth.admin.updateUserById(usuarioId.data, {
        ban_duration: dados.data.ativo ? "none" : BLOQUEIO,
      });
    } catch {
      return { mensagem: "Salvo. Atenção: o login não foi bloqueado (chave secreta ausente), mas o acesso aos dados já foi cortado." };
    }
  }

  revalidatePath("/admin/usuarios");
  return { mensagem: "Salvo." };
}
