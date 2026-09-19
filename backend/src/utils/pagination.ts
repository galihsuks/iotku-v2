import type { ApiPagination } from "./http.js";

export interface PaginationInput {
  page?: unknown;
  page_size?: unknown;
  limit?: unknown;
}

export const toPositiveInt = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
};

export const getPagination = (query: PaginationInput) => {
  const page = toPositiveInt(query.page, 1);
  const pageSize = toPositiveInt(query.page_size ?? query.limit, 10);
  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
  };
};

export const buildPagination = (
  page: number,
  pageSize: number,
  totalItems: number,
): ApiPagination => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  return {
    page,
    page_size: pageSize,
    total_items: totalItems,
    total_pages: totalPages,
    has_next: page < totalPages,
    has_prev: page > 1,
  };
};
