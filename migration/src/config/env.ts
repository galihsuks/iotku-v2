import "dotenv/config";

export type MigratorConfig = {
  driver: "mysql";
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

const mustGet = (key: string) => {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`Missing required env: ${key}`);
  }
  return value;
};

export const config: MigratorConfig = {
  driver: mustGet("DB_MIGRATOR_DRIVER") as "mysql",
  host: mustGet("DB_HOST"),
  port: Number(mustGet("DB_PORT")),
  username: mustGet("DB_USERNAME"),
  password: process.env.DB_PASSWORD ?? "",
  database: mustGet("DB_NAME"),
};

if (config.driver !== "mysql") {
  throw new Error(`Unsupported DB_MIGRATOR_DRIVER: ${config.driver}`);
}
