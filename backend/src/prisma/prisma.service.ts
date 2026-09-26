import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    const databaseUrl = configService.get<string>("database.url");
    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: ["query", "error", "warn", "info"],
      errorFormat: "colorless",
    });
  }

  async onModuleInit() {
    this.logger.log("Prisma service initialized");
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks() {
    (this.$on as any)("beforeExit", async () => {
      await this.$disconnect();
    });
  }
}
