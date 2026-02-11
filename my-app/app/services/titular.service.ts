import {
  TitularRepository,
  CrearTitularDB,
  TitularDB,
} from "../repositories/titular.repository";

export class TitularService {
  private titularRepo = new TitularRepository();

  async listarTitulares(): Promise<TitularDB[]> {
    return this.titularRepo.findAll();
  }

  async getTitularByRol(id_rol: string): Promise<TitularDB | null> {
    return this.titularRepo.findTitularByRol(id_rol);
  }

  async crearTitular(data: CrearTitularDB): Promise<TitularDB> {
    const actual = await this.titularRepo.findTitularByRol(data.id_rol);
    if (actual) throw new Error("YA_EXISTE_TITULAR");

    return this.titularRepo.createTitular(data);
  }

  async cambiarTitular(data: CrearTitularDB): Promise<TitularDB> {
    return this.titularRepo.changeTitular(data);
  }

  async eliminarTitularPorRol(id_rol: string): Promise<void> {
    return this.titularRepo.deleteByRol(id_rol);
  }
}
