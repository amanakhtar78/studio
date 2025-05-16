
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
import { Minus, Plus, Trash2, Loader2, ShoppingCart } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import * as z from 'zod';
import type { CheckoutFormData, SalesEnquiryHeaderPayload, SalesEnquiryItemPayload } from '@/types';
import { useEffect, useState, useMemo } from 'react';
import { format } from 'date-fns';

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
import { fetchNextSalesEnquiryNoAPI, saveSalesEnquiryHeaderAPI, saveSalesEnquiryItemAPI } from '@/services/api';


const checkoutFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  phoneNumber: z.string().regex(/^\+?[0-9]{10,14}$/, { message: "Invalid phone number format. e.g. +254712345678" }),
  deliveryAddress: z.string().min(10, { message: "Delivery address must be at least 10 characters." }),
  pinCode: z.string().regex(/^[0-9]{4,6}$/, { message: "Invalid pin code. e.g. 00100" }),
});

export default function CheckoutPage() {
  const { 
    items: cartItemsBase, 
    updateItemQuantity, 
    clearCart, 
    getCartItemsWithDetails, 
  } = useCart();
  const { user, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const { items: allApiProducts, status: productStatus } = useSelector((state: RootState) => state.products);
  
  const cartItemsWithDetails = useMemo(() => {
    if (productStatus === 'succeeded' && allApiProducts.length > 0) {
      return getCartItemsWithDetails(allApiProducts);
    }
    return [];
  }, [productStatus, allApiProducts, getCartItemsWithDetails, cartItemsBase]);

  const { cartSubtotal, totalAmountExclVat, totalVatAmount, totalAmountInclVat } = useMemo(() => {
    if (productStatus !== 'succeeded' || allApiProducts.length === 0) {
      return { cartSubtotal: 0, totalAmountExclVat: 0, totalVatAmount: 0, totalAmountInclVat: 0 };
    }
    const subtotal = cartItemsWithDetails.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);
    let exclVat = 0;
    let vatAmount = 0;
    const vatRate = 0.16; // 16%

    cartItemsWithDetails.forEach(item => {
      const lineTotalExclVat = item.price * item.cartQuantity;
      exclVat += lineTotalExclVat;
      if (item.ITEM_VATABLE?.toUpperCase() === 'YES') {
        vatAmount += lineTotalExclVat * vatRate;
      }
    });
    const inclVat = exclVat + vatAmount;
    return { cartSubtotal: subtotal, totalAmountExclVat: exclVat, totalVatAmount: vatAmount, totalAmountInclVat: inclVat };
  }, [productStatus, allApiProducts, cartItemsWithDetails]);


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
  const [isMounted, setIsMounted] = useState(false);
  const placeholderImage = "https://placehold.co/64x64.png";
  const [newSalesEnquiryNo, setNewSalesEnquiryNo] = useState<string | null>(null);
  const [isFetchingEnquiryNo, setIsFetchingEnquiryNo] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);


  useEffect(() => {
    setIsMounted(true);
    const fetchEnquiryNo = async () => {
      setIsFetchingEnquiryNo(true);
      try {
        const response = await fetchNextSalesEnquiryNoAPI();
        if (response.data && response.data.length > 0 && response.data[0].NEXTPONO) {
          setNewSalesEnquiryNo(response.data[0].NEXTPONO);
        } else {
          toast({ title: 'Error', description: 'Could not fetch order number. Please try again.', variant: 'destructive' });
        }
      } catch (error) {
        console.error("Error fetching new sales enquiry number:", error);
        toast({ title: 'Error', description: 'Failed to initialize order. Please refresh.', variant: 'destructive' });
      } finally {
        setIsFetchingEnquiryNo(false);
      }
    };
    fetchEnquiryNo();
  }, [toast]);

  useEffect(() => {
    if (isMounted && isAuthenticated && user?.address) {
      setUseProfileAddress(true);
    } else if (isMounted) {
      setUseProfileAddress(false);
    }
  }, [isMounted, isAuthenticated, user]); 

  useEffect(() => {
    if (!isMounted) return;

    if (isAuthenticated && user) {
      const baseUserDetails = {
        fullName: user.name || '',
        phoneNumber: user.phoneNumber || '',
      };
      if (useProfileAddress && user.address) {
        form.reset({
          ...baseUserDetails,
          deliveryAddress: user.address.street || '',
          pinCode: user.address.pinCode || '',
        });
      } else {
        form.reset({
          ...baseUserDetails,
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
  }, [isMounted, user, isAuthenticated, useProfileAddress, form]);


  const handlePlaceOrder = async (data: CheckoutFormData) => {
    if (!user) {
      toast({ title: 'Authentication Error', description: 'Please log in to place an order.', variant: 'destructive' });
      return;
    }
    if (!newSalesEnquiryNo) {
      toast({ title: 'Order Error', description: 'Could not get an order number. Please try refreshing.', variant: 'destructive' });
      return;
    }
    if (cartItemsWithDetails.length === 0) {
      toast({ title: 'Empty Cart', description: 'Your cart is empty.', variant: 'destructive' });
      return;
    }

    setIsPlacingOrder(true);
    const currentDate = new Date();
    const datePass = format(currentDate, 'yyyy-MM-dd');
    const timePass = format(currentDate, 'HH:mm:ss');

    const headerPayload: SalesEnquiryHeaderPayload = {
      SALESENQUIRYNO: Number(newSalesEnquiryNo),
      SALESENQUIRYITEMSSERVICE: 0,
      CLIENTCODE: user.email,
      REFFROM: "ZAHARASWEETROOLE",
      SALESENQUIRYDATE: datePass,
      SALESENQUIRYVEHICLE: "",
      DIVISION: 'NAIROBI',
      SALESENQUIRYNOTES: "", // Add a field for notes if needed
      CREATEDBY: user.email.split("@")[0].toUpperCase(),
      CREATEDDATE: datePass,
      CREATEDTIME: timePass,
      AMOUNTEXCVAT: totalAmountExclVat,
      VATAMOUNT: totalVatAmount,
      AMTOUNTINCLUSIVEVAT: totalAmountInclVat,
      CURRENCYCODE: "KSH",
      MODEOFPAY: "ONLINE", // Or implement selection
      CLIENTNAME: data.fullName,
      DELIVERYADDRESS: data.deliveryAddress,
      CLIENTEMAIL: user.email,
      CLIENTCOUNTRY: user.address?.country || "Kenya",
      CLIENTCITY: user.address?.city || data.deliveryAddress.split(',').pop()?.trim() || "Nairobi", // Basic city extraction
      CLIENTPHONENUMBER: data.phoneNumber,
      CARTNO: Number(newSalesEnquiryNo),
      DELIVERYPROVIDED: 0,
      DELIVERYROUTE: 0,
      DELIVERYCHARGES: 0,
    };

    try {
      const headerResponse = await saveSalesEnquiryHeaderAPI(headerPayload);
      if (!headerResponse.data || !headerResponse.data.message.toLowerCase().includes('document saved')) {
        throw new Error(headerResponse.data.message || 'Failed to save order header.');
      }
      toast({ title: 'Order Header Saved', description: 'Processing items...', variant: 'default' });

      for (let i = 0; i < cartItemsWithDetails.length; i++) {
        const item = cartItemsWithDetails[i];
        const itemRateExclVat = item.price * item.cartQuantity;
        const itemVat = item.ITEM_VATABLE?.toUpperCase() === 'YES' ? itemRateExclVat * 0.16 : 0;
        const itemAmountInclVat = itemRateExclVat + itemVat;

        const itemPayload: SalesEnquiryItemPayload = {
          SALESENQUIRYNO: Number(newSalesEnquiryNo),
          SALESENQUIRYDATE: datePass,
          SERIALNO: i + 1,
          ITEMCODE: item.id, // product.id is ITEM CODE
          ITEMDESCRIPTION: item.title,
          UOM: item.ITEM_BASE_UOM || "PCS",
          ITEMQTY: item.cartQuantity,
          ITEMRATE: itemRateExclVat,
          ITEMVAT: itemVat,
          ITEMCURRENCY: "KSH",
          ITEMAMOUNT: itemAmountInclVat,
          DIVISION: 'NAIROBI',
          CREATEDBY: user.email.split("@")[0].toUpperCase(),
          CREATEDDATE: datePass,
        };
        const itemResponse = await saveSalesEnquiryItemAPI(itemPayload);
        if (!itemResponse.data || !itemResponse.data.message.toLowerCase().includes('document saved')) {
          throw new Error(`Failed to save item ${item.title}: ${itemResponse.data.message || 'Unknown error'}`);
        }
      }

      toast({ title: 'Order Placed Successfully!', description: `Your order #${newSalesEnquiryNo} is confirmed.`, variant: 'default' });
      clearCart();
      router.push(`/my-orders/${newSalesEnquiryNo}?new=true`);

    } catch (error: any) {
      console.error("Error placing order:", error);
      toast({ title: 'Order Placement Failed', description: error.message || 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsPlacingOrder(false);
    }
  };


  if (!isMounted || productStatus === 'loading' || (authIsLoading && !user) || isFetchingEnquiryNo) {
     return (
      <div className="container max-w-screen-lg mx-auto px-2 md:px-4 py-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-3 text-muted-foreground text-sm">Loading checkout details...</p>
      </div>
    );
  }

  if (productStatus === 'failed') {
    return (
      <div className="container max-w-screen-lg mx-auto px-2 md:px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Error Loading Products</h1>
        <p className="text-muted-foreground mb-6 text-sm">Could not load product details. Please try again later.</p>
        <Button asChild size="sm" onClick={() => router.push('/')}>
          <a>Back to Homepage</a>
        </Button>
      </div>
    );
  }
  
  if (cartItemsBase.length === 0 && productStatus === 'succeeded') {
    return (
      <div className="container max-w-screen-lg mx-auto px-2 md:px-4 py-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-6 text-sm">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild size="sm">
          <Link href="/" legacyBehavior passHref><a>Continue Shopping</a></Link>
        </Button>
      </div>
    );
  }


  return (
    <div className="container max-w-screen-xl mx-auto px-2 md:px-4 py-4 md:py-6">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-6">Checkout</h1>
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        <div className="md:col-span-2">
          <Card className="shadow-md">
            <CardHeader className="p-4">
              <CardTitle className="text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border p-4 pt-0">
              {cartItemsWithDetails.length > 0 ? cartItemsWithDetails.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 py-3 first:pt-0 last:pb-0">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden bg-white p-1 border">
                    <Image 
                      src={item.image || placeholderImage} 
                      alt={item.title} 
                      layout="fill" 
                      objectFit="contain" 
                      data-ai-hint="product bakery"
                      onError={(e) => { (e.target as HTMLImageElement).src = placeholderImage; }}
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">KES {item.price.toLocaleString()}</p>
                     {!item.stockAvailability && <p className="text-xs text-destructive">Out of stock</p>}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9" 
                      onClick={() => updateItemQuantity(item.id, item.cartQuantity - 1)}
                      aria-label={`Decrease quantity of ${item.title}`}
                      disabled={isPlacingOrder}
                    > 
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium w-8 text-center tabular-nums">{item.cartQuantity}</span> 
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9" 
                      onClick={() => updateItemQuantity(item.id, item.cartQuantity + 1)}
                      disabled={!item.stockAvailability || isPlacingOrder}
                      aria-label={`Increase quantity of ${item.title}`}
                    > 
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="font-semibold w-24 text-right tabular-nums text-sm">KES {(item.price * item.cartQuantity).toLocaleString()}</p> 
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive/80 h-9 w-9" 
                    onClick={() => updateItemQuantity(item.id, 0)}
                    aria-label={`Remove ${item.title} from cart`}
                    disabled={isPlacingOrder}
                  > 
                     <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground py-4 text-center">Loading cart items or your cart is empty...</p>
              )}
            </CardContent>
            <CardFooter className="flex justify-end items-center p-4 border-t">
                <div className="text-right text-sm">
                    <p>Subtotal (Excl. VAT): KES {totalAmountExclVat.toLocaleString()}</p>
                    <p>VAT (16%): KES {totalVatAmount.toLocaleString()}</p>
                    <p className="text-lg font-bold mt-1">Total: KES {totalAmountInclVat.toLocaleString()}</p>
                </div>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="shadow-md">
            <CardHeader className="p-4">
              <CardTitle className="text-xl">Delivery Details</CardTitle>
              <CardDescription className="text-xs">
                {isAuthenticated && user?.address ? 'Choose your delivery address or enter a new one.' : 'Please fill in your delivery information.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {isAuthenticated && user?.address && (
                <RadioGroup
                  value={useProfileAddress ? "profile" : "new"}
                  onValueChange={(value) => {
                    setUseProfileAddress(value === "profile");
                  }}
                  className="mb-4"
                  disabled={isPlacingOrder}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="profile" id="rProfileAddress" />
                    <Label htmlFor="rProfileAddress" className="cursor-pointer text-sm">Use my saved address:</Label>
                  </div>
                  {useProfileAddress && (
                    <Card className="bg-muted/50 p-2.5 text-xs ml-6 my-1.5 border-border/70 shadow-sm">
                      <p><strong>{user.name}</strong></p>
                      <p>{user.phoneNumber || 'No phone on file'}</p>
                      <p>{user.address.street}, {user.address.city}</p>
                      <p>{user.address.pinCode} {user.address.country && `(${user.address.country})`} <span className="capitalize">({user.address.addressType})</span></p>
                    </Card>
                  )}
                  <div className="flex items-center space-x-2 mt-1.5">
                    <RadioGroupItem value="new" id="rNewAddress" />
                    <Label htmlFor="rNewAddress" className="cursor-pointer text-sm">Enter a new delivery address</Label>
                  </div>
                </RadioGroup>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handlePlaceOrder)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Zahra Ali" {...field} disabled={(useProfileAddress && !!user?.name) || isPlacingOrder} className="h-9 text-sm" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="e.g. +254712345678" {...field} disabled={(useProfileAddress && !!user?.phoneNumber) || isPlacingOrder} className="h-9 text-sm" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deliveryAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Delivery Address</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 123 Bakery St, Apt 4B, Nairobi" {...field} disabled={(useProfileAddress && !!user?.address?.street) || isPlacingOrder} className="h-9 text-sm" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pinCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Pin Code / Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 00100" {...field} disabled={(useProfileAddress && !!user?.address?.pinCode) || isPlacingOrder} className="h-9 text-sm" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    size="default" 
                    className="w-full text-sm py-2.5 bg-accent hover:bg-accent/90 text-accent-foreground" 
                    disabled={isPlacingOrder || form.formState.isSubmitting || cartItemsWithDetails.length === 0 || authIsLoading || isFetchingEnquiryNo || !newSalesEnquiryNo}
                  >
                    {isPlacingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Place Order (KES {totalAmountInclVat.toLocaleString()})
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
