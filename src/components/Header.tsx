import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Package, 
  BarChart3,
  LogOut,
  Home,
  Menu
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  userRole?: 'customer' | 'admin' | null;
  cartCount?: number;
  onNavigate: (page: string) => void;
}

const Header = ({ userRole, onNavigate }: HeaderProps) => {
  const { cartCount } = useCart();
  const { user } = useAuth();

  return (
    <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => onNavigate(userRole ? 'dashboard' : 'home')}
          >
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-secondary-foreground font-bold text-xl">W</span>
            </div>
            <h1 className="text-2xl font-bold hidden sm:block">Walmart</h1>
          </div>

          {/* Search Bar - Only show for customers */}
          {userRole === 'customer' && (
            <div className="flex-1 max-w-2xl mx-4 lg:mx-8 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-10 bg-background text-foreground"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {userRole === 'customer' ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onNavigate('dashboard')}
                  className="text-primary-foreground hover:bg-primary/80 hidden sm:flex"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Shop
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onNavigate('orders')}
                  className="text-primary-foreground hover:bg-primary/80 hidden sm:flex"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Orders
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onNavigate('analytics')}
                  className="text-primary-foreground hover:bg-primary/80 hidden sm:flex"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onNavigate('cart')}
                  className="text-primary-foreground hover:bg-primary/80 relative"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs w-5 h-5 flex items-center justify-center p-0">
                      {cartCount > 99 ? '99+' : cartCount}
                    </Badge>
                  )}
                </Button>
                
                {/* Mobile menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="sm:hidden">
                    <Button variant="ghost" size="sm" className="text-primary-foreground">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onNavigate('dashboard')}>
                      <Home className="w-4 h-4 mr-2" />
                      Shop
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate('orders')}>
                      <Package className="w-4 h-4 mr-2" />
                      Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate('analytics')}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onNavigate('logout')}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : userRole === 'admin' ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onNavigate('dashboard')}
                  className="text-primary-foreground hover:bg-primary/80"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onNavigate('login')}
                  className="text-primary-foreground hover:bg-primary/80"
                >
                  Login
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => onNavigate('register')}
                >
                  Sign Up
                </Button>
              </>
            )}
            
            {userRole && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onNavigate('logout')}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
