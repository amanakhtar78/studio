
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { sampleOrders } from '@/lib/mock-data'; // Removed products as allProducts
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

  if (!isAuthenticated) { 
    router.replace('/');
    return null;
  }

  if (!order) {
    return (
      <div className="container max-w-screen-md mx-auto px-2 md:px-4 py-8 text-center"> {/* Reduced padding */}
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" /> {/* Reduced icon size and margin */}
        <h1 className="text-2xl font-bold mb-3">Order Not Found</h1> {/* Reduced font size and margin */}
        <p className="text-muted-foreground mb-6 text-sm"> {/* Reduced font size and margin */}
          We couldn't find the order you're looking for, or it doesn't belong to your account.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/my-orders" legacyBehavior passHref><a>Back to My Orders</a></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-lg mx-auto px-2 md:px-4 py-4 md:py-6"> {/* Reduced padding */}
      <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4 text-xs"> {/* Smaller button, reduced margin, text size */}
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to My Orders
      </Button>

      <Card className="shadow-lg">
        <CardHeader className="bg-muted/30 rounded-t-lg p-4"> {/* Reduced padding */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5">
            <CardTitle className="text-xl md:text-2xl text-primary">Order #{order.id}</CardTitle> {/* Reduced font size */}
            <Badge 
              variant={order.currentStatus === 'Delivered' || order.currentStatus === 'Completed' ? 'secondary' : 'default'} 
              className="text-xs px-2 py-0.5 h-5" /* Smaller badge */
            >
              {order.currentStatus}
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground pt-1"> {/* Reduced font size and padding */}
            Placed on: {format(new Date(order.orderDate), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
          </CardDescription>
           {order.estimatedTime && (order.currentStatus !== "Completed" && order.currentStatus !== "Delivered") && (
              <p className="text-xs text-accent font-semibold pt-0.5">{order.estimatedTime}</p> /* Reduced font size and padding */
            )}
        </CardHeader>

        <CardContent className="p-4"> {/* Reduced padding */}
          <div className="mb-6"> {/* Reduced margin */}
            <h3 className="text-lg font-semibold mb-3 text-foreground">Order Status</h3> {/* Reduced font size and margin */}
            <OrderProgressBar currentStatus={order.currentStatus} orderType={order.orderType} />
          </div>

          <Separator className="my-6" /> {/* Reduced margin */}

          <div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">Items Ordered</h3> {/* Reduced font size and margin */}
            <div className="space-y-3"> {/* Reduced spacing */}
              {order.items.map((item: OrderItemDetail) => (
                <div key={item.productId} className="flex items-start space-x-3 p-2.5 border rounded-lg bg-card hover:bg-muted/20 transition-colors"> {/* Reduced padding and spacing */}
                  <div className="relative w-16 h-16 rounded-md overflow-hidden border bg-white p-1"> {/* Reduced image size */}
                    <Image 
                        src={item.imageUrl || `https://picsum.photos/seed/${item.productId}/64/64`} 
                        alt={item.name} 
                        layout="fill" 
                        objectFit="contain" 
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-semibold text-base text-foreground">{item.name}</h4> {/* Reduced font size */}
                    <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                    <p className="text-xs text-muted-foreground">Price per item: KES {item.price.toLocaleString()}</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">KES {(item.price * item.quantity).toLocaleString()}</p> {/* Reduced font size */}
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" /> {/* Reduced margin */}
          
          <div className="grid md:grid-cols-2 gap-4"> {/* Reduced gap */}
            <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Order Summary</h3> {/* Reduced font size and margin */}
                <div className="space-y-1.5 text-xs"> {/* Reduced spacing and font size */}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>KES {order.totalAmount.toLocaleString()}</span> 
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Fee:</span>
                        <span>{order.orderType === 'delivery' ? 'KES 150' : 'N/A (Dine-In)'}</span>
                    </div>
                    <Separator className="my-1" />
                    <div className="flex justify-between font-bold text-base text-foreground"> {/* Reduced font size */}
                        <span>Total Paid:</span>
                        <span>KES {(order.totalAmount + (order.orderType === 'delivery' ? 150 : 0)).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {order.orderType === 'delivery' && order.deliveryDetails && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Delivery Details</h3> {/* Reduced font size and margin */}
                <div className="space-y-1.5 text-xs"> {/* Reduced spacing and font size */}
                  <p className="flex items-center"><Tag className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> <span className="font-medium">{order.deliveryDetails.fullName}</span></p>
                  <p className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> {order.deliveryDetails.phoneNumber}</p>
                  <p className="flex items-start"><MapPin className="w-3.5 h-3.5 mr-1.5 mt-0.5 text-muted-foreground flex-shrink-0" /> {order.deliveryDetails.deliveryAddress}, {order.deliveryDetails.pinCode}</p>
                </div>
              </div>
            )}
             {order.orderType === 'dine-in' && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Dine-In Details</h3> {/* Reduced font size and margin */}
                 <p className="text-xs text-muted-foreground">This order is for dine-in at our cafe.</p> {/* Reduced font size */}
                  {order.currentStatus === "Table Ready" && <p className="text-xs text-green-600 font-medium mt-1.5">Your table is ready!</p>} {/* Reduced font size */}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t p-3 flex justify-end"> {/* Reduced padding */}
          {(order.currentStatus === 'Completed' || order.currentStatus === 'Delivered') && (
            <Button variant="default" size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs" onClick={() => alert('Reorder functionality coming soon!')}> {/* Smaller button, text size */}
             <ShoppingBag className="mr-1.5 h-3.5 w-3.5" /> Reorder Items
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
