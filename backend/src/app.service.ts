import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): { message: string } {
    return {
      message: "Welcome to Multi-Vendor E-Commerce API",
    };
  }
}
