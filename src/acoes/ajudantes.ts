"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { exigirUsuario } from "@/lib/auth";
import { dadosDoFormulario, erroDoBanco, type Estado } from "@/lib/formulario";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaAjudante, esquemaAjudanteAdmin, mensagemDeErro } from "@/lib/validacao/esquemas";

/**
 * Cadastro de ajudante. Coordenador: o banco força "pendente" e vincula ao próprio coordenador.
 * Admin: escolhe coordenador e situação.
 */
export async function cadastrarAjudante(_: Estado, fd: FormData): Promise<Estado> {
  const usuario = await exigirUsuario("admin", "coordenador");
  const form = dadosDoFormulario(fd);
  const dados = esquemaAjudante.safeParse(form);
  if (!dados.success) return { erro: mensagemDeErro(dados.error) };

  let extras: { coordenador_id: string; situacao: "pendente" | "ativo" | "inativo" } = {
    coordenador_id: usuario.id,
    situacao: "pendente",
  };
  if (usuario.papel === "admin") {
    const adm = esquemaAjudanteAdmin.safeParse(form);
    if (!adm.success) return { erro: mensagemDeErro(adm.error) };
    extras = adm.data;
  }

  const supabase = await criarClienteServidor();
  const { data: ajudante, error } = await supabase
    .from("ajudantes")
    .insert({ nome: dados.data.nome, telefone: dados.data.telefone, ...extras })
    .select("id")
    .single();
  if (error || !ajudante) return { erro: erroDoBanco(error) };

  if (dados.data.tipo_chave_pix && dados.data.chave_pix) {
    const { error: erroPix } = await supabase.from("dados_bancarios").insert({
      ajudante_id: ajudante.id,
      cpf: dados.data.cpf,
      tipo_chave_pix: dados.data.tipo_chave_pix,
      chave_pix: dados.data.chave_pix,
    });
    if (erroPix) return { erro: `Ajudante cadastrado, mas o Pix não foi salvo: ${erroDoBanco(erroPix)}` };
  }

  if (usuario.papel === "admin") {
    revalidatePath("/admin/ajudantes");
    redirect("/admin/ajudantes?ok=salvo");
  }
  revalidatePath("/equipe");
  redirect("/equipe?ok=pendente");
}

/** Admin edita ajudante e dados de pagamento. */
export async function editarAjudante(_: Estado, fd: FormData): Promise<Estado> {
  await exigirUsuario("admin");
  const ajudanteId = z.uuid().safeParse(fd.get("$id"));
  if (!ajudanteId.success) return { erro: "Ajudante inválido." };
  const form = dadosDoFormulario(fd);
  const dados = esquemaAjudante.safeParse(form);
  const adm = esquemaAjudanteAdmin.safeParse(form);
  if (!dados.success) return { erro: mensagemDeErro(dados.error) };
  if (!adm.success) return { erro: mensagemDeErro(adm.error) };

  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("ajudantes")
    .update({ nome: dados.data.nome, telefone: dados.data.telefone, ...adm.data })
    .eq("id", ajudanteId.data);
  if (error) return { erro: erroDoBanco(error) };

  if (dados.data.tipo_chave_pix && dados.data.chave_pix) {
    const { error: erroPix } = await supabase.from("dados_bancarios").upsert(
      {
        ajudante_id: ajudanteId.data,
        cpf: dados.data.cpf,
        tipo_chave_pix: dados.data.tipo_chave_pix,
        chave_pix: dados.data.chave_pix,
      },
      { onConflict: "ajudante_id" },
    );
    if (erroPix) return { erro: erroDoBanco(erroPix) };
  }

  revalidatePath("/admin/ajudantes");
  return { mensagem: "Salvo." };
}

/** Botão rápido "Validar" da lista de pendentes. */
export async function validarAjudante(fd: FormData) {
  await exigirUsuario("admin");
  const ajudanteId = z.uuid().parse(fd.get("id"));
  const supabase = await criarClienteServidor();
  await supabase.from("ajudantes").update({ situacao: "ativo" }).eq("id", ajudanteId);
  revalidatePath("/admin/ajudantes");
  revalidatePath("/inicio");
}
