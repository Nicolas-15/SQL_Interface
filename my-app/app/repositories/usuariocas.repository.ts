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
  async findAllUsuarios(
    sistema: number | null = 2,
    search: string = "",
  ): Promise<UsuarioDB[]> {
    const pool = await connectToDB("comun");
    if (!pool) return [];

    const request = pool.request();

    let queryStr = `
        SELECT TOP 20 Usuar_Cuenta, Usuar_Name, Usuar_Sistema
        FROM Usuario
        WHERE (Inactivo = 0 OR Inactivo IS NULL) 
    `;

    if (sistema !== null) {
      request.input("Sistema", sql.Int, sistema);
      queryStr += ` AND Usuar_Sistema = @Sistema `;
    }

    if (search) {
      request.input("Search", sql.VarChar(100), `%${search}%`);
      queryStr += ` AND (Usuar_Name LIKE @Search OR Usuar_Cuenta LIKE @Search) `;
    }

    queryStr += ` ORDER BY Usuar_Sistema, Usuar_Name ASC`;

    const result = await request.query(queryStr);

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
              Menu_Activado, Menu_Visible, LEFT(@UsuarioDestino, 6), Menu_Nuevo, Menu_Guardar,
              Menu_Eliminar, Menu_Imprimir, Menu_Consultar, Menu_Listar, Menu_Todo,
              Menu_Sistema, Menu_Name, Menu_Caption, Codigo_Area
          FROM Permisos
          WHERE Menu_UserID = LEFT(@UsuarioOrigen, 6)
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
           LEFT(CONCAT('Replica de ', @UsuarioOrigen, ' a ', @UsuarioDestino, ' Sis:', @CodigoSistema), 50), 
           LEFT('INSERT COPY PERMISOS', 20));
        `);

      await transaction.commit();

      // Auditoría del sistema nuevo
      await this.auditoriaRepo.createAuditoria({
        id_usuario: idUsuarioAuditoria,
        modulo: "USUARIOS_CAS",
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
                LEFT(@NombreNuevo, 50),
                Usuar_Nivel,
                Usuar_Sistema,
                Usuar_Iniciales,
                User_Iniciales,
                LEFT(Grupo, 20),
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
              Menu_Activado, Menu_Visible, LEFT(@UsuarioNuevo, 6), Menu_Nuevo, Menu_Guardar,
              Menu_Eliminar, Menu_Imprimir, Menu_Consultar, Menu_Listar, Menu_Todo,
              Menu_Sistema, Menu_Name, Menu_Caption, Codigo_Area
          FROM Permisos
          WHERE Menu_UserID = LEFT(@UsuarioBase, 6)
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
           LEFT(CONCAT('Crear ', @UsuarioNuevo, ' copiado de ', @UsuarioBase, ' Sis:', @CodigoSistema, ' N:', @NombreNuevo), 50), 
           LEFT('INSERT COPY USER', 20));
        `);

      await transaction.commit();

      // Auditoría
      await this.auditoriaRepo.createAuditoria({
        id_usuario: idUsuarioAuditoria,
        modulo: "USUARIOS_CAS",
        registro: "CREAR_USUARIO_CAS",
        descripcion: `Creación usuario ${nuevoUsuario.cuenta} copiando de ${nuevoUsuario.base} en sistema ${sistema}`,
      });
    } catch (err) {
      if (transaction) await transaction.rollback();
      throw err;
    }
  }

  /**
   * ELIMINAR 1: Eliminar permisos y usuario de un solo sistema
   */
  async eliminarUsuarioSistema(
    cuenta: string,
    sistema: number,
    idUsuarioAuditoria: string,
  ): Promise<void> {
    const pool = await connectToDB("comun");
    if (!pool) throw new Error("Error de conexión a BD Comun");

    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // Validar existencia del usuario en el sistema específico
      const checkParams = await new sql.Request(transaction)
        .input("Cuenta", sql.VarChar(10), cuenta)
        .input("Sistema", sql.Int, sistema)
        .query(
          `SELECT 1 FROM Usuario WHERE Usuar_Cuenta = @Cuenta AND Usuar_Sistema = @Sistema`,
        );

      if (checkParams.recordset.length === 0) {
        throw new Error(
          `El usuario ${cuenta} no existe en el sistema ${sistema}.`,
        );
      }

      // Eliminar permisos solo del sistema indicado (Respetar Límite 6 Permisos)
      await new sql.Request(transaction)
        .input("Cuenta", sql.VarChar(10), cuenta)
        .input("Sistema", sql.Int, sistema).query(`
          DELETE FROM Permisos 
          WHERE Menu_UserID = LEFT(@Cuenta, 6)
          AND Menu_Sistema = @Sistema;
        `);

      // Eliminar usuario solo del sistema indicado
      await new sql.Request(transaction)
        .input("Cuenta", sql.VarChar(10), cuenta)
        .input("Sistema", sql.Int, sistema).query(`
          DELETE FROM Usuario 
          WHERE Usuar_Cuenta = @Cuenta
          AND Usuar_Sistema = @Sistema;
        `);

      // Registrar evento en bitácora
      await new sql.Request(transaction)
        .input("Cuenta", sql.VarChar(10), cuenta)
        .input("Sistema", sql.Int, sistema).query(`
          INSERT INTO Transacciones_MantenedorUsuarios
          (Codigo_Area, Fecha, Estacion, Tabla, Accion, Observacion, MiSql)
          VALUES
          ('1', GETDATE(), 'Administrador', 'Permisos y Usuario', 'Elimina', 
           LEFT(CONCAT('Eliminación usuario: ', @Cuenta, ' del Sistema: ', @Sistema), 250), 
           'DELETE POR SISTEMA');
        `);

      await transaction.commit();

      // Auditoría
      await this.auditoriaRepo.createAuditoria({
        id_usuario: idUsuarioAuditoria,
        modulo: "USUARIOS_CAS",
        registro: "ELIMINAR_USUARIO_SISTEMA_CAS",
        descripcion: `Eliminación usuario ${cuenta} del sistema ${sistema}`,
      });
    } catch (err) {
      if (transaction) await transaction.rollback();
      throw err;
    }
  }

  /**
   * ELIMINAR 2: Eliminar usuario completamente de TODOS los sistemas
   */
  async eliminarUsuarioGlobal(
    cuenta: string,
    idUsuarioAuditoria: string,
  ): Promise<void> {
    const pool = await connectToDB("comun");
    if (!pool) throw new Error("Error de conexión a BD Comun");

    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // Validar existencia del usuario
      const checkParams = await new sql.Request(transaction)
        .input("Cuenta", sql.VarChar(10), cuenta)
        .query(`SELECT 1 FROM Usuario WHERE Usuar_Cuenta = @Cuenta`);

      if (checkParams.recordset.length === 0) {
        throw new Error(`El usuario ${cuenta} no existe en ningún sistema.`);
      }

      // Eliminar permisos asociados (Respetar Límite 6 Permisos)
      await new sql.Request(transaction).input(
        "Cuenta",
        sql.VarChar(10),
        cuenta,
      ).query(`
          DELETE FROM Permisos 
          WHERE Menu_UserID = LEFT(@Cuenta, 6);
        `);

      // Eliminar usuario
      await new sql.Request(transaction).input(
        "Cuenta",
        sql.VarChar(10),
        cuenta,
      ).query(`
          DELETE FROM Usuario 
          WHERE Usuar_Cuenta = @Cuenta;
        `);

      // Registrar evento en bitácora
      await new sql.Request(transaction).input(
        "Cuenta",
        sql.VarChar(10),
        cuenta,
      ).query(`
          INSERT INTO Transacciones_MantenedorUsuarios
          (Codigo_Area, Fecha, Estacion, Tabla, Accion, Observacion, MiSql)
          VALUES
          ('1', GETDATE(), 'Administrador', 'Permisos y Usuario', 'Elimina', 
           LEFT(CONCAT('Eliminación total de usuario: ', @Cuenta), 250), 
           'DELETE');
        `);

      await transaction.commit();

      // Auditoría
      await this.auditoriaRepo.createAuditoria({
        id_usuario: idUsuarioAuditoria,
        modulo: "USUARIOS_CAS",
        registro: "ELIMINAR_USUARIO_GLOBAL_CAS",
        descripcion: `Eliminación total del usuario ${cuenta}`,
      });
    } catch (err) {
      if (transaction) await transaction.rollback();
      throw err;
    }
  }
}
