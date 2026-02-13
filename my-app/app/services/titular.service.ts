import {
  TitularRepository,
  CrearTitularDB,
  TitularDB,
} from "../repositories/titular.repository";

export class TitularService {
  private titularRepo = new TitularRepository();

  /*Listar todos los titulares*/
  async listarTitulares(): Promise<TitularDB[]> {
    return this.titularRepo.findAll();
  }

  /*Obtener titular por rol*/
  async getTitularByRol(id_rol: string): Promise<TitularDB | null> {
    return this.titularRepo.findTitularByRol(id_rol);
  }

  /*Cambio de titular entre administrador y alcalde */
  async cambiarTitular(data: CrearTitularDB): Promise<TitularDB> {
    return this.titularRepo.changeTitular(data);
  }
}
