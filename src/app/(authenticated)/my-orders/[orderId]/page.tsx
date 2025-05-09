
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { sampleOrders, products as allProducts } from '@/lib/mock-data';
import type { Order, OrderItemDetail } from '@/types';
import { OrderProgressBar } from '@/components/order-progress-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft, MapPin, Phone, Tag, AlertCircle, ShoppingBag } from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const orderId = params.orderId as string;

  // In a real app, fetch order by ID and ensure it belongs to the user
  const order: Order | undefined = sampleOrders.find(o => o.id === orderId && o.userId === user?.id);

  if (!isAuthenticated) { // Should be handled by layout, but good to double check
    router.replace('/');
    return null;
  }

  if (!order) {
    return (
      <div className="container max-w-screen-lg mx-auto px-4 md:px-6 py-12 text-center">
        <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
        <p className="text-muted-foreground mb-8">
          We couldn't find the order you're looking for, or it doesn't belong to your account.
        </p>
        <Button asChild variant="outline">
          <Link href="/my-orders">Back to My Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-lg mx-auto px-4 md:px-6 py-8 md:py-12">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Orders
      </Button>

      <Card className="shadow-xl">
        <CardHeader className="bg-muted/30 rounded-t-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <CardTitle className="text-2xl md:text-3xl text-primary">Order #{order.id}</CardTitle>
            <Badge variant={order.currentStatus === 'Delivered' || order.currentStatus === 'Completed' ? 'secondary' : 'default'} className="text-sm px-3 py-1">
              {order.currentStatus}
            </Badge>
          </div>
          <CardDescription className="text-sm text-muted-foreground pt-2">
            Placed on: {format(new Date(order.orderDate), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
          </CardDescription>
           {order.estimatedTime && (order.currentStatus !== "Completed" && order.currentStatus !== "Delivered") && (
              <p className="text-sm text-accent font-semibold pt-1">{order.estimatedTime}</p>
            )}
        </CardHeader>

        <CardContent className="p-6">
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Order Status</h3>
            <OrderProgressBar currentStatus={order.currentStatus} orderType={order.orderType} />
          </div>

          <Separator className="my-8" />

          <div>
            <h3 className="text-xl font-semibold mb-4 text-foreground">Items Ordered</h3>
            <div className="space-y-4">
              {order.items.map((item: OrderItemDetail) => (
                <div key={item.productId} className="flex items-start space-x-4 p-3 border rounded-lg bg-card hover:bg-muted/20 transition-colors">
                  <div className="relative w-20 h-20 rounded-md overflow-hidden border">
                    <Image 
                        src={item.imageUrl || `https://picsum.photos/seed/${item.productId}/100/100`} 
                        alt={item.name} 
                        layout="fill" 
                        objectFit="cover"
                        data-ai-hint={item.dataAiHint || "food item"}
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-semibold text-lg text-foreground">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    <p className="text-sm text-muted-foreground">Price per item: KES {item.price.toLocaleString()}</p>
                  </div>
                  <p className="text-md font-semibold text-primary">KES {(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-8" />
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">Order Summary</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>KES {order.totalAmount.toLocaleString()}</span> {/* Assuming totalAmount is subtotal for now */}
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Fee:</span>
                        <span>{order.orderType === 'delivery' ? 'KES 150' : 'N/A (Dine-In)'}</span>
                    </div>
                    <Separator className="my-1" />
                    <div className="flex justify-between font-bold text-lg text-foreground">
                        <span>Total Paid:</span>
                        <span>KES {(order.totalAmount + (order.orderType === 'delivery' ? 150 : 0)).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {order.orderType === 'delivery' && order.deliveryDetails && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">Delivery Details</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center"><Tag className="w-4 h-4 mr-2 text-muted-foreground" /> <span className="font-medium">{order.deliveryDetails.fullName}</span></p>
                  <p className="flex items-center"><Phone className="w-4 h-4 mr-2 text-muted-foreground" /> {order.deliveryDetails.phoneNumber}</p>
                  <p className="flex items-start"><MapPin className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" /> {order.deliveryDetails.deliveryAddress}, {order.deliveryDetails.pinCode}</p>
                </div>
              </div>
            )}
             {order.orderType === 'dine-in' && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">Dine-In Details</h3>
                 <p className="text-sm text-muted-foreground">This order is for dine-in at our cafe.</p>
                  {order.currentStatus === "Table Ready" && <p className="text-sm text-green-600 font-medium mt-2">Your table is ready!</p>}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t p-6 flex justify-end">
          {(order.currentStatus === 'Completed' || order.currentStatus === 'Delivered') && (
            <Button variant="default" className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => alert('Reorder functionality coming soon!')}>
             <ShoppingBag className="mr-2 h-4 w-4" /> Reorder Items
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

// export const metadata = { // Dynamic metadata would require generating static params or server component logic
//   title: 'Order Details - Zahra Sweet Rolls',
//   description: 'View the details of your order from Zahra Sweet Rolls.',
// };