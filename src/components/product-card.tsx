
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
    <Card className="flex flex-col overflow-hidden h-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <CardHeader className="p-0">
        <div className="relative w-full h-48">
          <Image
            src={product.image} // API field: image
            alt={product.title} // API field: title
            layout="fill"
            objectFit="contain" // Changed to contain to show full image, or "cover" if cropping is fine
            className="rounded-t-lg p-2 bg-white" // Added padding and white background for better presentation
          />
        </div>
      </CardHeader>
      <CardContent className="p-5 flex-grow">
        <CardTitle className="text-lg font-semibold mb-2 truncate" title={product.title}>{product.title}</CardTitle>
        <Badge variant="secondary" className="mb-2 text-xs">{product.category}</Badge>
        <CardDescription className="text-sm text-muted-foreground mb-2 h-10 overflow-hidden text-ellipsis">
          {product.description}
        </CardDescription>
        <p className="text-lg font-bold text-primary mb-2">KES {product.price.toLocaleString()}</p>
        <Badge variant={stockAvailable ? 'default' : 'destructive'} className={`${stockAvailable ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white text-xs`}>
          {stockAvailable ? 'In Stock' : 'Out of Stock'}
        </Badge>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        {quantityInCart === 0 ? (
          <Button
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={!stockAvailable}
            onClick={handleAddToCart}
            aria-label={`Add ${product.title} to cart`}
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" size="icon" onClick={handleDecreaseQuantity} aria-label="Decrease quantity">
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium mx-4 tabular-nums">{quantityInCart}</span>
            <Button variant="outline" size="icon" onClick={handleIncreaseQuantity} aria-label="Increase quantity" disabled={!stockAvailable}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
