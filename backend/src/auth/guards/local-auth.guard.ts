import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class LocalAuthGuard extends AuthGuard("local") {
  handleRequest<T = unknown>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ): T {
    if (err || !user) {
      const message =
        info?.message || err?.message || "Invalid email or password";
      throw new UnauthorizedException(message);
    }
    return user as T;
  }
}
