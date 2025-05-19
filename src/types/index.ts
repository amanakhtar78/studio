
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
}

export const signupFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required."}),
  lastName: z.string().min(1, { message: "Last name is required."}),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, {message: "Confirm password must be at least 6 characters."}),
  phoneNumber: z.string().regex(/^\+?[0-9]{10,14}$/, { message: "Invalid phone number format. e.g. +254712345678" }).optional().or(z.literal('')),
  addressStreet: z.string().min(5, { message: "Street address must be at least 5 characters." }).optional().or(z.literal('')),
  addressCity: z.string().min(2, { message: "City must be at least 2 characters." }).optional().or(z.literal('')),
  addressPinCode: z.string().regex(/^[0-9]{4,6}$/, { message: "Invalid pin code." }).optional().or(z.literal('')),
  country: z.string().min(2, { message: "Country must be at least 2 characters." }).optional().or(z.literal('')),
  addressType: z.enum(['home', 'office', 'other'], { errorMap: () => ({ message: "Please select an address type."}) }).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], 
});
export type SignupFormData = z.infer<typeof signupFormSchema>;


export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters." }),
  confirmNewPassword: z.string().min(6, { message: "Confirm new password must be at least 6 characters." }),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
});
export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;


export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  signup: (data: SignupData) => Promise<boolean>;
  updateUserProfile: (updatedProfileData: Partial<User>, currentPasswordForApi: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}
export type SignupData = SignupFormData; 

export type OrderType = 'dine-in' | 'delivery'; 

export type OrderStatusDineIn = "Order Placed" | "Being Prepared" | "Table Ready" | "Completed";
export type OrderStatusDelivery = "Order Placed" | "Being Prepared" | "In Transit" | "Delivered";
export type OrderStatus = OrderStatusDineIn | OrderStatusDelivery | "Unknown Status" | "Processing"; 

export const DINE_IN_ORDER_STATUS_STEPS: OrderStatusDineIn[] = ["Order Placed", "Being Prepared", "Table Ready", "Completed"];
export const DELIVERY_ORDER_STATUS_STEPS: OrderStatusDelivery[] = ["Order Placed", "Being Prepared", "In Transit", "Delivered"];


export interface OrderItemDetail {
  productId: string; 
  name: string; 
  quantity: number;
  price: number; // This will be unit price
  imageUrl?: string | null; 
  dataAiHint?: string;
}

// Raw item from viewname=654
export interface ApiOrderItemDetail {
  ENQUIRYNO: string;
  ENQUIRYDATE: string;
  ITEMSERIALNO: string;
  ITEMCODE: string;
  ITEMDESCRIPTION: string;
  ITEMUOM: string;
  ITEMQTY: number;
  ITEMRATE: number; // Assuming this is unit price or line total. To be confirmed.
  POITEMAMOUNT: number; // Assuming this is quantity * unit price
  VAT?: number;
  ITEMPARTNO?: string;
  // ... other fields from the API response
}

// Represents the data from viewname=655 API (Order Header)
export interface ApiOrderHeader {
  ENQUIRYNO: string;
  REFFROM: string;
  ENQUIRYDATE: string; 
  CLIENTCODE: string;
  CLIENTEMAIL: string;
  "CLIENT NAME": string;
  PHONENUMBER: string;
  ENQUIRYSTATUS: number; 
  "CLIENT ADDR1"?: string;
  DIVISION?: string;
  GROSSAMT?: number;
  MODEOFPAY?: string;
  // Add other fields from the API response as needed
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
  deliveryDetails?: Partial<CheckoutFormDataType>; // Using partial as not all fields might be there
  clientName?: string; 
  phoneNumber?: string; 
  rawEnquiryStatus?: number; 
}

export interface CartItem {
  productId: string; 
  quantity: number;
}

export interface CartItemWithProductDetails extends Product {
  cartQuantity: number; 
  itemTotal: number;
}


