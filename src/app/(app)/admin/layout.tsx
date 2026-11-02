import { exigirUsuario } from "@/lib/auth";

// Toda a área /admin exige papel admin (as ações e o RLS também conferem).
export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  await exigirUsuario("admin");
  return children;
}
