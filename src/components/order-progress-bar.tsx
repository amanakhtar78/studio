
'use client';

import type { OrderStatus, OrderType } from '@/types';
import { DINE_IN_ORDER_STATUS_STEPS, DELIVERY_ORDER_STATUS_STEPS } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle, Loader2, PackageCheck, PackageSearch, Truck, Utensils } from 'lucide-react'; // Added Utensils

interface OrderProgressBarProps {
  currentStatus: OrderStatus;
  orderType: OrderType;
  className?: string;
}

const getStepIcon = (status: OrderStatus, orderType: OrderType, isActive: boolean, isCurrent: boolean) => {
  if (orderType === 'dine-in') {
    switch (status as (typeof DINE_IN_ORDER_STATUS_STEPS)[number]) {
      case 'Order Placed': return CheckCircle;
      case 'Being Prepared': return isCurrent ? Loader2 : CheckCircle; // Loader if current and preparing
      case 'Table Ready': return Utensils; // Using Utensils for Table Ready
      case 'Completed': return CheckCircle;
      default: return Circle;
    }
  } else { // delivery
    switch (status as (typeof DELIVERY_ORDER_STATUS_STEPS)[number]) {
      case 'Order Placed': return CheckCircle;
      case 'Being Prepared': return isCurrent ? Loader2 : CheckCircle;
      case 'In Transit': return Truck;
      case 'Delivered': return PackageCheck;
      default: return Circle;
    }
  }
};


export function OrderProgressBar({ currentStatus, orderType, className }: OrderProgressBarProps) {
  const steps = orderType === 'dine-in' ? DINE_IN_ORDER_STATUS_STEPS : DELIVERY_ORDER_STATUS_STEPS;
  const currentStatusIndex = steps.findIndex(step => step === currentStatus);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between relative mb-2">
        {steps.map((step, index) => (
          <div key={step} className="flex-1 flex flex-col items-center relative z-10">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                index <= currentStatusIndex ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground",
                index === currentStatusIndex && "ring-4 ring-primary/30",
              )}
            >
              {React.createElement(getStepIcon(step, orderType, index <= currentStatusIndex, index === currentStatusIndex), { 
                className: cn("w-4 h-4", index === currentStatusIndex && (step === "Being Prepared") && "animate-spin") 
              })}
            </div>
            <p className={cn(
                "text-xs mt-1 text-center",
                index <= currentStatusIndex ? "text-primary font-medium" : "text-muted-foreground"
              )}
            >
              {step}
            </p>
          </div>
        ))}
         {/* Progress line - adjust for number of steps */}
        <div className="absolute top-4 left-0 w-full h-1 bg-border -z-0">
            <div 
                className="h-1 bg-primary transition-all duration-500 ease-out"
                style={{ width: `${Math.max(0, (currentStatusIndex / (steps.length -1 )) * 100)}%` }}
            ></div>
        </div>
      </div>
    </div>
  );
}