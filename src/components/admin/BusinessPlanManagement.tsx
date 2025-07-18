import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  Calendar, 
  Plus, 
  Edit, 
  FileText,
  Building2,
  Users,
  Globe,
  Briefcase,
  MapPin,
  Banknote,
  Calculator,
  UserCheck,
  Timer,
  Activity,
  Settings,
  BarChart3,
  Zap,
  Crown,
  Shield,
  PieChart,
  TrendingDown
} from 'lucide-react';
import { toast } from 'sonner';
import StartupPitchPresentation from './StartupPitchPresentation';
import BudgetOptimizationSolver from './BudgetOptimizationSolver';

interface BusinessGoal {
  id: string;
  title: string;
  description: string;
  target: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

interface RevenueStream {
  id: string;
  name: string;
  description: string;
  monthlyRevenue: number;
  growth: number;
  status: 'active' | 'planned' | 'discontinued';
  marketSegment: string;
}

interface AlgerianRegulation {
  id: string;
  name: string;
  description: string;
  compliance: 'compliant' | 'pending' | 'non-compliant';
  deadline?: string;
}

interface EventTypeConfig {
  id: string;
  name: string;
  difficultyScore: number;
  detectionRate: number;
  timeRequired: number; // en secondes
}

interface TrackerBudgetConfig {
  basePayPerHour: number;
  difficultyMultiplier: number;
  overtimeRate: number;
  transportAllowance: number;
  equipmentCost: number;
  socialCharges: number; // pourcentage
}

interface Founder {
  id: string;
  name: string;
  role: 'founder' | 'co-founder' | 'investor' | 'advisor';
  equityPercentage: number;
  responsibilities: string[];
  monthlyContribution: number;
  expectedROI: number;
  vestingPeriod: number; // in months
  joinDate: string;
}

interface FinancialProjection {
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
  founderDistribution: number;
}

interface InterventionType {
  id: string;
  name: string;
  description: string;
  requiredCapital: number;
  expectedReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeframe: number; // in months
}

const BusinessPlanManagement: React.FC = () => {
  const [goals, setGoals] = useState<BusinessGoal[]>([
    {
      id: '1',
      title: 'Pénétrer le marché algérien du football',
      description: 'Établir une présence forte sur le marché du football en Algérie',
      target: '50 clubs partenaires',
      deadline: '2024-12-31',
      status: 'in-progress',
      priority: 'high'
    }
  ]);

  const [revenueStreams, setRevenueStreams] = useState<RevenueStream[]>([
    {
      id: '1',
      name: 'Abonnements Clubs',
      description: 'Abonnements mensuels pour les clubs de football',
      monthlyRevenue: 150000,
      growth: 15,
      status: 'active',
      marketSegment: 'Clubs professionnels'
    },
    {
      id: '2',
      name: 'Formation et Consulting',
      description: 'Services de formation pour entraîneurs et analystes',
      monthlyRevenue: 80000,
      growth: 25,
      status: 'active',
      marketSegment: 'Éducation sportive'
    }
  ]);

  const [regulations] = useState<AlgerianRegulation[]>([
    {
      id: '1',
      name: 'Enregistrement Commercial',
      description: 'Inscription au Registre du Commerce Algérien',
      compliance: 'compliant'
    },
    {
      id: '2',
      name: 'TVA Algérienne',
      description: 'Conformité aux règles de TVA (19%)',
      compliance: 'compliant'
    },
    {
      id: '3',
      name: 'Autorisation FAF',
      description: 'Autorisation de la Fédération Algérienne de Football',
      compliance: 'pending',
      deadline: '2024-06-30'
    }
  ]);

  // Founders and financial data
  const [founders, setFounders] = useState<Founder[]>([
    {
      id: '1',
      name: 'Ahmed Benali',
      role: 'founder',
      equityPercentage: 45,
      responsibilities: ['Direction générale', 'Stratégie commerciale', 'Relations FAF'],
      monthlyContribution: 0,
      expectedROI: 25,
      vestingPeriod: 48,
      joinDate: '2024-01-01'
    },
    {
      id: '2',
      name: 'Yasmine Kaci',
      role: 'co-founder',
      equityPercentage: 35,
      responsibilities: ['Développement technique', 'Gestion équipe', 'Innovation'],
      monthlyContribution: 0,
      expectedROI: 22,
      vestingPeriod: 48,
      joinDate: '2024-01-01'
    },
    {
      id: '3',
      name: 'Karim Ouali',
      role: 'investor',
      equityPercentage: 15,
      responsibilities: ['Financement', 'Réseau professionnel', 'Conseils stratégiques'],
      monthlyContribution: 250000,
      expectedROI: 30,
      vestingPeriod: 36,
      joinDate: '2024-02-01'
    },
    {
      id: '4',
      name: 'Dr. Rachid Medjahdi',
      role: 'advisor',
      equityPercentage: 5,
      responsibilities: ['Expertise football', 'Relations clubs', 'Validation produit'],
      monthlyContribution: 0,
      expectedROI: 15,
      vestingPeriod: 24,
      joinDate: '2024-03-01'
    }
  ]);

  const [interventions, setInterventions] = useState<InterventionType[]>([
    {
      id: '1',
      name: 'Expansion vers clubs amateurs',
      description: 'Développer une version simplifiée pour les clubs amateurs algériens',
      requiredCapital: 2500000,
      expectedReturn: 35,
      riskLevel: 'medium',
      timeframe: 18
    },
    {
      id: '2',
      name: 'Partenariat international',
      description: 'Alliance avec une plateforme européenne pour le transfert de technologie',
      requiredCapital: 5000000,
      expectedReturn: 45,
      riskLevel: 'high',
      timeframe: 24
    },
    {
      id: '3',
      name: 'Centre de formation',
      description: 'Ouverture d\'un centre de formation pour analystes sportifs',
      requiredCapital: 1500000,
      expectedReturn: 25,
      riskLevel: 'low',
      timeframe: 12
    }
  ]);

  const [financialProjections] = useState<FinancialProjection[]>([
    { year: 2024, revenue: 2760000, expenses: 1980000, profit: 780000, founderDistribution: 390000 },
    { year: 2025, revenue: 4140000, expenses: 2730000, profit: 1410000, founderDistribution: 705000 },
    { year: 2026, revenue: 6210000, expenses: 3795000, profit: 2415000, founderDistribution: 1207500 },
    { year: 2027, revenue: 8280000, expenses: 4680000, profit: 3600000, founderDistribution: 1800000 },
    { year: 2028, revenue: 11040000, expenses: 5940000, profit: 5100000, founderDistribution: 2550000 }
  ]);

  // Enhanced configuration for real-world tracker budget parameters
  const [budgetConfig, setBudgetConfig] = useState<TrackerBudgetConfig>({
    basePayPerHour: 1500, // DZD par heure - salaire minimum algérien ~= 20,000 DZD/mois = 1,250 DZD/heure
    difficultyMultiplier: 1.3, // Multiplicateur pour événements complexes
    overtimeRate: 1.5, // Taux horaire supplémentaire (standard algérien)
    transportAllowance: 2500, // Indemnité transport par match (réaliste pour Alger)
    equipmentCost: 800, // Coût équipement par tracker par match (tablette, casque, etc.)
    socialCharges: 26 // Pourcentage charges sociales algériennes (CNAS + autres)
  });

  // Real-world match simulation parameters
  const [matchSimulation, setMatchSimulation] = useState({
    duration: 90, // Durée standard d'un match
    totalEvents: 616, // Nombre moyen d'événements par match (statistiques réelles)
    trackersMinimum: 2, // Minimum pour couvrir un match basique
    trackersOptimal: 3, // Nombre optimal pour qualité maximale
    playersToTrack: 22, // 22 joueurs sur le terrain
    replacements: 1, // Nombre de remplacements de trackers durant le match
    matchFrequency: 15, // Nombre de matchs par mois pour un club actif
    seasonDuration: 9 // Durée de la saison en mois
  });

  // Enhanced event types with realistic difficulty and time requirements
  const [eventTypes, setEventTypes] = useState<EventTypeConfig[]>([
    { id: '1', name: 'But', difficultyScore: 3, detectionRate: 95, timeRequired: 15 },
    { id: '2', name: 'Passe courte', difficultyScore: 2, detectionRate: 88, timeRequired: 4 },
    { id: '3', name: 'Passe longue', difficultyScore: 4, detectionRate: 82, timeRequired: 6 },
    { id: '4', name: 'Tir cadré', difficultyScore: 4, detectionRate: 92, timeRequired: 10 },
    { id: '5', name: 'Tir non-cadré', difficultyScore: 3, detectionRate: 85, timeRequired: 8 },
    { id: '6', name: 'Faute simple', difficultyScore: 5, detectionRate: 78, timeRequired: 12 },
    { id: '7', name: 'Faute grave', difficultyScore: 7, detectionRate: 90, timeRequired: 18 },
    { id: '8', name: 'Hors-jeu', difficultyScore: 8, detectionRate: 65, timeRequired: 25 },
    { id: '9', name: 'Corner', difficultyScore: 3, detectionRate: 95, timeRequired: 6 },
    { id: '10', name: 'Coup franc', difficultyScore: 4, detectionRate: 90, timeRequired: 8 },
    { id: '11', name: 'Carton jaune', difficultyScore: 2, detectionRate: 98, timeRequired: 5 },
    { id: '12', name: 'Carton rouge', difficultyScore: 3, detectionRate: 98, timeRequired: 8 },
    { id: '13', name: 'Duel aérien', difficultyScore: 7, detectionRate: 72, timeRequired: 18 },
    { id: '14', name: 'Tackle', difficultyScore: 6, detectionRate: 75, timeRequired: 15 },
    { id: '15', name: 'Interception', difficultyScore: 5, detectionRate: 80, timeRequired: 10 },
    { id: '16', name: 'Dribble réussi', difficultyScore: 6, detectionRate: 70, timeRequired: 12 },
    { id: '17', name: 'Centre', difficultyScore: 4, detectionRate: 85, timeRequired: 8 },
    { id: '18', name: 'Sortie gardien', difficultyScore: 5, detectionRate: 88, timeRequired: 12 }
  ]);

  // Advanced calculations for real-world accuracy
  const calculateComplexityScore = () => {
    const eventDistribution = {
      'passes': 0.45, // 45% des événements sont des passes
      'duels': 0.25,  // 25% duels et tackles
      'tirs': 0.12,   // 12% tirs
      'fautes': 0.10, // 10% fautes
      'autres': 0.08  // 8% autres événements
    };

    const avgComplexityByType = {
      'passes': 3,
      'duels': 6.5,
      'tirs': 3.5,
      'fautes': 6,
      'autres': 4
    };

    const weightedComplexity = Object.entries(eventDistribution).reduce((sum, [type, weight]) => {
      return sum + (avgComplexityByType[type as keyof typeof avgComplexityByType] * weight * matchSimulation.totalEvents);
    }, 0);

    return Math.round(weightedComplexity);
  };

  const calculateTrackerCost = () => {
    const matchDurationHours = matchSimulation.duration / 60;
    const complexityScore = calculateComplexityScore();
    
    // Coût de base par tracker
    const baseCostPerTracker = matchDurationHours * budgetConfig.basePayPerHour;
    
    // Prime de complexité basée sur le score de difficulté
    const complexityBonus = baseCostPerTracker * (complexityScore / 1000) * (budgetConfig.difficultyMultiplier - 1);
    
    // Coût horaire total par tracker
    const hourlyRateWithComplexity = baseCostPerTracker + complexityBonus;
    
    // Coût pour tous les trackers
    const totalLaborCost = hourlyRateWithComplexity * matchSimulation.trackersOptimal;
    
    // Indemnités et frais
    const totalTransportCost = matchSimulation.trackersOptimal * budgetConfig.transportAllowance;
    const totalEquipmentCost = matchSimulation.trackersOptimal * budgetConfig.equipmentCost;
    
    // Coût de remplacement (si nécessaire)
    const replacementCost = matchSimulation.replacements * (hourlyRateWithComplexity * 0.3); // 30% du coût pour remplacement
    
    // Sous-total avant charges sociales
    const subtotal = totalLaborCost + totalTransportCost + totalEquipmentCost + replacementCost;
    
    // Charges sociales
    const socialChargesCost = subtotal * (budgetConfig.socialCharges / 100);
    
    // Coût total
    const totalCost = subtotal + socialChargesCost;
    
    return {
      totalCost: Math.round(totalCost),
      breakdown: {
        laborCost: Math.round(totalLaborCost),
        complexityBonus: Math.round(complexityBonus * matchSimulation.trackersOptimal),
        transportCost: Math.round(totalTransportCost),
        equipmentCost: Math.round(totalEquipmentCost),
        replacementCost: Math.round(replacementCost),
        socialCharges: Math.round(socialChargesCost)
      }
    };
  };

  const calculateMonthlyAndSeasonalCosts = () => {
    const costPerMatch = calculateTrackerCost();
    const monthlyCost = costPerMatch.totalCost * matchSimulation.matchFrequency;
    const seasonalCost = monthlyCost * matchSimulation.seasonDuration;
    
    return {
      perMatch: costPerMatch.totalCost,
      monthly: monthlyCost,
      seasonal: seasonalCost,
      breakdown: costPerMatch.breakdown
    };
  };

  const calculateEfficiencyMetrics = () => {
    const costs = calculateMonthlyAndSeasonalCosts();
    const complexityScore = calculateComplexityScore();
    
    return {
      costPerEvent: Math.round(costs.perMatch / matchSimulation.totalEvents),
      costPerMinute: Math.round(costs.perMatch / matchSimulation.duration),
      costPerPlayer: Math.round(costs.perMatch / matchSimulation.playersToTrack),
      complexityEfficiency: Math.round(complexityScore / costs.perMatch * 1000), // Score par 1000 DZD
      hourlyRatePerTracker: Math.round(costs.perMatch / (matchSimulation.trackersOptimal * matchSimulation.duration / 60))
    };
  };

  const [newGoal, setNewGoal] = useState<{
    title: string;
    description: string;
    target: string;
    deadline: string;
    priority: 'low' | 'medium' | 'high';
  }>({
    title: '',
    description: '',
    target: '',
    deadline: '',
    priority: 'medium'
  });

  const [newRevenue, setNewRevenue] = useState({
    name: '',
    description: '',
    monthlyRevenue: 0,
    marketSegment: ''
  });

  const addGoal = () => {
    if (!newGoal.title || !newGoal.description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const goal: BusinessGoal = {
      id: Date.now().toString(),
      ...newGoal,
      status: 'pending'
    };

    setGoals([...goals, goal]);
    setNewGoal({ title: '', description: '', target: '', deadline: '', priority: 'medium' });
    toast.success('Objectif ajouté avec succès');
  };

  const addRevenueStream = () => {
    if (!newRevenue.name || !newRevenue.description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const revenue: RevenueStream = {
      id: Date.now().toString(),
      ...newRevenue,
      growth: 0,
      status: 'planned'
    };

    setRevenueStreams([...revenueStreams, revenue]);
    setNewRevenue({ name: '', description: '', monthlyRevenue: 0, marketSegment: '' });
    toast.success('Source de revenus ajoutée avec succès');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD'
    }).format(amount);
  };

  const totalMonthlyRevenue = revenueStreams
    .filter(stream => stream.status === 'active')
    .reduce((sum, stream) => sum + stream.monthlyRevenue, 0);

  const totalYearlyRevenue = totalMonthlyRevenue * 12;

  // Handler for optimization solver
  const handleConfigUpdate = (config: {
    trackersMinimum: number;
    trackersOptimal: number;
    replacements: number;
    playersToTrack: number;
  }) => {
    setMatchSimulation({
      ...matchSimulation,
      ...config
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Plan d'Affaires - Marché Algérien
          </h2>
          <p className="text-muted-foreground">
            Gestion stratégique pour le marché du football en Algérie
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <MapPin className="h-3 w-3 mr-1" />
          Algérie
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="pitch">Pitch Startup</TabsTrigger>
          <TabsTrigger value="goals">Objectifs</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="founders">Fondateurs</TabsTrigger>
          <TabsTrigger value="budget">Budget Trackers</TabsTrigger>
          <TabsTrigger value="market">Marché Local</TabsTrigger>
          <TabsTrigger value="compliance">Conformité</TabsTrigger>
        </TabsList>

        <TabsContent value="pitch" className="space-y-6">
          <StartupPitchPresentation />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenus Mensuels</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(totalMonthlyRevenue)}
                    </p>
                  </div>
                  <Banknote className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  +12% vs mois précédent
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Objectifs Actifs</p>
                    <p className="text-2xl font-bold text-foreground">
                      {goals.filter(g => g.status !== 'completed').length}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {goals.filter(g => g.status === 'completed').length} terminés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Clubs Partenaires</p>
                    <p className="text-2xl font-bold text-foreground">28</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Objectif: 50 clubs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Coût par Match</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(calculateTrackerCost().totalCost)}
                    </p>
                  </div>
                  <Calculator className="h-8 w-8 text-orange-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {matchSimulation.trackersOptimal} trackers optimal
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Business Model Canvas - Algerian Context */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Modèle d'Affaires - Contexte Algérien
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Partenaires Clés</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Fédération Algérienne de Football (FAF)</li>
                    <li>• Ligues Régionales</li>
                    <li>• Clubs Professionnels</li>
                    <li>• Centres de Formation</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Segments Clients</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Clubs de Ligue 1 et 2</li>
                    <li>• Académies de football</li>
                    <li>• Entraîneurs professionnels</li>
                    <li>• Analystes sportifs</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Canaux de Distribution</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Plateforme web</li>
                    <li>• Partenariats directs</li>
                    <li>• Formations présentielles</li>
                    <li>• Support technique local</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          {/* Budget Optimization Solver */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Optimisateur de Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetOptimizationSolver
                currentConfig={{
                  trackersMinimum: matchSimulation.trackersMinimum,
                  trackersOptimal: matchSimulation.trackersOptimal,
                  replacements: matchSimulation.replacements,
                  playersToTrack: matchSimulation.playersToTrack
                }}
                onConfigUpdate={handleConfigUpdate}
                calculateCost={calculateTrackerCost}
                calculateEfficiency={calculateEfficiencyMetrics}
              />
            </CardContent>
          </Card>

          {/* Enhanced Real-World Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  📊 Analyse Événements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Événements</p>
                    <p className="text-2xl font-bold text-foreground">{matchSimulation.totalEvents}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Événements/Minute</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(matchSimulation.totalEvents / matchSimulation.duration).toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Score Complexité</p>
                    <p className="text-2xl font-bold text-foreground">{calculateComplexityScore()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Complexité/Minute</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(calculateComplexityScore() / matchSimulation.duration).toFixed(1)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  👥 Charge de Travail
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Trackers Minimum</p>
                    <p className="text-2xl font-bold text-foreground">{matchSimulation.trackersMinimum}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Trackers Optimal</p>
                    <p className="text-2xl font-bold text-foreground">{matchSimulation.trackersOptimal}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Remplacements</p>
                    <p className="text-2xl font-bold text-foreground">{matchSimulation.replacements}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Joueurs à Suivre</p>
                    <p className="text-2xl font-bold text-foreground">{matchSimulation.playersToTrack}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  💰 Coûts par Match
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Coût Total</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(calculateMonthlyAndSeasonalCosts().perMatch)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Par événement</p>
                    <p className="font-semibold">{formatCurrency(calculateEfficiencyMetrics().costPerEvent)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Par minute</p>
                    <p className="font-semibold">{formatCurrency(calculateEfficiencyMetrics().costPerMinute)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Cost Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Détail des Coûts par Match
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const costs = calculateMonthlyAndSeasonalCosts();
                    return (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-muted rounded">
                          <span className="font-medium">Salaire de base ({matchSimulation.trackersOptimal} trackers)</span>
                          <span className="font-bold">{formatCurrency(costs.breakdown.laborCost)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-muted rounded">
                          <span className="font-medium">Prime complexité</span>
                          <span className="font-bold text-orange-600">{formatCurrency(costs.breakdown.complexityBonus)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-muted rounded">
                          <span className="font-medium">Transport</span>
                          <span className="font-bold text-blue-600">{formatCurrency(costs.breakdown.transportCost)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-muted rounded">
                          <span className="font-medium">Équipement</span>
                          <span className="font-bold text-purple-600">{formatCurrency(costs.breakdown.equipmentCost)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-muted rounded">
                          <span className="font-medium">Remplacements</span>
                          <span className="font-bold text-yellow-600">{formatCurrency(costs.breakdown.replacementCost)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded border">
                          <span className="font-medium">Charges sociales ({budgetConfig.socialCharges}%)</span>
                          <span className="font-bold text-red-600">{formatCurrency(costs.breakdown.socialCharges)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-4 bg-green-50 rounded border-2 border-green-200">
                          <span className="font-bold text-lg">TOTAL</span>
                          <span className="font-bold text-2xl text-green-600">{formatCurrency(costs.perMatch)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Projections Temporelles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const costs = calculateMonthlyAndSeasonalCosts();
                    const efficiency = calculateEfficiencyMetrics();
                    return (
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded border">
                          <h4 className="font-semibold text-blue-800 mb-2">Coûts Mensuels</h4>
                          <div className="text-2xl font-bold text-blue-600">{formatCurrency(costs.monthly)}</div>
                          <p className="text-sm text-blue-700">{matchSimulation.matchFrequency} matchs/mois</p>
                        </div>
                        
                        <div className="bg-purple-50 p-4 rounded border">
                          <h4 className="font-semibold text-purple-800 mb-2">Coûts Saisonniers</h4>
                          <div className="text-2xl font-bold text-purple-600">{formatCurrency(costs.seasonal)}</div>
                          <p className="text-sm text-purple-700">{matchSimulation.seasonDuration} mois de saison</p>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded border">
                          <h4 className="font-semibold text-green-800 mb-2">Métriques d'Efficacité</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Coût/Joueur</p>
                              <p className="font-semibold">{formatCurrency(efficiency.costPerPlayer)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Taux horaire/Tracker</p>
                              <p className="font-semibold">{formatCurrency(efficiency.hourlyRatePerTracker)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dynamic Configuration Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration Salaires & Charges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="basePayPerHour">Salaire Base/Heure (DZD)</Label>
                    <Input
                      id="basePayPerHour"
                      type="number"
                      value={budgetConfig.basePayPerHour}
                      onChange={(e) => setBudgetConfig({
                        ...budgetConfig,
                        basePayPerHour: Number(e.target.value)
                      })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">SNMG Algérie ≈ 1,250 DZD/h</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="difficultyMultiplier">Multiplicateur Complexité</Label>
                    <Input
                      id="difficultyMultiplier"
                      type="number"
                      step="0.1"
                      value={budgetConfig.difficultyMultiplier}
                      onChange={(e) => setBudgetConfig({
                        ...budgetConfig,
                        difficultyMultiplier: Number(e.target.value)
                      })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Bonus événements difficiles</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="transportAllowance">Transport/Match (DZD)</Label>
                    <Input
                      id="transportAllowance"
                      type="number"
                      value={budgetConfig.transportAllowance}
                      onChange={(e) => setBudgetConfig({
                        ...budgetConfig,
                        transportAllowance: Number(e.target.value)
                      })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Alger: 2000-3000 DZD</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="socialCharges">Charges Sociales (%)</Label>
                    <Input
                      id="socialCharges"
                      type="number"
                      value={budgetConfig.socialCharges}
                      onChange={(e) => setBudgetConfig({
                        ...budgetConfig,
                        socialCharges: Number(e.target.value)
                      })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Algérie: 25-30%</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="equipmentCost">Équipement/Match (DZD)</Label>
                    <Input
                      id="equipmentCost"
                      type="number"
                      value={budgetConfig.equipmentCost}
                      onChange={(e) => setBudgetConfig({
                        ...budgetConfig,
                        equipmentCost: Number(e.target.value)
                      })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Tablette + accessoires</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="overtimeRate">Taux Heures Sup.</Label>
                    <Input
                      id="overtimeRate"
                      type="number"
                      step="0.1"
                      value={budgetConfig.overtimeRate}
                      onChange={(e) => setBudgetConfig({
                        ...budgetConfig,
                        overtimeRate: Number(e.target.value)
                      })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Standard: 1.5x</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Configuration Match & Saison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="matchDuration">Durée Match (min)</Label>
                    <Input
                      id="matchDuration"
                      type="number"
                      value={matchSimulation.duration}
                      onChange={(e) => setMatchSimulation({
                        ...matchSimulation,
                        duration: Number(e.target.value)
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="totalEvents">Total Événements</Label>
                    <Input
                      id="totalEvents"
                      type="number"
                      value={matchSimulation.totalEvents}
                      onChange={(e) => setMatchSimulation({
                        ...matchSimulation,
                        totalEvents: Number(e.target.value)
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="trackersOptimal">Trackers Optimal</Label>
                    <Input
                      id="trackersOptimal"
                      type="number"
                      value={matchSimulation.trackersOptimal}
                      onChange={(e) => setMatchSimulation({
                        ...matchSimulation,
                        trackersOptimal: Number(e.target.value)
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="matchFrequency">Matchs/Mois</Label>
                    <Input
                      id="matchFrequency"
                      type="number"
                      value={matchSimulation.matchFrequency}
                      onChange={(e) => setMatchSimulation({
                        ...matchSimulation,
                        matchFrequency: Number(e.target.value)
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="seasonDuration">Durée Saison (mois)</Label>
                    <Input
                      id="seasonDuration"
                      type="number"
                      value={matchSimulation.seasonDuration}
                      onChange={(e) => setMatchSimulation({
                        ...matchSimulation,
                        seasonDuration: Number(e.target.value)
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="replacements">Remplacements</Label>
                    <Input
                      id="replacements"
                      type="number"
                      value={matchSimulation.replacements}
                      onChange={(e) => setMatchSimulation({
                        ...matchSimulation,
                        replacements: Number(e.target.value)
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Event Types Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Configuration Types d'Événements (Paramètres Réels)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Type d'Événement</th>
                      <th className="text-left p-2">Difficulté (1-10)</th>
                      <th className="text-left p-2">Détection (%)</th>
                      <th className="text-left p-2">Temps (sec)</th>
                      <th className="text-left p-2">Impact Coût</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventTypes.map((event) => (
                      <tr key={event.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{event.name}</td>
                        <td className="p-2">
                          <Badge variant={
                            event.difficultyScore <= 3 ? 'default' :
                            event.difficultyScore <= 6 ? 'secondary' : 'destructive'
                          }>
                            {event.difficultyScore}/10
                          </Badge>
                        </td>
                        <td className="p-2">
                          <span className={`font-medium ${
                            event.detectionRate >= 90 ? 'text-green-600' :
                            event.detectionRate >= 80 ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {event.detectionRate}%
                          </span>
                        </td>
                        <td className="p-2">{event.timeRequired}s</td>
                        <td className="p-2">
                          <span className="text-xs">
                            +{Math.round((event.difficultyScore / 10) * budgetConfig.basePayPerHour * 0.1)} DZD
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded border">
                <h4 className="font-semibold text-blue-800 mb-2">Statistiques Événements</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Difficulté Moyenne</p>
                    <p className="font-bold">{(eventTypes.reduce((sum, e) => sum + e.difficultyScore, 0) / eventTypes.length).toFixed(1)}/10</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Détection Moyenne</p>
                    <p className="font-bold">{(eventTypes.reduce((sum, e) => sum + e.detectionRate, 0) / eventTypes.length).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Temps Moyen</p>
                    <p className="font-bold">{(eventTypes.reduce((sum, e) => sum + e.timeRequired, 0) / eventTypes.length).toFixed(1)}s</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Types Événements</p>
                    <p className="font-bold">{eventTypes.length} types</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Objectifs Stratégiques</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel Objectif
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un Objectif</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="goal-title">Titre</Label>
                    <Input
                      id="goal-title"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      placeholder="Ex: Expansion dans 3 nouvelles wilayas"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-description">Description</Label>
                    <Textarea
                      id="goal-description"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      placeholder="Description détaillée de l'objectif"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-target">Cible</Label>
                    <Input
                      id="goal-target"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                      placeholder="Ex: 15 nouveaux clubs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-deadline">Date Limite</Label>
                    <Input
                      id="goal-deadline"
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-priority">Priorité</Label>
                    <Select
                      value={newGoal.priority}
                      onValueChange={(value: 'low' | 'medium' | 'high') => 
                        setNewGoal({ ...newGoal, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Faible</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="high">Élevée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={addGoal} className="w-full">
                    Ajouter l'Objectif
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">{goal.title}</h4>
                        <Badge variant={
                          goal.priority === 'high' ? 'destructive' :
                          goal.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {goal.priority === 'high' ? 'Élevée' :
                           goal.priority === 'medium' ? 'Moyenne' : 'Faible'}
                        </Badge>
                        <Badge variant={
                          goal.status === 'completed' ? 'default' :
                          goal.status === 'in-progress' ? 'secondary' : 'outline'
                        }>
                          {goal.status === 'completed' ? 'Terminé' :
                           goal.status === 'in-progress' ? 'En cours' : 'En attente'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Cible: {goal.target}</span>
                        {goal.deadline && (
                          <span>Échéance: {new Date(goal.deadline).toLocaleDateString('fr-FR')}</span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          {/* Revenue Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-foreground mb-2">Revenus Mensuels</h4>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalMonthlyRevenue)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-foreground mb-2">Revenus Annuels</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalYearlyRevenue)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-foreground mb-2">Sources Actives</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {revenueStreams.filter(stream => stream.status === 'active').length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Add New Revenue Stream */}
          <Card>
            <CardHeader>
              <CardTitle>Ajouter une Source de Revenus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="revenue-name">Nom</Label>
                  <Input
                    id="revenue-name"
                    value={newRevenue.name}
                    onChange={(e) => setNewRevenue({ ...newRevenue, name: e.target.value })}
                    placeholder="Ex: Licences logiciels"
                  />
                </div>
                <div>
                  <Label htmlFor="revenue-segment">Segment de Marché</Label>
                  <Input
                    id="revenue-segment"
                    value={newRevenue.marketSegment}
                    onChange={(e) => setNewRevenue({ ...newRevenue, marketSegment: e.target.value })}
                    placeholder="Ex: Clubs amateurs"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="revenue-description">Description</Label>
                  <Textarea
                    id="revenue-description"
                    value={newRevenue.description}
                    onChange={(e) => setNewRevenue({ ...newRevenue, description: e.target.value })}
                    placeholder="Description de la source de revenus"
                  />
                </div>
                <div>
                  <Label htmlFor="revenue-amount">Revenus Mensuels Estimés (DZD)</Label>
                  <Input
                    id="revenue-amount"
                    type="number"
                    value={newRevenue.monthlyRevenue}
                    onChange={(e) => setNewRevenue({ ...newRevenue, monthlyRevenue: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addRevenueStream} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Streams List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sources de Revenus</h3>
            {revenueStreams.map((stream) => (
              <Card key={stream.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">{stream.name}</h4>
                        <Badge variant={
                          stream.status === 'active' ? 'default' :
                          stream.status === 'planned' ? 'secondary' : 'outline'
                        }>
                          {stream.status === 'active' ? 'Actif' :
                           stream.status === 'planned' ? 'Planifié' : 'Discontinué'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{stream.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium text-green-600">
                          {formatCurrency(stream.monthlyRevenue)}/mois
                        </span>
                        <span className="text-muted-foreground">
                          Segment: {stream.marketSegment}
                        </span>
                        {stream.growth > 0 && (
                          <span className="text-green-600 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            +{stream.growth}%
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Analyse du Marché Algérien
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Taille du Marché</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 140+ clubs professionnels</li>
                    <li>• 48 wilayas couvertes</li>
                    <li>• 2M+ joueurs licenciés</li>
                    <li>• Marché estimé: 2.5B DZD</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Opportunités</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Digitalisation du sport</li>
                    <li>• Formation des entraîneurs</li>
                    <li>• Analyse de performance</li>
                    <li>• Jeunes talents</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Défis du Marché Local</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Défis Techniques</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Infrastructure internet variable</li>
                    <li>• Adoption technologique lente</li>
                    <li>• Formation numérique nécessaire</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Défis Économiques</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Budgets limités des clubs</li>
                    <li>• Volatilité du dinar</li>
                    <li>• Financement difficile</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stratégie de Pénétration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold">Phase 1: Établissement</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Partenariat avec FAF</li>
                    <li>• Clubs pilotes à Alger</li>
                    <li>• Formation équipes locales</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Phase 2: Expansion</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Extension à Oran, Constantine</li>
                    <li>• Recrutement commercial</li>
                    <li>• Adaptation produit local</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Phase 3: Consolidation</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Couverture nationale</li>
                    <li>• Diversification services</li>
                    <li>• Leadership marché</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Conformité Réglementaire Algérienne
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regulations.map((regulation) => (
                  <div key={regulation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{regulation.name}</h4>
                      <p className="text-sm text-muted-foreground">{regulation.description}</p>
                      {regulation.deadline && (
                        <p className="text-xs text-orange-600 mt-1">
                          Échéance: {new Date(regulation.deadline).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                    <Badge variant={
                      regulation.compliance === 'compliant' ? 'default' :
                      regulation.compliance === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {regulation.compliance === 'compliant' ? 'Conforme' :
                       regulation.compliance === 'pending' ? 'En cours' : 'Non conforme'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exigences Fiscales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Obligations Fiscales</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• TVA: 19% sur services digitaux</li>
                    <li>• IBS: 23% sur bénéfices</li>
                    <li>• TAP: 2% sur chiffre d'affaires</li>
                    <li>• Versement forfaitaire: 1%</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Calendrier Fiscal</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Déclarations TVA: Mensuelle</li>
                    <li>• Déclaration IBS: Annuelle</li>
                    <li>• Acomptes provisionnels: Trimestriels</li>
                    <li>• Bilan comptable: 31 Mars</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="founders" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Founders Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Structure des Fondateurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {founders.map((founder) => (
                    <div key={founder.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            {founder.role === 'founder' ? <Crown className="h-4 w-4 text-primary" /> : 
                             founder.role === 'co-founder' ? <Shield className="h-4 w-4 text-blue-600" /> : 
                             founder.role === 'investor' ? <DollarSign className="h-4 w-4 text-green-600" /> : 
                             <UserCheck className="h-4 w-4 text-purple-600" />}
                          </div>
                          <div>
                            <h4 className="font-semibold">{founder.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {founder.role === 'founder' ? 'Fondateur' : 
                               founder.role === 'co-founder' ? 'Co-fondateur' : 
                               founder.role === 'investor' ? 'Investisseur' : 'Conseiller'}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{founder.equityPercentage}%</p>
                          <p className="text-xs text-muted-foreground">Équité</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">ROI attendu</p>
                          <p className="font-semibold">{founder.expectedROI}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Vesting</p>
                          <p className="font-semibold">{founder.vestingPeriod} mois</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Contribution</p>
                          <p className="font-semibold">{formatCurrency(founder.monthlyContribution)}/mois</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Depuis</p>
                          <p className="font-semibold">{new Date(founder.joinDate).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground mb-2">Responsabilités:</p>
                        <div className="flex flex-wrap gap-1">
                          {founder.responsibilities.map((resp, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {resp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Financial Simulation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Simulation Financière (5 ans)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financialProjections.map((projection, index) => (
                    <div key={projection.year} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Année {projection.year}</h4>
                        <Badge 
                          variant={projection.profit > 0 ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {projection.profit > 0 ? "Profitable" : "Déficitaire"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Revenus</p>
                          <p className="font-semibold text-green-600">{formatCurrency(projection.revenue)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Dépenses</p>
                          <p className="font-semibold text-red-600">{formatCurrency(projection.expenses)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Profit</p>
                          <p className={`font-semibold ${projection.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(projection.profit)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Distribution</p>
                          <p className="font-semibold text-primary">{formatCurrency(projection.founderDistribution)}</p>
                        </div>
                      </div>
                      
                      {index === 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground">
                            Distribution basée sur les parts d'équité des fondateurs
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Individual Founder Profit Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Répartition des Profits par Fondateur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {founders.map((founder) => (
                  <div key={founder.id} className="border rounded-lg p-4">
                    <div className="text-center mb-3">
                      <h4 className="font-semibold">{founder.name}</h4>
                      <Badge variant="outline" className="text-xs mt-1">
                        {founder.equityPercentage}% d'équité
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {financialProjections.slice(0, 3).map((projection) => (
                        <div key={projection.year} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{projection.year}:</span>
                          <span className="font-semibold">
                            {formatCurrency(projection.founderDistribution * (founder.equityPercentage / 100))}
                          </span>
                        </div>
                      ))}
                      
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm font-semibold">
                          <span>Total 3 ans:</span>
                          <span className="text-primary">
                            {formatCurrency(
                              financialProjections.slice(0, 3).reduce((sum, p) => 
                                sum + (p.founderDistribution * (founder.equityPercentage / 100)), 0
                              )
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Investment Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Opportunités d'Intervention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {interventions.map((intervention) => (
                  <div key={intervention.id} className="border rounded-lg p-4">
                    <div className="mb-3">
                      <h4 className="font-semibold mb-2">{intervention.name}</h4>
                      <p className="text-sm text-muted-foreground">{intervention.description}</p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capital requis:</span>
                        <span className="font-semibold">{formatCurrency(intervention.requiredCapital)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Retour attendu:</span>
                        <span className="font-semibold text-green-600">{intervention.expectedReturn}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Délai:</span>
                        <span className="font-semibold">{intervention.timeframe} mois</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Risque:</span>
                        <Badge 
                          variant={intervention.riskLevel === 'low' ? 'default' : 
                                  intervention.riskLevel === 'medium' ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {intervention.riskLevel === 'low' ? 'Faible' : 
                           intervention.riskLevel === 'medium' ? 'Moyen' : 'Élevé'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t">
                      <div className="text-xs text-muted-foreground">
                        Profit potentiel: {formatCurrency(intervention.requiredCapital * (intervention.expectedReturn / 100))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Responsibilities Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Matrice des Responsabilités
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Domaine</th>
                      {founders.map((founder) => (
                        <th key={founder.id} className="text-center p-2">{founder.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      'Direction générale',
                      'Développement technique', 
                      'Relations commerciales',
                      'Financement',
                      'Ressources humaines',
                      'Stratégie',
                      'Innovation',
                      'Relations institutionnelles'
                    ].map((domain) => (
                      <tr key={domain} className="border-b">
                        <td className="p-2 font-medium">{domain}</td>
                        {founders.map((founder) => (
                          <td key={founder.id} className="text-center p-2">
                            {founder.responsibilities.some(resp => 
                              resp.toLowerCase().includes(domain.toLowerCase()) ||
                              domain.toLowerCase().includes(resp.toLowerCase().split(' ')[0]) ||
                              (domain === 'Relations commerciales' && resp.includes('commercial')) ||
                              (domain === 'Financement' && resp.includes('Financement')) ||
                              (domain === 'Relations institutionnelles' && resp.includes('FAF'))
                            ) ? (
                              <Badge variant="default" className="text-xs">Responsable</Badge>
                            ) : founder.responsibilities.length > 2 ? (
                              <Badge variant="outline" className="text-xs">Support</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessPlanManagement;
