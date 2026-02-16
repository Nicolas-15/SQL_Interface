import sql from "mssql";

const DB_NAME_TITULAR = process.env.DB_NAME_TITULAR;
const DB_NAME_PERMISO = process.env.DB_NAME_PERMISO;
const DB_NAME_TESORERIA = process.env.DB_NAME_TESORERIA;
const DB_NAME_COMUN = process.env.DB_NAME_COMUN;
const DB_NAME_DEFAULT = process.env.DB_NAME;

const pools = new Map<string, sql.ConnectionPool>();
const connectionLocks = new Map<string, boolean>();

export async function connectToDB(
  nombre_db: string,
): Promise<sql.ConnectionPool | null> {
  let NOMBRE_BASE: string;

  switch (nombre_db) {
    case "comun":
      NOMBRE_BASE = DB_NAME_COMUN!;
      break;
    case "tesoreria":
      NOMBRE_BASE = DB_NAME_TESORERIA!;
      break;
    case "titular":
      NOMBRE_BASE = DB_NAME_TITULAR!;
      break;
    case "permiso":
      NOMBRE_BASE = DB_NAME_PERMISO!;
      break;
    default:
      NOMBRE_BASE = DB_NAME_DEFAULT!;
      break;
  }

  if (!NOMBRE_BASE) {
    console.error(`Database name not fully configured for alias: ${nombre_db}`);
    return null;
  }

  if (pools.has(NOMBRE_BASE)) {
    const pool = pools.get(NOMBRE_BASE);
    if (pool && pool.connected) {
      return pool;
    }
  }

  if (connectionLocks.get(NOMBRE_BASE)) {
    while (connectionLocks.get(NOMBRE_BASE)) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    if (pools.has(NOMBRE_BASE)) {
      const pool = pools.get(NOMBRE_BASE);
      if (pool && pool.connected) {
        return pool;
      }
    }
  }

  connectionLocks.set(NOMBRE_BASE, true);

  try {
    if (pools.has(NOMBRE_BASE)) {
      const pool = pools.get(NOMBRE_BASE);
      if (pool && pool.connected) {
        connectionLocks.set(NOMBRE_BASE, false);
        return pool;
      }
    }

    const config: sql.config = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_HOST || "localhost",
      database: NOMBRE_BASE,
      options: {
        encrypt: true,
        trustServerCertificate: true,
        cryptoCredentialsDetails: {
          minVersion: "TLSv1.2",
        },
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
      connectionTimeout: 15000,
      requestTimeout: 30000,
    };

    console.log(`Creating new database connection pool for ${NOMBRE_BASE}...`);
    const newPool = new sql.ConnectionPool(config);
    const connectedPool = await newPool.connect();
    console.log(`Database connection pool established for ${NOMBRE_BASE}.`);

    connectedPool.on("error", (err) => {
      console.log(`SQL Pool Error (Runtime) for ${NOMBRE_BASE}:`, err);
      if (pools.get(NOMBRE_BASE) === connectedPool) {
        pools.delete(NOMBRE_BASE);
      }
      try {
        connectedPool
          .close()
          .catch((e) => console.error("Error closing pool", e));
      } catch {}
    });

    pools.set(NOMBRE_BASE, connectedPool);
    connectionLocks.set(NOMBRE_BASE, false);
    return connectedPool;
  } catch (error) {
    console.error(
      `Database connection error (Initial/New Pool) for ${NOMBRE_BASE}:`,
      error,
    );
    connectionLocks.set(NOMBRE_BASE, false);
    return null;
  }
}
