// backend/src/lib/db.js
import mysql from "mysql2/promise";
import { env } from "../config/env.js";

const pool = mysql.createPool({
  uri: env.DB_URL,
  waitForConnections: true,
  connectionLimit: 10,
});

export async function query(sql, params = []) {
  const safeParams = Array.isArray(params) ? params : [params];

  // TEMP: log params
  console.log('QUERY SQL:', sql);
  console.log('QUERY PARAMS:', safeParams);
  const [rows] = await pool.execute(sql, safeParams);
  return rows;
}

export { pool };
