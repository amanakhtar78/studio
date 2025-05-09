import type { BannerImage, Category, Product, Order, OrderStatusStep } from '@/types';

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

export const sampleOrder: Order = {
  id: 'ORD12345',
  currentStatus: 'Preparing',
  statusHistory: [
    { status: 'Order Confirmed', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
    { status: 'Preparing', timestamp: new Date().toISOString() },
  ],
};

export const orderStatusSteps: OrderStatusStep[] = [
  "Order Confirmed",
  "Preparing",
  "Searching for Driver",
  "Assigned to Driver",
  "Out for Delivery",
];
