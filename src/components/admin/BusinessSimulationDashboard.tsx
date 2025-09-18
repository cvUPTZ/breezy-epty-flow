import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain,
  TrendingUp, 
  Target, 
  DollarSign, 
  Users, 
  Building2,
  Lightbulb,
  BarChart3,
  PieChart,
  Globe,
  Calendar,
  Activity,
  Zap,
  CheckCircle,
  AlertTriangle,
  Plus,
  Sparkles,
  BookOpen,
  Briefcase,
  LineChart,
  Radar,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import BusinessPlanManagement from './BusinessPlanManagement';
import BusinessModelCanvasDocument from '../documents/BusinessModelCanvasDocument';
import MarketStudyDocument from '../documents/MarketStudyDocument';
import AIInsightGenerator from './AIInsightGenerator';

// === AI INSIGHTS & RECOMMENDATIONS ===
interface AIInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'optimization' | 'trend';
  category: 'market' | 'finance' | 'operations' | 'strategy';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  urgency: 'immediate' | 'short-term' | 'long-term';
  actionItems: string[];
  confidence: number; // 0-100
  createdAt: string;
}

interface BusinessKPI {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  category: 'financial' | 'operational' | 'market' | 'strategic';
}

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  variables: Record<string, number>;
  outcomes: {
    revenue: number;
    costs: number;
    profit: number;
    marketShare: number;
    riskScore: number;
  };
  probability: number;
}

interface EventTracker {
  id: string;
  name: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
  progress: number;
  deadline: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  assignee?: string;
}

