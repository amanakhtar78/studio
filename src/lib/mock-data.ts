import type { BannerImage, Category, Product, Order, User, OrderItemDetail, CheckoutFormData } from '@/types';
import { DINE_IN_ORDER_STATUS_STEPS, DELIVERY_ORDER_STATUS_STEPS } from '@/types';


export const bannerImages: BannerImage[] = [
  { id: '1', src: 'https://picsum.photos/1200/400?random=1', alt: 'Delicious Sweet Rolls', dataAiHint: 'bakery pastry' },
  { id: '2', src: 'https://picsum.photos/1200/400?random=2', alt: 'Freshly Baked Goods', dataAiHint: 'cake shop' },
  { id: '3', src: 'https://picsum.photos/1200/400?random=3', alt: 'Morning Coffee and Pastries', dataAiHint: 'coffee pastry' },
];

export const categories: Category[] = [
  { id: 'cat1', name: 'Sweet Rolls', slug: 'sweet-rolls' },
  { id: 'cat2', name: 'Cakes', slug: 'cakes' },
  { id: 'cat3', name: 'Cookies', slug: 'cookies' },
  { id: 'cat4', name: 'Beverages', slug: 'beverages' },
];

export const products: Product[] = [
  // Sweet Rolls
  {
    id: 'prod1',
    name: 'Classic Cinnamon Roll',
    description: 'Warm, gooey cinnamon roll with cream cheese frosting.',
    price: 350,
    categorySlug: 'sweet-rolls',
    categoryName: 'Sweet Rolls',
    imageUrl: 'https://picsum.photos/300/200?random=11',
    stockAvailability: true,
    dataAiHint: 'cinnamon roll',
  },
  {
    id: 'prod2',
    name: 'Chocolate Swirl Roll',
    description: 'Rich chocolate swirled into a soft, sweet dough.',
    price: 400,
    categorySlug: 'sweet-rolls',
    categoryName: 'Sweet Rolls',
    imageUrl: 'https://picsum.photos/300/200?random=12',
    stockAvailability: true,
    dataAiHint: 'chocolate pastry',
  },
  // Cakes
  {
    id: 'prod3',
    name: 'Velvet Red Cake Slice',
    description: 'A slice of our signature red velvet cake with vanilla buttercream.',
    price: 500,
    categorySlug: 'cakes',
    categoryName: 'Cakes',
    imageUrl: 'https://picsum.photos/300/200?random=13',
    stockAvailability: true,
    dataAiHint: 'red velvet',
  },
  {
    id: 'prod4',
    name: 'Carrot Cake Slice',
    description: 'Moist carrot cake with walnuts and cream cheese frosting.',
    price: 480,
    categorySlug: 'cakes',
    categoryName: 'Cakes',
    imageUrl: 'https://picsum.photos/300/200?random=14',
    stockAvailability: false,
    dataAiHint: 'carrot cake',
  },
  // Cookies
  {
    id: 'prod5',
    name: 'Choco Chip Cookie',
    description: 'Classic chocolate chip cookie, crispy edges and chewy center.',
    price: 150,
    categorySlug: 'cookies',
    categoryName: 'Cookies',
    imageUrl: 'https://picsum.photos/300/200?random=15',
    stockAvailability: true,
    dataAiHint: 'chocolate cookie',
  },
  {
    id: 'prod6',
    name: 'Oatmeal Raisin Cookie',
    description: 'Hearty oatmeal cookie with sweet raisins.',
    price: 120,
    categorySlug: 'cookies',
    categoryName: 'Cookies',
    imageUrl: 'https://picsum.photos/300/200?random=16',
    stockAvailability: true,
    dataAiHint: 'oatmeal cookie',
  },
  // Beverages
  {
    id: 'prod7',
    name: 'Espresso',
    description: 'Strong and aromatic single shot espresso.',
    price: 200,
    categorySlug: 'beverages',
    categoryName: 'Beverages',
    imageUrl: 'https://picsum.photos/300/200?random=17',
    stockAvailability: true,
    dataAiHint: 'espresso shot',
  },
  {
    id: 'prod8',
    name: 'Fresh Orange Juice',
    description: 'Squeezed daily, pure orange goodness.',
    price: 300,
    categorySlug: 'beverages',
    categoryName: 'Beverages',
    imageUrl: 'https://picsum.photos/300/200?random=18',
    stockAvailability: true,
    dataAiHint: 'orange juice',
  },
];

