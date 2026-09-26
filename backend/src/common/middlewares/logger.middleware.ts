import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    next();
    const ms = Date.now() - start;
    console.log(
      `${req.method} ${req.url} ${res.statusCode} - ${ms}ms`,
    );
  }
}
