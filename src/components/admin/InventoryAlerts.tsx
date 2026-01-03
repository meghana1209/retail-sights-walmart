import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Package, Bell, RefreshCw } from 'lucide-react';
import { useInventoryAlerts } from '@/hooks/useInventoryAlerts';
import { useProducts } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const InventoryAlerts = () => {
  const { toast } = useToast();
  const { lowStockProducts, loading } = useInventoryAlerts();
  const { products } = useProducts();

  const updateStock = async (productId: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);
      
      if (error) throw error;
      
      toast({
        title: 'Stock updated',
        description: 'Product stock has been updated',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const outOfStockProducts = products.filter(p => p.stock === 0);
  const lowStockOnlyProducts = products.filter(p => p.stock > 0 && p.stock <= p.threshold);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Out of Stock Products */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Out of Stock ({outOfStockProducts.length})
          </CardTitle>
          <CardDescription>
            Products with zero inventory that need immediate restocking
          </CardDescription>
        </CardHeader>
        <CardContent>
          {outOfStockProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No products are currently out of stock
            </div>
          ) : (
            <div className="space-y-4">
              {outOfStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border border-destructive rounded-lg bg-destructive/5">
                  <div className="flex items-center gap-4">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400';
                      }}
                    />
                    <div>
                      <div className="font-semibold line-clamp-1">{product.name}</div>
                      <Badge variant="destructive">OUT OF STOCK</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Add stock"
                      className="w-24"
                      min={0}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value > 0) {
                          updateStock(product.id, value);
                        }
                      }}
                    />
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Restock
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Products */}
      <Card className="border-secondary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-secondary-foreground">
            <Package className="w-5 h-5" />
            Low Stock Warning ({lowStockOnlyProducts.length})
          </CardTitle>
          <CardDescription>
            Products running low on inventory (stock ≤ threshold)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lowStockOnlyProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              All products have adequate stock levels
            </div>
          ) : (
            <div className="space-y-4">
              {lowStockOnlyProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400';
                      }}
                    />
                    <div>
                      <div className="font-semibold line-clamp-1">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Stock: <span className="text-secondary font-bold">{product.stock}</span> / Threshold: {product.threshold}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-24"
                      defaultValue={product.stock}
                      min={0}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value);
                        if (value !== product.stock) {
                          updateStock(product.id, value);
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Inventory Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-3xl font-bold text-primary">{products.length}</div>
              <div className="text-sm text-muted-foreground">Total Products</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-3xl font-bold text-success">
                {products.filter(p => p.stock > p.threshold).length}
              </div>
              <div className="text-sm text-muted-foreground">In Stock</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-3xl font-bold text-secondary">
                {lowStockOnlyProducts.length}
              </div>
              <div className="text-sm text-muted-foreground">Low Stock</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-3xl font-bold text-destructive">
                {outOfStockProducts.length}
              </div>
              <div className="text-sm text-muted-foreground">Out of Stock</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryAlerts;
