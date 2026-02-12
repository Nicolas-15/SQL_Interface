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

  /*Creacion de titular con validacion*/
  async crearTitular(data: CrearTitularDB): Promise<TitularDB> {
    const actual = await this.titularRepo.findTitularByRol(data.id_rol);
    if (actual) throw new Error("YA_EXISTE_TITULAR");

    return this.titularRepo.createTitular(data);
  }

  /*Cambio de titular entre administrador y alcalde */
  async cambiarTitular(data: CrearTitularDB): Promise<TitularDB> {
    return this.titularRepo.changeTitular(data);
  }

  /*Eliminar titular por rol*/
  async eliminarTitularPorRol(id_rol: string): Promise<void> {
    return this.titularRepo.deleteByRol(id_rol);
  }
}
