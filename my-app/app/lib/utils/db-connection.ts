import sql from "mssql";
const DB_NAME_TITULAR = process.env.DB_NAME_TITULAR;
const DB_NAME_PERMISO = process.env.DB_NAME_PERMISO;
const DB_NAME_TESORERIA = process.env.DB_NAME_TESORERIA;
const DB_NAME_COMUN = process.env.DB_NAME_COMUN;

let pool: sql.ConnectionPool | null = null;
let connectionAttemptInProgress: boolean = false;
const DB_NAME = process.env.DB_NAME;

export async function connectToDB(
  nombre_db: string,
): Promise<sql.ConnectionPool | null> {
  if (connectionAttemptInProgress) {
    while (connectionAttemptInProgress) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    if (pool && pool.connected) {
      return pool;
    }
  }

  connectionAttemptInProgress = true;

  try {
    if (pool && pool.connected) {
      connectionAttemptInProgress = false;
      return pool;
    }

    if (pool) {
      try {
        console.warn("Attempting to reconnect to existing pool...");
        await pool.connect();
        console.log("Successfully reconnected to existing pool.");
        connectionAttemptInProgress = false;
        return pool;
      } catch (reconnectError) {
        console.warn(
          "Failed to reconnect to existing pool, creating a new one:",
          reconnectError,
        );
        pool = null;
      }
    }
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
        NOMBRE_BASE = DB_NAME!;
        break;
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

    console.log("Creating new database connection pool...");
    const newPool = new sql.ConnectionPool(config);
    pool = await newPool.connect();
    console.log("Database connection pool established.");

    pool.on("error", (err) => {
      console.log("SQL Pool Error (Runtime):", err);
      if (pool && pool.connected) {
        pool
          .close()
          .catch((e) => console.error("Error, closing errored pool:", e));
      }
      pool = null;
    });

    connectionAttemptInProgress = false;
    return pool;
  } catch (error) {
    console.error("Database connection error (Initial/New Pool):", error);
    connectionAttemptInProgress = false;
    return null;
  }
}
