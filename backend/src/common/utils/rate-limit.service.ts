import { Injectable } from "@nestjs/common";

@Injectable()
export class RateLimitService {
  private readonly dailyLimits = new Map<string, { date: string; count: number }>();

  checkDailyLimit(key: string, max: number = 1000): boolean {
    const today = new Date().toISOString().split("T")[0];
    const current = this.dailyLimits.get(key);

    if (!current || current.date !== today) {
      this.dailyLimits.set(key, { date: today, count: 1 });
      return true;
    }

    if (current.count >= max) {
      return false;
    }

    current.count++;
    return true;
  }

  reset(key: string): void {
    this.dailyLimits.delete(key);
  }
}
