import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./tipos";

/**
 * Cliente com a chave SECRETA: ignora o RLS. Usar só no servidor, só depois de confirmar que
 * quem pediu é admin, e só para o que o RLS não cobre (criar e bloquear logins).
 */
export function criarClienteAdmin() {
  const chave = process.env.SUPABASE_SECRET_KEY;
  if (!chave) {
    throw new Error("SUPABASE_SECRET_KEY não configurada no servidor.");
  }
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, chave, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
