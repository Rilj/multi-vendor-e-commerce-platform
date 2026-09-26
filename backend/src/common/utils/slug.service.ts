import { Injectable, Logger } from "@nestjs/common";
import slugify from "slugify";

@Injectable()
export class SlugService {
  private readonly logger = new Logger(SlugService.name);

  generate(text: string): string {
    return slugify(text, {
      lower: true,
      strict: true,
      remove: /[*+~.,])/g,
    });
  }

  generateUnique(text: string, existingSlugs: string[]): string {
    let baseSlug = this.generate(text);
    let slug = baseSlug;
    let counter = 2;

    while (existingSlugs.includes(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  generateOrderNumber(prefix: string = "ORD"): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${year}${month}${day}${random}`;
  }

  generateSKU(vendorId: string, productId: string, variantIndex: number): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SKU-${year}-${vendorId.substring(0, 4).toUpperCase()}-${productId.substring(0, 4).toUpperCase()}-${random}${variantIndex}`;
  }
}
