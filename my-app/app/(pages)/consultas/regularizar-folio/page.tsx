import { protectPage } from "@/app/lib/utils/auth-server";
import RegularizarFolioPage from "./RegularizarFolioPage";

export default async function Page() {
  await protectPage("/consultas/regularizar-folio");
  return <RegularizarFolioPage />;
}
