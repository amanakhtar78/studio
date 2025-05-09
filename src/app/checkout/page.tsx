
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import type { CheckoutFormData, Product } from '@/types';
import { useEffect, useState } from 'react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';


const checkoutFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  phoneNumber: z.string().regex(/^\+?[0-9]{10,14}$/, { message: "Invalid phone number format." }),
  deliveryAddress: z.string().min(10, { message: "Delivery address must be at least 10 characters." }),
  pinCode: z.string().regex(/^[0-9]{4,6}$/, { message: "Invalid pin code." }),
});

export default function CheckoutPage() {
  const { items: cartItemsBase, updateItemQuantity, clearCart, getCartItemsWithDetails, getCartSubtotal } = useCart();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const { items: allApiProducts, status: productStatus } = useSelector((state: RootState) => state.products);
  
  const cartItemsWithDetails = productStatus === 'succeeded' ? getCartItemsWithDetails(allApiProducts) : [];
  const cartSubtotal = productStatus === 'succeeded' ? getCartSubtotal(allApiProducts) : 0;


  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      deliveryAddress: '',
      pinCode: '',
    },
  });

  const [useProfileAddress, setUseProfileAddress] = useState<boolean>(false); 

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.address && useProfileAddress) {
        form.reset({
          fullName: user.name || '',
          phoneNumber: user.phoneNumber || '',
          deliveryAddress: user.address.street,
          pinCode: user.address.pinCode,
        });
      } else {
        form.reset({
          fullName: user.name || '',
          phoneNumber: user.phoneNumber || '',
          deliveryAddress: '', 
          pinCode: '',         
        });
      }
    } else {
      form.reset({
        fullName: '',
        phoneNumber: '',
        deliveryAddress: '',
        pinCode: '',
      });
    }
  }, [user, isAuthenticated, useProfileAddress, form]);

  useEffect(() => {
    if (isAuthenticated && user?.address) {
      setUseProfileAddress(true); 
    } else {
      setUseProfileAddress(false); 
    }
  }, [isAuthenticated, user]);


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
    const mockOrderId = `ORD${Date.now().toString().slice(-6)}`; 
    router.push(`/my-orders/${mockOrderId}?new=true`); 
  };

  if (productStatus === 'loading') {
     return (
      <div className="container max-w-screen-lg mx-auto px-4 md:px-6 py-12 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading cart details...</p>
      </div>
    );
  }

  if (cartItemsBase.length === 0) {
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
            <CardContent className="divide-y divide-border">
              {cartItemsWithDetails.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 py-5 first:pt-0 last:pb-0">
                  <div className="relative w-24 h-24 rounded-md overflow-hidden bg-white p-1">
                    <Image src={item.image} alt={item.title} layout="fill" objectFit="contain" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">KES {item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => updateItemQuantity(item.id.toString(), item.cartQuantity - 1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-medium w-8 text-center tabular-nums">{item.cartQuantity}</span>
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => updateItemQuantity(item.id.toString(), item.cartQuantity + 1)} disabled={!item.stockAvailability}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="font-semibold w-28 text-right tabular-nums">KES {(item.price * item.cartQuantity).toLocaleString()}</p>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 h-9 w-9" onClick={() => updateItemQuantity(item.id.toString(), 0)}>
                     <Trash2 className="h-5 w-5" />
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
              <CardDescription>
                {isAuthenticated && user?.address ? 'Choose your delivery address or enter a new one.' : 'Please fill in your delivery information.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAuthenticated && user?.address && (
                <RadioGroup
                  value={useProfileAddress ? "profile" : "new"}
                  onValueChange={(value) => {
                    setUseProfileAddress(value === "profile");
                  }}
                  className="mb-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="profile" id="rProfileAddress" />
                    <Label htmlFor="rProfileAddress" className="cursor-pointer">Use my saved address:</Label>
                  </div>
                  {useProfileAddress && (
                    <Card className="bg-muted/50 p-3 text-sm ml-7 my-2 border-border/70 shadow-sm">
                      <p><strong>{user.name}</strong></p>
                      <p>{user.phoneNumber || 'No phone on file'}</p>
                      <p>{user.address!.street}, {user.address!.city}</p>
                      <p>{user.address!.pinCode} <span className="capitalize">({user.address!.addressType})</span></p>
                    </Card>
                  )}
                  <div className="flex items-center space-x-2 mt-2">
                    <RadioGroupItem value="new" id="rNewAddress" />
                    <Label htmlFor="rNewAddress" className="cursor-pointer">Enter a new delivery address</Label>
                  </div>
                </RadioGroup>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Zahra Ali" {...field} disabled={useProfileAddress && !!user?.name} />
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
                          <Input type="tel" placeholder="e.g. +254712345678" {...field} disabled={useProfileAddress && !!user?.phoneNumber} />
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
                          <Input placeholder="e.g. 123 Bakery St, Apt 4B, Nairobi" {...field} disabled={useProfileAddress && !!user?.address?.street}/>
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
                          <Input placeholder="e.g. 00100" {...field} disabled={useProfileAddress && !!user?.address?.pinCode} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
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
