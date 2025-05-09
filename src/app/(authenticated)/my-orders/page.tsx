
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
import { Package, ShoppingBag } from 'lucide-react'; // Removed AlertCircle as it's not used when orders exist

export default function MyOrdersPage() {
  const { user } = useAuth();
  const userOrders: Order[] = user ? sampleOrders.filter(order => order.userId === user.id) : [];

  if (!userOrders || userOrders.length === 0) {
    return (
      <div className="container max-w-screen-lg mx-auto px-4 md:px-6 py-12 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">No Orders Yet</h1>
        <p className="text-muted-foreground mb-8">
          You haven't placed any orders. Start shopping to see your orders here!
        </p>
        <Button asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-lg mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="flex flex-col items-center mb-8 md:mb-12">
        <Package className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          My Orders
        </h1>
        <p className="text-muted-foreground mt-2">Track your current and past orders.</p>
      </div>

      <div className="space-y-8">
        {userOrders.sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()).map((order) => (
          <Card key={order.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <CardTitle className="text-xl md:text-2xl text-primary">Order #{order.id}</CardTitle>
                <Badge variant={order.currentStatus === 'Delivered' || order.currentStatus === 'Completed' ? 'secondary' : 'default'} className="whitespace-nowrap">
                  {order.currentStatus}
                </Badge>
              </div>
              <CardDescription className="text-sm text-muted-foreground pt-1">
                Placed on: {format(new Date(order.orderDate), 'PPpp')} ({order.orderType === 'delivery' ? 'Delivery' : 'Dine-In'})
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 pb-4">
              <OrderProgressBar currentStatus={order.currentStatus} orderType={order.orderType} className="mb-6" />
              
              <div className="mb-4">
                <h4 className="font-semibold text-md mb-2">Items:</h4>
                <ul className="space-y-2">
                  {order.items.slice(0,2).map(item => ( 
                    <li key={item.productId} className="flex items-center space-x-3 text-sm">
                      <div className="relative w-12 h-12 rounded-md overflow-hidden border bg-white p-0.5">
                        <Image 
                            src={item.imageUrl || `https://picsum.photos/seed/${item.productId}/50/50`} 
                            alt={item.name} 
                            layout="fill" 
                            objectFit="contain" // Changed to contain
                        />
                      </div>
                      <span>{item.name} (x{item.quantity})</span>
                      <span className="ml-auto font-medium">KES {(item.price * item.quantity).toLocaleString()}</span>
                    </li>
                  ))}
                  {order.items.length > 2 && <li className="text-sm text-muted-foreground text-center pt-1">...and {order.items.length - 2} more item(s)</li>}
                </ul>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold">Total: KES {order.totalAmount.toLocaleString()}</p>
                 {order.estimatedTime && (order.currentStatus !== "Completed" && order.currentStatus !== "Delivered") && (
                    <p className="text-sm text-primary font-medium">{order.estimatedTime}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button asChild className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href={`/my-orders/${order.id}`}>View Details</Link>
              </Button>
              {(order.currentStatus === 'Completed' || order.currentStatus === 'Delivered') && (
                <Button variant="outline" className="w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0" onClick={() => alert('Reorder functionality coming soon!')}>
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
