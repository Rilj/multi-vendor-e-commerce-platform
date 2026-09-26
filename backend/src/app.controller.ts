import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { AppService } from "./app.service";

@ApiTags("health")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("health")
  @ApiOperation({ summary: "Health check endpoint" })
  getHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "multi-vendor-ecommerce-backend",
    };
  }

  @Get()
  @ApiOperation({ summary: "Root endpoint" })
  getHello(): { message: string } {
    return this.appService.getHello();
  }
}
