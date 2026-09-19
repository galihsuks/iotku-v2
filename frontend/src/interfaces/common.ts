export type ID = string;

export interface PaginationQuery {
  page?: number;
  page_size?: number;
}

export interface KeywordPaginationQuery extends PaginationQuery {
  keywords?: string;
}

export interface UserListQuery extends KeywordPaginationQuery {
  role_id?: ID;
  role_code?: string;
}

export interface SortablePaginationQuery extends KeywordPaginationQuery {
  sort_by?: string;
}
