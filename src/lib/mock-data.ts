
import type { BannerImage, User, Order, CheckoutFormData, OrderType, OrderItemDetail, Product } from '@/types';
import { DINE_IN_ORDER_STATUS_STEPS, DELIVERY_ORDER_STATUS_STEPS } from '@/types';

export const bannerImages: BannerImage[] = [
  { id: '1', src: 'https://placehold.co/1200x400.png', alt: 'Delicious Sweet Rolls', dataAiHint: 'bakery pastry' },
  { id: '2', src: 'https://placehold.co/1200x400.png', alt: 'Freshly Baked Goods', dataAiHint: 'cake shop' },
  { id: '3', src: 'https://placehold.co/1200x400.png', alt: 'Morning Coffee and Pastries', dataAiHint: 'coffee pastry' },
];

export const sampleUser: User = {
  id: 'user123', // This ID might correspond to something in your auth system
  email: 'test@gmail.com',
  name: 'Test User',
  avatarUrl: 'https://placehold.co/100x100.png', 
  phoneNumber: '+254700111222',
  alternatePhoneNumber: '+254700333444',
  address: {
    street: '456 Mock Avenue, Suite 7B',
    city: 'Mock City',
    pinCode: '00200',
    addressType: 'home',
  },
};

const sampleOrderDeliveryAddress: CheckoutFormData = {
  fullName: 'Test User', 
  phoneNumber: '+254712345678', 
  deliveryAddress: '123 Test Street, Test City', 
  pinCode: '00100', 
};

// Sample order items - IDs should match ITEM CODEs from your new API for consistency
const sampleOrderItems: OrderItemDetail[] = [
  { productId: 'TOMKE001', name: 'Classic Cinnamon Roll (Mock)', quantity: 2, price: 350, imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'cinnamon roll' },
  { productId: 'TOMKE007', name: 'Espresso (Mock)', quantity: 1, price: 200, imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'espresso shot' },
  { productId: 'TOMKE003', name: 'Velvet Red Cake Slice (Mock)', quantity: 1, price: 500, imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'red velvet' },
  { productId: 'TOMKE005', name: 'Choco Chip Cookie (Mock)', quantity: 5, price: 150, imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'chocolate cookie' },
  { productId: 'TOMKE002', name: 'Chocolate Swirl Roll (Mock)', quantity: 1, price: 400, imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'chocolate pastry' },
  { productId: 'TOMKE008', name: 'Fresh Orange Juice (Mock)', quantity: 1, price: 300, imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'orange juice' },
];


export const sampleOrders: Order[] = [
  {
    id: 'ORD122344', 
    userId: sampleUser.id,
    orderType: 'delivery',
    currentStatus: 'In Transit',
    statusHistory: [
      { status: 'Order Placed', timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
      { status: 'Being Prepared', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
      { status: 'In Transit', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    ],
    items: [sampleOrderItems[0], sampleOrderItems[1]],
    totalAmount: (sampleOrderItems[0].price * sampleOrderItems[0].quantity) + sampleOrderItems[1].price,
    orderDate: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    estimatedTime: 'Approx. 10 mins remaining',
    deliveryDetails: sampleOrderDeliveryAddress,
  },
  {
    id: 'ORD567890',
    userId: sampleUser.id,
    orderType: 'dine-in',
    currentStatus: 'Being Prepared',
    statusHistory: [
      { status: 'Order Placed', timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString() },
      { status: 'Being Prepared', timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
    ],
    items: [sampleOrderItems[2]],
    totalAmount: sampleOrderItems[2].price,
    orderDate: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    estimatedTime: 'Ready in 15 mins',
  },
  {
    id: 'ORD112233',
    userId: sampleUser.id,
    orderType: 'delivery',
    currentStatus: 'Delivered',
    statusHistory: [
      { status: 'Order Placed', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() }, 
      { status: 'Being Prepared', timestamp: new Date(Date.now() - 1000 * 60 * (60 * 2 - 10)).toISOString() },
      { status: 'In Transit', timestamp: new Date(Date.now() - 1000 * 60 * (60 * 2 - 25)).toISOString() },
      { status: 'Delivered', timestamp: new Date(Date.now() - 1000 * 60 * (60 * 2 - 40)).toISOString() },
    ],
    items: [sampleOrderItems[3]],
    totalAmount: sampleOrderItems[3].price * sampleOrderItems[3].quantity,
    orderDate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    deliveryDetails: sampleOrderDeliveryAddress,
  },
    {
    id: 'ORD445566',
    userId: sampleUser.id,
    orderType: 'dine-in',
    currentStatus: 'Completed',
    statusHistory: [
      { status: 'Order Placed', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() }, 
      { status: 'Being Prepared', timestamp: new Date(Date.now() - 1000 * 60 * (60 * 24 * 2 - 5)).toISOString() },
      { status: 'Table Ready', timestamp: new Date(Date.now() - 1000 * 60 * (60 * 24 * 2 - 15)).toISOString() },
      { status: 'Completed', timestamp: new Date(Date.now() - 1000 * 60 * (60 * 24 * 2 - 45)).toISOString() },
    ],
    items: [sampleOrderItems[4], sampleOrderItems[5]],
    totalAmount: sampleOrderItems[4].price + sampleOrderItems[5].price,
    orderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
];

export const getOrderStatusFlow = (orderType: OrderType) => {
  return orderType === 'dine-in' ? DINE_IN_ORDER_STATUS_STEPS : DELIVERY_ORDER_STATUS_STEPS;
};
