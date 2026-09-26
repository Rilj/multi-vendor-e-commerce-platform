import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { CartService } from "./cart.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { GetUser } from "../common/decorators/get-user.decorator";

@ApiTags("cart")
@Controller("cart")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: "Get cart with vendor grouping" })
  async getCart(@GetUser("id") userId: string) {
    const cart = await this.cartService.getCart(userId);
    return { data: cart };
  }

  @Post("add/:variantId")
  @ApiOperation({ summary: "Add item to cart" })
  async addToCart(
    @GetUser("id") userId: string,
    @Param("variantId") variantId: string,
    @Query("quantity") quantity: number = 1,
  ) {
    const item = await this.cartService.addToCart(userId, variantId, Number(quantity));
    return { data: item };
  }

  @Patch("update/:itemId")
  @ApiOperation({ summary: "Update cart item quantity" })
  async updateQuantity(
    @GetUser("id") userId: string,
    @Param("itemId") itemId: string,
    @Body("quantity") quantity: number,
  ) {
    const item = await this.cartService.updateQuantity(userId, itemId, Number(quantity));
    return { data: item };
  }

  @Delete("remove/:itemId")
  @ApiOperation({ summary: "Remove item from cart" })
  async removeFromCart(@GetUser("id") userId: string, @Param("itemId") itemId: string) {
    await this.cartService.removeFromCart(userId, itemId);
    return { data: { message: "Item removed from cart" } };
  }

  @Delete("clear")
  @ApiOperation({ summary: "Clear entire cart" })
  async clearCart(@GetUser("id") userId: string) {
    await this.cartService.clearCart(userId);
    return { data: { message: "Cart cleared" } };
  }
}
