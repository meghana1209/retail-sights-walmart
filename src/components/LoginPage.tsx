import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, BarChart3, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginPageProps {
  onLogin: (role: 'customer' | 'admin') => void;
  onNavigate: (page: string) => void;
  initialTab?: 'customer' | 'admin';
}

const LoginPage = ({ onLogin, onNavigate, initialTab = 'customer' }: LoginPageProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(initialTab);
  
  const [customerForm, setCustomerForm] = useState({
    email: '',
    password: ''
  });
  
  const [adminForm, setAdminForm] = useState({
    email: '',
    password: ''
  });

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in as customer.",
      });
      onLogin('customer');
    }, 1500);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Admin access granted",
        description: "Successfully logged in to sales dashboard.",
      });
      onLogin('admin');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => onNavigate('home')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-2xl">W</span>
            </div>
            <CardTitle className="text-2xl">Welcome to Walmart</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as 'customer' | 'admin')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customer" className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Customer
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Admin
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="customer" className="space-y-4 mt-6">
                <div className="text-center mb-4">
                  <Badge variant="secondary" className="mb-2">
                    Customer Portal
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Access your shopping account, cart, and order history
                  </p>
                </div>
                
                <form onSubmit={handleCustomerLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-email">Email</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      placeholder="customer@example.com"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-password">Password</Label>
                    <Input
                      id="customer-password"
                      type="password"
                      placeholder="Enter your password"
                      value={customerForm.password}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In as Customer'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="admin" className="space-y-4 mt-6">
                <div className="text-center mb-4">
                  <Badge variant="outline" className="mb-2">
                    Admin Portal
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Access sales analytics and business intelligence tools
                  </p>
                </div>
                
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@walmart.com"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Admin Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Enter admin password"
                      value={adminForm.password}
                      onChange={(e) => setAdminForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" variant="secondary" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Verifying...' : 'Access Admin Dashboard'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button
                  onClick={() => onNavigate('register')}
                  className="text-primary hover:underline font-medium"
                >
                  Create one here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;