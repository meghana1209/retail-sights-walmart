import { useState } from 'react';
import { useBudgets, BudgetWithSpending } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useProducts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { Plus, Edit2, Trash2, DollarSign, TrendingUp, PiggyBank, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = ['#0041C2', '#F6BE00', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B'];

export const BudgetingDashboard = () => {
  const { budgets, loading, totalBudget, totalSpent, createBudget, updateBudget, deleteBudget } = useBudgets();
  const { categories } = useCategories();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithSpending | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [budgetAmount, setBudgetAmount] = useState('');

  const handleSubmit = async () => {
    if (!budgetAmount || Number(budgetAmount) <= 0) {
      toast.error('Please enter a valid budget amount');
      return;
    }

    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, Number(budgetAmount));
      } else {
        await createBudget(selectedCategory || null, Number(budgetAmount));
      }
      setIsDialogOpen(false);
      setEditingBudget(null);
      setBudgetAmount('');
      setSelectedCategory('');
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const handleEdit = (budget: BudgetWithSpending) => {
    setEditingBudget(budget);
    setBudgetAmount(budget.monthly_limit.toString());
    setSelectedCategory(budget.category_id || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (budgetId: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      await deleteBudget(budgetId);
    }
  };

  const totalRemaining = Math.max(0, totalBudget - totalSpent);
  const overallPercentage = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;

  // Prepare chart data
  const spentVsRemainingData = [
    { name: 'Spent', value: totalSpent },
    { name: 'Remaining', value: totalRemaining },
  ];

  const categoryBudgetData = budgets.map(b => ({
    name: b.category?.name || 'Total Budget',
    budget: Number(b.monthly_limit),
    spent: b.spent,
  }));

  // Find overspending categories
  const overspendingBudgets = budgets.filter(b => b.percentage >= 80);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Budget Management</h2>
          <p className="text-muted-foreground">Track your spending against your budgets</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingBudget(null); setBudgetAmount(''); setSelectedCategory(''); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBudget ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category (optional)</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={!!editingBudget}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category or leave empty for total budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Total Monthly Budget</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Monthly Budget Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="Enter budget amount"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{editingBudget ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Monthly allocation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{overallPercentage.toFixed(1)}% of budget</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalRemaining.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Available to spend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{overspendingBudgets.length}</div>
            <p className="text-xs text-muted-foreground">Categories nearing limit</p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Budget Usage</CardTitle>
          <CardDescription>Your total spending vs total budget</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>${totalSpent.toFixed(2)} spent</span>
              <span>${totalBudget.toFixed(2)} budget</span>
            </div>
            <Progress 
              value={overallPercentage} 
              className={`h-4 ${overallPercentage >= 100 ? 'bg-destructive/20' : overallPercentage >= 80 ? 'bg-yellow-500/20' : ''}`}
            />
            <p className="text-sm text-muted-foreground text-center">
              {overallPercentage >= 100 
                ? '⚠️ You have exceeded your budget!' 
                : overallPercentage >= 80 
                  ? '⚠️ You are nearing your budget limit' 
                  : '✅ You are within budget'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Spent vs Remaining Donut */}
        <Card>
          <CardHeader>
            <CardTitle>Spent vs Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spentVsRemainingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {spentVsRemainingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#EF4444' : '#10B981'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Budget Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBudgetData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="budget" fill="#0041C2" name="Budget" />
                  <Bar dataKey="spent" fill="#F6BE00" name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Budgets</CardTitle>
          <CardDescription>Manage your monthly spending limits</CardDescription>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PiggyBank className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No budgets set yet. Create one to start tracking!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => (
                <div key={budget.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{budget.category?.name || 'Total Monthly Budget'}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${budget.spent.toFixed(2)} of ${Number(budget.monthly_limit).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(budget)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(budget.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Progress 
                      value={budget.percentage} 
                      className={`h-2 ${budget.percentage >= 100 ? 'bg-destructive/20' : budget.percentage >= 80 ? 'bg-yellow-500/20' : ''}`}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{budget.percentage.toFixed(1)}% used</span>
                      <span>${budget.remaining.toFixed(2)} remaining</span>
                    </div>
                  </div>
                  {budget.percentage >= 80 && (
                    <p className={`text-xs mt-2 ${budget.percentage >= 100 ? 'text-destructive' : 'text-yellow-600'}`}>
                      {budget.percentage >= 100 ? '⚠️ Budget exceeded!' : '⚠️ Approaching limit'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