export const sampleUser: User = {
  id: 'user123',
  email: 'test@gmail.com',
  name: 'Test User',
  avatarUrl: 'https://picsum.photos/seed/user123/100/100', // Placeholder avatar
};

const sampleDeliveryAddress: CheckoutFormData = {
  fullName: 'Test User',
  phoneNumber: '+254712345678',
  deliveryAddress: '123 Test Street, Test City',
  pinCode: '00100',
};

export const sampleOrders: Order[] = [
  {
    id: 'ORD122344', // Example active order from prompt
    userId: sampleUser.id,
    orderType: 'delivery',
    currentStatus: 'In Transit',
    statusHistory: [
      { status: 'Order Placed', timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
      { status: 'Being Prepared', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
      { status: 'In Transit', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    ],
    items: [
      { productId: 'prod1', name: 'Classic Cinnamon Roll', quantity: 2, price: 350, imageUrl: products.find(p=>p.id==='prod1')?.imageUrl, dataAiHint: products.find(p=>p.id==='prod1')?.dataAiHint },
      { productId: 'prod7', name: 'Espresso', quantity: 1, price: 200, imageUrl: products.find(p=>p.id==='prod7')?.imageUrl, dataAiHint: products.find(p=>p.id==='prod7')?.dataAiHint },
    ],
    totalAmount: (2 * 350) + 200,
    orderDate: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    estimatedTime: 'Approx. 10 mins remaining',
    deliveryDetails: sampleDeliveryAddress,
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
      { productId: 'prod3', name: 'Velvet Red Cake Slice', quantity: 1, price: 500, imageUrl: products.find(p=>p.id==='prod3')?.imageUrl, dataAiHint: products.find(p=>p.id==='prod3')?.dataAiHint },
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
      { status: 'Order Placed', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() }, // 2 hours ago
      { status: 'Being Prepared', timestamp: new Date(Date.now() - 1000 * 60 * (60 * 2 - 10)).toISOString() },
      { status: 'In Transit', timestamp: new Date(Date.now() - 1000 * 60 * (60 * 2 - 25)).toISOString() },
      { status: 'Delivered', timestamp: new Date(Date.now() - 1000 * 60 * (60 * 2 - 40)).toISOString() },
    ],
    items: [
      { productId: 'prod5', name: 'Choco Chip Cookie', quantity: 5, price: 150, imageUrl: products.find(p=>p.id==='prod5')?.imageUrl, dataAiHint: products.find(p=>p.id==='prod5')?.dataAiHint },
    ],
    totalAmount: 5 * 150,
    orderDate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    deliveryDetails: sampleDeliveryAddress,
  },
    {
    id: 'ORD445566',
    userId: sampleUser.id,
    orderType: 'dine-in',
    currentStatus: 'Completed',
    statusHistory: [
      { status: 'Order Placed', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() }, // 2 days ago
      { status: 'Being Prepared', timestamp: new Date(Date.now() - 1000 * 60 * (60 * 24 * 2 - 5)).toISOString() },
      { status: 'Table Ready', timestamp: new Date(Date.now() - 1000 * 60 * (60 * 24 * 2 - 15)).toISOString() },
      { status: 'Completed', timestamp: new Date(Date.now() - 1000 * 60 * (60 * 24 * 2 - 45)).toISOString() },
    ],
    items: [
      { productId: 'prod2', name: 'Chocolate Swirl Roll', quantity: 1, price: 400, imageUrl: products.find(p=>p.id==='prod2')?.imageUrl, dataAiHint: products.find(p=>p.id==='prod2')?.dataAiHint },
      { productId: 'prod8', name: 'Fresh Orange Juice', quantity: 1, price: 300, imageUrl: products.find(p=>p.id==='prod8')?.imageUrl, dataAiHint: products.find(p=>p.id==='prod8')?.dataAiHint },
    ],
    totalAmount: 400 + 300,
    orderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
];

// The old sampleOrder is no longer needed as we have sampleOrders array
// export const sampleOrder: Order = { ... }; 

// These are now exported from types/index.ts but kept here for reference if needed by other logic
export const orderStatusStepsDineIn = DINE_IN_ORDER_STATUS_STEPS;
export const orderStatusStepsDelivery = DELIVERY_ORDER_STATUS_STEPS;

// A general helper to get steps based on order type, if needed by components directly
export const getOrderStatusFlow = (orderType: OrderType) => {
  return orderType === 'dine-in' ? DINE_IN_ORDER_STATUS_STEPS : DELIVERY_ORDER_STATUS_STEPS;
};