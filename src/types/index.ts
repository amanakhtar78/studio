
import type { LucideIcon } from 'lucide-react';
import * as z from 'zod';

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
  title: string; 
  price: number; 
  description: string; 
  category: string; 
  image: string | null; 
  classification: string; 
  rating: { 
    rate: number;
    count: number; 
  };
  stockAvailability: boolean; 
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
  country?: string; 
  addressType: AddressType;
}

export interface User {
  id: string; 
  email: string;
  name: string; 
  firstName?: string; 
  lastName?: string; 
  avatarUrl?: string; 
  phoneNumber?: string;
  alternatePhoneNumber?: string;
  address?: UserAddress;
  // We will NOT store password here for security reasons
}

export interface SignupData {
  firstName: string; 
  lastName: string;
  email: string;
  password?: string; // Password for signup
  confirmPassword?: string; // For client-side validation
  phoneNumber?: string;
  addressStreet?: string; 
  addressCity?: string; 
  addressPinCode?: string; 
  country?: string; 
  addressType?: AddressType; 
}

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters." }),
  confirmNewPassword: z.string().min(6, { message: "Confirm new password must be at least 6 characters." }),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
});
export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

// --- END AUTH and USER TYPES ---


// --- START ORDER TYPES ---
export type OrderType = 'dine-in' | 'delivery';

export type OrderStatusDineIn = "Order Placed" | "Being Prepared" | "Table Ready" | "Completed";
export type OrderStatusDelivery = "Order Placed" | "Being Prepared" | "In Transit" | "Delivered";

export type OrderStatus = OrderStatusDineIn | OrderStatusDelivery;

export const DINE_IN_ORDER_STATUS_STEPS: OrderStatusDineIn[] = ["Order Placed", "Being Prepared", "Table Ready", "Completed"];
export const DELIVERY_ORDER_STATUS_STEPS: OrderStatusDelivery[] = ["Order Placed", "Being Prepared", "In Transit", "Delivered"];


export interface OrderItemDetail {
  productId: string; 
  name: string; 
  quantity: number;
  price: number; 
  imageUrl?: string | null; 
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
  orderDate: string; 
  estimatedTime?: string; 
  deliveryDetails?: CheckoutFormData; 
}
// --- END ORDER TYPES ---


export interface CartItem {
  productId: string; 
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
export interface AdminProduct {
  "ITEM CODE": string;
  "PART NO": string;
  "ITEM NAME": string;
  "ITEM CATEGORY": string;
  "ITEM SUB CATEGORY": string;
  "ITEM CLASSIFICATION": string;
  "IMAGEPATH": string | null;
  "ITEM DESCRIPTION": string; 
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
// Payload for SP 128 (Signup and potentially Profile Update)
export interface UserSignupPayload {
  FIRSTNAME: string;
  LASTNAME: string;
  EMAILADDRESS: string; // Primary key for matching existing user
  PASSWORD?: string;     // Required for signup, optional for profile update (if not changing password)
  COUNTRY?: string;
  CITY?: string;
  POSTALCODE?: string;
  PHYSICALADDRESS?: string;
  PHONENUMBER?: string;
}

export interface UserSignupResponse {
  message?: string; 
}
// --- END USER SIGNUP API (SP 128) TYPES ---

// --- START API USER DETAIL (VIEWNAME 610) TYPE ---
export interface ApiUserDetail {
  EMAILADDRESS: string;
  PASSWORD?: string; 
  FIRSTNAME: string;
  LASTNAME: string;
  CITY?: string; // Made optional as it might not always be present
  CONFIRMED?: boolean;
  CONFIRMEDDATETIME?: string | null;
  COUNTRY?: string; // Made optional
  PHONENUMBER?: string;
  PHYSICALADDRESS?: string; // Made optional
  POSTALCODE?: string; // Made optional
  REGISTRATIONDATE?: string;
  REGISTRATIONTIME?: string;
}
// --- END API USER DETAIL (VIEWNAME 610) TYPE ---
