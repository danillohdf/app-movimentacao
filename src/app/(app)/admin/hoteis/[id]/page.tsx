import { notFound } from "next/navigation";
import { Cabecalho } from "@/componentes/pagina";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FormularioHotel } from "../formulario";

export const metadata = { title: "Editar hotel" };

export default async function EditarHotel({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await criarClienteServidor();
  const { data: hotel } = await supabase.from("hoteis").select("*").eq("id", id).maybeSingle();
  if (!hotel) notFound();
  return (
    <>
      <Cabecalho titulo={hotel.nome} voltar="/admin/hoteis" />
      <FormularioHotel hotel={hotel} />
    </>
  );
}
