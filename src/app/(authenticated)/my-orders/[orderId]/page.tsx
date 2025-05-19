
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import type { Order, OrderItemDetail, ApiOrderHeader, OrderStatus, ApiOrderItemDetail } from '@/types';
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
import { fetchOrderHistoryAPI, fetchOrderItemsAPI } from '@/services/api';
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

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const orderId = params.orderId as string;
  const placeholderImage = "https://placehold.co/64x64.png";

  const [orderHeader, setOrderHeader] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemDetail[]>([]);
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
        // Fetch order header details (viewname=655)
        const headerResponse = await fetchOrderHistoryAPI(user.email);
        const foundApiOrder = headerResponse.data?.find(o => o.ENQUIRYNO === orderId);

        if (foundApiOrder) {
          const mappedHeader: Order = {
            id: foundApiOrder.ENQUIRYNO,
            userId: foundApiOrder.CLIENTCODE,
            orderType: 'delivery', // FIXME: Placeholder, infer if possible
            currentStatus: mapEnquiryStatusToOrderStatus(foundApiOrder.ENQUIRYSTATUS),
            statusHistory: [{ status: mapEnquiryStatusToOrderStatus(foundApiOrder.ENQUIRYSTATUS), timestamp: foundApiOrder.ENQUIRYDATE }], // Simplified
            items: [], // Will be populated by the items API call
            totalAmount: foundApiOrder.GROSSAMT ?? 0,
            orderDate: foundApiOrder.ENQUIRYDATE,
            clientName: foundApiOrder["CLIENT NAME"],
            phoneNumber: foundApiOrder.PHONENUMBER,
            rawEnquiryStatus: foundApiOrder.ENQUIRYSTATUS,
            deliveryDetails: {
              fullName: foundApiOrder["CLIENT NAME"],
              phoneNumber: foundApiOrder.PHONENUMBER,
              deliveryAddress: foundApiOrder["CLIENT ADDR1"] || "N/A",
              city: "N/A", // Not directly in header API
              pinCode: "N/A", // Not directly in header API
              country: "N/A", // Not directly in header API
              modeOfPayment: foundApiOrder.MODEOFPAY as 'pay_on_delivery' | 'online' | 'credit_pay_later' | undefined,
              salesEnquiryNotes: '', // Not in header API
            }
          };
          setOrderHeader(mappedHeader);

          // Fetch order items (viewname=654)
          const itemsResponse = await fetchOrderItemsAPI(orderId);
          if (itemsResponse.data && Array.isArray(itemsResponse.data)) {
            const mappedItems: OrderItemDetail[] = itemsResponse.data.map((apiItem: ApiOrderItemDetail) => ({
              productId: apiItem.ITEMCODE,
              name: apiItem.ITEMDESCRIPTION,
              quantity: apiItem.ITEMQTY,
              price: apiItem.ITEMQTY > 0 ? (apiItem.POITEMAMOUNT / apiItem.ITEMQTY) : 0, // Calculate unit price
              imageUrl: `https://placehold.co/64x64.png?text=${apiItem.ITEMCODE.substring(0,3)}`, // Placeholder, replace if image path is available
              dataAiHint: "product bakery"
            }));
            setOrderItems(mappedItems);
          } else {
            setOrderItems([]); // No items found or error
          }

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
    router.replace('/'); 
    return null;
  }

  if (error || !orderHeader) {
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
            <CardTitle className="text-xl md:text-2xl text-primary">Order #{orderHeader.id}</CardTitle> 
            <Badge 
              variant={orderHeader.currentStatus === 'Delivered' || orderHeader.currentStatus === 'Completed' ? 'secondary' : 'default'} 
              className="text-xs px-2 py-0.5 h-5" 
            >
              {orderHeader.currentStatus}
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground pt-1"> 
            Placed for: {orderHeader.clientName} on: {format(new Date(orderHeader.orderDate), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
          </CardDescription>
           {orderHeader.estimatedTime && (orderHeader.currentStatus !== "Completed" && orderHeader.currentStatus !== "Delivered") && (
              <p className="text-xs text-accent font-semibold pt-0.5">{orderHeader.estimatedTime}</p> 
            )}
        </CardHeader>

        <CardContent className="p-4"> 
          <div className="mb-6"> 
            <h3 className="text-lg font-semibold mb-3 text-foreground">Order Status</h3> 
            <OrderProgressBar currentStatus={orderHeader.currentStatus} orderType={orderHeader.orderType} />
          </div>

          <Separator className="my-6" /> 

          <div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">Items Ordered</h3> 
            {orderItems && orderItems.length > 0 ? (
              <div className="space-y-3"> 
                {orderItems.map((item: OrderItemDetail) => (
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
              <p className="text-sm text-muted-foreground text-center py-4">No items found for this order or items are still loading.</p>
            )}
          </div>

          <Separator className="my-6" /> 
          
          <div className="grid md:grid-cols-2 gap-4"> 
            <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Order Summary</h3> 
                <div className="space-y-1.5 text-xs"> 
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        {/* Total amount from GROSSAMT */}
                        <span>KES {orderHeader.totalAmount.toLocaleString()}</span> 
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Fee:</span>
                        <span>{orderHeader.orderType === 'delivery' ? 'KES 150' : 'N/A (Dine-In)'}</span> {/* Delivery fee is placeholder */}
                    </div>
                    <Separator className="my-1" />
                    <div className="flex justify-between font-bold text-base text-foreground"> 
                        <span>Total Paid:</span>
                         {/* Assuming GROSSAMT is inclusive of delivery for now */}
                        <span>KES {(orderHeader.totalAmount + (orderHeader.orderType === 'delivery' ? 0 : 0)).toLocaleString()}</span>
                    </div>
                    {orderHeader.deliveryDetails?.modeOfPayment && (
                       <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Mode:</span>
                        <span className='capitalize'>{orderHeader.deliveryDetails.modeOfPayment.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                </div>
            </div>

            {orderHeader.orderType === 'delivery' && orderHeader.deliveryDetails && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Delivery Details</h3> 
                <div className="space-y-1.5 text-xs"> 
                  <p className="flex items-center"><Tag className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> <span className="font-medium">{orderHeader.deliveryDetails.fullName}</span></p>
                  <p className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> {orderHeader.deliveryDetails.phoneNumber}</p>
                  <p className="flex items-start"><MapPin className="w-3.5 h-3.5 mr-1.5 mt-0.5 text-muted-foreground flex-shrink-0" /> {orderHeader.deliveryDetails.deliveryAddress || 'N/A'}</p>
                </div>
              </div>
            )}
             {orderHeader.orderType === 'dine-in' && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Dine-In Details</h3> 
                 <p className="text-xs text-muted-foreground">This order is for dine-in at our cafe.</p> 
                  {orderHeader.currentStatus === "Table Ready" && <p className="text-xs text-green-600 font-medium mt-1.5">Your table is ready!</p>} 
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t p-3 flex justify-end"> 
          {(orderHeader.currentStatus === 'Completed' || orderHeader.currentStatus === 'Delivered') && (
            <Button variant="default" size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs" onClick={() => alert('Reorder functionality coming soon!')}> 
             <ShoppingBag className="mr-1.5 h-3.5 w-3.5" /> Reorder Items
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
