import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - now;
        const response = context.switchToHttp().getResponse();
        if (response.setHeader && !response.headersSent) {
          response.setHeader("X-Response-Time", `${ms}ms`);
        }
      }),
    );
  }
}
