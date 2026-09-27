import { PrismaClient, ProductStatus, VendorStatus, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Electronics", children: ["Smartphones", "Laptops", "Tablets", "Audio", "Cameras"] },
  { name: "Fashion", children: ["Men's Clothing", "Women's Clothing", "Shoes", "Accessories", "Bags"] },
  { name: "Home & Living", children: ["Furniture", "Kitchen", "Decor", "Bedding", "Lighting"] },
  { name: "Sports & Outdoors", children: ["Fitness", "Cycling", "Outdoor Gear", "Team Sports"] },
  { name: "Beauty & Health", children: ["Skincare", "Makeup", "Supplements", "Hair Care"] },
  { name: "Books & Media", children: ["Books", "Movies", "Music", "Magazines"] },
  { name: "Toys & Games", children: ["Board Games", "Action Figures", "Puzzles", "Video Games"] },
  { name: "Groceries", children: ["Beverages", "Snacks", "Canned Goods", "Bakery"] },
];

const FIRST_NAMES = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
  "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
  "Matthew", "Betty", "Anthony", "Helen", "Mark", "Donna", "Donald", "Carol",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
];

const PRODUCT_IMAGES = [
  "https://picsum.photos/seed/p1/800/800",
  "https://picsum.photos/seed/p2/800/800",
  "https://picsum.photos/seed/p3/800/800",
  "https://picsum.photos/seed/p4/800/800",
  "https://picsum.photos/seed/p5/800/800",
];

const PRODUCT_ADJECTIVES = ["Premium", "Ultra", "Pro", "Classic", "Deluxe", "Essential", "Smart", "Portable", "Wireless", "Compact"];
const PRODUCT_NOUNS = ["Phone", "Watch", "Speaker", "Headphone", "Tablet", "Camera", "Laptop", "Charger", "Case", "Stand"];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomName(): string {
  return `${randomElement(FIRST_NAMES)} ${randomElement(LAST_NAMES)}`;
}

function generateProductData(vendorId: string, categoryId: string, productIndex: number) {
  const adj = randomElement(PRODUCT_ADJECTIVES);
  const noun = randomElement(PRODUCT_NOUNS);
  const name = `${adj} ${noun} ${randomInt(100, 9999)}`;
  const basePrice = randomInt(100, 5000);

  const variants: Array<{
    sku: string;
    attributes: Record<string, any>;
    price: number;
    stock: number;
  }> = [];

  const variantCount = randomInt(1, 4);
  const colors = ["Black", "White", "Red", "Blue", "Green", "Silver"];
  const sizes = ["S", "M", "L", "XL"];

  for (let i = 0; i < variantCount; i++) {
    variants.push({
      sku: `SKU-${productIndex}-${i}-${randomInt(1000, 9999)}`,
      attributes: {
        color: randomElement(colors),
        ...(Math.random() > 0.7 ? { size: randomElement(sizes) } : {}),
      },
      price: basePrice + randomInt(0, 500),
      stock: randomInt(0, 100),
    });
  }

  return {
    vendorId,
    categoryId,
    name,
    description: `${name} is a premium quality product from our collection. Perfect for everyday use with excellent durability and performance.`,
    basePrice,
    variants,
    imageCount: randomInt(2, 5),
  };
}

