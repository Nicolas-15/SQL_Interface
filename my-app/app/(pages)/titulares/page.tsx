import { TitularService } from "@/app/services/titular.service";
import TitularesTable from "./titularesTable";
import { getSessionUserAction } from "@/app/lib/action/auth/session.action";
import { tieneAcceso } from "@/app/lib/utils/roles.config";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getSessionUserAction();

  if (!session) {
    redirect("/login");
  }

  // Defensa SSR: Solo roles permitidos según roles.config.ts pueden ver esto
  if (!tieneAcceso(session.nombre_rol, "/titulares")) {
    redirect("/");
  }

  const service = new TitularService();
  const titulares = await service.listarTitulares();

  return (
    <div className="p-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-black">
        Lista de Titulares Firmantes DPW
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Listado de titulares activos de firmates para la plataforma Decreto Pago
        Web
      </p>
      <TitularesTable titulares={titulares} />
    </div>
  );
}
