import { useAIInsights } from '@/hooks/useAIInsights';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, Lightbulb, PiggyBank, Sparkles, RefreshCw, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const AIInsightsDashboard = () => {
  const { 
    insights, 
    prediction, 
    recommendations, 
    anomalies, 
    loading, 
    generateInsights, 
    dismissInsight 
  } = useAIInsights();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-5 w-5 text-green-500" />;
      default:
        return <Minus className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Spending Insights
          </h2>
          <p className="text-muted-foreground">
            Explainable AI predictions and recommendations based on your spending patterns
          </p>
        </div>
        <Button onClick={generateInsights} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Generate New Insights
        </Button>
      </div>

      {/* Spending Prediction Card */}
      {prediction && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Next Month Spending Prediction
              </CardTitle>
              <Badge variant="secondary" className="flex items-center gap-1">
                {(prediction.confidence * 100).toFixed(0)}% confidence
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="text-4xl font-bold text-primary">
                ${prediction.nextMonthPredicted.toFixed(2)}
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon(prediction.trend)}
                <span className="text-sm">
                  {prediction.trend === 'up' ? 'Trending higher' : 
                   prediction.trend === 'down' ? 'Trending lower' : 'Stable'}
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <strong>Why this prediction?</strong> {prediction.explanation}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Anomalies Alert */}
      {anomalies.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Unusual Spending Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {anomalies.map((anomaly, index) => (
                <div key={index} className="bg-background rounded-lg p-4 border">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{anomaly.categoryName}</h4>
                    <Badge variant="destructive">+{anomaly.percentageIncrease}%</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Current</p>
                      <p className="font-semibold text-destructive">${anomaly.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Average</p>
                      <p className="font-semibold">${anomaly.averageAmount.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Explanation:</strong> {anomaly.explanation}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Smart Budget Recommendations
            </CardTitle>
            <CardDescription>
              AI-generated budget suggestions based on your historical spending patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold">{rec.categoryName}</h4>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Recommended
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Avg:</span>
                      <span className="font-medium">${rec.currentSpending.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Suggested Budget:</span>
                      <span className="font-bold text-primary">${rec.recommendedBudget.toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    {rec.explanation}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Insights List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            All AI Insights
          </CardTitle>
          <CardDescription>
            Review and manage all generated insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No insights yet</h3>
              <p className="text-muted-foreground mb-4">
                Click "Generate New Insights" to analyze your spending patterns
              </p>
              <Button onClick={generateInsights} disabled={loading}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Insights
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((insight) => (
                <div 
                  key={insight.id} 
                  className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="capitalize">
                          {insight.insight_type}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <div className={`h-2 w-2 rounded-full ${getConfidenceColor(insight.confidence_score)}`} />
                          <span className="text-xs text-muted-foreground">
                            {(insight.confidence_score * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                      </div>
                      <h4 className="font-semibold">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => dismissInsight(insight.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle>How Our AI Works</CardTitle>
          <CardDescription>Transparent and explainable artificial intelligence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-background rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Spending Prediction
              </h4>
              <p className="text-sm text-muted-foreground">
                Uses weighted moving average on your last 3-6 months of spending data.
                More recent months have higher weights for better accuracy.
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Budget Recommendations
              </h4>
              <p className="text-sm text-muted-foreground">
                Analyzes your average category spending and adds a 10% buffer.
                Based on historical patterns, not arbitrary limits.
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Anomaly Detection
              </h4>
              <p className="text-sm text-muted-foreground">
                Flags spending that's 50%+ above your historical average.
                Uses simple statistical thresholds for transparency.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
