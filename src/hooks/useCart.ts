import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type CartItem = Tables<'cart_items'>;
type Product = Tables<'products'>;

export interface CartItemWithProduct extends CartItem {
  products: Product;
}

export const useCart = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, products(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems((data as CartItemWithProduct[]) || []);
    } catch (err: any) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();

    if (!user) return;

    // Real-time updates
    const channel = supabase
      .channel('cart-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cart_items', filter: `user_id=eq.${user.id}` },
        () => {
          fetchCart();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast({
        title: 'Please login',
        description: 'You need to be logged in to add items to cart',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Check if item already exists
      const existingItem = cartItems.find(item => item.product_id === productId);

      if (existingItem) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({ product_id: productId, user_id: user.id, quantity });

        if (error) throw error;
      }

      toast({
        title: 'Added to cart',
        description: 'Item has been added to your cart',
      });
      return true;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      return removeFromCart(itemId);
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      toast({
        title: 'Removed from cart',
        description: 'Item has been removed from your cart',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err: any) {
      console.error('Error clearing cart:', err);
    }
  };

  const cartTotal = cartItems.reduce((total, item) => {
    return total + (item.products?.price || 0) * item.quantity;
  }, 0);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
    refetch: fetchCart,
  };
};
