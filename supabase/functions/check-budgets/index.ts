import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckBudgetRequest {
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId }: CheckBudgetRequest = await req.json();

    // Get user's budgets
    const { data: budgets, error: budgetError } = await supabase
      .from("budgets")
      .select("*, categories(*)")
      .eq("user_id", userId);

    if (budgetError) throw budgetError;

    // Get current month's orders
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString();

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, total_amount, order_items(*, products(category_id))")
      .eq("user_id", userId)
      .gte("created_at", startOfMonth)
      .lte("created_at", endOfMonth);

    if (ordersError) throw ordersError;

    // Calculate spending per category
    const categorySpending: Record<string, number> = {};
    let totalMonthSpent = 0;

    orders?.forEach((order: any) => {
      totalMonthSpent += Number(order.total_amount);
      order.order_items?.forEach((item: any) => {
        const categoryId = item.products?.category_id;
        if (categoryId) {
          categorySpending[categoryId] = (categorySpending[categoryId] || 0) + Number(item.price) * item.quantity;
        }
      });
    });

    // Fetch existing unread budget alerts to prevent duplicates
    const { data: existingNotifications } = await supabase
      .from("notifications")
      .select("id, metadata")
      .eq("user_id", userId)
      .eq("type", "budget_alert")
      .eq("is_read", false);

    const existingBudgetAlerts = new Set(
      existingNotifications?.map((n: any) => n.metadata?.budgetId) || []
    );

    const notifications: any[] = [];

    // Check each budget
    for (const budget of budgets || []) {
      // Skip if there's already an unread alert for this budget
      if (existingBudgetAlerts.has(budget.id)) {
        console.log(`Skipping duplicate alert for budget ${budget.id}`);
        continue;
      }

      const spent = budget.category_id 
        ? categorySpending[budget.category_id] || 0 
        : totalMonthSpent;
      const percentage = Number(budget.monthly_limit) > 0 
        ? (spent / Number(budget.monthly_limit)) * 100 
        : 0;

      const categoryName = budget.categories?.name || "Total";

      if (percentage >= 100) {
        notifications.push({
          user_id: userId,
          title: `🚨 Budget Exceeded: ${categoryName}`,
          message: `You've spent $${spent.toFixed(2)} of your $${Number(budget.monthly_limit).toFixed(2)} ${categoryName} budget (${percentage.toFixed(1)}%).`,
          type: "budget_alert",
          metadata: {
            budgetId: budget.id,
            categoryName,
            spent,
            limit: budget.monthly_limit,
            percentage,
          },
        });
      } else if (percentage >= 80) {
        notifications.push({
          user_id: userId,
          title: `⚠️ Budget Warning: ${categoryName}`,
          message: `You've used ${percentage.toFixed(1)}% of your ${categoryName} budget. $${(Number(budget.monthly_limit) - spent).toFixed(2)} remaining.`,
          type: "budget_alert",
          metadata: {
            budgetId: budget.id,
            categoryName,
            spent,
            limit: budget.monthly_limit,
            percentage,
          },
        });
      }
    }

    // Insert notifications
    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (insertError) {
        console.error("Error inserting notifications:", insertError);
      }
      console.log(`Created ${notifications.length} budget alert(s) for user ${userId}`);
    } else {
      console.log(`No new budget alerts needed for user ${userId}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsCreated: notifications.length,
        totalSpent: totalMonthSpent,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error checking budgets:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
