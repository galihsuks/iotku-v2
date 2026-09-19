export type DateFormatPreset =
  | "dot-short"
  | "slash-short"
  | "dash-short"
  | "day"
  | "weekday-id"
  | "month-id"
  | "compact-date-id"
  | "long-id"
  | "short-month-id"
  | "month-day-year";

const twoDigits = (value: number) => String(value).padStart(2, "0");

export const parseDateValue = (value?: string | Date | null): Date | null => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const normalized = value.includes(" ") ? value.replace(" ", "T") : value;
  const date = new Date(normalized);

  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (
  value?: string | Date | null,
  preset: DateFormatPreset = "long-id",
  fallback = "",
) => {
  const date = parseDateValue(value);

  if (!date) {
    return fallback;
  }

  const day = twoDigits(date.getDate());
  const month = twoDigits(date.getMonth() + 1);
  const shortYear = twoDigits(date.getFullYear() % 100);

  if (preset === "day") {
    return day;
  }

  if (preset === "weekday-id") {
    return new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(date);
  }

  if (preset === "month-id") {
    return new Intl.DateTimeFormat("id-ID", { month: "long" }).format(date);
  }

  if (preset === "compact-date-id") {
    const monthLabel = new Intl.DateTimeFormat("id-ID", { month: "short" })
      .format(date)
      .replace(".", "")
      .toUpperCase();

    return `${day} ${monthLabel} ${date.getFullYear()}`;
  }

  if (preset === "dot-short") {
    return `${day}.${month}.${shortYear}`;
  }

  if (preset === "slash-short") {
    return `${day}/${month}/${shortYear}`;
  }

  if (preset === "dash-short") {
    return `${day}-${month}-${shortYear}`;
  }

  if (preset === "short-month-id") {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  if (preset === "month-day-year") {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};
