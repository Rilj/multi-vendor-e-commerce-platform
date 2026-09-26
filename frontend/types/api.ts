export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "BUYER" | "VENDOR" | "ADMIN" | "FINANCE_ADMIN" | "SUPPORT_ADMIN";
  emailVerified: boolean;
  phone?: string;
  vendor?: Vendor;
}

export interface Vendor {
  id: string;
  userId: string;
  storeName: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  ktpNumber?: string;
  npwpNumber?: string;
  bankDetails?: Record<string, any>;
  status: "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";
  commissionRate?: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  attributes: Record<string, any>;
  price: number;
  stockQuantity: number;
  weight?: number;
  dimensions?: Record<string, any>;
  images: ProductImage[];
}

export interface ProductImage {
  id: string;
  productVariantId: string;
  url: string;
  alt?: string;
  position: number;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  vendorId: string;
  vendor: Vendor;
  categoryId: string;
  category: Category;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  status: "ACTIVE" | "INACTIVE" | "DRAFT" | "SOLD_OUT";
  isFeatured: boolean;
  viewCount: number;
  variants: ProductVariant[];
  reviews?: Review[];
  avgRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label?: string;
  name: string;
  phone: string;
  address: string;
  province?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  userId: string;
  productVariantId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartVendorGroup {
  vendorId: string;
  vendorStoreName: string;
  vendorLogoUrl: string | null;
  items: CartItemWithDetails[];
  subtotal: number;
}

export interface CartItemWithDetails {
  productId: string;
  productName: string;
  vendorId: string;
  vendorStoreName: string;
  variantId: string;
  variantSku: string;
  variantAttributes: Record<string, any>;
  price: number;
  image: string | null;
  quantity: number;
  maxStock: number;
  totalPrice: number;
}

export interface CartSummary {
  vendors: CartVendorGroup[];
  total: number;
  itemCount: number;
}

export interface Order {
  id: string;
  buyerId: string;
  orderNumber: string;
  totalAmount: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
  shippingStatus: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";
  shippingAddress: Record<string, any>;
  shippingFee: number;
  taxAmount: number;
  discountAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  vendorOrders: VendorOrder[];
  payments: Payment[];
}

export interface VendorOrder {
  id: string;
  orderId: string;
  vendorId: string;
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  commissionFee: number;
  discountAmount: number;
  totalAmount: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: string;
  vendorOrderId: string;
  productVariantId: string;
  variant: ProductVariant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Payment {
  id: string;
  orderId: string;
  gatewayRef?: string;
  amount: number;
  method: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
  payload?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  user: { id: string; name: string };
  vendorId: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  images: ReviewImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewImage {
  id: string;
  reviewId: string;
  url: string;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  commissionRate: number;
  shippingMethods: Array<{ name: string; code: string; cost: number; estimatedDays: string }>;
  paymentMethods: Array<{ name: string; code: string; enabled: boolean }>;
  taxRate: number;
  currency: string;
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  minOrderAmount: number;
  maxOrderAmount: number;
}
