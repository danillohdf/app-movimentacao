"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirUsuario } from "@/lib/auth";
import { dadosDoFormulario, erroDoBanco, type Estado } from "@/lib/formulario";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import {
  esquemaGrupo,
  esquemaHotel,
  esquemaParque,
  mensagemDeErro,
} from "@/lib/validacao/esquemas";
import { z } from "zod";

const id = z.uuid();

/** Salva (cria ou edita) um cadastro simples do admin, sempre com validação e RLS. */
async function salvar<T extends z.ZodType>(
  tabela: "grupos" | "parques" | "hoteis",
  esquema: T,
  fd: FormData,
  voltarPara: string,
): Promise<Estado> {
  await exigirUsuario("admin");
  const dados = esquema.safeParse(dadosDoFormulario(fd));
  if (!dados.success) return { erro: mensagemDeErro(dados.error) };

  const registroId = fd.get("$id");
  const supabase = await criarClienteServidor();
  const valores = dados.data as never;

  const { error } =
    typeof registroId === "string" && registroId
      ? await supabase.from(tabela).update(valores).eq("id", id.parse(registroId))
      : await supabase.from(tabela).insert(valores);

  if (error) return { erro: erroDoBanco(error) };
  revalidatePath(voltarPara);
  redirect(`${voltarPara}?ok=salvo`);
}

export async function salvarGrupo(_: Estado, fd: FormData) {
  return salvar("grupos", esquemaGrupo, fd, "/admin/grupos");
}

export async function salvarParque(_: Estado, fd: FormData) {
  return salvar("parques", esquemaParque, fd, "/admin/parques");
}

export async function salvarHotel(_: Estado, fd: FormData) {
  return salvar("hoteis", esquemaHotel, fd, "/admin/hoteis");
}
