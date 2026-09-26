import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from "@nestjs/common";
import Redis from "ioredis";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>("redis.url", "redis://localhost:6379");
    this.client = new Redis(redisUrl);
  }

  async onModuleInit() {
    this.client.on("error", (err) => {
      this.logger.error(`Redis error: ${err.message}`);
    });
    this.logger.log("Redis client connected");
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  async set(key: string, value: string, ttl?: number): Promise<"OK"> {
    if (ttl) {
      return this.client.setex(key, ttl, value);
    }
    return this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }
}
