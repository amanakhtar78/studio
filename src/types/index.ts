import type { LucideIcon } from 'lucide-react';

export interface BannerImage {
  id: string;
  src: string;
  alt: string;
  dataAiHint?: string;
}

export interface Category {
  id: string; // Generated: "cat-slug-from-name" or from API if available
  name: string; // From API (e.g., "electronics")
  slug: string; // Generated: "electronics" or from API
}

export interface Product {
  id: number; // from API
  title: string; // API uses title (map to name if needed by components)
  price: number;
  description: string;
  category: string; // API returns category name directly (map to categoryName if needed)
  image: string; // API uses image (map to imageUrl if needed)
  rating: {
    rate: number;
    count: number;
  };
  // Fields like stockAvailability can be added if API supports or default assumed
  stockAvailability?: boolean; // Added for consistency, will default to true
}

// --- START AUTH and USER TYPES ---
export type AddressType = 'home' | 'office' | 'other';

export interface UserAddress {
  street: string;
  city: string;
  pinCode: string;
  addressType: AddressType;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  phoneNumber?: string;
  alternatePhoneNumber?: string;
  address?: UserAddress;
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
  productId: string; // Keep as string to match CartItem
  name: string; // This should align with Product's title
  quantity: number;
  price: number; // Price at the time of order for one unit
  imageUrl?: string; // This should align with Product's image
  dataAiHint?: string; // This might be deprecated if API doesn't provide similar
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
  deliveryDetails?: CheckoutFormData; // If delivery - This is specific to an order
}
// --- END ORDER TYPES ---


export interface CartItem {
  productId: string; // Store as string, API product ID is number
  quantity: number;
}

// This type will be used when combining CartItem with full Product details from the store
export interface CartItemWithProductDetails extends Product {
  cartQuantity: number; // Renamed from quantity to avoid clash with Product.rating.count or other quantity fields
  itemTotal: number;
}


// This is for one-off checkout, distinct from User's primary address
export interface CheckoutFormData {
  fullName: string; // Could be pre-filled from User.name
  phoneNumber: string; // Could be pre-filled from User.phoneNumber
  deliveryAddress: string; // This is the full street address for delivery for THIS order
  pinCode: string; // Pin code for THIS order
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
