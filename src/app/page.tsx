import { Banner } from '@/components/banner';
import { CategorySelector } from '@/components/category-selector';
import { ProductList } from '@/components/product-list';
import { Separator } from '@/components/ui/separator';
import { bannerImages, categories, products } from '@/lib/mock-data';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <div className="container max-w-screen-2xl px-4 md:px-6 py-6 md:py-8">
        <Banner images={bannerImages} />
      </div>
      
      <CategorySelector categories={categories} />
      
      {categories.map((category, index) => (
        <div key={category.id}>
          <ProductList category={category} products={products} />
          {index < categories.length - 1 && (
            <div className="container max-w-screen-2xl px-4 md:px-6">
              <Separator className="my-8 md:my-12" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
