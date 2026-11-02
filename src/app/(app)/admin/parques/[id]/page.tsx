import { notFound } from "next/navigation";
import { Cabecalho } from "@/componentes/pagina";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FormularioParque } from "../formulario";

export const metadata = { title: "Editar parque" };

export default async function EditarParque({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await criarClienteServidor();
  const { data: parque } = await supabase.from("parques").select("*").eq("id", id).maybeSingle();
  if (!parque) notFound();
  return (
    <>
      <Cabecalho titulo={parque.nome} voltar="/admin/parques" />
      <FormularioParque parque={parque} />
    </>
  );
}
