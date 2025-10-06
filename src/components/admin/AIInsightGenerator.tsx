import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Brain,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Zap,
  Activity,
  RefreshCw,
  Target,
  BarChart3,
  CheckCircle,
  Clock,
  Lightbulb
} from 'lucide-react';
import { useBusinessAIInsights, type BusinessMetrics, type AIInsight } from '@/hooks/useBusinessAIInsights';
import { toast } from 'sonner';

interface AIInsightGeneratorProps {
  onInsightsGenerated?: (insights: AIInsight[]) => void;
  businessMetrics?: Partial<BusinessMetrics>;
}

const AIInsightGenerator: React.FC<AIInsightGeneratorProps> = ({
  onInsightsGenerated,
  businessMetrics
}) => {
  const {
    insights,
    recommendations,
    isGenerating,
    generateInsights,
    generateRecommendations,
    analyzeCompetitivePosition
  } = useBusinessAIInsights();

  const [selectedAnalysisType, setSelectedAnalysisType] = useState<string>('market_analysis');
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Default business metrics for SportDataAnalytics Algeria
  const defaultMetrics: BusinessMetrics = {
    monthlyRevenue: 75000, // DZD
    burnRate: 120000, // DZD/month
    customerCount: 6,
    churnRate: 15, // %
    marketPenetration: 22, // %
    competitorPrice: 300000, // EUR/year average
    complianceStatus: 'compliant'
  };

  const metrics = { ...defaultMetrics, ...businessMetrics };

  const analysisTypes = [
    { value: 'market_analysis', label: 'Analyse Marché', icon: BarChart3 },
    { value: 'financial_optimization', label: 'Optimisation Financière', icon: TrendingUp },
    { value: 'operational_efficiency', label: 'Efficacité Opérationnelle', icon: Zap },
    { value: 'strategic_planning', label: 'Planification Stratégique', icon: Target }
  ];

  const handleGenerateInsights = async () => {
    try {
      setAnalysisProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 15;
        });
      }, 300);

      const newInsights = await generateInsights(
        metrics,
        selectedAnalysisType as any
      );

      setAnalysisProgress(100);
      setTimeout(() => setAnalysisProgress(0), 2000);

      if (onInsightsGenerated) {
        onInsightsGenerated(newInsights);
      }

      // Auto-generate recommendations based on insights
      if (newInsights.length > 0) {
        await generateRecommendations(newInsights);
      }

    } catch (error) {
      console.error('Error in insight generation:', error);
      toast.error('Erreur lors de la génération des insights');
      setAnalysisProgress(0);
    }
  };

  const handleCompetitiveAnalysis = async () => {
    const competitors = [
      { name: 'Wyscout', price: 300000, features: ['Video Analysis', 'Statistics', 'Scouting'] },
      { name: 'Hudl', price: 250000, features: ['Video Analysis', 'Team Management'] },
      { name: 'InStat', price: 400000, features: ['Live Data', 'Analytics', 'Scouting'] }
    ];

    const analysis = await analyzeCompetitivePosition(competitors);
    toast.success(`Analyse concurrentielle: Score ${analysis.positioningScore}/100`);
  };

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'risk': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'optimization': return <Zap className="h-4 w-4 text-blue-600" />;
      case 'trend': return <Activity className="h-4 w-4 text-purple-600" />;
      default: return <Lightbulb className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'bg-red-500';
      case 'short-term': return 'bg-yellow-500';
      case 'long-term': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Générateur d'Insights IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type d'Analyse</label>
              <Select value={selectedAnalysisType} onValueChange={setSelectedAnalysisType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {analysisTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleGenerateInsights}
                disabled={isGenerating}
                className="w-full gap-2"
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Générer Insights IA
              </Button>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleCompetitiveAnalysis}
                variant="outline"
                className="w-full gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Analyse Concurrentielle
              </Button>
            </div>
          </div>

          {analysisProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Analyse en cours...</span>
                <span>{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Business Metrics Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Métriques Business Actuelles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">MRR</div>
              <div className="font-semibold">{metrics.monthlyRevenue.toLocaleString()} DZD</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Burn Rate</div>
              <div className="font-semibold text-red-600">{metrics.burnRate.toLocaleString()} DZD</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Clients</div>
              <div className="font-semibold">{metrics.customerCount}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Pénétration</div>
              <div className="font-semibold">{metrics.marketPenetration}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Insights Générés</span>
              <Badge variant="outline">{insights.length} insights</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.slice(0, 3).map(insight => (
              <Alert key={insight.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getInsightTypeIcon(insight.type)}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <div className="flex gap-2">
                        <Badge variant={getImpactColor(insight.impact)}>
                          {insight.impact}
                        </Badge>
                        <Badge variant="outline">{insight.confidence}%</Badge>
                        <div className={`w-3 h-3 rounded-full ${getUrgencyColor(insight.urgency)}`}></div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>

                    <div className="space-y-2">
                      <div className="text-xs font-medium">Actions Recommandées:</div>
                      <ul className="space-y-1">
                        {insight.actionItems.map((action, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs">
                            <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Strategic Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Recommandations Stratégiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{rec.title}</h4>
                    <Badge variant="secondary" className="mt-1">{rec.category}</Badge>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={getImpactColor(rec.priority)}>
                      {rec.priority}
                    </Badge>
                    {rec.estimatedROI && (
                      <div className="text-xs text-green-600 font-medium">
                        ROI: {rec.estimatedROI}%
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {rec.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="font-medium mb-1">Impact Attendu:</div>
                    <div className="text-muted-foreground">{rec.expectedImpact}</div>
                  </div>
                  {rec.timeToImplement && (
                    <div>
                      <div className="font-medium mb-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Délai d'Implémentation:
                      </div>
                      <div className="text-muted-foreground">{rec.timeToImplement}</div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-medium">Plan d'Implémentation:</div>
                  <ul className="space-y-1">
                    {rec.implementation.map((step, stepIdx) => (
                      <li key={stepIdx} className="flex items-center gap-2 text-xs">
                        <CheckCircle className="h-3 w-3 text-blue-500 flex-shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIInsightGenerator;