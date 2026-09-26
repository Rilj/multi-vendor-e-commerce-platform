import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { APP_FILTER } from "@nestjs/core";

import configuration from "./config/configuration";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { RedisModule } from "./redis/redis.module";
import { EmailModule } from "./email/email.module";
import { StorageModule } from "./storage/storage.module";
import { CommonModule } from "./common/common.module";
import { LoggerMiddleware } from "./common/middlewares/logger.middleware";

import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./users/users.module";
import { VendorsModule } from "./vendors/vendors.module";
import { CategoryModule } from "./categories/categories.module";
import { ProductModule } from "./products/products.module";
import { OrderModule } from "./orders/orders.module";
import { PaymentsModule } from "./payments/payments.module";
import { CartModule } from "./cart/cart.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { AdminModule } from "./admin/admin.module";
import { BannersModule } from "./banners/banners.module";
import { SettingsModule } from "./settings/settings.module";

import { RolesGuard } from "./common/guards/roles.guard";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { TimingInterceptor } from "./common/interceptors/timeout.interceptor";
import { AllExceptionsFilter } from "./common/interceptors/exception.filter";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [".env", ".env.local"],
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "default-secret",
      signOptions: { expiresIn: "7d" },
    }),
    PrismaModule,
    RedisModule,
    EmailModule,
    StorageModule,
    CommonModule,
    AuthModule,
    UserModule,
    VendorsModule,
    CategoryModule,
    ProductModule,
    OrderModule,
    PaymentsModule,
    CartModule,
    ReviewsModule,
    AdminModule,
    BannersModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TimingInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
