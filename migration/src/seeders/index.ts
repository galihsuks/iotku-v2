import { baseAppSeeder } from "./base-app.seeder.js";
import { sensorUnitSeeder } from "./sensor-unit.seeder.js";
import type { Seeder } from "./seeder.types.js";

export const seeders: Seeder[] = [baseAppSeeder, sensorUnitSeeder];
