
export interface BannerImage {
  id: string;
  src: string;
  alt: string;
  dataAiHint?: string;
}

export interface Category {
  id: string;
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

export type OrderStatusStep =
  | "Order Confirmed"
  | "Preparing"
  | "Searching for Driver"
  | "Assigned to Driver"
  | "Out for Delivery";

export interface Order {
  id: string;
  currentStatus: OrderStatusStep;
  statusHistory: { status: OrderStatusStep; timestamp: string }[]; // Using string for simplicity, ideally Date
}

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
