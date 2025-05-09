import type { BannerImage, User, Order, CheckoutFormData, OrderType } from '@/types';
import { DINE_IN_ORDER_STATUS_STEPS, DELIVERY_ORDER_STATUS_STEPS } from '@/types';

export const bannerImages: BannerImage[] = [
  { id: '1', src: 'https://picsum.photos/1200/400?random=1', alt: 'Delicious Sweet Rolls', dataAiHint: 'bakery pastry' },
  { id: '2', src: 'https://picsum.photos/1200/400?random=2', alt: 'Freshly Baked Goods', dataAiHint: 'cake shop' },
  { id: '3', src: 'https://picsum.photos/1200/400?random=3', alt: 'Morning Coffee and Pastries', dataAiHint: 'coffee pastry' },
];

// Removed categories and products arrays as they will be fetched from API.

export const sampleUser: User = {
  id: 'user123',
  email: 'test@gmail.com',
  name: 'Test User',
  avatarUrl: 'https://picsum.photos/seed/user123/100/100', 
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
    items: [
      { productId: '1', name: 'Classic Cinnamon Roll (Mock)', quantity: 2, price: 350, imageUrl: 'https://picsum.photos/300/200?random=11', dataAiHint: 'cinnamon roll' },
      { productId: '7', name: 'Espresso (Mock)', quantity: 1, price: 200, imageUrl: 'https://picsum.photos/300/200?random=17', dataAiHint: 'espresso shot' },
    ],
    totalAmount: (2 * 350) + 200,
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
    items: [
      { productId: '3', name: 'Velvet Red Cake Slice (Mock)', quantity: 1, price: 500, imageUrl: 'https://picsum.photos/300/200?random=13', dataAiHint: 'red velvet' },
    ],
    totalAmount: 500,
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
    items: [
      { productId: '5', name: 'Choco Chip Cookie (Mock)', quantity: 5, price: 150, imageUrl: 'https://picsum.photos/300/200?random=15', dataAiHint: 'chocolate cookie' },
    ],
    totalAmount: 5 * 150,
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
    items: [
      { productId: '2', name: 'Chocolate Swirl Roll (Mock)', quantity: 1, price: 400, imageUrl: 'https://picsum.photos/300/200?random=12', dataAiHint: 'chocolate pastry' },
      { productId: '8', name: 'Fresh Orange Juice (Mock)', quantity: 1, price: 300, imageUrl: 'https://picsum.photos/300/200?random=18', dataAiHint: 'orange juice' },
    ],
    totalAmount: 400 + 300,
    orderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
];

export const getOrderStatusFlow = (orderType: OrderType) => {
  return orderType === 'dine-in' ? DINE_IN_ORDER_STATUS_STEPS : DELIVERY_ORDER_STATUS_STEPS;
};
