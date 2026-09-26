import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 20;
    const skip = (page - 1) * limit;

    request.pagination = { skip, take: limit };

    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data) && request.pagination) {
          const total = data.length;
          const totalPages = Math.ceil(total / limit);
          return {
            data,
            meta: {
              total,
              page,
              limit,
              totalPages,
            },
          };
        }
        return data;
      }),
    );
  }
}
