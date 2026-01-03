import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type NotifyRequest = Tables<'notify_requests'>;
type Product = Tables<'products'>;

export interface NotifyRequestWithProduct extends NotifyRequest {
  products: Product;
}

export const useNotifyRequests = () => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<NotifyRequestWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!user) {
      setRequests([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('notify_requests')
        .select('*, products(*)');

      if (userRole !== 'admin') {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data as NotifyRequestWithProduct[]) || []);
    } catch (err: any) {
      console.error('Error fetching notify requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    if (!user) return;

    const channel = supabase
      .channel('notify-requests-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notify_requests' },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userRole]);

  const createNotifyRequest = async (productId: string) => {
    if (!user) {
      toast({
        title: 'Please login',
        description: 'You need to be logged in to receive notifications',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Check if already requested
      const existing = requests.find(
        r => r.product_id === productId && !r.notified
      );

      if (existing) {
        toast({
          title: 'Already requested',
          description: 'You will be notified when this item is back in stock',
        });
        return false;
      }

      const { error } = await supabase
        .from('notify_requests')
        .insert({
          product_id: productId,
          user_id: user.id,
          email: user.email || '',
        });

      if (error) throw error;

      toast({
        title: 'Notification set!',
        description: 'You will be notified when this item is back in stock',
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

  // Get demand count per product (for admin)
  const getDemandCount = (productId: string) => {
    return requests.filter(r => r.product_id === productId && !r.notified).length;
  };

  return {
    requests,
    loading,
    createNotifyRequest,
    getDemandCount,
    refetch: fetchRequests,
  };
};
