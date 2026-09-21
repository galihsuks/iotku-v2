import type { Seeder } from "./seeder.types.js";

export const sensorUnitSeeder: Seeder = {
  name: "sensorUnitSeeder",
  run: async (db) => {
    await db.query(`
      SET @now = NOW();

      INSERT IGNORE INTO sensor_units (id, name, unit, value_type, widget_type, created_at, updated_at) VALUES
      ('unit-temperature-celsius', 'Temperature', 'C', 'number', 'gauge', @now, @now),
      ('unit-humidity-percent', 'Humidity', '%', 'number', 'chart', @now, @now),
      ('unit-status-text', 'Status', 'text', 'string', 'status', @now, @now);
    `);
  },
};
