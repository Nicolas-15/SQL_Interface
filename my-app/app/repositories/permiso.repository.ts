import { connectToDB } from "@/app/lib/utils/db-connection";

export type ReporteTransparenciaDB = {
  Comuna: string;
  Placa: string;
  Digito: string;
  Correlativo_Caja: number;
  numero_boletin: number;
  Forma_de_Pago: string;
  Papel_o_Electronico: string;
  Codigo_SII: string;
  Año_Fabricacion: number;
  Tasacion: number;
  Numero_Factura: string;
  Neto_Factura: number;
  Rut: string;
  Contribuyente: string;
  Direccion: string;
  Telefono: string;
  Telefono_Movil: string;
  Mail: string;
  Municipalidad: string;
  Comuna_Anterior: string;
  Codigo_Comuna_Ant: number;
  Fecha_Pago: Date | string;
  Fecha_Vencimiento: Date | string;
  Total_a_Pagar: number;
  Valor_IPC: number;
  Valor_Multa: number;
  Valor_Contado: number;
  Año_del_Permiso: number;
  Descripcion: string;
  Marca: string;
  Modelo: string;
  Cilindrada: string;
  Combustible: string;
  Transmision: string;
  Equipamiento: string;
  Color: string;
  Numero_Asientos: number;
  Numero_Chasis: string;
  Numero_Chassis: string;
  Numero_Motor: string;
};

export class PermisoRepository {
  async obtenerReporteTransparencia(
    fechaInicio: string,
    fechaFin: string,
  ): Promise<ReporteTransparenciaDB[]> {
    const db = await connectToDB("permiso");
    if (!db) throw new Error("Database connection failed");

    const query = `
      SELECT     
        'El Quisco' as Comuna,
        p.Placa, 
        p.Digito, 
        p.Correlativo_Caja, 
        p.numero_boletin,
        CASE
          WHEN p.Forma_de_Pago = 0 THEN 'TOTAL'
          WHEN p.Forma_de_Pago = 1 THEN '1era Cuota'
          WHEN p.Forma_de_Pago = 2 THEN '2da Cuota'
          ELSE 'Sin Info'
        END AS Forma_de_Pago,
        CASE 
          WHEN p.Numero_Caja <> '998' THEN 'PAPEL'
          WHEN p.Numero_Caja = '998' THEN 'ELECTRONICO'
        END AS Papel_o_Electronico,
        dv.Codigo_SII, 
        dv.Año_Fabricacion, 
        p.Tasacion, 
        dv.Numero_Factura, 
        dv.Neto_Factura,
        dv.Rut, 
        pr.Nombre AS Contribuyente, 
        pr.Direccion, 
        pr.Telefono, 
        pr.Telefono_Movil, 
        pr.Mail, 
        pr.Comuna AS Comuna_Propietario, 
        p.Municipalidad, 
        (SELECT c.Descripcion FROM DBO.Comunas c WHERE c.Codigo = p.Comuna_Anterior) AS Comuna_Anterior,
        p.Comuna_Anterior as Codigo_Comuna_Ant,
        p.Fecha_Pago, 
        p.Fecha_Vencimiento, 
        p.Total_a_Pagar, 
        p.Valor_IPC, 
        p.Valor_Multa,
        p.Valor_Contado, 
        p.Año_del_Permiso, 
        tv.Descripcion, 
        m.Descripcion AS Marca, 
        dv.Modelo, 
        dv.Cilindrada, 
        dv.Combustible, 
        dv.Transmision, 
        dv.Equipamiento, 
        dv.Color, 
        dv.Numero_Asientos, 
        dv.Numero_Chasis,
        dv.Numero_Chassis, 
        dv.Numero_Motor
      FROM         
        Permisos_de_Circulacion p 
        INNER JOIN Datos_del_Vehiculo dv ON p.Placa = dv.Placa 
        INNER JOIN Tipos_de_Vehiculos tv ON p.Tipo_Vehiculo = tv.Codigo AND dv.Tipo_Vehiculo = tv.Codigo 
        INNER JOIN Marcas m ON dv.Codigo_Marca = m.Codigo 
        INNER JOIN Propietarios pr ON dv.Rut = pr.Rut
      WHERE     
        (p.Fecha_Pago BETWEEN @FechaInicio AND @FechaFin)
      ORDER BY 
        p.Fecha_Pago
    `;

    const result = await db
      .request()
      .input("FechaInicio", fechaInicio)
      .input("FechaFin", fechaFin)
      .query(query);

    return result.recordset as ReporteTransparenciaDB[];
  }

  async obtenerRangoFechas(): Promise<{
    MinFecha: Date | null;
    MaxFecha: Date | null;
  }> {
    const db = await connectToDB("permiso");
    if (!db) throw new Error("Database connection failed");

    const query = `
      SELECT 
        MIN(Fecha_Pago) as MinFecha, 
        MAX(Fecha_Pago) as MaxFecha 
      FROM Permisos_de_Circulacion
    `;
    const result = await db.request().query(query);
    return result.recordset[0];
  }

  async testConnection() {
    const db = await connectToDB("permiso");
    if (!db) throw new Error("Database connection failed");
    const result = await db.request().query("SELECT GETDATE() as CurrentTime");
    return result.recordset[0];
  }
}
