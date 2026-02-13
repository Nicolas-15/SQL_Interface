// app/(pages)/consultas/intercambiar-titular/page.tsx

import { TitularRepository } from "@/app/repositories/titular.repository";
import IntercambiarTitularPage from "./IntercambiarTitularPage";

export default async function Page() {
  const repo = new TitularRepository();
  const titulares = await repo.findAll();

  return <IntercambiarTitularPage titulares={titulares} />;
}
