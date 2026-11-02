import { exigirUsuario } from "@/lib/auth";

export default async function LayoutEquipe({ children }: { children: React.ReactNode }) {
  await exigirUsuario("coordenador");
  return children;
}