async function main() {
  console.log("Seeding database...");

  await prisma.payoutItem.deleteMany({});
  await prisma.payoutRequest.deleteMany({});
  await prisma.walletTransaction.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.vendorOrder.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.reviewImage.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.vendor.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.banner.deleteMany({});
  await prisma.setting.deleteMany({});

  console.log("Cleaned up existing data");

  const categoryIds: string[] = [];
  for (const topCat of CATEGORIES) {
    const parent = await prisma.category.create({
      data: {
        name: topCat.name,
        slug: topCat.name.toLowerCase().replace(/\s+/g, "-"),
      },
    });
    categoryIds.push(parent.id);

    for (const childName of topCat.children) {
      const child = await prisma.category.create({
        data: {
          name: childName,
          slug: `${parent.slug}/${childName.toLowerCase().replace(/\s+/g, "-")}`,
          parentId: parent.id,
        },
      });
      categoryIds.push(child.id);
    }
  }
  console.log(`Created ${CATEGORIES.reduce((acc, c) => acc + 1 + c.children.length, 0)} categories`);

  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@mvecommerce.com",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });
  console.log("Created admin user");

  const vendorCount = 50;
  const buyerCount = 500;

  const vendorIds: string[] = [];
  const buyerIds: string[] = [];

  for (let i = 0; i < vendorCount; i++) {
    const password = await bcrypt.hash("password123", 12);
    const user = await prisma.user.create({
      data: {
        name: randomName(),
        email: `vendor${i + 1}@example.com`,
        passwordHash: password,
        role: UserRole.VENDOR,
        emailVerified: true,
      },
    });

    const vendor = await prisma.vendor.create({
      data: {
        userId: user.id,
        storeName: `${randomElement(FIRST_NAMES)}'s Store ${i + 1}`,
        slug: `store-${i + 1}`,
        description: `Welcome to ${randomElement(FIRST_NAMES)}'s Store! We offer high-quality products at great prices.`,
        logoUrl: `https://picsum.photos/seed/vendor${i}/200/200`,
        bannerUrl: `https://picsum.photos/seed/vendorbanner${i}/1200/400`,
        ktpNumber: `123456${randomInt(100000, 999999)}`,
        npwpNumber: `01.${randomInt(10, 99)}.${randomInt(100, 999)}.${randomInt(100, 999)}.${randomInt(1000, 9999)}-${randomInt(10, 99)}.${randomInt(10, 99)}`,
        bankDetails: {
          bankName: randomElement(["BCA", "BNI", "BRI", "Mandiri", "CIMB"]),
          accountNumber: `123${randomInt(100000000, 999999999)}`,
          accountName: randomElement(FIRST_NAMES),
        },
        commissionRate: 10.0,
        status: VendorStatus.APPROVED,
      },
    });
    vendorIds.push(vendor.id);
  }
  console.log(`Created ${vendorCount} vendors`);

  for (let i = 0; i < buyerCount; i++) {
    const password = await bcrypt.hash("password123", 12);
    const user = await prisma.user.create({
      data: {
        name: randomName(),
        email: `buyer${i + 1}@example.com`,
        passwordHash: password,
        role: UserRole.BUYER,
        emailVerified: true,
      },
    });
    buyerIds.push(user.id);

    await prisma.address.create({
      data: {
        userId: user.id,
        label: i === 0 ? "Home" : i === 1 ? "Work" : "Other",
        name: randomElement(FIRST_NAMES),
        phone: `+62${randomInt(810, 820)}${randomInt(10000000, 99999999)}`,
        address: `Jl. ${randomElement(["Sudirman", "Thamrin", "Gadjah Mada", "Hasan Roesfo", "Diponegoro"])} No. ${randomInt(1, 200)}`,
        province: "DKI Jakarta",
        city: "Jakarta",
        district: randomElement(["Kebayoran", "Menteng", "Kebon Jeruk", "Cipagalo", "Buncit"]),
        postalCode: `${randomInt(10000, 99999)}`,
        latitude: -6.2 + Math.random() * 0.2,
        longitude: 106.8 + Math.random() * 0.2,
        isDefault: i === 0,
      },
    });
  }
  console.log(`Created ${buyerCount} buyers with addresses`);

  const productCount = 2000;
  const productIds: string[] = [];

  for (let i = 0; i < productCount; i++) {
    const vendorId = vendorIds[Math.floor(Math.random() * vendorIds.length)];
    const categoryId = categoryIds[randomInt(0, categoryIds.length - 1)];
    const productData = generateProductData(vendorId, categoryId, i);

    const existingSlugs = await prisma.product.findMany({ select: { slug: true } });
    const slugBase = productData.name.toLowerCase().replace(/\s+/g, "-");
    let slug = slugBase;
    let counter = 2;
    while (existingSlugs.some((p) => p.slug === slug)) {
      slug = `${slugBase}-${counter}`;
      counter++;
    }

    const product = await prisma.product.create({
      data: {
        vendorId,
        categoryId,
        name: productData.name,
        slug,
        description: productData.description,
        basePrice: productData.basePrice,
        status: ProductStatus.ACTIVE,
        isFeatured: Math.random() > 0.8,
      },
    });

    for (let v = 0; v < productData.variants.length; v++) {
      const variant = productData.variants[v];
      const createdVariant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: variant.sku,
          attributes: variant.attributes,
          price: variant.price,
          stockQuantity: variant.stock,
        },
      });

      for (let img = 0; img < productData.imageCount; img++) {
        await prisma.productImage.create({
          data: {
            productVariantId: createdVariant.id,
            url: `${PRODUCT_IMAGES[img % PRODUCT_IMAGES.length]}?random=${Math.random()}`,
            alt: productData.name,
            position: img,
            isPrimary: img === 0,
          },
        });
      }
    }

    productIds.push(product.id);
  }
  console.log(`Created ${productCount} products`);

  const orderCount = 1000;
  for (let i = 0; i < orderCount; i++) {
    const buyerId = buyerIds[Math.floor(Math.random() * buyerIds.length)];

    const address = await prisma.address.findFirst({
      where: { userId: buyerId },
    });

    const orderNumber = `ORD${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}${randomInt(100000, 999999)}${i}${Math.random().toString(36).substring(2, 6)}`;

    const product = await prisma.product.findUnique({
      where: { id: productIds[Math.floor(Math.random() * productIds.length)] },
      include: {
        variants: { take: 1 },
        vendor: true,
      },
    });

    const variant = product?.variants?.[0];
    if (!product || !variant) continue;

    const quantity = randomInt(1, 5);
    const unitPrice = Number(variant.price);
    const subtotal = unitPrice * quantity;
    const shippingFee = randomInt(5000, 30000);
    const taxAmount = Math.round(subtotal * 0.11);
    const commissionFee = Math.round(subtotal * 0.10);
    const discountAmount = Math.random() > 0.7 ? randomInt(0, 10000) : 0;
    const totalAmount = subtotal + shippingFee + taxAmount - discountAmount;

    const paymentStatuses = ["PAID", "PAID", "PAID", "PENDING", "FAILED", "REFUNDED"];
    const paymentStatusVal = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];

    const order = await prisma.order.create({
      data: {
        buyerId,
        orderNumber,
        totalAmount,
        paymentStatus: paymentStatusVal as any,
        shippingStatus: (paymentStatusVal === "PAID"
          ? ["PROCESSING", "SHIPPED", "DELIVERED"][Math.floor(Math.random() * 3)]
          : paymentStatusVal === "FAILED"
            ? "CANCELLED"
            : "DELIVERED") as any,
        shippingAddress: {
          name: address?.name || "Test",
          phone: address?.phone || "+6281234567890",
          address: address?.address || "Test Address",
          city: address?.city || "Jakarta",
          district: address?.district || "Test",
          postalCode: address?.postalCode || "10000",
          province: address?.province || "DKI Jakarta",
        },
        shippingFee,
        taxAmount,
        discountAmount,
      },
    });

    const vendorOrderStatus = paymentStatusVal === "FAILED"
      ? "CANCELLED"
      : paymentStatusVal === "PAID"
        ? ["PROCESSING", "SHIPPED", "DELIVERED"][Math.floor(Math.random() * 3)]
        : "DELIVERED";

    await prisma.vendorOrder.create({
      data: {
        orderId: order.id,
        vendorId: product.vendor.id,
        subtotal,
        shippingFee,
        taxAmount,
        commissionFee,
        discountAmount,
        totalAmount: subtotal + shippingFee - commissionFee - discountAmount,
        status: vendorOrderStatus as any,
        trackingNumber: `TRK${randomInt(10000000, 99999999)}`,
        shippedAt: new Date(Date.now() - randomInt(0, 7) * 86400000),
        deliveredAt: new Date(Date.now() - randomInt(0, 5) * 86400000),
      },
    });

    await prisma.orderItem.create({
      data: {
        vendorOrderId: (await prisma.vendorOrder.findFirst({
          where: { orderId: order.id },
        }))!.id,
        productVariantId: variant.id,
        quantity,
        unitPrice,
        totalPrice: subtotal,
      },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: totalAmount,
        method: randomElement(["midtrans", "stripe", "bank_transfer"]),
        status: paymentStatusVal as any,
        gatewayRef: `pay_${randomInt(1000000, 9999999)}`,
        payload: { orderId: order.id, gateway: "midtrans" },
      },
    });

    if (paymentStatusVal !== "FAILED") {
      const netAmount = subtotal - commissionFee;
      await prisma.walletTransaction.create({
        data: {
          vendorId: product.vendor.id,
          type: "CREDIT",
          amount: netAmount,
          description: `Payment for order ${orderNumber}`,
          referenceId: order.id,
          status: "COMPLETED",
        },
      });
      await prisma.walletTransaction.create({
        data: {
          vendorId: product.vendor.id,
          type: "COMMISSION",
          amount: commissionFee,
          description: `Platform commission for order ${orderNumber}`,
          referenceId: order.id,
          status: "COMPLETED",
        },
      });
    }
  }
  console.log(`Created ${orderCount} orders with payments and wallet transactions`);

  const reviewCount = 500;
  const reviewedProducts = new Set<string>();
  for (let i = 0; i < reviewCount; i++) {
    const product = await prisma.product.findUnique({
      where: { id: productIds[Math.floor(Math.random() * productIds.length)] },
      include: { vendor: true },
    });

    if (!product || reviewedProducts.has(product.id)) continue;
    if (Math.random() < 0.5) continue;

    reviewedProducts.add(product.id);
    const buyerId = buyerIds[Math.floor(Math.random() * buyerIds.length)];

    await prisma.review.create({
      data: {
        productId: product.id,
        userId: buyerId,
        vendorId: product.vendor.id,
        rating: randomInt(3, 5),
        title: "Great product!",
        comment: "Excellent quality and fast shipping. Highly recommended!",
        isVerifiedPurchase: true,
      },
    });
  }
  console.log(`Created ${reviewCount} reviews`);

  for (let i = 0; i < 5; i++) {
    await prisma.banner.create({
      data: {
        title: ["Summer Sale", "New Arrivals", "Flash Deal", "Premium Collection", "Best Sellers"][i],
        imageUrl: `https://picsum.photos/seed/banner${i}/1200/400`,
        linkUrl: `/collections/${["summer", "new-arrivals", "flash-deal", "premium", "best-sellers"][i]}`,
        position: i,
        isActive: true,
      },
    });
  }
  console.log("Created 5 banners");

  await prisma.setting.create({
    data: {
      key: "global",
      value: {
        commissionRate: 10.0,
        shippingMethods: [
          { name: "Standard", code: "standard", cost: 5000, estimatedDays: "3-5" },
          { name: "Express", code: "express", cost: 15000, estimatedDays: "1-2" },
        ],
        paymentMethods: [
          { name: "Credit Card", code: "credit_card", enabled: true },
          { name: "Bank Transfer", code: "bank_transfer", enabled: true },
          { name: "E-Wallet", code: "e_wallet", enabled: true },
        ],
        taxRate: 0.11,
        currency: "IDR",
        siteName: "Multi-Vendor E-Commerce",
      },
    },
  });
  console.log("Created global settings");

  console.log("\n=== Database seeding completed! ===");
  console.log(`  Users: ${buyerCount + vendorCount + 1}`);
  console.log(`  Vendors: ${vendorCount}`);
  console.log(`  Buyers: ${buyerCount}`);
  console.log(`  Categories: ${CATEGORIES.reduce((acc, c) => acc + 1 + c.children.length, 0)}`);
  console.log(`  Products: ${productCount}`);
  console.log(`  Orders: ${orderCount}`);
  console.log(`  Reviews: ${reviewCount}`);
  console.log(`  Banners: 5`);
  console.log(`  Settings: 1`);
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
