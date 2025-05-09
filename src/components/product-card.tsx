import Image from 'next/image';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
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
        <Button 
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          disabled={!product.stockAvailability}
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
