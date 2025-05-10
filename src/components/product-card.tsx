
'use client';

import Image from 'next/image';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/cart-context';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { getItemQuantity, addItem, updateItemQuantity } = useCart();
  const quantityInCart = getItemQuantity(product.id.toString()); // Product ID is number, cart uses string

  const stockAvailable = product.stockAvailability !== undefined ? product.stockAvailability : true; // Default to true if undefined

  const handleAddToCart = () => {
    if (stockAvailable) {
      addItem(product.id.toString());
    }
  };

  const handleIncreaseQuantity = () => {
    if (stockAvailable) {
      updateItemQuantity(product.id.toString(), quantityInCart + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    updateItemQuantity(product.id.toString(), quantityInCart - 1);
  };

  return (
    <Card className="flex flex-col overflow-hidden h-full shadow-md hover:shadow-lg transition-shadow duration-300 rounded-md">
      <CardHeader className="p-0">
        <div className="relative w-full h-40"> {/* Reduced height */}
          <Image
            src={product.image} // API field: image
            alt={product.title} // API field: title
            layout="fill"
            objectFit="contain" // Changed to contain to show full image, or "cover" if cropping is fine
            className="rounded-t-md p-1.5 bg-white" // Added padding and white background for better presentation
          />
        </div>
      </CardHeader>
      <CardContent className="p-3 flex-grow"> {/* Reduced padding */}
        <CardTitle className="text-base font-semibold mb-1 truncate" title={product.title}>{product.title}</CardTitle> {/* Reduced font size */}
        <Badge variant="secondary" className="mb-1.5 text-xs">{product.category}</Badge>
        <CardDescription className="text-xs text-muted-foreground mb-1.5 h-8 overflow-hidden text-ellipsis"> {/* Reduced font size and height */}
          {product.description}
        </CardDescription>
        <p className="text-base font-bold text-primary mb-1.5">KES {product.price.toLocaleString()}</p> {/* Reduced font size */}
        <Badge variant={stockAvailable ? 'default' : 'destructive'} className={`${stockAvailable ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white text-xs`}>
          {stockAvailable ? 'In Stock' : 'Out of Stock'}
        </Badge>
      </CardContent>
      <CardFooter className="p-3 pt-0"> {/* Reduced padding */}
        {quantityInCart === 0 ? (
          <Button
            size="sm" 
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-sm" 
            disabled={!stockAvailable}
            onClick={handleAddToCart}
            aria-label={`Add ${product.title} to cart`}
          >
            <ShoppingCart className="mr-1.5 h-4 w-4" /> Add to Cart
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleDecreaseQuantity} aria-label="Decrease quantity">
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium mx-2 tabular-nums">{quantityInCart}</span>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleIncreaseQuantity} aria-label="Increase quantity" disabled={!stockAvailable}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

