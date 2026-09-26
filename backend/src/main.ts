import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
      credentials: true,
    },
  });

  const configService = app.get(ConfigService);

  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle("Multi-Vendor E-Commerce API")
    .setDescription("Enterprise-grade multi-vendor e-commerce platform API")
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("auth", "Authentication endpoints")
    .addTag("users", "User management")
    .addTag("vendors", "Vendor/seller portal")
    .addTag("products", "Product catalog")
    .addTag("categories", "Product categories")
    .addTag("orders", "Order management")
    .addTag("payments", "Payment processing")
    .addTag("cart", "Shopping cart")
    .addTag("reviews", "Product reviews")
    .addTag("admin", "Admin operations")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = configService.get("PORT", 4000);
  await app.listen(port);
  console.log(`Application running on port ${port}`);
  console.log(`API Docs available at http://localhost:${port}/api/docs`);
}
bootstrap();
