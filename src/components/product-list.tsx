
import type { Product, Category } from '@/types';
import { ProductCard } from './product-card';
import { cn } from '@/lib/utils';

interface ProductListProps {
  category: Category;
  products: Product[]; // This list is pre-filtered and pre-sorted by the parent.
  className?: string;
}

export function ProductList({ category, products, className }: ProductListProps) {
  // All filtering and sorting is now done in page.tsx by the parent component.
  // This component just displays the products it's given for the specified category.

  return (
    <section 
      id={category.slug} 
      className={cn(
        "py-8 md:py-12 scroll-mt-24", // scroll-mt adjusted for sticky header/filters
        className 
      )}
    >
      <div className="container max-w-screen-2xl px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-6 md:mb-8 text-center md:text-left">
          {category.name}
        </h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No products found in {category.name} matching your current filters.
          </p>
        )}
      </div>
    </section>
  );
}
