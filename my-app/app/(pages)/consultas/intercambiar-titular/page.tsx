import { FirmanteRepository } from "@/app/repositories/firmante.repository";
import IntercambiarTitularPage from "./IntercambiarTitularPage";
import { protectPage } from "@/app/lib/utils/auth-server";

export default async function Page() {
  await protectPage("/consultas/intercambiar-titular");
  const repo = new FirmanteRepository();
  const titular = await repo.findTitularActual();

  return <IntercambiarTitularPage titular={titular} />;
}
