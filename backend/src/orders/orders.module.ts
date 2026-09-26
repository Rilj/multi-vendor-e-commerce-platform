import { Module } from "@nestjs/common";
import { CommonModule } from "../common/common.module";
import { OrdersService } from "./orders.service";
import { OrdersController, VendorOrdersController } from "./orders.controller";

@Module({
  imports: [CommonModule],
  controllers: [OrdersController, VendorOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrderModule {}
