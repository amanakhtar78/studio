'use client';

import type { Order, OrderStatusStep } from '@/types';
import { CheckCircle, Loader2, Truck, PackageSearch, PackageCheck, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface TrackOrderStatusProps {
  order: Order;
  allSteps: OrderStatusStep[];
}

const stepIcons: Record<OrderStatusStep, React.ElementType> = {
  "Order Confirmed": CheckCircle,
  "Preparing": Loader2,
  "Searching for Driver": PackageSearch,
  "Assigned to Driver": PackageCheck,
  "Out for Delivery": Truck,
};

export function TrackOrderStatus({ order, allSteps }: TrackOrderStatusProps) {
  const [currentStatusIndex, setCurrentStatusIndex] = useState(-1);
  const [isMounted, setIsMounted] = useState(false);

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
            {[...Array(5)].map((_, i) => (
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
            const Icon = stepIcons[step] || Circle;
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
                  <Icon className={cn("w-5 h-5", isCurrent && step === "Preparing" && "animate-spin")} />
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
