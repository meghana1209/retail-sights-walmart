import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Budget {
  id: string;
  user_id: string;
  category_id: string | null;
  monthly_limit: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
  } | null;
}

export interface BudgetWithSpending extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
}

export const useBudgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<BudgetWithSpending[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  const fetchBudgets = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch budgets with category info
      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .select('*, categories(*)')
        .eq('user_id', user.id);

      if (budgetError) throw budgetError;

      // Fetch user's orders for current month to calculate spending
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString();

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_amount, order_items(*, products(category_id))')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth);

      if (ordersError) throw ordersError;

      // Calculate spending per category
      const categorySpending: Record<string, number> = {};
      let totalMonthSpent = 0;

      ordersData?.forEach(order => {
        totalMonthSpent += Number(order.total_amount);
        order.order_items?.forEach((item: any) => {
          const categoryId = item.products?.category_id;
          if (categoryId) {
            categorySpending[categoryId] = (categorySpending[categoryId] || 0) + Number(item.price) * item.quantity;
          }
        });
      });

      // Map budgets with spending data
      const budgetsWithSpending: BudgetWithSpending[] = (budgetData || []).map((budget: any) => {
        const spent = budget.category_id 
          ? categorySpending[budget.category_id] || 0 
          : totalMonthSpent;
        const remaining = Math.max(0, Number(budget.monthly_limit) - spent);
        const percentage = Number(budget.monthly_limit) > 0 
          ? Math.min(100, (spent / Number(budget.monthly_limit)) * 100) 
          : 0;

        return {
          ...budget,
          category: budget.categories,
          spent,
          remaining,
          percentage,
        };
      });

      setBudgets(budgetsWithSpending);
      setTotalBudget(budgetsWithSpending.reduce((sum, b) => sum + Number(b.monthly_limit), 0));
      setTotalSpent(totalMonthSpent);
    } catch (error: any) {
      console.error('Error fetching budgets:', error);
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();

    if (!user) return;

    // Real-time subscription
    const channel = supabase
      .channel('budgets-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'budgets', filter: `user_id=eq.${user.id}` },
        () => fetchBudgets()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const createBudget = async (categoryId: string | null, monthlyLimit: number) => {
    if (!user) return;

    const currentMonth = new Date();
    const periodStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0];
    const periodEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0];

    const { error } = await supabase
      .from('budgets')
      .insert({
        user_id: user.id,
        category_id: categoryId,
        monthly_limit: monthlyLimit,
        period_start: periodStart,
        period_end: periodEnd,
      });

    if (error) {
      toast.error('Failed to create budget');
      throw error;
    }

    toast.success('Budget created successfully');
    
    // Check budgets and generate alerts if needed
    try {
      await supabase.functions.invoke('check-budgets', {
        body: { userId: user.id }
      });
    } catch (error) {
      console.error('Error checking budgets:', error);
    }
    
    fetchBudgets();
  };

  const updateBudget = async (budgetId: string, monthlyLimit: number) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('budgets')
      .update({ monthly_limit: monthlyLimit, updated_at: new Date().toISOString() })
      .eq('id', budgetId);

    if (error) {
      toast.error('Failed to update budget');
      throw error;
    }

    toast.success('Budget updated successfully');
    
    // Check budgets and generate alerts if needed
    try {
      await supabase.functions.invoke('check-budgets', {
        body: { userId: user.id }
      });
    } catch (error) {
      console.error('Error checking budgets:', error);
    }
    
    fetchBudgets();
  };

  const deleteBudget = async (budgetId: string) => {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId);

    if (error) {
      toast.error('Failed to delete budget');
      throw error;
    }

    toast.success('Budget deleted successfully');
    fetchBudgets();
  };

  return {
    budgets,
    loading,
    totalBudget,
    totalSpent,
    createBudget,
    updateBudget,
    deleteBudget,
    refetch: fetchBudgets,
  };
};