const BusinessSimulationDashboard: React.FC = () => {
  // === STATE MANAGEMENT ===
  const [activeSimulation, setActiveSimulation] = useState<string>('overview');
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [businessKPIs, setBusinessKPIs] = useState<BusinessKPI[]>([]);
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [eventTrackers, setEventTrackers] = useState<EventTracker[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // === MOCK DATA INITIALIZATION ===
  useEffect(() => {
    // Initialize with realistic business data
    setAiInsights([
      {
        id: '1',
        type: 'opportunity',
        category: 'market',
        title: 'Partnership FAF - Opportunité Stratégique',
        description: 'L\'endorsement officiel de la FAF pourrait augmenter votre crédibilité de 70% et accélérer l\'adoption par les académies.',
        impact: 'high',
        urgency: 'immediate',
        actionItems: [
          'Préparer dossier de présentation FAF',
          'Planifier rencontre avec responsables techniques',
          'Démontrer conformité Loi 18-07'
        ],
        confidence: 85,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        type: 'risk',
        category: 'finance',
        title: 'Burn Rate vs Runway - Attention Requise',
        description: 'Avec le burn rate actuel de 120k DZD/mois, le runway est de 15 mois. Considérer optimisation des coûts ou levée supplémentaire.',
        impact: 'medium',
        urgency: 'short-term',
        actionItems: [
          'Analyser structure des coûts',
          'Négocier tarifs fournisseurs',
          'Explorer financement pont'
        ],
        confidence: 78,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        type: 'optimization',
        category: 'operations',
        title: 'Support Bilingue - Avantage Concurrentiel',
        description: 'Le support en arabe/français est un différenciateur clé. 89% des clubs préfèrent un support local.',
        impact: 'high',
        urgency: 'short-term',
        actionItems: [
          'Former équipe support technique',
          'Créer documentation bilingue',
          'Mesurer satisfaction client'
        ],
        confidence: 92,
        createdAt: new Date().toISOString()
      }
    ]);

    setBusinessKPIs([
      { id: '1', name: 'MRR (Monthly Recurring Revenue)', current: 45000, target: 80000, unit: 'DZD', trend: 'up', category: 'financial' },
      { id: '2', name: 'Customer Acquisition Cost', current: 25000, target: 20000, unit: 'DZD', trend: 'down', category: 'financial' },
      { id: '3', name: 'Churn Rate', current: 15, target: 10, unit: '%', trend: 'stable', category: 'operational' },
      { id: '4', name: 'Market Penetration', current: 18, target: 35, unit: '%', trend: 'up', category: 'market' },
      { id: '5', name: 'Client Satisfaction Score', current: 4.2, target: 4.5, unit: '/5', trend: 'up', category: 'operational' }
    ]);

    setScenarios([
      {
        id: '1',
        name: 'Scénario Optimiste',
        description: 'Partnership FAF + adoption rapide Ligue 1',
        variables: { clients: 12, prix_moyen: 125000, coûts: 1200000 },
        outcomes: { revenue: 1500000, costs: 1200000, profit: 300000, marketShare: 45, riskScore: 25 },
        probability: 30
      },
      {
        id: '2',
        name: 'Scénario Réaliste',
        description: 'Croissance progressive selon plan',
        variables: { clients: 8, prix_moyen: 110000, coûts: 1100000 },
        outcomes: { revenue: 880000, costs: 1100000, profit: -220000, marketShare: 28, riskScore: 40 },
        probability: 55
      },
      {
        id: '3',
        name: 'Scénario Pessimiste',
        description: 'Résistance au changement + concurrence',
        variables: { clients: 4, prix_moyen: 95000, coûts: 950000 },
        outcomes: { revenue: 380000, costs: 950000, profit: -570000, marketShare: 15, riskScore: 70 },
        probability: 15
      }
    ]);

    setEventTrackers([
      {
        id: '1',
        name: 'Développement MVP',
        description: 'Version minimale viable avec features core',
        status: 'in-progress',
        progress: 75,
        deadline: '2025-03-15',
        impact: 'critical',
        category: 'Produit',
        assignee: 'Équipe Tech'
      },
      {
        id: '2',
        name: 'Certification Loi 18-07',
        description: 'Audit conformité et certification officielle',
        status: 'planned',
        progress: 25,
        deadline: '2025-04-30',
        impact: 'critical',
        category: 'Conformité',
        assignee: 'Conseiller Juridique'
      },
      {
        id: '3',
        name: 'Pilot Client - CR Belouizdad',
        description: 'Test en conditions réelles avec club référence',
        status: 'in-progress',
        progress: 40,
        deadline: '2025-05-15',
        impact: 'high',
        category: 'Commercial',
        assignee: 'CEO'
      }
    ]);
  }, []);

  // === AI INSIGHTS GENERATION ===
  const generateAIInsights = async () => {
    setIsGeneratingInsights(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newInsights: AIInsight[] = [
      {
        id: Date.now().toString(),
        type: 'trend',
        category: 'market',
        title: 'IA dans le Football - Tendance Émergente',
        description: 'L\'adoption de l\'IA dans l\'analyse football augmente de 340% en Afrique du Nord. Opportunité de positioning comme pioneer.',
        impact: 'high',
        urgency: 'short-term',
        actionItems: [
          'Intégrer features IA prédictive',
          'Communiquer sur innovation technologique',
          'Former clients aux nouveaux outils'
        ],
        confidence: 87,
        createdAt: new Date().toISOString()
      }
    ];
    
    setAiInsights(prev => [newInsights[0], ...prev]);
    setIsGeneratingInsights(false);
    toast.success('Nouvelles insights IA générées!');
  };

  // === UTILITY FUNCTIONS ===
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'delayed': return 'bg-red-500';
      case 'planned': return 'bg-yellow-500';
      default: return 'bg-gray-500';
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

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-4 w-4" />;
      case 'risk': return <AlertTriangle className="h-4 w-4" />;
      case 'optimization': return <Zap className="h-4 w-4" />;
      case 'trend': return <Activity className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  // === RENDER ===
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            Simulation Business Intelligence
          </h1>
          <p className="text-muted-foreground mt-2">
            Plateforme IA pour simulation, analyse et optimisation business stratégique
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generateAIInsights} disabled={isGeneratingInsights} className="gap-2">
            {isGeneratingInsights ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Générer Insights IA
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard IA</TabsTrigger>
          <TabsTrigger value="scenarios">Scénarios</TabsTrigger>
          <TabsTrigger value="kpis">KPIs & Métriques</TabsTrigger>
          <TabsTrigger value="trackers">Event Trackers</TabsTrigger>
          <TabsTrigger value="business-plan">Business Plan</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* === DASHBOARD IA === */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* AI Insight Generator */}
          <AIInsightGenerator
            businessMetrics={{
              monthlyRevenue: 75000,
              burnRate: 120000,
              customerCount: 6,
              churnRate: 15,
              marketPenetration: 22,
              competitorPrice: 300000,
              complianceStatus: 'compliant'
            }}
            onInsightsGenerated={(insights) => {
              setAiInsights(prev => [...insights, ...prev]);
            }}
          />

          {/* AI Insights Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Insights IA Stratégiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiInsights.map(insight => (
                  <Alert key={insight.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {getInsightTypeIcon(insight.type)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-foreground">{insight.title}</h4>
                          <div className="flex gap-2">
                            <Badge variant={getImpactColor(insight.impact)}>{insight.impact}</Badge>
                            <Badge variant="outline">{insight.confidence}%</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                        <div className="space-y-1">
                          <p className="text-xs font-medium">Actions Recommandées:</p>
                          <ul className="text-xs space-y-1">
                            {insight.actionItems.map((action, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                {action}
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

            {/* Quick Stats */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">85%</div>
                    <div className="text-sm text-muted-foreground">Probabilité Succès</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">22 mois</div>
                    <div className="text-sm text-muted-foreground">Délai Break-Even</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">2.1M DZD</div>
                    <div className="text-sm text-muted-foreground">Potentiel Revenus An 5</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Market Intelligence */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radar className="h-5 w-5" />
                Intelligence Marché Temps Réel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Concurrence</h4>
                  <p className="text-sm text-muted-foreground">Solutions internationales: Prix 3-30k EUR/an, Non-conformes Loi 18-07</p>
                  <Badge className="mt-2" variant="default">Avantage: 75% moins cher</Badge>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Marché Cible</h4>
                  <p className="text-sm text-muted-foreground">18-22 clubs potentiels identifiés sur 42 professionnels</p>
                  <Badge className="mt-2" variant="default">Potentiel: 2.5M DZD/an</Badge>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Tendances</h4>
                  <p className="text-sm text-muted-foreground">Digitalisation football +340% en Afrique du Nord</p>
                  <Badge className="mt-2" variant="default">Momentum: Élevé</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === SCENARIOS === */}
        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Simulation de Scénarios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {scenarios.map(scenario => (
                <div key={scenario.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{scenario.name}</h4>
                    <Badge variant="outline">{scenario.probability}% probabilité</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <div>
                      <div className="font-medium">Revenus</div>
                      <div className={scenario.outcomes.profit > 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(scenario.outcomes.revenue)}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Coûts</div>
                      <div className="text-red-600">{formatCurrency(scenario.outcomes.costs)}</div>
                    </div>
                    <div>
                      <div className="font-medium">Profit</div>
                      <div className={scenario.outcomes.profit > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        {formatCurrency(scenario.outcomes.profit)}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Market Share</div>
                      <div>{scenario.outcomes.marketShare}%</div>
                    </div>
                    <div>
                      <div className="font-medium">Risk Score</div>
                      <div className={scenario.outcomes.riskScore < 30 ? 'text-green-600' : scenario.outcomes.riskScore < 60 ? 'text-yellow-600' : 'text-red-600'}>
                        {scenario.outcomes.riskScore}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === KPIs === */}
        <TabsContent value="kpis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessKPIs.map(kpi => (
              <Card key={kpi.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{kpi.name}</h4>
                    <Badge variant="secondary">{kpi.category}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">{kpi.current.toLocaleString()} {kpi.unit}</span>
                      <span className={`text-sm ${kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                        {kpi.trend === 'up' ? '↗' : kpi.trend === 'down' ? '↘' : '→'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Cible: {kpi.target.toLocaleString()} {kpi.unit}</span>
                        <span>{Math.round((kpi.current / kpi.target) * 100)}%</span>
                      </div>
                      <Progress value={(kpi.current / kpi.target) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* === EVENT TRACKERS === */}
        <TabsContent value="trackers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Suivi d'Événements Stratégiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {eventTrackers.map(tracker => (
                <div key={tracker.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{tracker.name}</h4>
                      <p className="text-sm text-muted-foreground">{tracker.description}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant={getImpactColor(tracker.impact)}>{tracker.impact}</Badge>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(tracker.status)}`}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progression</span>
                      <span>{tracker.progress}%</span>
                    </div>
                    <Progress value={tracker.progress} className="h-2" />
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Échéance: {tracker.deadline}</span>
                      <span>Assigné: {tracker.assignee}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === BUSINESS PLAN === */}
        <TabsContent value="business-plan">
          <BusinessPlanManagement />
        </TabsContent>

        {/* === DOCUMENTS === */}
        <TabsContent value="documents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Business Model Canvas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BusinessModelCanvasDocument />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Étude de Marché
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MarketStudyDocument />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessSimulationDashboard;