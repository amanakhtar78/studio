
'use client';

import Image from 'next/image';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Minus, Star } from 'lucide-react';
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
          {product.rating && (
            <Badge variant="default" className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-xs px-1.5 py-0.5">
              <Star className="w-3 h-3 mr-1 fill-current" /> {product.rating.rate.toFixed(1)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 flex-grow"> {/* Reduced padding */}
        <CardTitle className="text-base font-semibold mb-1 truncate h-10 leading-tight" title={product.title}>{product.title}</CardTitle> {/* Reduced font size, added fixed height and leading-tight */}
        <Badge variant="secondary" className="mb-1.5 text-xs">{product.category}</Badge>
        <CardDescription className="text-xs text-muted-foreground mb-1.5 h-8 overflow-hidden text-ellipsis"> {/* Reduced font size and height */}
          {product.description}
        </CardDescription>
        <div className="flex items-end justify-between mt-1.5"> {/* Changed items-center to items-end */}
          <p className="text-xl font-bold text-primary">KES {product.price.toLocaleString()}</p> {/* Increased font size to text-xl */}
          <Badge variant={stockAvailable ? 'default' : 'destructive'} className={`${stockAvailable ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'} text-xs px-2 py-0.5 border`}>
            {stockAvailable ? 'In Stock' : 'Out of Stock'}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-2 mt-auto border-t"> {/* Reduced padding, added pt-2 and mt-auto, added border-t */}
        {quantityInCart === 0 ? (
          <Button
            size="sm" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm py-2 transition-all duration-200 ease-in-out transform hover:scale-105 focus:ring-2 focus:ring-primary/50 focus:ring-offset-1"
            disabled={!stockAvailable}
            onClick={handleAddToCart}
            aria-label={`Add ${product.title} to cart`}
          >
            <ShoppingCart className="mr-1.5 h-4 w-4" /> Add to Cart
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" size="icon" className="h-9 w-9 border-primary/50 text-primary hover:bg-primary/10 hover:border-primary transition-colors" onClick={handleDecreaseQuantity} aria-label="Decrease quantity">
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium mx-2 tabular-nums w-8 text-center">{quantityInCart}</span>
            <Button variant="outline" size="icon" className="h-9 w-9 border-primary/50 text-primary hover:bg-primary/10 hover:border-primary transition-colors" onClick={handleIncreaseQuantity} aria-label="Increase quantity" disabled={!stockAvailable}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
