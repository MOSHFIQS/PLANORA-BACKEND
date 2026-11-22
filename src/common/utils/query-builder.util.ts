/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  IQueryConfig,
  IQueryParams,
  IQueryResult,
  PrismaCountArgs,
  PrismaFindManyArgs,
  PrismaModelDelegate,
  PrismaStringFilter,
} from "../interfaces/query.interface";

export class QueryBuilder<T = any> {
  private query: PrismaFindManyArgs;
  private countQuery: PrismaCountArgs;
  private page: number = 1;
  private limit: number = 10;
  private skip: number = 0;
  private sortBy: string = "createdAt";
  private sortOrder: "asc" | "desc" = "desc";
  private selectFields: Record<string, boolean> | undefined;

  constructor(
    private model: PrismaModelDelegate,
    private queryParams: IQueryParams = {},
    private config: IQueryConfig = {}
  ) {
    this.query = {
      where: {},
      include: {},
      orderBy: {},
      skip: 0,
      take: 10,
    };

    this.countQuery = {
      where: {},
    };
  }

  search(): this {
    const { searchTerm } = this.queryParams;
    const { searchableFields } = this.config;

    if (searchTerm && searchableFields && searchableFields.length > 0) {
      const searchConditions: Record<string, any>[] = searchableFields.map((field) => {
        if (field.includes(".")) {
          const parts = field.split(".");
          if (parts.length === 2) {
            const [relation, nestedField] = parts;
            return {
              [relation]: {
                [nestedField]: { contains: searchTerm, mode: "insensitive" },
              },
            };
          } else if (parts.length === 3) {
            const [relation, nestedRelation, nestedField] = parts;
            return {
              [relation]: {
                some: {
                  [nestedRelation]: {
                    [nestedField]: { contains: searchTerm, mode: "insensitive" },
                  },
                },
              },
            };
          }
        }
        return {
          [field]: { contains: searchTerm, mode: "insensitive" },
        };
      });

      this.query.where = {
        ...this.query.where,
        OR: searchConditions,
      };

      this.countQuery.where = {
        ...this.countQuery.where,
        OR: searchConditions,
      };
    }

    return this;
  }

  filter(): this {
    const { filterableFields } = this.config;
    const excludedFields = ["searchTerm", "page", "limit", "sortBy", "sortOrder", "fields"];

    const filterObj: Record<string, any> = {};

    Object.keys(this.queryParams).forEach((key) => {
      if (!excludedFields.includes(key)) {
        if (filterableFields && filterableFields.length > 0) {
          if (filterableFields.includes(key)) {
            filterObj[key] = this.parseFilterValue(this.queryParams[key]);
          }
        } else {
          filterObj[key] = this.parseFilterValue(this.queryParams[key]);
        }
      }
    });

    this.query.where = {
      ...this.query.where,
      ...filterObj,
    };

    this.countQuery.where = {
      ...this.countQuery.where,
      ...filterObj,
    };

    return this;
  }

  where(condition: Record<string, any>): this {
    this.query.where = {
      ...this.query.where,
      ...condition,
    };

    this.countQuery.where = {
      ...this.countQuery.where,
      ...condition,
    };

    return this;
  }

  include(include: Record<string, any>): this {
    this.query.include = include;
    delete this.query.select;
    return this;
  }

  selectFixed(select: Record<string, boolean>): this {
    this.selectFields = select;
    return this;
  }

  sort(): this {
    const { sortBy, sortOrder } = this.queryParams;

    if (sortBy) this.sortBy = sortBy;
    if (sortOrder && ["asc", "desc"].includes(sortOrder)) {
      this.sortOrder = sortOrder;
    }

    this.query.orderBy = {
      [this.sortBy]: this.sortOrder,
    };

    return this;
  }

  paginate(): this {
    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 10;

    this.page = page > 0 ? page : 1;
    this.limit = limit > 0 ? limit : 10;
    this.skip = (this.page - 1) * this.limit;

    this.query.skip = this.skip;
    this.query.take = this.limit;

    return this;
  }

  async execute(): Promise<IQueryResult<T>> {
    if (this.selectFields) {
      this.query.select = this.selectFields;
      delete this.query.include;
    }

    const [data, total] = await Promise.all([
      this.model.findMany(this.query),
      this.model.count(this.countQuery),
    ]);

    const totalPages = Math.ceil(total / this.limit);

    return {
      data,
      meta: {
        page: this.page,
        limit: this.limit,
        total,
        totalPages,
      },
    };
  }

  private parseFilterValue(value: any): any {
    if (value === "true") return true;
    if (value === "false") return false;
    if (!isNaN(Number(value)) && typeof value === "string" && value.trim() !== "") {
      return Number(value);
    }
    return value;
  }
}
