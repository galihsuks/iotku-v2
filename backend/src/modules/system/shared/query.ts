export type KeywordQuery = {
  page?: unknown;
  page_size?: unknown;
  keywords?: string;
};

export const like = (value: string) => `%${value}%`;

export const cleanNullable = (value?: string | null) =>
  value && value.trim() !== "" ? value.trim() : null;
