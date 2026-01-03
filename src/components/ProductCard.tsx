import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Plus, Bell } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number | null;
  image_url: string;
  rating?: number | null;
  reviews_count?: number | null;
  stock: number;
  categories?: { name: string } | null;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  onNotifyMe?: (productId: string) => void;
  showNotifyButton?: boolean;
}

const ProductCard = ({ product, onAddToCart, onNotifyMe, showNotifyButton = true }: ProductCardProps) => {
  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const inStock = product.stock > 0;
  const categoryName = product.categories?.name || 'General';

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400';
            }}
          />
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
              -{discount}%
            </Badge>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
          {product.stock > 0 && product.stock <= 10 && (
            <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">
              Only {product.stock} left
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 flex-grow">
        <div className="mb-2">
          <Badge variant="secondary" className="text-xs">
            {categoryName}
          </Badge>
        </div>
        
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating || 4)
                    ? 'text-secondary fill-current'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-1">
            ({product.reviews_count || 0})
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-primary">
            ${product.price.toFixed(2)}
          </span>
          {product.original_price && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.original_price.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        {inStock ? (
          <Button
            onClick={() => onAddToCart(product.id)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        ) : showNotifyButton && onNotifyMe ? (
          <Button
            onClick={() => onNotifyMe(product.id)}
            variant="outline"
            className="w-full"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notify Me
          </Button>
        ) : (
          <Button disabled variant="secondary" className="w-full">
            Out of Stock
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
