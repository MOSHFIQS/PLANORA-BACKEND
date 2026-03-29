/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryConfig, IQueryParams, IQueryResult } from "../interfaces/query.interface";

export class QueryBuilder<T> {
  private where: Record<string, any> = {};
  private page = 1;
  private limit = 10;
  private skip = 0;

  constructor(
    private model: any,
    private queryParams: IQueryParams,
    private config: IQueryConfig = {}
  ) {}

  // SEARCH
  search(): this {
    const { searchTerm } = this.queryParams;
    const { searchableFields } = this.config;

    if (searchTerm && searchableFields?.length) {
      this.where.OR = searchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      }));
    }

    return this;
  }

  // FILTER
  filter(): this {
    const { filterableFields } = this.config;

    Object.keys(this.queryParams).forEach((key) => {
      const value = this.queryParams[key];

      if (
        ["searchTerm", "page", "limit"].includes(key) ||
        value === undefined
      ) {
        return;
      }

      if (!filterableFields?.includes(key)) return;

      const parsedValue =
        !isNaN(value) && value !== "" ? Number(value) : value;

      this.where[key] = parsedValue;
    });

    return this;
  }

  // PAGINATION
  paginate(): this {
    this.page = Number(this.queryParams.page) || 1;
    this.limit = Number(this.queryParams.limit) || 10;
    this.skip = (this.page - 1) * this.limit;

    return this;
  }

  // EXECUTE
  async execute(): Promise<IQueryResult<T>> {
    const [total, data] = await Promise.all([
      this.model.count({ where: this.where }),
      this.model.findMany({
        where: this.where,
        skip: this.skip,
        take: this.limit,
      }),
    ]);

    return {
      data,
      meta: {
        page: this.page,
        limit: this.limit,
        total,
        totalPages: Math.ceil(total / this.limit),
      },
    };
  }
}