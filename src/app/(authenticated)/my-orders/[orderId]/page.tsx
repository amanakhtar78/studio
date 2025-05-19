
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import type { Order, OrderItemDetail, ApiOrderHeader, OrderStatus } from '@/types'; // Added ApiOrderHeader
import { OrderProgressBar } from '@/components/order-progress-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft, MapPin, Phone, Tag, AlertCircle, ShoppingBag, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchOrderHistoryAPI } from '@/services/api'; // Assuming this might be adapted or a new detail API
import { useToast } from '@/hooks/use-toast';

// Temporary mapping for ENQUIRYSTATUS to OrderStatus (should be consistent with MyOrdersPage)
const mapEnquiryStatusToOrderStatus = (status: number): OrderStatus => {
  switch (status) {
    case 0: return 'Order Placed';
    case 1: return 'Being Prepared';
    case 2: return 'In Transit'; 
    case 3: return 'Delivered'; 
    default: return 'Unknown Status';
  }
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const orderId = params.orderId as string;
  const placeholderImage = "https://placehold.co/64x64.png";

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!isAuthenticated || !user?.email || !orderId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // FIXME: This API (viewname=655) fetches ALL orders for the user.
        // We need an API to fetch details for a SINGLE orderId.
        // For now, we'll fetch all and filter, which is inefficient.
        const response = await fetchOrderHistoryAPI(user.email);
        const foundApiOrder = response.data?.find(o => o.ENQUIRYNO === orderId);

        if (foundApiOrder) {
          // TODO: Need a separate API to fetch order ITEMS (e.g., viewname=656&SALESENQUIRYNO=${orderId})
          // and full status history. For now, items will be empty.
          const mappedOrder: Order = {
            id: foundApiOrder.ENQUIRYNO,
            userId: foundApiOrder.CLIENTCODE,
            orderType: 'delivery', // FIXME: Placeholder
            currentStatus: mapEnquiryStatusToOrderStatus(foundApiOrder.ENQUIRYSTATUS),
            statusHistory: [{ status: mapEnquiryStatusToOrderStatus(foundApiOrder.ENQUIRYSTATUS), timestamp: foundApiOrder.ENQUIRYDATE }], // Simplified
            items: [], // FIXME: Items need to be fetched from another API (e.g., viewname=656)
            totalAmount: 0, // FIXME: Not in header API
            orderDate: foundApiOrder.ENQUIRYDATE,
            clientName: foundApiOrder["CLIENT NAME"],
            phoneNumber: foundApiOrder.PHONENUMBER,
            rawEnquiryStatus: foundApiOrder.ENQUIRYSTATUS,
            // deliveryDetails also needs to come from a more detailed API or be constructed if available
            deliveryDetails: { // Placeholder
              fullName: foundApiOrder["CLIENT NAME"],
              phoneNumber: foundApiOrder.PHONENUMBER,
              deliveryAddress: "N/A - Fetch from details API",
              city: "N/A",
              pinCode: "N/A",
              country: "N/A",
              modeOfPayment: 'online', // placeholder
              salesEnquiryNotes: '', // placeholder
            }
          };
          setOrder(mappedOrder);
        } else {
          setError("Order not found or could not be loaded.");
        }
      } catch (err: any) {
        console.error("Failed to fetch order details:", err);
        setError(err.response?.data?.message || err.message || "Could not load order details.");
        toast({
          title: 'Error Loading Order',
          description: err.response?.data?.message || err.message || "An unexpected error occurred.",
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, user, isAuthenticated, toast]);


  if (isLoading) {
    return (
      <div className="container max-w-screen-md mx-auto px-2 md:px-4 py-8 flex justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isAuthenticated && !isLoading) { 
    router.replace('/'); // Or open login modal
    return null;
  }

  if (error || !order) {
    return (
      <div className="container max-w-screen-md mx-auto px-2 md:px-4 py-8 text-center"> 
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" /> 
        <h1 className="text-2xl font-bold mb-3">Order Not Found</h1> 
        <p className="text-muted-foreground mb-6 text-sm"> 
          {error || "We couldn't find the order you're looking for."}
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/my-orders">Back to My Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-lg mx-auto px-2 md:px-4 py-4 md:py-6"> 
      <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4 text-xs"> 
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to My Orders
      </Button>

      <Card className="shadow-lg">
        <CardHeader className="bg-muted/30 rounded-t-lg p-4"> 
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5">
            <CardTitle className="text-xl md:text-2xl text-primary">Order #{order.id}</CardTitle> 
            <Badge 
              variant={order.currentStatus === 'Delivered' || order.currentStatus === 'Completed' ? 'secondary' : 'default'} 
              className="text-xs px-2 py-0.5 h-5" 
            >
              {order.currentStatus}
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground pt-1"> 
            Placed for: {order.clientName} on: {format(new Date(order.orderDate), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
          </CardDescription>
           {order.estimatedTime && (order.currentStatus !== "Completed" && order.currentStatus !== "Delivered") && (
              <p className="text-xs text-accent font-semibold pt-0.5">{order.estimatedTime}</p> 
            )}
        </CardHeader>

        <CardContent className="p-4"> 
          <div className="mb-6"> 
            <h3 className="text-lg font-semibold mb-3 text-foreground">Order Status</h3> 
            <OrderProgressBar currentStatus={order.currentStatus} orderType={order.orderType} />
          </div>

          <Separator className="my-6" /> 

          <div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">Items Ordered</h3> 
            {order.items && order.items.length > 0 ? (
              <div className="space-y-3"> 
                {order.items.map((item: OrderItemDetail) => (
                  <div key={item.productId} className="flex items-start space-x-3 p-2.5 border rounded-lg bg-card hover:bg-muted/20 transition-colors"> 
                    <div className="relative w-16 h-16 rounded-md overflow-hidden border bg-white p-1"> 
                      <Image 
                          src={item.imageUrl || placeholderImage} 
                          alt={item.name} 
                          layout="fill" 
                          objectFit="contain" 
                          data-ai-hint={item.dataAiHint || "product bakery"}
                          onError={(e) => { (e.target as HTMLImageElement).src = placeholderImage; }}
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-base text-foreground">{item.name}</h4> 
                      <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                      <p className="text-xs text-muted-foreground">Price per item: KES {item.price.toLocaleString()}</p>
                    </div>
                    <p className="text-sm font-semibold text-primary">KES {(item.price * item.quantity).toLocaleString()}</p> 
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Order item details are not available at the moment. Please check back later or contact support if this persists.</p>
            )}
          </div>

          <Separator className="my-6" /> 
          
          <div className="grid md:grid-cols-2 gap-4"> 
            <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Order Summary</h3> 
                <div className="space-y-1.5 text-xs"> 
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        {/* Total amount is a placeholder, real calculation needs item details */}
                        <span>KES {order.totalAmount > 0 ? order.totalAmount.toLocaleString() : 'N/A'}</span> 
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Fee:</span>
                        <span>{order.orderType === 'delivery' ? 'KES 150' : 'N/A (Dine-In)'}</span>
                    </div>
                    <Separator className="my-1" />
                    <div className="flex justify-between font-bold text-base text-foreground"> 
                        <span>Total Paid:</span>
                        <span>KES {(order.totalAmount > 0 ? (order.totalAmount + (order.orderType === 'delivery' ? 150 : 0)) : 0).toLocaleString() || 'N/A'}</span>
                    </div>
                </div>
            </div>

            {order.orderType === 'delivery' && order.deliveryDetails && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Delivery Details</h3> 
                <div className="space-y-1.5 text-xs"> 
                  <p className="flex items-center"><Tag className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> <span className="font-medium">{order.deliveryDetails.fullName}</span></p>
                  <p className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> {order.deliveryDetails.phoneNumber}</p>
                  <p className="flex items-start"><MapPin className="w-3.5 h-3.5 mr-1.5 mt-0.5 text-muted-foreground flex-shrink-0" /> {order.deliveryDetails.deliveryAddress || 'N/A'}, {order.deliveryDetails.pinCode || 'N/A'}</p>
                </div>
              </div>
            )}
             {order.orderType === 'dine-in' && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Dine-In Details</h3> 
                 <p className="text-xs text-muted-foreground">This order is for dine-in at our cafe.</p> 
                  {order.currentStatus === "Table Ready" && <p className="text-xs text-green-600 font-medium mt-1.5">Your table is ready!</p>} 
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t p-3 flex justify-end"> 
          {(order.currentStatus === 'Completed' || order.currentStatus === 'Delivered') && (
            <Button variant="default" size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs" onClick={() => alert('Reorder functionality coming soon!')}> 
             <ShoppingBag className="mr-1.5 h-3.5 w-3.5" /> Reorder Items
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

