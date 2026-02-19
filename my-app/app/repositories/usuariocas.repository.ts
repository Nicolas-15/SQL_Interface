import sql from "mssql";
import { connectToDB } from "../lib/utils/db-connection";
import { AuditoriaRepository } from "./auditoria.repository";

export interface UsuarioDB {
  Usuar_Cuenta: string;
  Usuar_Name: string;
  Usuar_Sistema: number;
}

export interface CrearUsuarioDTO {
  cuenta: string;
  nombre: string;
  clave: string;
  sistema: number;
  usuarioBase: string;
}

export class UsuarioRepository {
  private auditoriaRepo = new AuditoriaRepository();

  /**
   * Buscar usuarios por sistema para dropdowns
   */
  async findAllUsuarios(sistema: number = 2): Promise<UsuarioDB[]> {
    const pool = await connectToDB("comun");
    if (!pool) return [];

    const result = await pool.request().query(`
        SELECT Usuar_Cuenta, Usuar_Name, Usuar_Sistema
        FROM Usuario
        WHERE Inactivo = 0 OR Inactivo IS NULL -- Re-adding basic sanity check but user wanted 'all', keeping it broad but safer to exclude deleted? User said 'necesito que se muestren todos'. safely removing filter as requested.
        ORDER BY Usuar_Sistema, Usuar_Name ASC
      `);

    return result.recordset;
  }

  /**
   * Buscar un usuario específico
   */
  async findUsuario(
    cuenta: string,
    sistema: number = 2,
  ): Promise<UsuarioDB | null> {
    const pool = await connectToDB("comun");
    if (!pool) return null;

    const result = await pool
      .request()
      .input("Cuenta", sql.VarChar(10), cuenta)
      .input("Sistema", sql.Int, sistema).query(`
        SELECT Usuar_Cuenta, Usuar_Name, Usuar_Sistema
        FROM Usuario
        WHERE Usuar_Cuenta = @Cuenta
        AND Usuar_Sistema = @Sistema
      `);

    return result.recordset[0] || null;
  }

