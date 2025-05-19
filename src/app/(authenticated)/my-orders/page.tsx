
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import type { Order, ApiOrderHeader, OrderStatus } from '@/types';
import { OrderProgressBar } from '@/components/order-progress-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image'; // Keep for potential item display in future
import { format } from 'date-fns';
import { Package, ShoppingBag, Loader2, AlertTriangle } from 'lucide-react'; 
import { fetchOrderHistoryAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

// Temporary mapping for ENQUIRYSTATUS to OrderStatus
const mapEnquiryStatusToOrderStatus = (status: number): OrderStatus => {
  switch (status) {
    case 0: return 'Order Placed';
    case 1: return 'Being Prepared';
    case 2: return 'In Transit'; // Assuming delivery as default for now
    case 3: return 'Delivered'; // Assuming delivery as default for now
    // Add more cases as per your backend's ENQUIRYSTATUS definitions
    default: return 'Unknown Status';
  }
};


export default function MyOrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const placeholderImage = "https://placehold.co/40x40.png";


  useEffect(() => {
    const loadOrders = async () => {
      if (!isAuthenticated || !user?.email) {
        setIsLoading(false);
        // Auth guard in AuthenticatedLayout should handle redirection/modal
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchOrderHistoryAPI(user.email);
        if (response.data && Array.isArray(response.data)) {
          const mappedOrders: Order[] = response.data.map((apiOrder: ApiOrderHeader) => ({
            id: apiOrder.ENQUIRYNO,
            userId: apiOrder.CLIENTCODE,
            orderType: 'delivery', // FIXME: This is a placeholder, API doesn't provide it
            currentStatus: mapEnquiryStatusToOrderStatus(apiOrder.ENQUIRYSTATUS),
            statusHistory: [{ status: mapEnquiryStatusToOrderStatus(apiOrder.ENQUIRYSTATUS), timestamp: apiOrder.ENQUIRYDATE }], // Simplified history
            items: [], // Item details not provided by this API
            totalAmount: 0, // FIXME: Not provided by this API, default to 0 or fetch separately
            orderDate: apiOrder.ENQUIRYDATE,
            clientName: apiOrder["CLIENT NAME"],
            phoneNumber: apiOrder.PHONENUMBER,
            rawEnquiryStatus: apiOrder.ENQUIRYSTATUS,
            // estimatedTime and deliveryDetails are not available from this API
          }));
          setOrders(mappedOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
        } else {
          setOrders([]);
        }
      } catch (err: any) {
        console.error("Failed to fetch order history:", err);
        setError(err.response?.data?.message || err.message || "Could not load your orders.");
        toast({
          title: 'Error Loading Orders',
          description: err.response?.data?.message || err.message || "An unexpected error occurred.",
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [user, isAuthenticated, toast]);

  if (isLoading) {
    return (
      <div className="container max-w-screen-lg mx-auto px-2 md:px-4 py-8 flex justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-screen-md mx-auto px-2 md:px-4 py-8 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-3">Error Loading Orders</h1>
        <p className="text-muted-foreground mb-6 text-sm">{error}</p>
        <Button onClick={() => window.location.reload()} size="sm">Try Again</Button>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container max-w-screen-md mx-auto px-2 md:px-4 py-8 text-center"> 
        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" /> 
        <h1 className="text-2xl font-bold mb-3">No Orders Yet</h1> 
        <p className="text-muted-foreground mb-6 text-sm"> 
          You haven't placed any orders. Start shopping to see your orders here!
        </p>
        <Button asChild size="sm">
          <Link href="/" legacyBehavior passHref><a>Continue Shopping</a></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-lg mx-auto px-2 md:px-4 py-4 md:py-6"> 
      <div className="flex flex-col items-center mb-6 md:mb-8"> 
        <Package className="h-10 w-10 text-primary mb-3" /> 
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground"> 
          My Orders
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">Track your current and past orders.</p> 
      </div>

      <div className="space-y-6"> 
        {orders.map((order) => (
          <Card key={order.id} className="shadow-md hover:shadow-lg transition-shadow duration-300"> 
            <CardHeader className="p-4 pb-3"> 
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-1.5">
                <CardTitle className="text-lg md:text-xl text-primary">
                  Order #{order.id}
                </CardTitle>
                <Badge 
                  variant={order.currentStatus === 'Delivered' || order.currentStatus === 'Completed' ? 'secondary' : 'default'} 
                  className="whitespace-nowrap text-xs px-2 py-0.5 h-5" 
                >
                  {order.currentStatus}
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground pt-0.5"> 
                Placed for: {order.clientName} on: {format(new Date(order.orderDate), 'PPp')}
                {/* Order type is currently a placeholder */}
                {/* ({order.orderType === 'delivery' ? 'Delivery' : 'Dine-In'}) */}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 pb-3"> 
              {/* OrderProgressBar might not fully function without accurate orderType and refined status mapping */}
              <OrderProgressBar currentStatus={order.currentStatus} orderType={order.orderType} className="mb-4" /> 
              
              {/* Items display removed as viewname=655 doesn't provide item details */}
              {/* Consider fetching items on demand or if a summary is available */}
              {order.items && order.items.length > 0 ? (
                <div className="mb-3"> 
                  <h4 className="font-semibold text-sm mb-1.5">Items:</h4> 
                  <ul className="space-y-1.5"> 
                    {order.items.slice(0,2).map(item => ( 
                      <li key={item.productId} className="flex items-center space-x-2 text-xs"> 
                        <div className="relative w-10 h-10 rounded-sm overflow-hidden border bg-white p-0.5"> 
                          <Image 
                              src={item.imageUrl || placeholderImage} 
                              alt={item.name} 
                              layout="fill" 
                              objectFit="contain" 
                              data-ai-hint={item.dataAiHint || "product bakery"}
                              onError={(e) => { (e.target as HTMLImageElement).src = placeholderImage; }}
                          />
                        </div>
                        <span>{item.name} (x{item.quantity})</span>
                        <span className="ml-auto font-medium">KES {(item.price * item.quantity).toLocaleString()}</span>
                      </li>
                    ))}
                    {order.items.length > 2 && <li className="text-xs text-muted-foreground text-center pt-0.5">...and {order.items.length - 2} more item(s)</li>}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mb-3 text-center">Item details will be shown on the order detail page.</p>
              )}

              <Separator className="my-3" /> 
              <div className="flex justify-between items-center">
                {/* Total amount is currently a placeholder */}
                <p className="text-base font-bold">Total: KES {order.totalAmount > 0 ? order.totalAmount.toLocaleString() : 'N/A'}</p> 
                 {order.estimatedTime && (order.currentStatus !== "Completed" && order.currentStatus !== "Delivered") && (
                    <p className="text-xs text-primary font-medium">{order.estimatedTime}</p> 
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t p-3"> 
              <Button asChild size="sm" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground text-xs">
                <Link href={`/my-orders/${order.id}`} legacyBehavior={false} passHref><a>View Details</a></Link>
              </Button>
              {(order.currentStatus === 'Completed' || order.currentStatus === 'Delivered') && (
                <Button variant="outline" size="sm" className="w-full sm:w-auto sm:ml-auto mt-1.5 sm:mt-0 text-xs" onClick={() => alert('Reorder functionality coming soon!')}> 
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
