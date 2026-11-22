/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IQueryParams {
  searchTerm?: string;
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  fields?: string;
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

export interface PrismaModelDelegate {
  findMany: (args: any) => Promise<any>;
  count: (args: any) => Promise<number>;
}

export interface PrismaFindManyArgs {
  where?: Record<string, any>;
  include?: Record<string, any>;
  select?: Record<string, any>;
  orderBy?: Record<string, any> | Array<Record<string, any>>;
  skip?: number;
  take?: number;
}

export interface PrismaCountArgs {
  where?: Record<string, any>;
}

export interface PrismaStringFilter {
  contains?: string;
  mode?: "default" | "insensitive";
  equals?: string;
  in?: string[];
}

export interface PrismaNumberFilter {
  equals?: number;
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
}
