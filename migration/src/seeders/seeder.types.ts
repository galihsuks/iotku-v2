import type { Db } from "../db/mysql.js";

export type Seeder = {
  name: string;
  run: (db: Db) => Promise<void>;
};
