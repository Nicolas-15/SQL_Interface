import { TitularService } from "@/app/services/titular.service";
import TitularesTable from "./titularesTable";
import { protectPage } from "@/app/lib/utils/auth-server";

export default async function Page() {
  await protectPage("/titulares");

  const service = new TitularService();
  const titulares = await service.listarTitulares();

  return (
    <div className="py-6 md:py-10">
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
