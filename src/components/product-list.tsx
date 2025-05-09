import type { Product, Category } from '@/types';
import { ProductCard } from './product-card';

interface ProductListProps {
  category: Category;
  products: Product[];
}

export function ProductList({ category, products }: ProductListProps) {
  const filteredProducts = products.filter(p => p.categorySlug === category.slug);

  return (
    <section id={category.slug} className="py-8 md:py-12 scroll-mt-24"> {/* scroll-mt accounts for sticky navbar */}
      <div className="container max-w-screen-2xl px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-6 md:mb-8 text-center md:text-left">
          {category.name}
        </h2>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center">No products available in this category at the moment.</p>
        )}
      </div>
    </section>
  );
}
