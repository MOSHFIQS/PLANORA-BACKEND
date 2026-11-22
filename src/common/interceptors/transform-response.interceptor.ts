import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ApiResponse } from "../interfaces/response.interface";

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((res) => {
        // If response is already formatted as ApiResponse (has success, message)
        if (res && typeof res === "object" && "success" in res && "message" in res) {
          return res;
        }

        // If response is a paginated result from QueryBuilder (has data and meta)
        if (res && typeof res === "object" && "data" in res && "meta" in res) {
          return {
            success: true,
            message: "Data retrieved successfully",
            // Keep both res.data and nested data/meta for maximum compatibility with all clients
            data: {
              data: res.data,
              meta: res.meta,
            },
            meta: res.meta,
          };
        }

        return {
          success: true,
          message: "Operation completed successfully",
          data: res ?? null,
        };
      })
    );
  }
}
