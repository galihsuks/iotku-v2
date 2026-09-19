export type SensorKeywordQuery = {
  page?: unknown;
  page_size?: unknown;
  keywords?: string;
};

export const like = (value: string) => `%${value}%`;
