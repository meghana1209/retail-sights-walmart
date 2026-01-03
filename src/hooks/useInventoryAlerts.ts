import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/integrations/supabase/types';

type InventoryAlert = Tables<'inventory_alerts'>;
type Product = Tables<'products'>;

export interface InventoryAlertWithProduct extends InventoryAlert {
  products: Product;
}

export const useInventoryAlerts = () => {
  const { user, userRole } = useAuth();
  const [alerts, setAlerts] = useState<InventoryAlertWithProduct[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    if (!user || userRole !== 'admin') {
      setAlerts([]);
      setLowStockProducts([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch inventory alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('inventory_alerts')
        .select('*, products(*)')
        .order('created_at', { ascending: false });

      if (alertsError) throw alertsError;
      setAlerts((alertsData as InventoryAlertWithProduct[]) || []);

      // Fetch low stock products (stock <= threshold)
      const { data: lowStock, error: lowStockError } = await supabase
        .from('products')
        .select('*')
        .lte('stock', 10) // Using default threshold of 10
        .order('stock', { ascending: true });

      if (lowStockError) throw lowStockError;
      setLowStockProducts(lowStock || []);
    } catch (err: any) {
      console.error('Error fetching inventory alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    if (!user || userRole !== 'admin') return;

    // Real-time subscription
    const channel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchAlerts();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_alerts' },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userRole]);

  const createAlert = async (productId: string, currentStock: number, threshold: number) => {
    try {
      const { error } = await supabase
        .from('inventory_alerts')
        .insert({
          product_id: productId,
          current_stock: currentStock,
          threshold: threshold,
        });

      if (error) throw error;
    } catch (err: any) {
      console.error('Error creating alert:', err);
    }
  };

  const markAlertSent = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('inventory_alerts')
        .update({ alert_sent: true })
        .eq('id', alertId);

      if (error) throw error;
    } catch (err: any) {
      console.error('Error marking alert sent:', err);
    }
  };

  return {
    alerts,
    lowStockProducts,
    loading,
    createAlert,
    markAlertSent,
    refetch: fetchAlerts,
  };
};
