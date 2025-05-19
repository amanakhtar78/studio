
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Minus, Plus, Trash2, Loader2, ShoppingCart, AlertTriangle, ShieldCheck } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { checkoutFormSchema, type CheckoutFormDataType, type SalesEnquiryHeaderPayload, type SalesEnquiryItemPayload } from '@/types';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { fetchNextSalesEnquiryNoAPI, saveSalesEnquiryHeaderAPI, saveSalesEnquiryItemAPI } from '@/services/api';


export default function CheckoutPage() {
  const { 
    items: cartItemsBase, 
    updateItemQuantity, 
    clearCart, 
    getCartItemsWithDetails, 
  } = useCart();
  const { user, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const { openModal: openAuthModal } = useAuthModal();
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


  const form = useForm<CheckoutFormDataType>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      deliveryAddress: '',
      city: '',
      pinCode: '',
      country: '',
      modeOfPayment: undefined,
      salesEnquiryNotes: '',
      addressOption: user?.address ? 'profile' : 'new',
    },
  });

  const [isMounted, setIsMounted] = useState(false);
  const placeholderImage = "https://placehold.co/64x64.png";
  const [newSalesEnquiryNo, setNewSalesEnquiryNo] = useState<string | null>(null);
  const [isFetchingEnquiryNo, setIsFetchingEnquiryNo] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isConfirmOrderOpen, setIsConfirmOrderOpen] = useState(false);

  const addressOption = form.watch('addressOption');


  useEffect(() => {
    setIsMounted(true);
    if (!authIsLoading && !isAuthenticated && isMounted) {
      toast({
        title: "Authentication Required",
        description: "Please log in to proceed to checkout.",
        variant: "default",
      });
      openAuthModal();
      router.replace('/'); 
    }
  }, [authIsLoading, isAuthenticated, router, openAuthModal, toast, isMounted]);


  useEffect(() => {
    const fetchEnquiryNo = async () => {
      if (!isAuthenticated) return; 
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
    if(isMounted && isAuthenticated) {
      fetchEnquiryNo();
    } else if (isMounted && !isAuthenticated) {
      setIsFetchingEnquiryNo(false); 
    }
  }, [toast, isMounted, isAuthenticated]);

  useEffect(() => {
    if (!isMounted || !user) {
      form.reset({
        fullName: '', phoneNumber: '',
        deliveryAddress: '', city: '', pinCode: '', country: '',
        modeOfPayment: undefined, salesEnquiryNotes: '', addressOption: 'new',
      });
      return;
    }

    const defaultValues: Partial<CheckoutFormDataType> = {
      modeOfPayment: form.getValues('modeOfPayment') || undefined,
      salesEnquiryNotes: form.getValues('salesEnquiryNotes') || '',
    };

    if (addressOption === 'profile' && user.address) {
      form.reset({
        ...defaultValues,
        fullName: user.name || '',
        phoneNumber: user.phoneNumber || '',
        deliveryAddress: user.address.street || '', // Store for payload, not editable in form
        city: user.address.city || '', // Store for payload
        pinCode: user.address.pinCode || '', // Store for payload
        country: user.address.country || '', // Store for payload
        addressOption: 'profile',
      });
    } else { // 'new' address option
      form.reset({
        ...defaultValues,
        fullName: user.name || '', // Pre-fill but editable
        phoneNumber: user.phoneNumber || '', // Pre-fill but editable
        deliveryAddress: form.getValues('deliveryAddress') || '', // Keep user input if any
        city: form.getValues('city') || '',
        pinCode: form.getValues('pinCode') || '',
        country: form.getValues('country') || '',
        addressOption: 'new',
      });
    }
  }, [isMounted, user, addressOption, form.reset, form.getValues]);


  const onFormSubmit = async (data: CheckoutFormDataType) => {
    setIsConfirmOrderOpen(true);
  };
  
  const handlePlaceOrder = async () => {
    setIsConfirmOrderOpen(false); 
    const data = form.getValues(); 

    if (!user || !user.email) { 
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
    
    let deliveryDetails = {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      deliveryAddress: '',
      city: '',
      pinCode: '',
      country: '',
    };

    if (addressOption === 'profile' && user?.address) {
      deliveryDetails.deliveryAddress = user.address.street;
      deliveryDetails.city = user.address.city;
      deliveryDetails.pinCode = user.address.pinCode;
      deliveryDetails.country = user.address.country || '';
    } else {
      deliveryDetails.deliveryAddress = data.deliveryAddress || '';
      deliveryDetails.city = data.city || '';
      deliveryDetails.pinCode = data.pinCode || '';
      deliveryDetails.country = data.country || '';
    }

    const headerPayload: SalesEnquiryHeaderPayload = {
      SALESENQUIRYNO: Number(newSalesEnquiryNo),
      SALESENQUIRYITEMSSERVICE: 0,
      CLIENTCODE: user.email,
      REFFROM: "ZAHARASWEETROOLE",
      SALESENQUIRYDATE: datePass,
      SALESENQUIRYVEHICLE: "",
      DIVISION: 'NAIROBI', 
      SALESENQUIRYNOTES: data.salesEnquiryNotes || "",
      CREATEDBY: user.email.split("@")[0].toUpperCase(),
      CREATEDDATE: datePass,
      CREATEDTIME: timePass,
      AMOUNTEXCVAT: totalAmountExclVat,
      VATAMOUNT: totalVatAmount,
      AMTOUNTINCLUSIVEVAT: totalAmountInclVat,
      CURRENCYCODE: "KSH",
      MODEOFPAY: data.modeOfPayment,
      CLIENTNAME: deliveryDetails.fullName,
      DELIVERYADDRESS: deliveryDetails.deliveryAddress,
      CLIENTEMAIL: user.email,
      CLIENTCOUNTRY: deliveryDetails.country,
      CLIENTCITY: deliveryDetails.city,
      CLIENTPHONENUMBER: deliveryDetails.phoneNumber,
      CARTNO: Number(newSalesEnquiryNo),
      DELIVERYPROVIDED: 0,
      DELIVERYROUTE: 0,
      DELIVERYCHARGES: 0,
      SUCCESS_STATUS: '',
      ERROR_STATUS: '',
    };

    try {
      const headerResponse = await saveSalesEnquiryHeaderAPI(headerPayload);
      if (!headerResponse.data || !headerResponse.data.message.toLowerCase().includes('document saved')) {
        throw new Error(headerResponse.data.message || 'Failed to save order header.');
      }

      for (let i = 0; i < cartItemsWithDetails.length; i++) {
        const item = cartItemsWithDetails[i];
        const lineItemRateExclVat = item.price * item.cartQuantity;
        const lineItemVat = item.ITEM_VATABLE?.toUpperCase() === 'YES' ? lineItemRateExclVat * 0.16 : 0;
        const lineItemAmountInclVat = lineItemRateExclVat + lineItemVat;

        const itemPayload: SalesEnquiryItemPayload = {
          SALESENQUIRYNO: Number(newSalesEnquiryNo),
          SALESENQUIRYDATE: datePass,
          SERIALNO: i + 1,
          ITEMCODE: item.id,
          ITEMDESCRIPTION: item.title,
          UOM: item.ITEM_BASE_UOM || "PCS",
          ITEMQTY: item.cartQuantity,
          ITEMRATE: lineItemRateExclVat, 
          ITEMVAT: lineItemVat,
          ITEMCURRENCY: "KSH",
          ITEMAMOUNT: lineItemAmountInclVat, 
          DIVISION: 'NAIROBI',
          CREATEDBY: user.email.split("@")[0].toUpperCase(),
          CREATEDDATE: datePass, 
          SUCCESS_STATUS: '',
          ERROR_STATUS: '',
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


  if (!isMounted || productStatus === 'loading' || (authIsLoading && !user) || (isAuthenticated && isFetchingEnquiryNo)) {
     return (
      <div className="container max-w-screen-lg mx-auto px-2 md:px-4 py-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-3 text-muted-foreground text-sm">Loading checkout details...</p>
      </div>
    );
  }
   if (!isAuthenticated && isMounted && !authIsLoading) {
    return (
      <div className="container max-w-screen-lg mx-auto px-2 md:px-4 py-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-3">Authentication Required</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Please log in to proceed to checkout.
        </p>
        <Button onClick={openAuthModal} size="lg">Login / Sign Up</Button>
      </div>
    );
  }


  if (productStatus === 'failed') {
    return (
      <div className="container max-w-screen-lg mx-auto px-2 md:px-4 py-8 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
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
    <>
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
              <Card className="shadow-md">
                <CardHeader className="p-4">
                  <CardTitle className="text-xl">Delivery & Payment</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {isAuthenticated && user?.address && (
                    <FormField
                      control={form.control}
                      name="addressOption"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm">Delivery Address Option</FormLabel>
                          <RadioGroup
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue('addressOption', value as 'profile' | 'new');
                            }}
                            value={field.value || (user.address ? 'profile' : 'new')}
                            className="flex flex-col space-y-1"
                            disabled={isPlacingOrder}
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="profile" />
                              </FormControl>
                              <FormLabel className="font-normal text-sm cursor-pointer">Use my saved address</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="new" />
                              </FormControl>
                              <FormLabel className="font-normal text-sm cursor-pointer">Enter a new delivery address</FormLabel>
                            </FormItem>
                          </RadioGroup>
                          {field.value === 'profile' && user.address && (
                            <Card className="bg-muted/50 p-2.5 text-xs mt-1.5 border-border/70 shadow-sm">
                              <p><strong>{user.name}</strong></p>
                              <p>{user.phoneNumber || 'No phone on file'}</p>
                              <p>{user.address.street}, {user.address.city}</p>
                              <p>{user.address.pinCode} {user.address.country && `(${user.address.country})`} <span className="capitalize">({user.address.addressType})</span></p>
                            </Card>
                          )}
                           <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Zahra Ali" {...field} disabled={(addressOption === 'profile' && !!user?.name) || isPlacingOrder} className="h-9 text-sm" />
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
                          <Input type="tel" placeholder="e.g. +254712345678" {...field} disabled={(addressOption === 'profile' && !!user?.phoneNumber) || isPlacingOrder} className="h-9 text-sm" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  {(addressOption === 'new' || (!user?.address && !isAuthenticated)) && (
                    <>
                      <FormField
                        control={form.control}
                        name="deliveryAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Street Address</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 123 Bakery St, Apt 4B" {...field} disabled={isPlacingOrder} className="h-9 text-sm" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">City</FormLabel>
                            <FormControl>
                              <Input placeholder="Nairobi" {...field} disabled={isPlacingOrder} className="h-9 text-sm" />
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
                              <Input placeholder="e.g. 00100" {...field} disabled={isPlacingOrder} className="h-9 text-sm" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Country</FormLabel>
                            <FormControl>
                              <Input placeholder="Kenya" {...field} disabled={isPlacingOrder} className="h-9 text-sm" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="modeOfPayment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Mode of Payment</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isPlacingOrder}>
                          <FormControl>
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pay_on_delivery">Pay on Delivery</SelectItem>
                            <SelectItem value="online">Online Payment</SelectItem>
                            <SelectItem value="credit_pay_later">Credit Pay Later</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salesEnquiryNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Order Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Any special instructions for your order..." {...field} disabled={isPlacingOrder} className="text-sm min-h-[60px]" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                   <Button 
                    type="submit" 
                    size="default" 
                    className="w-full text-sm py-2.5 bg-accent hover:bg-accent/90 text-accent-foreground" 
                    disabled={isPlacingOrder || form.formState.isSubmitting || cartItemsWithDetails.length === 0 || authIsLoading || isFetchingEnquiryNo || !newSalesEnquiryNo || !isAuthenticated}
                  >
                    {isPlacingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                    Confirm & Place Order (KES {totalAmountInclVat.toLocaleString()})
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>
      </div>
    </div>

    <AlertDialog open={isConfirmOrderOpen} onOpenChange={setIsConfirmOrderOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to place this order with the total amount of KES {totalAmountInclVat.toLocaleString()}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmOrderOpen(false)} disabled={isPlacingOrder}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePlaceOrder} disabled={isPlacingOrder} className="bg-primary hover:bg-primary/90">
              {isPlacingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Yes, Place Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    
