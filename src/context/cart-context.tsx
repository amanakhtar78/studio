
'use client';

import type { Product, CartItem } from '@/types';
import { products as allProducts } from '@/lib/mock-data';
import type { ReactNode } from 'react';
import { createContext, useContext, useState, useMemo, useCallback } from 'react';

interface CartContextType {
  items: CartItem[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void; // This will effectively be updateItemQuantity(productId, currentQuantity - 1)
  updateItemQuantity: (productId: string, quantity: number) => void;
  getItemQuantity: (productId: string) => number;
  getCartItemsWithDetails: () => (CartItem & Product & { itemTotal: number })[];
  totalItemsCount: number;
  cartSubtotal: number;
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
        return prevItems; // Should not happen if item is in cart
    });
  }, []);


  const getItemQuantity = useCallback((productId: string): number => {
    const item = items.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  }, [items]);

  const totalItemsCount = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getCartItemsWithDetails = useCallback(() => {
    return items.map(cartItem => {
      const productDetails = allProducts.find(p => p.id === cartItem.productId);
      if (!productDetails) {
        // This case should ideally not happen if product IDs are consistent
        throw new Error(`Product with ID ${cartItem.productId} not found.`);
      }
      return {
        ...productDetails, // Spread all product properties
        ...cartItem, // Spread cartItem (productId, quantity)
        itemTotal: productDetails.price * cartItem.quantity,
      };
    });
  }, [items]);

  const cartSubtotal = useMemo(() => {
    return getCartItemsWithDetails().reduce((total, item) => total + item.price * item.quantity, 0);
  }, [getCartItemsWithDetails]);

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
        totalItemsCount,
        cartSubtotal,
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
