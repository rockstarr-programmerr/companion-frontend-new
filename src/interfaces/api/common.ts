export declare interface PaginatedRes {
  count: number;
  next: string | null;
  previous: string | null;
  results?: unknown[];
}

export declare interface PaginationQuery {
  limit: number;
  offset: number;
}
