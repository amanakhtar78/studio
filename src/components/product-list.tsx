
import type { Product, Category } from '@/types';
import { ProductCard } from './product-card';
import { cn } from '@/lib/utils';

interface ProductListProps {
  category: Category;
  allProducts: Product[]; // All products from the store
  searchQuery?: string;
  className?: string;
}

export function ProductList({ category, allProducts, searchQuery, className }: ProductListProps) {
  // API product.category is a string like "men's clothing"
  // Category.name is like "Men's Clothing"
  // Filter products belonging to the current category
  let categoryProducts = allProducts.filter(p => p.category.toLowerCase() === category.name.toLowerCase());

  if (searchQuery && searchQuery.trim() !== '') {
    const lowercasedQuery = searchQuery.toLowerCase();
    categoryProducts = categoryProducts.filter(product =>
      product.title.toLowerCase().includes(lowercasedQuery) || // API uses title
      product.description.toLowerCase().includes(lowercasedQuery)
    );
  }

  if (categoryProducts.length === 0 && searchQuery && searchQuery.trim() !== '') {
    return null;
  }
  
  return (
    <section 
      id={category.slug} 
      className={cn(
        "py-8 md:py-12 scroll-mt-24", 
        className 
      )}
    >
      <div className="container max-w-screen-2xl px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-6 md:mb-8 text-center md:text-left">
          {category.name}
        </h2>
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center">
            {searchQuery && searchQuery.trim() !== ''
              ? `No products found matching "${searchQuery}" in ${category.name}.`
              : `No products available in ${category.name} at the moment.`}
          </p>
        )}
      </div>
    </section>
  );
}
