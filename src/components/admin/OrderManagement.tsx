import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, Package, Truck, CheckCircle } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { format } from 'date-fns';

const OrderManagement = () => {
  const { orders, loading, updateOrderStatus } = useOrders();
  const [filter, setFilter] = useState('all');

  const filteredOrders = orders.filter(order => 
    filter === 'all' || order.status === filter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ShoppingCart className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <ShoppingCart className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-secondary text-secondary-foreground';
      case 'processing': return 'bg-primary text-primary-foreground';
      case 'shipped': return 'bg-blue-500 text-white';
      case 'delivered': return 'bg-success text-success-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Order Management ({orders.length} orders)
          </CardTitle>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              {orderStatuses.map(status => (
                <SelectItem key={status} value={status} className="capitalize">
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No orders found
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      {order.created_at && format(new Date(order.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {order.order_items?.slice(0, 2).map((item, idx) => (
                          <span key={idx} className="text-sm line-clamp-1">
                            {item.quantity}x {item.products?.name}
                          </span>
                        ))}
                        {order.order_items && order.order_items.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{order.order_items.length - 2} more items
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">
                      ${Number(order.total_amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {orderStatuses.map(status => (
                            <SelectItem key={status} value={status} className="capitalize">
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderManagement;
