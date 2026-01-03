import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, Clock, CheckCircle, Truck, XCircle, ShoppingBag } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { format } from 'date-fns';

interface OrdersPageProps {
  onNavigate: (page: string) => void;
}

const OrdersPage = ({ onNavigate }: OrdersPageProps) => {
  const { orders, loading } = useOrders();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-secondary text-secondary-foreground';
      case 'processing':
        return 'bg-primary text-primary-foreground';
      case 'shipped':
        return 'bg-blue-500 text-white';
      case 'delivered':
        return 'bg-success text-success-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-24 h-24 mx-auto text-muted-foreground mb-6" />
        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
        <p className="text-muted-foreground mb-6">
          Start shopping to see your orders here
        </p>
        <Button onClick={() => onNavigate('dashboard')}>
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="pb-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {order.created_at && format(new Date(order.created_at), 'MMMM d, yyyy h:mm a')}
                  </p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {getStatusIcon(order.status)}
                  <span className="ml-1 capitalize">{order.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <img
                        src={item.products?.image_url}
                        alt={item.products?.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium line-clamp-1">{item.products?.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                        </p>
                      </div>
                      <span className="font-semibold">
                        ${(item.quantity * Number(item.price)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Order Total */}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {order.order_items?.length} item(s)
                  </span>
                  <div className="text-right">
                    <span className="text-sm text-muted-foreground">Total: </span>
                    <span className="font-bold text-lg text-primary">
                      ${Number(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {order.shipping_address && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-sm text-muted-foreground">Shipping Address:</span>
                      <p className="mt-1">{order.shipping_address}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
