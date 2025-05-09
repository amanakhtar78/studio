import type { LucideIcon } from 'lucide-react';

export interface BannerImage {
  id: string;
  src: string;
  alt: string;
  dataAiHint?: string;
}

export interface Category {
  id:string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // KES
  categorySlug: string; 
  categoryName: string;
  imageUrl: string;
  stockAvailability: boolean;
  dataAiHint?: string;
}

// --- START AUTH and USER TYPES ---
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}
// --- END AUTH and USER TYPES ---


// --- START ORDER TYPES ---
export type OrderType = 'dine-in' | 'delivery';

export type OrderStatusDineIn = "Order Placed" | "Being Prepared" | "Table Ready" | "Completed";
export type OrderStatusDelivery = "Order Placed" | "Being Prepared" | "In Transit" | "Delivered";

// Union of all possible statuses
export type OrderStatus = OrderStatusDineIn | OrderStatusDelivery;

// Define the steps for each order type specifically
export const DINE_IN_ORDER_STATUS_STEPS: OrderStatusDineIn[] = ["Order Placed", "Being Prepared", "Table Ready", "Completed"];
export const DELIVERY_ORDER_STATUS_STEPS: OrderStatusDelivery[] = ["Order Placed", "Being Prepared", "In Transit", "Delivered"];


export interface OrderItemDetail {
  productId: string;
  name: string;
  quantity: number;
  price: number; // Price at the time of order for one unit
  imageUrl?: string;
  dataAiHint?: string;
}

export interface Order {
  id: string;
  userId: string;
  orderType: OrderType;
  currentStatus: OrderStatus;
  statusHistory: { status: OrderStatus; timestamp: string }[];
  items: OrderItemDetail[];
  totalAmount: number;
  orderDate: string; // ISO string
  estimatedTime?: string; // e.g., "10 mins", "Ready by 7:00 PM"
  deliveryDetails?: CheckoutFormData; // If delivery
}
// --- END ORDER TYPES ---


export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartItemWithProduct extends Product {
  quantity: number;
}

export interface CheckoutFormData {
  fullName: string;
  phoneNumber: string;
  deliveryAddress: string;
  pinCode: string;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface HighlightItem {
  icon: LucideIcon;
  title: string;
  description: string;
}