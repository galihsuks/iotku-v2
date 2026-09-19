export interface ApiPagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  shared_total_items?: number;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  pagination?: ApiPagination;
}
