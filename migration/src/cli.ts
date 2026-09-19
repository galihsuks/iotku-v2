import { config as loadDotenv } from "dotenv";
import { createMigration, migrateDown, migrateUp, migrationStatus } from "./migrator/migrator.js";
import { runSeeders } from "./seeder/seeder-runner.js";

loadDotenv();

const args = process.argv.slice(2);
const command = args[0] ?? "";

const getOption = (name: string) => {
  const prefix = `--${name}=`;
  const inline = args.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = args.findIndex((arg) => arg === `--${name}`);
  if (index >= 0) return args[index + 1] ?? "";

  return "";
};

const main = async () => {
  switch (command) {
    case "migrate:up":
      await migrateUp();
      break;
    case "migrate:down":
      await migrateDown(Number(getOption("steps") || 1));
      break;
    case "migrate:status":
      await migrationStatus();
      break;
    case "migrate:create":
      await createMigration(args[1] ?? getOption("name"));
      break;
    case "seed": {
      const names = getOption("names")
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
      await runSeeders(names);
      break;
    }
    default:
      throw new Error(`Unknown command: ${command}`);
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
