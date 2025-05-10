
'use client';

import { useAuth } from '@/context/auth-context';
import { sampleOrders } from '@/lib/mock-data'; // Using sampleOrders for now
import type { Order } from '@/types';
import { OrderProgressBar } from '@/components/order-progress-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Package, ShoppingBag } from 'lucide-react'; 

export default function MyOrdersPage() {
  const { user } = useAuth();
  const userOrders: Order[] = user ? sampleOrders.filter(order => order.userId === user.id) : [];

  if (!userOrders || userOrders.length === 0) {
    return (
      <div className="container max-w-screen-md mx-auto px-2 md:px-4 py-8 text-center"> {/* Reduced padding */}
        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" /> {/* Reduced icon size and margin */}
        <h1 className="text-2xl font-bold mb-3">No Orders Yet</h1> {/* Reduced font size and margin */}
        <p className="text-muted-foreground mb-6 text-sm"> {/* Reduced font size and margin */}
          You haven't placed any orders. Start shopping to see your orders here!
        </p>
        <Button asChild size="sm">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-lg mx-auto px-2 md:px-4 py-4 md:py-6"> {/* Reduced padding */}
      <div className="flex flex-col items-center mb-6 md:mb-8"> {/* Reduced margin */}
        <Package className="h-10 w-10 text-primary mb-3" /> {/* Reduced icon size and margin */}
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground"> {/* Reduced font size */}
          My Orders
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">Track your current and past orders.</p> {/* Reduced margin and font size */}
      </div>

      <div className="space-y-6"> {/* Reduced spacing */}
        {userOrders.sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()).map((order) => (
          <Card key={order.id} className="shadow-md hover:shadow-lg transition-shadow duration-300"> {/* Reduced shadow */}
            <CardHeader className="p-4 pb-3"> {/* Reduced padding */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-1.5">
                <CardTitle className="text-lg md:text-xl text-primary">{/* Reduced font size */}
                  Order #{order.id}
                </CardTitle>
                <Badge 
                  variant={order.currentStatus === 'Delivered' || order.currentStatus === 'Completed' ? 'secondary' : 'default'} 
                  className="whitespace-nowrap text-xs px-2 py-0.5 h-5" /* Smaller badge */
                >
                  {order.currentStatus}
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground pt-0.5"> {/* Reduced font size and padding */}
                Placed on: {format(new Date(order.orderDate), 'PPp')} ({order.orderType === 'delivery' ? 'Delivery' : 'Dine-In'})
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 pb-3"> {/* Reduced padding */}
              <OrderProgressBar currentStatus={order.currentStatus} orderType={order.orderType} className="mb-4" /> {/* Reduced margin */}
              
              <div className="mb-3"> {/* Reduced margin */}
                <h4 className="font-semibold text-sm mb-1.5">Items:</h4> {/* Reduced font size and margin */}
                <ul className="space-y-1.5"> {/* Reduced spacing */}
                  {order.items.slice(0,2).map(item => ( 
                    <li key={item.productId} className="flex items-center space-x-2 text-xs"> {/* Reduced spacing and font size */}
                      <div className="relative w-10 h-10 rounded-sm overflow-hidden border bg-white p-0.5"> {/* Reduced image size */}
                        <Image 
                            src={item.imageUrl || `https://picsum.photos/seed/${item.productId}/40/40`} 
                            alt={item.name} 
                            layout="fill" 
                            objectFit="contain" 
                        />
                      </div>
                      <span>{item.name} (x{item.quantity})</span>
                      <span className="ml-auto font-medium">KES {(item.price * item.quantity).toLocaleString()}</span>
                    </li>
                  ))}
                  {order.items.length > 2 && <li className="text-xs text-muted-foreground text-center pt-0.5">...and {order.items.length - 2} more item(s)</li>}
                </ul>
              </div>
              <Separator className="my-3" /> {/* Reduced margin */}
              <div className="flex justify-between items-center">
                <p className="text-base font-bold">Total: KES {order.totalAmount.toLocaleString()}</p> {/* Reduced font size */}
                 {order.estimatedTime && (order.currentStatus !== "Completed" && order.currentStatus !== "Delivered") && (
                    <p className="text-xs text-primary font-medium">{order.estimatedTime}</p> 
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t p-3"> {/* Reduced padding */}
              <Button asChild size="sm" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground text-xs"> {/* Smaller button, text size */}
                <Link href={`/my-orders/${order.id}`}>View Details</Link>
              </Button>
              {(order.currentStatus === 'Completed' || order.currentStatus === 'Delivered') && (
                <Button variant="outline" size="sm" className="w-full sm:w-auto sm:ml-auto mt-1.5 sm:mt-0 text-xs" onClick={() => alert('Reorder functionality coming soon!')}> {/* Smaller button, text size */}
                  Reorder
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
