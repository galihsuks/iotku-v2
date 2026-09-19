import mysql from "mysql2/promise";
import { config } from "../config/env.js";

export const createConnection = () =>
  mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.username,
    password: config.password,
    database: config.database,
    multipleStatements: true,
    dateStrings: true,
  });

export type Db = Awaited<ReturnType<typeof createConnection>>;
