import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Calendar,
  Package,
  AlertTriangle,
  Bell,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { useInventoryAlerts } from '@/hooks/useInventoryAlerts';
import { useNotifyRequests } from '@/hooks/useNotifyRequests';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import ProductManagement from './admin/ProductManagement';
import OrderManagement from './admin/OrderManagement';
import InventoryAlerts from './admin/InventoryAlerts';

const COLORS = ['#0041C2', '#F6BE00', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

const AdminDashboard = () => {
  const { toast } = useToast();
  const { products, loading: productsLoading } = useProducts();
  const { categories } = useCategories();
  const { orders, loading: ordersLoading } = useOrders();
  const { lowStockProducts, alerts } = useInventoryAlerts();
  const { requests: notifyRequests, getDemandCount } = useNotifyRequests();
  const [seeding, setSeeding] = useState(false);

  // Calculate KPIs
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const totalOrders = orders.length;
  const activeCustomers = new Set(orders.map(o => o.user_id)).size;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Sales by category
  const categoryRevenue = categories.map(cat => {
    const catProducts = products.filter(p => p.category_id === cat.id);
    const catProductIds = new Set(catProducts.map(p => p.id));
    
    let revenue = 0;
    orders.forEach(order => {
      order.order_items?.forEach(item => {
        if (catProductIds.has(item.product_id)) {
          revenue += Number(item.price) * item.quantity;
        }
      });
    });
    
    return { name: cat.name, value: revenue };
  }).filter(c => c.value > 0);

  // Top selling products
  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
  orders.forEach(order => {
    order.order_items?.forEach(item => {
      const key = item.product_id;
      if (!productSales[key]) {
        productSales[key] = {
          name: item.products?.name || 'Unknown',
          quantity: 0,
          revenue: 0,
        };
      }
      productSales[key].quantity += item.quantity;
      productSales[key].revenue += Number(item.price) * item.quantity;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Monthly revenue trend
  const monthlyRevenue = orders.reduce((acc, order) => {
    if (!order.created_at) return acc;
    const month = format(new Date(order.created_at), 'MMM yyyy');
    acc[month] = (acc[month] || 0) + Number(order.total_amount);
    return acc;
  }, {} as Record<string, number>);

  const revenueChartData = Object.entries(monthlyRevenue)
    .map(([month, revenue]) => ({ month, revenue }))
    .slice(-6);

  const seedProducts = async () => {
    setSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-products');
      
      if (error) throw error;
      
      toast({
        title: 'Products seeded!',
        description: data.message,
      });
    } catch (err: any) {
      toast({
        title: 'Error seeding products',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSeeding(false);
    }
  };

  const kpis = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-success',
    },
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'text-primary',
    },
    {
      title: 'Active Customers',
      value: activeCustomers.toLocaleString(),
      icon: Users,
      color: 'text-secondary',
    },
    {
      title: 'Avg Order Value',
      value: `$${avgOrderValue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-primary',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your store and track performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={seedProducts} disabled={seeding}>
            <RefreshCw className={`w-4 h-4 mr-2 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Seeding...' : 'Seed Products'}
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Card className="mb-6 border-destructive bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Low Stock Alert ({lowStockProducts.length} products)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.slice(0, 5).map((product) => (
                <Badge key={product.id} variant="outline" className="border-destructive text-destructive">
                  {product.name} - {product.stock} left
                </Badge>
              ))}
              {lowStockProducts.length > 5 && (
                <Badge variant="secondary">+{lowStockProducts.length - 5} more</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="inventory">
            Inventory
            {lowStockProducts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {lowStockProducts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="demand">
            Demand
            {notifyRequests.filter(r => !r.notified).length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {notifyRequests.filter(r => !r.notified).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                {revenueChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
                      <Line type="monotone" dataKey="revenue" stroke="#0041C2" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No order data yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Sales */}
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Revenue distribution across categories</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryRevenue.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryRevenue}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryRevenue.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No sales data yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Best performing products</CardDescription>
              </CardHeader>
              <CardContent>
                {topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-semibold line-clamp-1">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.quantity} units sold
                          </div>
                        </div>
                        <div className="font-bold text-success">
                          ${product.revenue.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No sales data yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-semibold">#{order.id.slice(0, 8).toUpperCase()}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.created_at && format(new Date(order.created_at), 'MMM d, h:mm a')}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold">${Number(order.total_amount).toFixed(2)}</div>
                          <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No orders yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <ProductManagement />
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <OrderManagement />
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory">
          <InventoryAlerts />
        </TabsContent>

        {/* Demand Tab */}
        <TabsContent value="demand">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Customer Demand (Notify Me Requests)
              </CardTitle>
              <CardDescription>
                Products customers want to be notified about when back in stock
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifyRequests.filter(r => !r.notified).length > 0 ? (
                <div className="space-y-4">
                  {/* Group by product */}
                  {Array.from(new Set(notifyRequests.filter(r => !r.notified).map(r => r.product_id)))
                    .map(productId => {
                      const product = notifyRequests.find(r => r.product_id === productId)?.products;
                      const count = getDemandCount(productId);
                      
                      return (
                        <div key={productId} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <img
                              src={product?.image_url}
                              alt={product?.name}
                              className="w-16 h-16 object-cover rounded-lg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400';
                              }}
                            />
                            <div>
                              <div className="font-semibold line-clamp-1">{product?.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Current stock: {product?.stock || 0}
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-lg">
                            {count} requests
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No pending notify requests
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
