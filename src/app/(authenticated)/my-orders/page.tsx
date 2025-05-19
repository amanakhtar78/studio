
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
import Image from 'next/image';
import { format } from 'date-fns';
import { Package, ShoppingBag, Loader2, AlertTriangle } from 'lucide-react'; 
import { fetchOrderHistoryAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const mapEnquiryStatusToOrderStatus = (status: number): OrderStatus => {
  switch (status) {
    case 0: return 'Order Placed';
    case 1: return 'Being Prepared';
    case 2: return 'In Transit'; 
    case 3: return 'Delivered'; 
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
            orderType: 'delivery', // FIXME: This is a placeholder, API doesn't provide it. Consider inferring from MODEOFPAY or other fields if possible.
            currentStatus: mapEnquiryStatusToOrderStatus(apiOrder.ENQUIRYSTATUS),
            statusHistory: [{ status: mapEnquiryStatusToOrderStatus(apiOrder.ENQUIRYSTATUS), timestamp: apiOrder.ENQUIRYDATE }], // Simplified history
            items: [], // Item details not provided by this API, will be fetched on detail page
            totalAmount: apiOrder.GROSSAMT ?? 0, // Use GROSSAMT
            orderDate: apiOrder.ENQUIRYDATE,
            clientName: apiOrder["CLIENT NAME"],
            phoneNumber: apiOrder.PHONENUMBER,
            rawEnquiryStatus: apiOrder.ENQUIRYSTATUS,
            deliveryDetails: {
              deliveryAddress: apiOrder["CLIENT ADDR1"],
              // city, pinCode, country might not be in header API directly or need parsing
              // fullName and phoneNumber can be taken from CLIENT NAME and PHONENUMBER from header
              fullName: apiOrder["CLIENT NAME"],
              phoneNumber: apiOrder.PHONENUMBER,
              modeOfPayment: apiOrder.MODEOFPAY as 'pay_on_delivery' | 'online' | 'credit_pay_later' | undefined,
            }
            // estimatedTime is not available from this API
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
          <Link href="/">Continue Shopping</Link>
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
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 pb-3"> 
              <OrderProgressBar currentStatus={order.currentStatus} orderType={order.orderType} className="mb-4" /> 
              
              <p className="text-xs text-muted-foreground mb-3 text-center">Item details will be shown on the order detail page.</p>

              <Separator className="my-3" /> 
              <div className="flex justify-between items-center">
                <p className="text-base font-bold">Total: KES {order.totalAmount.toLocaleString()}</p> 
                 {order.estimatedTime && (order.currentStatus !== "Completed" && order.currentStatus !== "Delivered") && (
                    <p className="text-xs text-primary font-medium">{order.estimatedTime}</p> 
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t p-3"> 
              <Button asChild size="sm" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground text-xs">
                <Link href={`/my-orders/${order.id}`}>View Details</Link>
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
