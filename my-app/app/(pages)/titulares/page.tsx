import { TitularService } from "@/app/services/titular.service";
import TitularesTable from "./titularesTable";

export default async function Page() {
  const service = new TitularService();
  const titulares = await service.listarTitulares();

  return (
    <div className="p-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-black">
        Lista de Titulares
      </h1>
      <p className="text-center text-gray-600 mb-6">
        En esta sección se muestran los titulares asociados, con opciones para
        editar sus datos.
      </p>
      <TitularesTable titulares={titulares} />
    </div>
  );
}
