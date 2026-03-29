/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IQueryParams {
  searchTerm?: string;
  page?: string;
  limit?: string;
  [key: string]: any;
}

export interface IQueryConfig {
  searchableFields?: string[];
  filterableFields?: string[];
}

export interface IQueryResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}