import sql from "mssql";

let pool: sql.ConnectionPool | null = null;
let connectionAttemptInProgress: boolean = false;

export async function connectToDB(): Promise<sql.ConnectionPool | null> {
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

    const config: sql.config = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME,
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
