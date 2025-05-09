
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import type { CheckoutFormData } from '@/types';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const checkoutFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  phoneNumber: z.string().regex(/^\+?[0-9]{10,14}$/, { message: "Invalid phone number format." }),
  deliveryAddress: z.string().min(10, { message: "Delivery address must be at least 10 characters." }),
  pinCode: z.string().regex(/^[0-9]{4,6}$/, { message: "Invalid pin code." }),
});

export default function CheckoutPage() {
  const { items, getCartItemsWithDetails, updateItemQuantity, cartSubtotal, clearCart } = useCart();
  const cartItemsWithDetails = getCartItemsWithDetails();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      deliveryAddress: '',
      pinCode: '',
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    console.log('Order placed:', {
      customerDetails: data,
      items: cartItemsWithDetails,
      total: cartSubtotal,
    });
    toast({
      title: 'Order Placed!',
      description: 'Your delicious treats are on their way!',
    });
    clearCart();
    router.push('/track-order'); // Navigate to a mock tracking page
  };

  if (items.length === 0) {
    return (
      <div className="container max-w-screen-lg mx-auto px-4 md:px-6 py-12 text-center">
        <h1 className="text-3xl font-bold mb-6">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-8">Checkout</h1>
      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        <div className="md:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {cartItemsWithDetails.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 py-4 border-b last:border-b-0">
                  <div className="relative w-20 h-20 rounded-md overflow-hidden">
                    <Image src={item.imageUrl} alt={item.name} layout="fill" objectFit="cover" data-ai-hint={item.dataAiHint} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">KES {item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span>{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateItemQuantity(item.productId, item.quantity + 1)} disabled={!item.stockAvailability}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="font-semibold w-24 text-right">KES {(item.price * item.quantity).toLocaleString()}</p>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 h-8 w-8" onClick={() => updateItemQuantity(item.productId, 0)}>
                     <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-end items-center pt-6 border-t">
                <p className="text-xl font-bold">Subtotal: KES {cartSubtotal.toLocaleString()}</p>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Delivery Details</CardTitle>
              <CardDescription>Please fill in your delivery information.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Zahra Ali" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="e.g. +254712345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deliveryAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 123 Bakery St, Apt 4B, Nairobi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pinCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pin Code / Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 00100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground">
                    Place Order (KES {cartSubtotal.toLocaleString()})
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
