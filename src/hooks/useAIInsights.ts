import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface AIInsight {
  id: string;
  user_id: string;
  insight_type: 'prediction' | 'recommendation' | 'anomaly' | 'segment' | 'savings';
  title: string;
  description: string;
  confidence_score: number;
  data: Record<string, any>;
  is_dismissed: boolean;
  created_at: string;
  expires_at: string;
}

export interface SpendingPrediction {
  nextMonthPredicted: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  explanation: string;
}

export interface BudgetRecommendation {
  categoryId: string;
  categoryName: string;
  recommendedBudget: number;
  currentSpending: number;
  explanation: string;
}

export interface SpendingAnomaly {
  categoryName: string;
  amount: number;
  averageAmount: number;
  percentageIncrease: number;
  explanation: string;
}

export const useAIInsights = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState<SpendingPrediction | null>(null);
  const [recommendations, setRecommendations] = useState<BudgetRecommendation[]>([]);
  const [anomalies, setAnomalies] = useState<SpendingAnomaly[]>([]);

  const fetchInsights = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedInsights = (data || []) as AIInsight[];
      setInsights(typedInsights);

      // Extract specific insights
      const predictionInsight = typedInsights.find(i => i.insight_type === 'prediction');
      if (predictionInsight) {
        setPrediction(predictionInsight.data as SpendingPrediction);
      }

      const recommendationInsights = typedInsights.filter(i => i.insight_type === 'recommendation');
      setRecommendations(recommendationInsights.map(i => i.data as BudgetRecommendation));

      const anomalyInsights = typedInsights.filter(i => i.insight_type === 'anomaly');
      setAnomalies(anomalyInsights.map(i => i.data as SpendingAnomaly));
    } catch (error: any) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch historical order data for analysis
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, order_items(*, products(category_id, categories(*)))')
        .eq('user_id', user.id)
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true });

      if (ordersError) throw ordersError;

      // Calculate monthly spending
      const monthlySpending: Record<string, number> = {};
      const categorySpending: Record<string, { total: number; count: number; name: string }> = {};

      ordersData?.forEach((order: any) => {
        const month = new Date(order.created_at).toISOString().slice(0, 7);
        monthlySpending[month] = (monthlySpending[month] || 0) + Number(order.total_amount);

        order.order_items?.forEach((item: any) => {
          const categoryId = item.products?.category_id;
          const categoryName = item.products?.categories?.name || 'Other';
          if (categoryId) {
            if (!categorySpending[categoryId]) {
              categorySpending[categoryId] = { total: 0, count: 0, name: categoryName };
            }
            categorySpending[categoryId].total += Number(item.price) * item.quantity;
            categorySpending[categoryId].count++;
          }
        });
      });

      // Generate spending prediction using simple moving average
      const months = Object.keys(monthlySpending).sort();
      const values = months.map(m => monthlySpending[m]);
      
      let predictedSpending = 0;
      let trend: 'up' | 'down' | 'stable' = 'stable';
      
      if (values.length >= 3) {
        // Use last 3 months weighted average
        const recentValues = values.slice(-3);
        predictedSpending = (recentValues[0] * 0.2 + recentValues[1] * 0.3 + recentValues[2] * 0.5);
        
        const avgOld = values.slice(0, Math.floor(values.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(values.length / 2);
        const avgNew = values.slice(Math.floor(values.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(values.length / 2);
        
        if (avgNew > avgOld * 1.1) trend = 'up';
        else if (avgNew < avgOld * 0.9) trend = 'down';
      } else if (values.length > 0) {
        predictedSpending = values[values.length - 1];
      }

      // Save prediction insight
      const predictionData: SpendingPrediction = {
        nextMonthPredicted: Math.round(predictedSpending * 100) / 100,
        trend,
        confidence: Math.min(0.95, 0.5 + values.length * 0.08),
        explanation: `Based on your ${values.length} month spending history, we predict your spending will ${trend === 'up' ? 'increase' : trend === 'down' ? 'decrease' : 'remain stable'}.`,
      };

      await supabase.from('ai_insights').insert([{
        user_id: user.id,
        insight_type: 'prediction',
        title: 'Next Month Spending Prediction',
        description: predictionData.explanation,
        confidence_score: predictionData.confidence,
        data: JSON.parse(JSON.stringify(predictionData)) as Json,
      }]);

      // Generate budget recommendations
      const avgMonthlySpend = values.length > 0 
        ? values.reduce((a, b) => a + b, 0) / values.length 
        : 0;

      for (const [categoryId, data] of Object.entries(categorySpending)) {
        const avgCategorySpend = data.total / Math.max(1, values.length);
        const recommendedBudget = Math.round(avgCategorySpend * 1.1 * 100) / 100; // 10% buffer

        const recommendationData: BudgetRecommendation = {
          categoryId,
          categoryName: data.name,
          recommendedBudget,
          currentSpending: Math.round(avgCategorySpend * 100) / 100,
          explanation: `Based on your average ${data.name} spending of $${avgCategorySpend.toFixed(2)}, we recommend a budget of $${recommendedBudget.toFixed(2)} with a 10% buffer.`,
        };

        await supabase.from('ai_insights').insert([{
          user_id: user.id,
          insight_type: 'recommendation',
          title: `${data.name} Budget Recommendation`,
          description: recommendationData.explanation,
          confidence_score: 0.85,
          data: JSON.parse(JSON.stringify(recommendationData)) as Json,
        }]);
      }

      // Detect anomalies (spending 50%+ above average)
      const currentMonth = new Date().toISOString().slice(0, 7);
      const currentMonthSpending = monthlySpending[currentMonth] || 0;
      
      if (avgMonthlySpend > 0 && currentMonthSpending > avgMonthlySpend * 1.5) {
        const percentageIncrease = ((currentMonthSpending - avgMonthlySpend) / avgMonthlySpend) * 100;
        
        const anomalyData: SpendingAnomaly = {
          categoryName: 'Total Spending',
          amount: currentMonthSpending,
          averageAmount: avgMonthlySpend,
          percentageIncrease: Math.round(percentageIncrease),
          explanation: `Your current month spending is ${Math.round(percentageIncrease)}% higher than your average. Consider reviewing recent purchases.`,
        };

        await supabase.from('ai_insights').insert([{
          user_id: user.id,
          insight_type: 'anomaly',
          title: 'Unusual Spending Detected',
          description: anomalyData.explanation,
          confidence_score: 0.9,
          data: JSON.parse(JSON.stringify(anomalyData)) as Json,
        }]);
      }

      toast.success('AI insights generated successfully');
      fetchInsights();
    } catch (error: any) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  const dismissInsight = async (insightId: string) => {
    const { error } = await supabase
      .from('ai_insights')
      .update({ is_dismissed: true })
      .eq('id', insightId);

    if (!error) {
      setInsights(prev => prev.filter(i => i.id !== insightId));
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [user]);

  return {
    insights,
    prediction,
    recommendations,
    anomalies,
    loading,
    generateInsights,
    dismissInsight,
    refetch: fetchInsights,
  };
};
