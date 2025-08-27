import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart, User } from 'lucide-react';

interface HeaderProps {
  userRole?: 'customer' | 'admin' | null;
  cartCount?: number;
  onNavigate: (page: string) => void;
}

const Header = ({ userRole, cartCount = 0, onNavigate }: HeaderProps) => {
  return (
    <header className="bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => onNavigate('home')}
          >
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-secondary-foreground font-bold text-xl">W</span>
            </div>
            <h1 className="text-2xl font-bold">Walmart</h1>
          </div>

          {/* Search Bar - Only show for customers */}
          {userRole === 'customer' && (
            <div className="flex-1 max-w-2xl mx-8">
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
          <div className="flex items-center space-x-4">
            {userRole === 'customer' ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onNavigate('orders')}
                  className="text-primary-foreground hover:bg-primary-hover"
                >
                  My Orders
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onNavigate('cart')}
                  className="text-primary-foreground hover:bg-primary-hover relative"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </>
            ) : userRole === 'admin' ? (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate('analytics')}
                className="text-primary-foreground hover:bg-primary-hover"
              >
                Analytics
              </Button>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onNavigate('login')}
                  className="text-primary-foreground hover:bg-primary-hover"
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
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate('logout')}
                className="text-primary-foreground hover:bg-primary-hover"
              >
                <User className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;