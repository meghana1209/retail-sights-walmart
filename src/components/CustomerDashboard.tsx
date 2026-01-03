import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from './ProductCard';
import { Search, Filter, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useNotifyRequests } from '@/hooks/useNotifyRequests';

const CustomerDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const { categories, loading: categoriesLoading } = useCategories();
  const { products, loading: productsLoading } = useProducts(
    selectedCategory === 'all' ? undefined : selectedCategory,
    debouncedSearch || undefined
  );
  const { addToCart } = useCart();
  const { createNotifyRequest } = useNotifyRequests();

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1);
  };

  const handleNotifyMe = async (productId: string) => {
    await createNotifyRequest(productId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            {selectedCategory === 'all' 
              ? 'All Products' 
              : categories.find(c => c.id === selectedCategory)?.name || 'Products'}
          </h2>
          <p className="text-muted-foreground">
            {products.length} results found
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Filter className="w-3 h-3 mr-1" />
            Best Match
          </Badge>
        </div>
      </div>

      {/* Product Grid */}
      {productsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                categories: product.categories as { name: string } | null,
              }}
              onAddToCart={handleAddToCart}
              onNotifyMe={handleNotifyMe}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or browse different categories
          </p>
          <Button onClick={() => {
            setSearchTerm('');
            setSelectedCategory('all');
          }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Quick Categories */}
      <section className="mt-16">
        <h3 className="text-xl font-semibold mb-6">Shop by Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categoriesLoading ? (
            [...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))
          ) : (
            categories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                className="h-20 flex-col space-y-2 hover:bg-primary hover:text-primary-foreground"
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="text-2xl">
                  {category.name === 'Electronics' && '📱'}
                  {category.name === 'Groceries' && '🛒'}
                  {category.name === 'Clothing & Shoes' && '👕'}
                  {category.name === 'Home & Kitchen' && '🏠'}
                  {category.name === 'Sports & Outdoors' && '⚽'}
                  {category.name === 'Toys & Games' && '🎮'}
                  {category.name === 'Beauty & Personal Care' && '💄'}
                  {category.name === 'Baby & Kids' && '👶'}
                </div>
                <span className="text-xs text-center line-clamp-1">{category.name}</span>
              </Button>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default CustomerDashboard;
