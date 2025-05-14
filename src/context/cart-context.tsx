
'use client';

import type { Product, CartItem, CartItemWithProductDetails } from '@/types';
import type { ReactNode } from 'react';
import { createContext, useContext, useState, useMemo, useCallback } from 'react';

interface CartContextType {
  items: CartItem[];
  addItem: (productId: string) => void; 
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  getItemQuantity: (productId: string) => number;
  getCartItemsWithDetails: (allApiProducts: Product[]) => CartItemWithProductDetails[];
  getCartSubtotal: (allApiProducts: Product[]) => number;
  totalItemsCount: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((productId: string) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === productId);
      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { productId, quantity: 1 }];
    });
  }, []);

  const updateItemQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prevItems) => {
      if (quantity <= 0) {
        return prevItems.filter((item) => item.productId !== productId);
      }
      return prevItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prevItems => {
        const existingItem = prevItems.find(item => item.productId === productId);
        if (existingItem) {
            if (existingItem.quantity > 1) {
                return prevItems.map(item => 
                    item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item
                );
            } else {
                return prevItems.filter(item => item.productId !== productId);
            }
        }
        return prevItems;
    });
  }, []);


  const getItemQuantity = useCallback((productId: string): number => {
    const item = items.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  }, [items]);

  const totalItemsCount = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getCartItemsWithDetails = useCallback((allApiProducts: Product[]): CartItemWithProductDetails[] => {
    return items.map(cartItem => {
      // Product.id is now string (ITEM CODE), cartItem.productId is also string
      const productDetails = allApiProducts.find(p => p.id === cartItem.productId);
      
      if (!productDetails) {
        console.warn(`Product with ID ${cartItem.productId} not found in API products list.`);
        // Return a minimal structure or skip if product not found
        return null;
      }
      return {
        ...productDetails, // Spread all Product properties
        cartQuantity: cartItem.quantity,
        itemTotal: productDetails.price * cartItem.quantity,
        // stockAvailability is already part of productDetails from the slice
      };
    }).filter(item => item !== null) as CartItemWithProductDetails[];
  }, [items]);


  const getCartSubtotal = useCallback((allApiProducts: Product[]) => {
    return getCartItemsWithDetails(allApiProducts).reduce((total, item) => total + item.price * item.cartQuantity, 0);
  }, [items, getCartItemsWithDetails]);


  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateItemQuantity,
        getItemQuantity,
        getCartItemsWithDetails,
        getCartSubtotal,
        totalItemsCount,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
