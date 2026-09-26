import { Module } from "@nestjs/common";
import { SlugService } from "./utils/slug.service";
import { CurrencyService } from "./utils/currency.service";
import { RateLimitService } from "./utils/rate-limit.service";
import { QueueService } from "./utils/queue.service";

@Module({
  providers: [SlugService, CurrencyService, RateLimitService, QueueService],
  exports: [SlugService, CurrencyService, RateLimitService, QueueService],
})
export class CommonModule {}