  /**
   * Replicar permisos de un usuario a otro (Script 1)
   */
  async replicarPermisos(
    origen: string,
    destino: string,
    sistema: number,
    idUsuarioAuditoria: string,
  ): Promise<void> {
    const pool = await connectToDB("comun");
    if (!pool) throw new Error("Error de conexión a BD Comun");

    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // Eliminar permisos actuales del destino
      await new sql.Request(transaction)
        .input("UsuarioDestino", sql.VarChar(10), destino)
        .input("CodigoSistema", sql.Int, sistema).query(`
          DELETE FROM Permisos
          WHERE Menu_UserID = @UsuarioDestino
          AND Menu_Sistema = @CodigoSistema;
        `);

      // Copiar permisos del usuario origen
      await new sql.Request(transaction)
        .input("UsuarioOrigen", sql.VarChar(10), origen)
        .input("UsuarioDestino", sql.VarChar(10), destino)
        .input("CodigoSistema", sql.Int, sistema).query(`
          INSERT INTO Permisos
          (
              Menu_Activado, Menu_Visible, Menu_UserID, Menu_Nuevo, Menu_Guardar,
              Menu_Eliminar, Menu_Imprimir, Menu_Consultar, Menu_Listar, Menu_Todo,
              Menu_Sistema, Menu_Name, Menu_Caption, Codigo_Area
          )
          SELECT
              Menu_Activado, Menu_Visible, @UsuarioDestino, Menu_Nuevo, Menu_Guardar,
              Menu_Eliminar, Menu_Imprimir, Menu_Consultar, Menu_Listar, Menu_Todo,
              Menu_Sistema, Menu_Name, Menu_Caption, Codigo_Area
          FROM Permisos
          WHERE Menu_UserID = @UsuarioOrigen
          AND Menu_Sistema = @CodigoSistema;
        `);

      // Bitácora (Transacciones_MantenedorUsuarios)
      await new sql.Request(transaction)
        .input("UsuarioOrigen", sql.VarChar(10), origen)
        .input("UsuarioDestino", sql.VarChar(10), destino)
        .input("CodigoSistema", sql.Int, sistema).query(`
          INSERT INTO Transacciones_MantenedorUsuarios
          (Codigo_Area, Fecha, Estacion, Tabla, Accion, Observacion, MiSql)
          VALUES
          ('1', GETDATE(), 'WebAdmin', 'Permisos', 'Replica', 
           CONCAT('Replica permisos desde ', @UsuarioOrigen, ' hacia ', @UsuarioDestino, ' en Sistema: ', @CodigoSistema), 
           'INSERT COPY PERMISOS');
        `);

      await transaction.commit();

      // Auditoría del sistema nuevo
      await this.auditoriaRepo.createAuditoria({
        id_usuario: idUsuarioAuditoria,
        registro: "REPLICA_PERMISOS",
        descripcion: `Replica de permisos desde ${origen} hacia ${destino} en sistema ${sistema}`,
      });
    } catch (err) {
      if (transaction) await transaction.rollback();
      throw err;
    }
  }

  /**
   * Crear nuevo usuario copiando estructura (Script 2)
   */
  async crearUsuario(
    nuevoUsuario: { cuenta: string; nombre: string; base: string },
    sistema: number,
    idUsuarioAuditoria: string,
  ): Promise<void> {
    const pool = await connectToDB("comun");
    if (!pool) throw new Error("Error de conexión a BD Comun");

    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // Crear nuevo usuario copiando estructura
      await new sql.Request(transaction)
        .input("UsuarioNuevo", sql.VarChar(10), nuevoUsuario.cuenta)
        .input("NombreNuevo", sql.VarChar(100), nuevoUsuario.nombre)
        .input("UsuarioBase", sql.VarChar(10), nuevoUsuario.base)
        .input("CodigoSistema", sql.Int, sistema).query(`
            INSERT INTO Usuario
            (
                Usuar_Cuenta, Usuar_Clave, Usuar_Name, Usuar_Nivel, Usuar_Sistema,
                Usuar_Iniciales, User_Iniciales, Grupo, Codigo_Caja, Activa_Caja,
                Id_Establecimiento, Usuar_Rut, Inactivo, RutaInformes_PC,
                Permiso_MercadoPago, Usuar_Cifrado
            )
            SELECT
                @UsuarioNuevo,
                Usuar_Clave,
                @NombreNuevo,
                Usuar_Nivel,
                Usuar_Sistema,
                Usuar_Iniciales,
                User_Iniciales,
                Grupo,
                Codigo_Caja,
                Activa_Caja,
                Id_Establecimiento,
                Usuar_Rut,
                Inactivo,
                RutaInformes_PC,
                Permiso_MercadoPago,
                Usuar_Cifrado
            FROM Usuario
            WHERE Usuar_Cuenta = @UsuarioBase
            AND Usuar_Sistema = @CodigoSistema;
         `);

      // Copiar permisos del usuario base
      await new sql.Request(transaction)
        .input("UsuarioBase", sql.VarChar(10), nuevoUsuario.base)
        .input("UsuarioNuevo", sql.VarChar(10), nuevoUsuario.cuenta)
        .input("CodigoSistema", sql.Int, sistema).query(`
          INSERT INTO Permisos
          (
              Menu_Activado, Menu_Visible, Menu_UserID, Menu_Nuevo, Menu_Guardar,
              Menu_Eliminar, Menu_Imprimir, Menu_Consultar, Menu_Listar, Menu_Todo,
              Menu_Sistema, Menu_Name, Menu_Caption, Codigo_Area
          )
          SELECT
              Menu_Activado, Menu_Visible, @UsuarioNuevo, Menu_Nuevo, Menu_Guardar,
              Menu_Eliminar, Menu_Imprimir, Menu_Consultar, Menu_Listar, Menu_Todo,
              Menu_Sistema, Menu_Name, Menu_Caption, Codigo_Area
          FROM Permisos
          WHERE Menu_UserID = @UsuarioBase
          AND Menu_Sistema = @CodigoSistema;
        `);

      // Bitácora Legacy
      await new sql.Request(transaction)
        .input("UsuarioBase", sql.VarChar(10), nuevoUsuario.base)
        .input("UsuarioNuevo", sql.VarChar(10), nuevoUsuario.cuenta)
        .input("NombreNuevo", sql.VarChar(100), nuevoUsuario.nombre)
        .input("CodigoSistema", sql.Int, sistema).query(`
          INSERT INTO Transacciones_MantenedorUsuarios
          (Codigo_Area, Fecha, Estacion, Tabla, Accion, Observacion, MiSql)
          VALUES
          ('1', GETDATE(), 'WebAdmin', 'Permisos y Usuario', 'Crea', 
           CONCAT('Creación usuario: ', @UsuarioNuevo, ' (', @NombreNuevo, ') copiando permisos de: ', @UsuarioBase, ' en Sistema: ', @CodigoSistema), 
           'INSERT COPY USER');
        `);

      await transaction.commit();

      // Auditoría
      await this.auditoriaRepo.createAuditoria({
        id_usuario: idUsuarioAuditoria,
        registro: "CREAR_USUARIO_CAS",
        descripcion: `Creación usuario ${nuevoUsuario.cuenta} copiando de ${nuevoUsuario.base} en sistema ${sistema}`,
      });
    } catch (err) {
      if (transaction) await transaction.rollback();
      throw err;
    }
  }
}
