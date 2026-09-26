import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetVendor = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.vendor) {
      return null;
    }

    return data ? user.vendor[data] : user.vendor;
  },
);
