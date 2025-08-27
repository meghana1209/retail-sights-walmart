import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Calendar
} from 'lucide-react';

const AdminDashboard = () => {
  // Mock analytics data
  const kpis = [
    {
      title: 'Total Revenue',
      value: '$2,847,392',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      description: 'vs last month'
    },
    {
      title: 'Total Orders',
      value: '18,427',
      change: '+8.3%',
      trend: 'up',
      icon: ShoppingCart,
      description: 'vs last month'
    },
    {
      title: 'Active Customers',
      value: '142,539',
      change: '+15.2%',
      trend: 'up',
      icon: Users,
      description: 'vs last month'
    },
    {
      title: 'Conversion Rate',
      value: '3.24%',
      change: '-2.1%',
      trend: 'down',
      icon: TrendingUp,
      description: 'vs last month'
    }
  ];

  const topProducts = [
    { name: 'iPhone 15 Pro Max', sales: 1247, revenue: '$1,246,753', category: 'Electronics' },
    { name: 'Samsung 65" QLED TV', sales: 893, revenue: '$714,407', category: 'Electronics' },
    { name: 'Nike Air Max 270', sales: 567, revenue: '$73,683', category: 'Clothing' },
    { name: 'KitchenAid Mixer', sales: 445, revenue: '$133,495', category: 'Home & Kitchen' },
    { name: 'Dyson V15 Vacuum', sales: 334, revenue: '$217,166', category: 'Home & Kitchen' }
  ];

  const recentOrders = [
    { id: '#12847', customer: 'John Smith', total: '$1,299.98', status: 'Delivered', time: '2 hours ago' },
    { id: '#12846', customer: 'Sarah Johnson', total: '$89.99', status: 'Processing', time: '3 hours ago' },
    { id: '#12845', customer: 'Mike Davis', total: '$456.50', status: 'Shipped', time: '5 hours ago' },
    { id: '#12844', customer: 'Emily Brown', total: '$234.99', status: 'Delivered', time: '1 day ago' },
    { id: '#12843', customer: 'David Wilson', total: '$678.25', status: 'Processing', time: '1 day ago' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-success text-success-foreground';
      case 'Shipped': return 'bg-primary text-primary-foreground';
      case 'Processing': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Sales Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your sales today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 days
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span className={`flex items-center ${
                  kpi.trend === 'up' ? 'text-success' : 'text-destructive'
                }`}>
                  {kpi.trend === 'up' ? (
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-1" />
                  )}
                  {kpi.change}
                </span>
                <span className="ml-2">{kpi.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>
              Best performing products this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.sales} units sold
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-success">{product.revenue}</div>
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest customer orders and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-semibold">{order.id}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.customer}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">{order.total}</div>
                    <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {order.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart Placeholder */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Sales Trends</CardTitle>
          <CardDescription>
            Revenue and order volume over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <div className="text-lg font-semibold">Interactive Sales Chart</div>
              <div className="text-muted-foreground">
                Chart visualization would be implemented here using Chart.js or Recharts
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;