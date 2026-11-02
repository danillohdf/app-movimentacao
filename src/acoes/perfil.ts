"use server";

import { revalidatePath } from "next/cache";
import { exigirUsuario } from "@/lib/auth";
import { dadosDoFormulario, erroDoBanco, type Estado } from "@/lib/formulario";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaPerfil, mensagemDeErro } from "@/lib/validacao/esquemas";

export async function salvarPerfil(_: Estado, fd: FormData): Promise<Estado> {
  const usuario = await exigirUsuario();
  const dados = esquemaPerfil.safeParse(dadosDoFormulario(fd));
  if (!dados.success) return { erro: mensagemDeErro(dados.error) };

  const supabase = await criarClienteServidor();
  // Só nome e telefone: papel, e-mail e ativo nunca vêm do formulário.
  const { error } = await supabase
    .from("usuarios")
    .update({ nome: dados.data.nome, telefone: dados.data.telefone })
    .eq("id", usuario.id);
  if (error) return { erro: erroDoBanco(error) };

  revalidatePath("/", "layout");
  return { mensagem: "Dados atualizados." };
}
