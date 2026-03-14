export interface Category {
  id: number;
  name: string;
  parentId?: number | null;
  createdAt: string;
  parent?: Category | null;
  children?: Category[];
  _count?: { products: number; children: number };
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  brand?: string;
  stock: number;
  status: boolean;
  image?: string;
  categoryId: number;
  createdAt: string;
  category?: Category;
}

export type OrderStatus = "PREPARING" | "SHIPPED" | "COMPLETED" | "CANCELLED";
export type PaymentMethod = "CARD" | "CASH" | "TRANSFER";
export type PaymentStatus = "PAID" | "PENDING" | "FAILED";

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  product?: Product;
}

export interface OrderHistory {
  id: number;
  orderId: number;
  status: OrderStatus;
  note?: string;
  createdAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  address?: string;
  trackingNumber?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  history: OrderHistory[];
}
