import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "./supabase/servidor";
import type { Papel } from "./supabase/tipos";

export type UsuarioAtual = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  papel: Papel;
  coordenador_id: string | null;
};

/** Usuário logado e ATIVO (uma vez por requisição). null se não tiver acesso. */
export const usuarioAtual = cache(async (): Promise<UsuarioAtual | null> => {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) return null;

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("id, nome, email, telefone, papel, coordenador_id, ativo")
    .eq("id", id)
    .maybeSingle();

  if (!usuario || !usuario.ativo) return null;
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    telefone: usuario.telefone,
    papel: usuario.papel,
    coordenador_id: usuario.coordenador_id,
  };
});

/** Exige login (e, opcionalmente, um dos papéis). Redireciona quem não pode. */
export async function exigirUsuario(...papeis: Papel[]): Promise<UsuarioAtual> {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/entrar?motivo=sem-acesso");
  if (papeis.length > 0 && !papeis.includes(usuario.papel)) redirect("/inicio");
  return usuario;
}
