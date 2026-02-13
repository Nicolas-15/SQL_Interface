import { FirmanteRepository } from "@/app/repositories/firmante.repository";
import IntercambiarTitularPage from "./IntercambiarTitularPage";

export default async function Page() {
  const repo = new FirmanteRepository();
  const titular = await repo.findTitularActual();

  return <IntercambiarTitularPage titular={titular} />;
}
