import { Injectable, ExecutionContext, NestInterceptor, CallHandler } from "@nestjs/common";
import { Observable, of } from "rxjs";
import { tap, switchMap } from "rxjs/operators";
import { RedisService } from "../../redis/redis.service";
import { Request, Response } from "express";

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private redisService: RedisService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const url = request.url;
    const query = JSON.stringify(request.query || {});
    const cacheKey = `cache:${url}:${query}`;

    const cacheTTL = this.getCacheTTL(url);

    if (cacheTTL === 0) {
      return next.handle();
    }

    const redis = this.redisService.getClient();

    return redis.get(cacheKey).then((cached: string | null) => {
      if (cached) {
        return of(JSON.parse(cached));
      }

      return next.handle().pipe(
        tap((data) => {
          redis.setex(cacheKey, cacheTTL, JSON.stringify(data));
        }),
      );
    }) as any;
  }

  private getCacheTTL(url: string): number {
    if (url.includes("/products/featured")) return 3600;
    if (url.includes("/categories")) return 7200;
    if (url.includes("/banners")) return 1800;
    return 0;
  }
}
