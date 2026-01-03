import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useProfile } from '@/hooks/useProfile';
import { useOrders } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';

interface CartPageProps {
  onNavigate: (page: string) => void;
}

const CartPage = ({ onNavigate }: CartPageProps) => {
  const { cartItems, loading, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { profile, updateWalletBalance } = useProfile();
  const { createOrder } = useOrders();
  const { toast } = useToast();
  const [checkingOut, setCheckingOut] = React.useState(false);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Add some items to your cart first',
        variant: 'destructive',
      });
      return;
    }

    const walletBalance = profile?.wallet_balance || 0;
    
    if (walletBalance < cartTotal) {
      toast({
        title: 'Insufficient wallet balance',
        description: `Your wallet balance is $${walletBalance.toFixed(2)}. You need $${cartTotal.toFixed(2)} to complete this order.`,
        variant: 'destructive',
      });
      return;
    }

    setCheckingOut(true);

    try {
      // Deduct from wallet
      const success = await updateWalletBalance(-cartTotal);
      
      if (!success) {
        setCheckingOut(false);
        return;
      }

      // Create order
      const orderItems = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products?.price || 0,
      }));

      const order = await createOrder(orderItems, cartTotal);

      if (order) {
        // Clear cart
        await clearCart();
        
        toast({
          title: 'Order placed successfully!',
          description: `Your order #${order.id.slice(0, 8)} has been placed.`,
        });
        
        onNavigate('orders');
      }
    } catch (error) {
      toast({
        title: 'Checkout failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-24 h-24 mx-auto text-muted-foreground mb-6" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">
          Add some items to your cart to get started
        </p>
        <Button onClick={() => onNavigate('dashboard')}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={item.products?.image_url}
                    alt={item.products?.name}
                    className="w-24 h-24 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400';
                    }}
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold line-clamp-2">{item.products?.name}</h3>
                    <p className="text-primary font-bold text-lg mt-1">
                      ${item.products?.price?.toFixed(2)}
                    </p>
                    
                    {item.products?.stock && item.products.stock < 10 && (
                      <Badge variant="secondary" className="mt-1">
                        Only {item.products.stock} left
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= (item.products?.stock || 0)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.reduce((t, i) => t + i.quantity, 0)} items)</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-success">FREE</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              
              <Separator />
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Wallet Balance</span>
                  <span className="font-bold text-primary">
                    ${(profile?.wallet_balance || 0).toFixed(2)}
                  </span>
                </div>
                {(profile?.wallet_balance || 0) < cartTotal && (
                  <p className="text-destructive text-sm mt-2">
                    Insufficient balance. Need ${(cartTotal - (profile?.wallet_balance || 0)).toFixed(2)} more.
                  </p>
                )}
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleCheckout}
                disabled={checkingOut || (profile?.wallet_balance || 0) < cartTotal}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {checkingOut ? 'Processing...' : 'Pay with Wallet'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
