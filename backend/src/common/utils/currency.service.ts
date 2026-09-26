import { Injectable } from "@nestjs/common";

@Injectable()
export class CurrencyService {
  private readonly exchangeRates: Record<string, number> = {
    USD: 1,
    EUR: 0.93,
    GBP: 0.79,
    IDR: 16000,
    JPY: 150,
  };

  convertTo(amount: number, fromCurrency: string, toCurrency: string): number {
    const fromRate = this.exchangeRates[fromCurrency] || 1;
    const toRate = this.exchangeRates[toCurrency] || 1;
    const usdAmount = amount / fromRate;
    return Math.round((usdAmount * toRate) * 100) / 100;
  }

  formatCurrency(amount: number, currency: string = "USD"): string {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    });
    return formatter.format(amount);
  }
}
