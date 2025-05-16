
import type { LucideIcon } from 'lucide-react';

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

// Updated Product interface to match new API (viewname=792)
export interface Product {
  id: string; // ITEM CODE (string)
  title: string; // ITEM NAME
  price: number; // SELLINGPRICE
  description: string; // ITEM DESCRIPTION
  category: string; // ITEM CATEGORY
  image: string | null; // IMAGEPATH
  classification: string; // ITEM CLASSIFICATION
  rating: { // Derived from RATING
    rate: number;
    count: number; // Defaulted to 0 as API doesn't provide count
  };
  stockAvailability: boolean; // Defaulted to true
  // Raw API fields for potential direct access if needed, though mapped fields are preferred
  PART_NO?: string;
  ITEM_BASE_UOM?: string;
  ITEM_ALT_UOM?: string;
  ITEM_CONV_FACTOR?: number;
  ITEM_VATABLE?: string;
  REORDER_LEVEL?: number | null;
  REORDER_QTY?: number | null;
  COST_PRICE?: number | null;
  LATEST_COST_PRICE?: number | null;
}

// --- START AUTH and USER TYPES ---
export type AddressType = 'home' | 'office' | 'other';

export interface UserAddress {
  street: string;
  city: string;
  pinCode: string;
  country?: string; // Added country to UserAddress as well for consistency
  addressType: AddressType;
}

export interface User {
  id: string;
  email: string;
  name: string; // Full name
  firstName?: string; // Added for potential use
  lastName?: string; // Added for potential use
  avatarUrl?: string;
  phoneNumber?: string;
  alternatePhoneNumber?: string;
  address?: UserAddress;
}

// Data collected during the multi-step signup process
export interface SignupData {
  name: string; // Full Name, will be split into FIRSTNAME, LASTNAME for API
  email: string;
  password?: string;
  phoneNumber?: string;
  addressStreet?: string; // Maps to PHYSICALADDRESS
  addressCity?: string; // Maps to CITY
  addressPinCode?: string; // Maps to POSTALCODE
  country?: string; // Maps to COUNTRY
  addressType?: AddressType; // For local User object, not directly sent to SP 128
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
  productId: string; // Align with Product.id (ITEM CODE)
  name: string; // Product title
  quantity: number;
  price: number; // Price at the time of order
  imageUrl?: string | null; // Product image
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
  estimatedTime?: string; 
  deliveryDetails?: CheckoutFormData; 
}
// --- END ORDER TYPES ---


export interface CartItem {
  productId: string; // Corresponds to Product.id (ITEM CODE)
  quantity: number;
}

export interface CartItemWithProductDetails extends Product {
  cartQuantity: number; 
  itemTotal: number;
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

// --- START ADMIN AUTH TYPES ---
export interface AdminUser {
  userType: boolean;
  userCode: string;
  emailId: string;
  traineeOrTrainer: string; 
}

export interface AdminLoginResponse {
  user: AdminUser;
  authenticationToken: string;
  sclientSecret: string; 
}

export interface AdminAuthState {
  adminUser: AdminUser | null;
  adminToken: string | null;
  sClientSecret: string | null;
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
// --- END ADMIN AUTH TYPES ---

// --- START ADMIN PRODUCT IMAGE MANAGEMENT TYPES ---
// This is the raw type from the API viewname=792
export interface AdminProduct {
  "ITEM CODE": string;
  "PART NO": string;
  "ITEM NAME": string;
  "ITEM DESCRIPTION": string;
  "ITEM CATEGORY": string;
  "ITEM SUB CATEGORY": string;
  "ITEM CLASSIFICATION": string;
  "ITEM BASE UOM": string;
  "ITEM ALT UOM": string;
  "ITEM CONV FACTOR": number;
  "ITEM VATABLE": string; 
  "REORDER LEVEL": number | null;
  "REORDER QTY": number | null;
  "COST PRICE": number | null;
  "LATEST COST PRICE": number | null;
  "SELLINGPRICE": number | null;
  "RATING": number | null;
  "IMAGEPATH": string | null;
}

export type ImageFilterStatus = "all" | "uploaded" | "not-uploaded";

export interface UploadImageApiResponse {
  data: string; 
  message: string;
  status: boolean;
}

export interface UpdateProductImagePathPayload {
  ITEMCODE: string;
  IMAGEPATH: string;
  SUCCESS_STATUS: string; 
  ERROR_STATUS: string;   
}

export interface UpdateProductImagePathResponse {
  message: string; 
}
// --- END ADMIN PRODUCT IMAGE MANAGEMENT TYPES ---

// --- START USER SIGNUP API (SP 128) TYPES ---
export interface UserSignupPayload {
  FIRSTNAME: string;
  LASTNAME: string;
  EMAILADDRESS: string;
  PASSWORD?: string;
  COUNTRY: string;
  CITY: string;
  POSTALCODE: string;
  PHYSICALADDRESS: string;
  PHONENUMBER?: string;
}

export interface UserSignupResponse {
  message?: string; // Example: "Saved data." or error message
  // Define other properties based on actual API response
  // e.g. status_code, error_message
}
// --- END USER SIGNUP API (SP 128) TYPES ---
