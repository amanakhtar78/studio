
import type { Product, Category } from '@/types';
import { ProductCard } from './product-card';

interface ProductListProps {
  category: Category;
  products: Product[];
  searchQuery?: string;
}

export function ProductList({ category, products, searchQuery }: ProductListProps) {
  let categoryProducts = products.filter(p => p.categorySlug === category.slug);

  if (searchQuery && searchQuery.trim() !== '') {
    const lowercasedQuery = searchQuery.toLowerCase();
    categoryProducts = categoryProducts.filter(product =>
      product.name.toLowerCase().includes(lowercasedQuery) ||
      product.description.toLowerCase().includes(lowercasedQuery)
    );
  }

  if (categoryProducts.length === 0 && searchQuery && searchQuery.trim() !== '') {
    // If there's a search query and this category has no matching products,
    // don't render this category section at all.
    // The global "no results" message will be handled in HomePage.
    return null;
  }
  
  return (
    <section id={category.slug} className="py-8 md:py-12 scroll-mt-24"> {/* scroll-mt accounts for sticky navbar */}
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
