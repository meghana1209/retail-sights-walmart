import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import ProductCard from './ProductCard';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CustomerDashboard = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartCount, setCartCount] = useState(0);

  // Mock product data
  const products = [
    {
      id: '1',
      name: 'Apple iPhone 15 Pro Max 256GB Natural Titanium',
      price: 999.99,
      originalPrice: 1199.99,
      image: '/placeholder.svg',
      rating: 4.8,
      reviews: 1247,
      category: 'Electronics',
      inStock: true
    },
    {
      id: '2',
      name: 'Samsung 65" 4K QLED Smart TV with HDR',
      price: 799.99,
      originalPrice: 1099.99,
      image: '/placeholder.svg',
      rating: 4.6,
      reviews: 893,
      category: 'Electronics',
      inStock: true
    },
    {
      id: '3',
      name: 'Nike Air Max 270 Running Shoes - Black/White',
      price: 129.99,
      originalPrice: 149.99,
      image: '/placeholder.svg',
      rating: 4.5,
      reviews: 567,
      category: 'Clothing & Shoes',
      inStock: true
    },
    {
      id: '4',
      name: 'KitchenAid Stand Mixer - 5 Quart Artisan Series',
      price: 299.99,
      originalPrice: 379.99,
      image: '/placeholder.svg',
      rating: 4.9,
      reviews: 2134,
      category: 'Home & Kitchen',
      inStock: false
    },
    {
      id: '5',
      name: 'Great Value Organic Whole Milk - 1 Gallon',
      price: 4.98,
      image: '/placeholder.svg',
      rating: 4.3,
      reviews: 445,
      category: 'Groceries',
      inStock: true
    },
    {
      id: '6',
      name: 'Dyson V15 Detect Cordless Vacuum Cleaner',
      price: 649.99,
      originalPrice: 749.99,
      image: '/placeholder.svg',
      rating: 4.7,
      reviews: 756,
      category: 'Home & Kitchen',
      inStock: true
    }
  ];

  const categories = [
    'All Categories',
    'Electronics',
    'Clothing & Shoes',
    'Home & Kitchen',
    'Groceries',
    'Health & Beauty',
    'Sports & Outdoors'
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           selectedCategory === 'All Categories' || 
                           product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (productId: string) => {
    setCartCount(prev => prev + 1);
    const product = products.find(p => p.id === productId);
    toast({
      title: "Added to cart",
      description: `${product?.name} has been added to your cart.`,
    });
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
              {categories.map((category) => (
                <SelectItem 
                  key={category} 
                  value={category === 'All Categories' ? 'all' : category}
                >
                  {category}
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
            {selectedCategory === 'all' || selectedCategory === 'All Categories' 
              ? 'All Products' 
              : selectedCategory}
          </h2>
          <p className="text-muted-foreground">
            {filteredProducts.length} results found
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
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.slice(1).map((category) => (
            <Button
              key={category}
              variant="outline"
              className="h-20 flex-col space-y-2 hover:bg-primary hover:text-primary-foreground"
              onClick={() => setSelectedCategory(category)}
            >
              <div className="text-2xl">
                {category === 'Electronics' && '📱'}
                {category === 'Clothing & Shoes' && '👕'}
                {category === 'Home & Kitchen' && '🏠'}
                {category === 'Groceries' && '🛒'}
                {category === 'Health & Beauty' && '💄'}
                {category === 'Sports & Outdoors' && '⚽'}
              </div>
              <span className="text-xs text-center">{category}</span>
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CustomerDashboard;