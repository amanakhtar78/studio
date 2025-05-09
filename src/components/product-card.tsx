
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
  const quantityInCart = getItemQuantity(product.id);

  const handleAddToCart = () => {
    if (product.stockAvailability) {
      addItem(product.id);
    }
  };

  const handleIncreaseQuantity = () => {
    if (product.stockAvailability) {
      updateItemQuantity(product.id, quantityInCart + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    updateItemQuantity(product.id, quantityInCart - 1);
  };

  return (
    <Card className="flex flex-col overflow-hidden h-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <CardHeader className="p-0">
        <div className="relative w-full h-48">
          <Image
            src={product.imageUrl}
            alt={product.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint={product.dataAiHint}
            className="rounded-t-lg"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold mb-1 truncate" title={product.name}>{product.name}</CardTitle>
        <Badge variant="secondary" className="mb-2 text-xs">{product.categoryName}</Badge>
        <CardDescription className="text-sm text-muted-foreground mb-2 h-10 overflow-hidden text-ellipsis">
          {product.description}
        </CardDescription>
        <p className="text-lg font-bold text-primary mb-2">KES {product.price.toLocaleString()}</p>
        <Badge variant={product.stockAvailability ? 'default' : 'destructive'} className="bg-green-500 text-white data-[destructive=true]:bg-red-500 data-[destructive=true]:text-white text-xs">
          {product.stockAvailability ? 'In Stock' : 'Out of Stock'}
        </Badge>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {quantityInCart === 0 ? (
          <Button
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={!product.stockAvailability}
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" size="icon" onClick={handleDecreaseQuantity} aria-label="Decrease quantity">
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium mx-4">{quantityInCart}</span>
            <Button variant="outline" size="icon" onClick={handleIncreaseQuantity} aria-label="Increase quantity" disabled={!product.stockAvailability}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
