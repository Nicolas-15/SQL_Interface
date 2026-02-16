import {
  RegularizarRepository,
  DecretoDB,
  DecretoHistoricoDB,
} from "../repositories/regularizar.repository";

export class RegularizarService {
  private repo = new RegularizarRepository();

  async buscarDecretos(anio: number, numero: number): Promise<DecretoDB[]> {
    return this.repo.findDecretos(anio, numero);
  }

  async liberarDecreto(anio: number, numero: number): Promise<boolean> {
    return this.repo.liberarDecreto(anio, numero);
  }

  async regularizarDecreto(anio: number, numero: number): Promise<boolean> {
    return this.repo.regularizarDecreto(anio, numero);
  }

  async buscarDecretoHistorico(anio: number, numero: number) {
    return this.repo.findDecretoHistorico(anio, numero);
  }

  async buscarDecretosLiberados(
    anio: number,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ decretos: DecretoDB[]; total: number }> {
    return this.repo.findDecretosLiberados(anio, page, pageSize);
  }
}
