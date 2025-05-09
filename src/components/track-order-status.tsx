
'use client';

import type { Order, OrderStatus } from '@/types'; // Updated OrderStatusStep to OrderStatus
import { CheckCircle, Loader2, Truck, PackageSearch, PackageCheck, Circle, Utensils } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { getOrderStatusFlow } from '@/lib/mock-data'; // Helper to get steps

interface TrackOrderStatusProps {
  order: Order;
  // allSteps: OrderStatus[]; // This prop might be redundant if we derive from order.orderType
}

// Icons can be made more dynamic based on order type if needed
const stepIcons: Record<OrderStatus, React.ElementType> = {
  "Order Placed": CheckCircle,
  "Being Prepared": Loader2,
  "Searching for Driver": PackageSearch, // Specific to some delivery flows, might need adjustment
  "Assigned to Driver": PackageCheck, // Specific to some delivery flows
  "Out for Delivery": Truck, // Specific to delivery
  "Delivered": PackageCheck, // Specific to delivery
  "Table Ready": Utensils, // Specific to dine-in
  "Completed": CheckCircle, // Generic completed, or specific for dine-in
  // Ensure all statuses from OrderStatusDineIn and OrderStatusDelivery are covered
};


export function TrackOrderStatus({ order }: TrackOrderStatusProps) {
  const [currentStatusIndex, setCurrentStatusIndex] = useState(-1);
  const [isMounted, setIsMounted] = useState(false);
  
  const allSteps = getOrderStatusFlow(order.orderType);


  useEffect(() => {
    setIsMounted(true);
    const index = allSteps.findIndex(step => step === order.currentStatus);
    setCurrentStatusIndex(index);
  }, [order, allSteps]);

  if (!isMounted) {
     return (
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">Tracking Order: {order.id}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6 animate-pulse">
            {[...Array(allSteps.length)].map((_, i) => (
                 <div key={i} className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-muted rounded-full"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                 </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-xl">
      <CardHeader className="bg-muted/30 rounded-t-xl p-6">
        <CardTitle className="text-2xl font-bold text-center text-primary">
          Tracking Order: {order.id}
        </CardTitle>
        <p className="text-center text-muted-foreground">Current Status: <span className="font-semibold text-foreground">{order.currentStatus}</span></p>
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        <div className="relative space-y-8">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border -z-10 ml-[1px]"></div>

          {allSteps.map((step, index) => {
            const IconComponent = stepIcons[step] || Circle;
            const isActive = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            
            const historyEntry = order.statusHistory.find(h => h.status === step);

            return (
              <div key={step} className="flex items-start space-x-4">
                <div className={cn(
                  "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border-2",
                  isActive ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-muted-foreground",
                  isCurrent && "animate-pulse ring-4 ring-primary/30"
                )}>
                  <IconComponent className={cn("w-5 h-5", isCurrent && step === "Being Prepared" && "animate-spin")} />
                </div>
                <div className="pt-1">
                  <p className={cn(
                    "font-semibold",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step}
                  </p>
                  {historyEntry && isActive && (
                     <p className="text-xs text-muted-foreground">
                       {new Date(historyEntry.timestamp).toLocaleString()}
                     </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}