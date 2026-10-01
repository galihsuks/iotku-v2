export type SensorValueOption = {
  label: string;
  value: string;
};

export const parseValueOptions = (raw: unknown): SensorValueOption[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as SensorValueOption[];

  try {
    const parsed = JSON.parse(String(raw)) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const option = item as Record<string, unknown>;
        const label = String(option.label ?? option.value ?? "").trim();
        const value = String(option.value ?? "").trim();
        return label && value ? { label, value } : null;
      })
      .filter((item): item is SensorValueOption => Boolean(item));
  } catch {
    return [];
  }
};

export const stringifyValueOptions = (options?: SensorValueOption[] | null) => {
  if (!options?.length) return null;
  return JSON.stringify(options);
};

export const normalizeReadingValue = (value: unknown) => String(value).trim();

export const assertValueInOptions = (value: string, valueOptions: SensorValueOption[]) => {
  if (!valueOptions.length) return;
  const validValues = valueOptions.map((option) => option.value);
  if (!validValues.includes(value)) {
    throw new Error(`Value must be one of: ${validValues.join(", ")}.`);
  }
};
