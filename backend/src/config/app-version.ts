import { readFileSync } from "node:fs";
import { join } from "node:path";

const DEFAULT_VERSION = "0.1.0";

type PackageMetadata = {
  version?: unknown;
};

export const getPackageVersion = () => {
  try {
    const packageJson = readFileSync(join(process.cwd(), "package.json"), "utf8");
    const metadata = JSON.parse(packageJson) as PackageMetadata;

    return typeof metadata.version === "string" && metadata.version.trim()
      ? metadata.version.trim()
      : DEFAULT_VERSION;
  } catch {
    return DEFAULT_VERSION;
  }
};