export const checkoutFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  phoneNumber: z.string().regex(/^\+?[0-9]{10,14}$/, { message: "Invalid phone number format. e.g. +254712345678" }),
  deliveryAddress: z.string().optional(), 
  city: z.string().optional(),
  pinCode: z.string().optional(), 
  country: z.string().optional(),
  modeOfPayment: z.enum(['pay_on_delivery', 'online', 'credit_pay_later'], { required_error: "Please select a mode of payment." }),
  salesEnquiryNotes: z.string().max(250, { message: "Notes cannot exceed 250 characters." }).optional().or(z.literal('')),
  addressOption: z.enum(['profile', 'new']).default('profile'), 
}).superRefine((data, ctx) => {
  if (data.addressOption === 'new') {
    if (!data.deliveryAddress || data.deliveryAddress.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Street address must be at least 5 characters.",
        path: ["deliveryAddress"],
      });
    }
    if (!data.city || data.city.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "City must be at least 2 characters.",
        path: ["city"],
      });
    }
    if (!data.pinCode || !/^[0-9A-Za-z\s-]{3,10}$/.test(data.pinCode)) { 
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid pin code (3-10 chars).",
        path: ["pinCode"],
      });
    }
     if (!data.country || data.country.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Country must be at least 2 characters.",
        path: ["country"],
      });
    }
  }
});

export type CheckoutFormDataType = z.infer<typeof checkoutFormSchema>;


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

export interface UserSignupPayload {
  FIRSTNAME: string;
  LASTNAME: string;
  EMAILADDRESS: string; 
  PASSWORD?: string;     
  COUNTRY?: string;
  CITY?: string;
  POSTALCODE?: string;
  PHYSICALADDRESS?: string;
  PHONENUMBER?: string;
}

export interface UserSignupResponse {
  message?: string; 
}

export interface ApiUserDetail {
  EMAILADDRESS: string;
  PASSWORD?: string; 
  FIRSTNAME: string;
  LASTNAME: string;
  CITY?: string; 
  CONFIRMED?: boolean;
  CONFIRMEDDATETIME?: string | null;
  COUNTRY?: string; 
  PHONENUMBER?: string;
  PHYSICALADDRESS?: string; 
  POSTALCODE?: string; 
  REGISTRATIONDATE?: string;
  REGISTRATIONTIME?: string;
}

export interface NextPurchaseOrderNumber {
  NEXTPONO: string;
}
export type NextPurchaseOrderNumberResponse = NextPurchaseOrderNumber[];


export interface SalesEnquiryHeaderPayload {
  SALESENQUIRYNO: number;
  SALESENQUIRYITEMSSERVICE: number; 
  CLIENTCODE: string; 
  REFFROM: string; 
  SALESENQUIRYDATE: string; 
  SALESENQUIRYVEHICLE: string; 
  DIVISION: string; 
  SALESENQUIRYNOTES: string; 
  CREATEDBY: string; 
  CREATEDDATE: string; 
  CREATEDTIME: string; 
  AMOUNTEXCVAT: number;
  VATAMOUNT: number;
  AMTOUNTINCLUSIVEVAT: number;
  CURRENCYCODE: string; 
  MODEOFPAY: string; 
  CLIENTNAME: string; 
  DELIVERYADDRESS: string; 
  CLIENTEMAIL: string; 
  CLIENTCOUNTRY: string; 
  CLIENTCITY: string; 
  CLIENTPHONENUMBER: string; 
  CARTNO: number; 
  DELIVERYPROVIDED: number; 
  DELIVERYROUTE: number; 
  DELIVERYCHARGES: number; 
  SUCCESS_STATUS: string,
  ERROR_STATUS: string,
}

export interface SalesEnquiryItemPayload {
  SALESENQUIRYNO: number; 
  SALESENQUIRYDATE: string; 
  SERIALNO: number; 
  ITEMCODE: string; 
  ITEMDESCRIPTION: string; 
  UOM: string; 
  ITEMQTY: number; 
  ITEMRATE: number; 
  ITEMVAT: number; 
  ITEMCURRENCY: string; 
  ITEMAMOUNT: number; 
  DIVISION: string; 
  CREATEDBY: string; 
  CREATEDDATE: string; 
  SUCCESS_STATUS: string,
  ERROR_STATUS: string,
}

export interface SalesEnquiryResponse {
  message: string; 
}
    
