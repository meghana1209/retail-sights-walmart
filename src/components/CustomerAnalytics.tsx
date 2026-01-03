import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, ShoppingBag, DollarSign, PieChart as PieIcon } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useProfile } from '@/hooks/useProfile';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#0041C2', '#F6BE00', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

interface CustomerAnalyticsProps {
  onNavigate: (page: string) => void;
}

const CustomerAnalytics = ({ onNavigate }: CustomerAnalyticsProps) => {
  const { orders, loading: ordersLoading } = useOrders();
  const { profile, loading: profileLoading } = useProfile();

  // Calculate total spend
  const totalSpend = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  
  // Monthly spending trend
  const monthlySpend = orders.reduce((acc, order) => {
    if (!order.created_at) return acc;
    const month = format(new Date(order.created_at), 'MMM yyyy');
    acc[month] = (acc[month] || 0) + Number(order.total_amount);
    return acc;
  }, {} as Record<string, number>);

  const monthlyChartData = Object.entries(monthlySpend)
    .map(([month, amount]) => ({ month, amount }))
    .slice(-6);

  // Category-wise spending
  const categorySpend: Record<string, number> = {};
  orders.forEach(order => {
    order.order_items?.forEach(item => {
      // Get category from product - using a simplified approach
      const category = 'Products'; // In real app, would join with products table
      categorySpend[category] = (categorySpend[category] || 0) + Number(item.price) * item.quantity;
    });
  });

  // We'll compute actual category data from order items
  const categoryData = orders.reduce((acc, order) => {
    order.order_items?.forEach(item => {
      // Group by product for now since we don't have category in order_items
      const productName = item.products?.name?.split(' ').slice(0, 2).join(' ') || 'Other';
      acc[productName] = (acc[productName] || 0) + Number(item.price) * item.quantity;
    });
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData)
    .map(([name, value]) => ({ name: name.length > 15 ? name.substring(0, 15) + '...' : name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Frequent purchases
  const productPurchases: Record<string, { name: string; count: number }> = {};
  orders.forEach(order => {
    order.order_items?.forEach(item => {
      const key = item.product_id;
      if (!productPurchases[key]) {
        productPurchases[key] = {
          name: item.products?.name?.split(' ').slice(0, 3).join(' ') || 'Unknown',
          count: 0,
        };
      }
      productPurchases[key].count += item.quantity;
    });
  });

  const frequentPurchases = Object.values(productPurchases)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const loading = ordersLoading || profileLoading;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-64 bg-muted rounded-lg" />
            <div className="h-64 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Analytics</h1>
        <p className="text-muted-foreground">Track your spending and purchase history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpend.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">Orders placed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${orders.length > 0 ? (totalSpend / orders.length).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Per order</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(profile?.wallet_balance || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Available to spend</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Spending Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Monthly Spending
            </CardTitle>
            <CardDescription>Your spending trend over time</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Spent']} />
                  <Line type="monotone" dataKey="amount" stroke="#0041C2" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No spending data yet. Start shopping!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieIcon className="w-5 h-5" />
              Spending by Product
            </CardTitle>
            <CardDescription>Where your money goes</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Spent']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No purchases yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Frequent Purchases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Frequent Purchases
          </CardTitle>
          <CardDescription>Products you buy most often</CardDescription>
        </CardHeader>
        <CardContent>
          {frequentPurchases.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={frequentPurchases} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="count" fill="#0041C2" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No purchase history yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerAnalytics;
