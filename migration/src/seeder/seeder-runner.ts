import { createConnection } from "../db/mysql.js";
import { seeders } from "../seeders/index.js";

export const runSeeders = async (names: string[]) => {
  const selected =
    names.length > 0 ? seeders.filter((seeder) => names.includes(seeder.name)) : seeders;
  const missing = names.filter((name) => !seeders.some((seeder) => seeder.name === name));

  if (missing.length > 0) {
    throw new Error(`Seeder not found: ${missing.join(", ")}`);
  }

  const db = await createConnection();
  try {
    for (const seeder of selected) {
      console.log(`Running seeder ${seeder.name}`);
      await seeder.run(db);
    }
  } finally {
    await db.end();
  }
};
