
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
        "py-4 md:py-6 scroll-mt-20", // scroll-mt adjusted for sticky header/filters, reduced padding
        className 
      )}
    >
      <div className="container max-w-screen-2xl px-2 md:px-4"> {/* Reduced padding */}
        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4 md:mb-5 text-center md:text-left"> {/* Reduced font size and margin */}
          {category.name}
        </h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"> {/* Reduced gap, added xl:grid-cols-5 for potentially more items */}
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-6"> {/* Reduced font size and padding */}
            No products found in {category.name} matching your current filters.
          </p>
        )}
      </div>
    </section>
  );
}
