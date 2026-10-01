import type { Seeder } from "./seeder.types.js";

export const sensorUnitSeeder: Seeder = {
  name: "sensorUnitSeeder",
  run: async (db) => {
    await db.query(`
      SET @now = NOW();

      INSERT IGNORE INTO sensor_units (id, name, unit, value_type, widget_type, value_options, created_at, updated_at) VALUES
      ('unit-temperature-celsius', 'Temperature', 'C', 'number', 'gauge', NULL, @now, @now),
      ('unit-humidity-percent', 'Humidity', '%', 'number', 'chart', NULL, @now, @now),
      ('unit-status-text', 'Status', 'text', 'string', 'status', NULL, @now, @now),
      ('unit-switch', 'Switch', 'state', 'string', 'switch', '[{"label":"On","value":"on"},{"label":"Off","value":"off"}]', @now, @now),
      ('unit-gate', 'Gate', 'state', 'string', 'switch', '[{"label":"Open","value":"open"},{"label":"Close","value":"close"}]', @now, @now),
      ('unit-rgb-light', 'RGB Light', 'color', 'string', 'switch', '[{"label":"On","value":"on"},{"label":"Off","value":"off"},{"label":"Red","value":"red"},{"label":"Green","value":"green"},{"label":"Blue","value":"blue"},{"label":"Warm","value":"warm"}]', @now, @now);
    `);
  },
};
