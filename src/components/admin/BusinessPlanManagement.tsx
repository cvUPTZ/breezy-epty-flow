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
  id: number;
  name: string;
  category: string;
  frequency: number;
  difficultyScore: number;
  detectionRate: number;
}

interface TrackerBudgetConfig {
  basePayPerHour: number;
  difficultyMultiplier: number;
  overtimeRate: number;
  transportAllowance: number;
  equipmentCost: number;
  socialCharges: number; // pourcentage
  desiredSalaryPerMatch: number;
}

interface Founder {
  id: string;
  name: string;
  role: 'founder' | 'co-founder' | 'technical' | 'investor' | 'advisor';
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

  // Simulation toggles
  const [includeInvestors, setIncludeInvestors] = useState(true);
  const [activePositions, setActivePositions] = useState({
    founder: true,
    technicalManager: true,
    cofounder: true,
    investor1: true,
    investor2: true
  });

  const togglePosition = (position: keyof typeof activePositions) => {
    setActivePositions(prev => ({
      ...prev,
      [position]: !prev[position]
    }));
  };

  // Founders and financial data
  const [founders, setFounders] = useState<Founder[]>([
    {
      id: '1',
      name: 'HOUDACHE Zakaria',
      role: 'founder',
      equityPercentage: 60,
      responsibilities: ['Vision stratégique', 'Relations investisseurs', 'Développement business', 'Direction générale'],
      monthlyContribution: 0,
      expectedROI: 25,
      vestingPeriod: 48,
      joinDate: '2024-01-01'
    },
    // ========== START: UPDATED ISLAM'S ROLE ==========
    {
      id: '2',
      name: 'ISLAM',
      role: 'technical',
      equityPercentage: 5,
      responsibilities: ['Liaison FAF & Clubs', 'Gestion Opérations Football', 'Formation & Qualité des Données', 'Stratégie Produit Terrain'],
      monthlyContribution: 0,
      expectedROI: 15,
      vestingPeriod: 36,
      joinDate: '2024-01-01'
    },
    // ========== END: UPDATED ISLAM'S ROLE ==========
    {
      id: '3',
      name: 'FERROUDJE Cherif',
      role: 'commercial',
      equityPercentage: 5,
      responsibilities: ['Développement commercial', 'Partenariats', 'Opérations'],
      monthlyContribution: 0,
      expectedROI: 15,
      vestingPeriod: 36,
      joinDate: '2024-01-01'
    },
    {
      id: '4',
      name: 'Investisseur Stratégique',
      role: 'investor',
      equityPercentage: 10,
      responsibilities: ['Financement', 'Réseau professionnel', 'Conseils stratégiques'],
      monthlyContribution: 250000,
      expectedROI: 30,
      vestingPeriod: 36,
      joinDate: '2024-02-01'
    },
    {
      id: '5',
      name: 'Business Angel',
      role: 'investor',
      equityPercentage: 5,
      responsibilities: ['Financement', 'Mentoring', 'Validation produit'],
      monthlyContribution: 100000,
      expectedROI: 25,
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
    socialCharges: 26, // Pourcentage charges sociales algériennes (CNAS + autres)
    desiredSalaryPerMatch: 0,
  });

  // Real-world match simulation parameters
  const [matchSimulation, setMatchSimulation] = useState({
    duration: 90, // Durée standard d'un match
    playersToTrack: 22, // 22 joueurs sur le terrain
    matchFrequency: 15, // Nombre de matchs par mois pour un club actif
    seasonDuration: 9, // Durée de la saison en mois
    trackersMinimum: 5,
    trackersOptimal: 7,
    replacements: 3,
  });

  // Calculated fields based on event types and requirements
  const getTotalEvents = () => {
    return eventTypes.reduce((sum, et) => sum + et.frequency, 0);
  };


  // Enhanced event types with realistic difficulty and time requirements
  const [eventTypes, setEventTypes] = useState<EventTypeConfig[]>([
    // Ball Actions
    { id: 1, name: 'Pass', category: 'Ball Actions', frequency: 450, difficultyScore: 3, detectionRate: 95 },
    { id: 2, name: 'Shot', category: 'Ball Actions', frequency: 25, difficultyScore: 6, detectionRate: 90 },
    { id: 3, name: 'Cross', category: 'Ball Actions', frequency: 35, difficultyScore: 4, detectionRate: 92 },
    { id: 4, name: 'Dribble', category: 'Ball Actions', frequency: 45, difficultyScore: 5, detectionRate: 88 },
    { id: 5, name: 'Tackle', category: 'Ball Actions', frequency: 28, difficultyScore: 6, detectionRate: 85 },
    { id: 6, name: 'Interception', category: 'Ball Actions', frequency: 32, difficultyScore: 5, detectionRate: 87 },
    { id: 7, name: 'Clearance', category: 'Ball Actions', frequency: 24, difficultyScore: 4, detectionRate: 90 },
    { id: 8, name: 'Save', category: 'Ball Actions', frequency: 8, difficultyScore: 7, detectionRate: 95 },
    
    // Set Pieces
    { id: 9, name: 'Corner Kick', category: 'Set Pieces', frequency: 12, difficultyScore: 4, detectionRate: 95 },
    { id: 10, name: 'Free Kick', category: 'Set Pieces', frequency: 18, difficultyScore: 5, detectionRate: 93 },
    { id: 11, name: 'Throw In', category: 'Set Pieces', frequency: 40, difficultyScore: 3, detectionRate: 96 },
    { id: 12, name: 'Goal Kick', category: 'Set Pieces', frequency: 15, difficultyScore: 2, detectionRate: 98 },
    { id: 13, name: 'Penalty', category: 'Set Pieces', frequency: 1, difficultyScore: 4, detectionRate: 100 },
    
    // Fouls & Cards
    { id: 14, name: 'Foul', category: 'Fouls & Cards', frequency: 30, difficultyScore: 7, detectionRate: 85 },
    { id: 15, name: 'Yellow Card', category: 'Fouls & Cards', frequency: 6, difficultyScore: 5, detectionRate: 98 },
    { id: 16, name: 'Red Card', category: 'Fouls & Cards', frequency: 0.5, difficultyScore: 3, detectionRate: 100 },
    { id: 17, name: 'Offside', category: 'Fouls & Cards', frequency: 8, difficultyScore: 8, detectionRate: 80 },
    
    // Goals & Assists
    { id: 18, name: 'Goal', category: 'Goals & Assists', frequency: 3, difficultyScore: 2, detectionRate: 100 },
    { id: 19, name: 'Assist', category: 'Goals & Assists', frequency: 2.5, difficultyScore: 6, detectionRate: 85 },
    { id: 20, name: 'Own Goal', category: 'Goals & Assists', frequency: 0.3, difficultyScore: 4, detectionRate: 100 },
    
    // Possession
    { id: 21, name: 'Ball Lost', category: 'Possession', frequency: 60, difficultyScore: 5, detectionRate: 82 },
    { id: 22, name: 'Ball Recovered', category: 'Possession', frequency: 55, difficultyScore: 5, detectionRate: 83 },
    
    // Match Events
    { id: 23, name: 'Substitution', category: 'Match Events', frequency: 6, difficultyScore: 3, detectionRate: 100 },
    { id: 24, name: 'Sub', category: 'Match Events', frequency: 6, difficultyScore: 3, detectionRate: 100 },
    
    // Duels
    { id: 25, name: 'Aerial Duel', category: 'Duels', frequency: 35, difficultyScore: 7, detectionRate: 78 },
    { id: 26, name: 'Ground Duel', category: 'Duels', frequency: 45, difficultyScore: 6, detectionRate: 80 }
  ]);

  // Advanced calculations for real-world accuracy
  const calculateComplexityScore = () => {
    const totalEvents = getTotalEvents();
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
      return sum + (avgComplexityByType[type as keyof typeof avgComplexityByType] * weight * totalEvents);
    }, 0);

    return Math.round(weightedComplexity);
  };

  const calculateTrackerCost = () => {
    const matchDurationHours = matchSimulation.duration / 60;
    const complexityScore = calculateComplexityScore();
    
    // Coût de base par tracker
    const baseCostPerTracker = budgetConfig.desiredSalaryPerMatch > 0
      ? budgetConfig.desiredSalaryPerMatch
      : matchDurationHours * budgetConfig.basePayPerHour;
    
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
    const totalEvents = getTotalEvents();
    
    return {
      costPerEvent: Math.round(costs.perMatch / totalEvents),
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

  // ========== START: UPDATED HELPER FUNCTION FOR ROLE DISPLAY ==========
  const getRoleDisplayName = (role: Founder['role']) => {
    switch (role) {
      case 'founder':
        return 'Fondateur';
      case 'co-founder':
        return 'Co-fondateur';
      case 'investor':
        return 'Investisseur';
      case 'technical':
        return 'Resp. Opérations Football';
      case 'advisor':
        return 'Conseiller';
      default:
        return 'Partenaire';
    }
  };
  // ========== END: UPDATED HELPER FUNCTION FOR ROLE DISPLAY ==========


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
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="pitch">Pitch Startup</TabsTrigger>
          <TabsTrigger value="goals">Objectifs</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="founders">Fondateurs</TabsTrigger>
          <TabsTrigger value="match-planning">Planification</TabsTrigger>
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
                    <p className="text-2xl font-bold text-foreground">{getTotalEvents()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Événements/Minute</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(getTotalEvents() / matchSimulation.duration).toFixed(1)}
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
                    <Label htmlFor="desiredSalaryPerMatch">Salaire par match/tracker souhaité (DZD)</Label>
                    <Input
                      id="desiredSalaryPerMatch"
                      type="number"
                      value={budgetConfig.desiredSalaryPerMatch}
                      onChange={(e) => setBudgetConfig({
                        ...budgetConfig,
                        desiredSalaryPerMatch: Number(e.target.value)
                      })}
                    />
                  </div>
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
                      disabled={budgetConfig.desiredSalaryPerMatch > 0}
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
                    <Label>Total Événements (Calculé)</Label>
                    <div className="p-2 bg-muted rounded text-center font-bold">
                      {getTotalEvents()}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Trackers Optimal</Label>
                    <Input
                      type="number"
                      value={matchSimulation.trackersOptimal}
                      onChange={(e) => setMatchSimulation(prev => ({
                        ...prev,
                        trackersOptimal: parseInt(e.target.value) || 0
                      }))}
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
                    <Label>Remplacements</Label>
                    <Input
                      type="number"
                      value={matchSimulation.replacements}
                      onChange={(e) => setMatchSimulation(prev => ({
                        ...prev,
                        replacements: parseInt(e.target.value) || 0
                      }))}
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
                        <td className="p-2">{Math.round(event.frequency / 10)}s</td>
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
                     <p className="text-muted-foreground">Fréquence Moyenne</p>
                     <p className="font-bold">{(eventTypes.reduce((sum, e) => sum + e.frequency, 0) / eventTypes.length).toFixed(1)}/match</p>
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

        <TabsContent value="match-planning" className="space-y-6">
          <div className="grid gap-6">
            {/* Match Planning Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Paramètres de Planification des Matchs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <Label>Durée du match (minutes)</Label>
                    <Input
                      type="number"
                      value={matchSimulation.duration}
                      onChange={(e) => setMatchSimulation(prev => ({
                        ...prev,
                        duration: parseInt(e.target.value) || 90
                      }))}
                    />
                  </div>
                   <div className="space-y-4">
                     <Label>Nombre total d'événements (calculé)</Label>
                     <div className="flex items-center gap-2">
                       <Input
                         type="number"
                         value={eventTypes.reduce((sum, et) => sum + et.frequency, 0)}
                         disabled
                         className="bg-muted"
                       />
                       <Badge variant="outline" className="text-xs">
                         Auto-calculé
                       </Badge>
                     </div>
                     <p className="text-xs text-muted-foreground">
                       Basé sur la configuration des types d'événements ci-dessous
                     </p>
                   </div>
                  <div className="space-y-4">
                    <Label>Joueurs à tracker</Label>
                    <Input
                      type="number"
                      value={matchSimulation.playersToTrack}
                      onChange={(e) => setMatchSimulation(prev => ({
                        ...prev,
                        playersToTrack: parseInt(e.target.value) || 22
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <Label>Trackers minimum requis</Label>
                    <Input
                      type="number"
                      value={matchSimulation.trackersMinimum}
                      onChange={(e) => setMatchSimulation(prev => ({
                        ...prev,
                        trackersMinimum: parseInt(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label>Trackers optimal</Label>
                    <Input
                      type="number"
                      value={matchSimulation.trackersOptimal}
                      onChange={(e) => setMatchSimulation(prev => ({
                        ...prev,
                        trackersOptimal: parseInt(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label>Remplacements prévus</Label>
                    <Input
                      type="number"
                      value={matchSimulation.replacements}
                      onChange={(e) => setMatchSimulation(prev => ({
                        ...prev,
                        replacements: parseInt(e.target.value) || 0
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Trackers requis pour tous les matchs mensuels</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 bg-muted rounded text-center">
                        <p className="text-sm text-muted-foreground">Minimum</p>
                        <p className="font-bold">{matchSimulation.trackersMinimum * matchSimulation.matchFrequency}</p>
                      </div>
                      <div className="p-2 bg-muted rounded text-center">
                        <p className="text-sm text-muted-foreground">Optimal</p>
                        <p className="font-bold">{matchSimulation.trackersOptimal * matchSimulation.matchFrequency}</p>
                      </div>
                      <div className="p-2 bg-muted rounded text-center">
                        <p className="text-sm text-muted-foreground">Remplacements</p>
                        <p className="font-bold">{matchSimulation.replacements * matchSimulation.matchFrequency}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label>Fréquence des matchs par mois</Label>
                    <Input
                      type="number"
                      value={matchSimulation.matchFrequency}
                      onChange={(e) => setMatchSimulation(prev => ({
                        ...prev,
                        matchFrequency: parseInt(e.target.value) || 15
                      }))}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label>Durée de la saison (mois)</Label>
                    <Input
                      type="number"
                      value={matchSimulation.seasonDuration}
                      onChange={(e) => setMatchSimulation(prev => ({
                        ...prev,
                        seasonDuration: parseInt(e.target.value) || 9
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resource Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Exigences en Ressources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-medium">Équipe Humaine</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p>Trackers minimum: {matchSimulation.trackersMinimum}</p>
                      <p>Trackers optimal: {matchSimulation.trackersOptimal}</p>
                      <p>Remplacements: {matchSimulation.replacements}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Charge de Travail</span>
                    </div>
                     <div className="space-y-1 text-sm">
                       <p>Durée: {matchSimulation.duration} min</p>
                       <p>Événements: {eventTypes.reduce((sum, et) => sum + et.frequency, 0)}</p>
                       <p>Événements/tracker: {Math.round(getTotalEvents() / matchSimulation.trackersOptimal)}</p>
                     </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Fréquence</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p>Matchs/mois: {matchSimulation.matchFrequency}</p>
                      <p>Saison: {matchSimulation.seasonDuration} mois</p>
                      <p>Total saison: {matchSimulation.matchFrequency * matchSimulation.seasonDuration} matchs</p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Complexité</span>
                    </div>
                     <div className="space-y-1 text-sm">
                       <p>Score: {Math.round(calculateComplexityScore() / eventTypes.reduce((sum, et) => sum + et.frequency, 0) * 10) / 10}</p>
                       <p>Difficulté: {calculateComplexityScore() > 2000 ? 'Élevée' : calculateComplexityScore() > 1500 ? 'Moyenne' : 'Faible'}</p>
                       <p>Précision: {Math.round(eventTypes.reduce((sum, et) => sum + et.detectionRate, 0) / eventTypes.length)}%</p>
                     </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technology and Equipment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Technologie et Équipement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Équipement par Tracker</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Tablette/Laptop</span>
                        <Badge variant="outline">Requis</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Casque audio</span>
                        <Badge variant="outline">Requis</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Souris</span>
                        <Badge variant="outline">Recommandé</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Connexion internet</span>
                        <Badge variant="outline">Critique</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Logiciel tracking</span>
                        <Badge variant="outline">Licence</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Spécifications Techniques</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>RAM minimum:</span>
                        <span>8GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processeur:</span>
                        <span>i5 ou équivalent</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Écran:</span>
                        <span>15" minimum</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stockage:</span>
                        <span>256GB SSD</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bande passante:</span>
                        <span>50 Mbps minimum</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Métriques de Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {(() => {
                    const metrics = calculateEfficiencyMetrics();
                    return (
                      <>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Coût par Événement</p>
                          <p className="text-lg font-bold">{formatCurrency(metrics.costPerEvent)}</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Coût par Minute</p>
                          <p className="text-lg font-bold">{formatCurrency(metrics.costPerMinute)}</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Coût par Joueur</p>
                          <p className="text-lg font-bold">{formatCurrency(metrics.costPerPlayer)}</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Taux Horaire/Tracker</p>
                          <p className="text-lg font-bold">{formatCurrency(metrics.hourlyRatePerTracker)}</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Efficacité Complexité</p>
                          <p className="text-lg font-bold">{metrics.complexityEfficiency}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Event Types Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Configuration des Types d'Événements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {eventTypes.map((eventType) => (
                      <div key={eventType.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <h5 className="font-medium">{eventType.name}</h5>
                          <Badge variant={eventType.difficultyScore > 6 ? 'destructive' : eventType.difficultyScore > 4 ? 'default' : 'secondary'}>
                            Difficulté: {eventType.difficultyScore}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Taux détection:</span>
                            <span>{eventType.detectionRate}%</span>
                          </div>
                           <div className="flex justify-between">
                             <span>Fréquence:</span>
                             <span>{eventType.frequency}/match</span>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Résumé des Coûts de Planification
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const costs = calculateMonthlyAndSeasonalCosts();
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-6 bg-primary/5 rounded-lg">
                        <h4 className="font-semibold text-primary">Par Match</h4>
                        <p className="text-2xl font-bold mt-2">{formatCurrency(costs.perMatch)}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {matchSimulation.trackersOptimal} trackers × {matchSimulation.duration} min
                        </p>
                      </div>
                      <div className="text-center p-6 bg-secondary/5 rounded-lg">
                        <h4 className="font-semibold text-secondary-foreground">Par Mois</h4>
                        <p className="text-2xl font-bold mt-2">{formatCurrency(costs.monthly)}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {matchSimulation.matchFrequency} matchs/mois
                        </p>
                      </div>
                      <div className="text-center p-6 bg-accent/5 rounded-lg">
                        <h4 className="font-semibold text-accent-foreground">Par Saison</h4>
                        <p className="text-2xl font-bold mt-2">{formatCurrency(costs.seasonal)}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {matchSimulation.seasonDuration} mois de saison
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
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
                              {/* ========== START: USING THE NEW DISPLAY NAME FUNCTION ========== */}
                              {getRoleDisplayName(founder.role)}
                              {/* ========== END: USING THE NEW DISPLAY NAME FUNCTION ========== */}
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

            {/* Detailed Job Descriptions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Fiches de Poste Détaillées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {founders.map((founder) => (
                    <div key={founder.id} className="border rounded-lg p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-primary">{founder.name}</h3>
                        <p className="text-muted-foreground">
                          {/* ========== START: UPDATED JOB TITLE DISPLAY ========== */}
                          {founder.role === 'founder' ? 'Fondateur - Direction Générale' : 
                           founder.role === 'technical' ? 'Manager Technique & Responsable des Opérations Football' : 
                           founder.role === 'co-founder' ? 'Co-fondateur - Développement et Opérations' :
                           'Partenaire Stratégique'}
                           {/* ========== END: UPDATED JOB TITLE DISPLAY ========== */}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3 text-sm uppercase tracking-wide">Responsabilités Principales</h4>
                          <ul className="space-y-2 text-sm">
                            {founder.role === 'founder' && ( // HOUDACHE Zakaria - Fondateur
                              <>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                  Direction générale et vision stratégique de l'entreprise
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                  Développement commercial et acquisition de nouveaux clients
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                  Gestion des partenariats stratégiques avec les clubs
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                  Supervision financière et budgétaire
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                  Représentation externe et networking
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                  Prise de décisions stratégiques majeures
                                </li>
                              </>
                            )}
                            {/* ========== START: UPDATED ISLAM'S JOB DESCRIPTION ========== */}
                            {founder.role === 'technical' && ( // ISLAM
                              <>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                  Gérer la liaison stratégique avec la FAF et les clubs professionnels.
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                  Diriger la formation et la supervision des analystes vidéo (trackers).
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                  Développer et superviser les protocoles de tracking et la qualité des données.
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                  Agir comme interface technique principale avec les staffs des clubs clients.
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                  Assurer l'adéquation du produit avec les besoins tactiques du football algérien.
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                  Piloter l'amélioration continue des processus opérationnels sur le terrain.
                                </li>
                              </>
                            )}
                            {/* ========== END: UPDATED ISLAM'S JOB DESCRIPTION ========== */}
                            {founder.role === 'co-founder' && ( // FERROUDJE Cherif - Co-fondateur
                              <>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                  Développement produit et innovation technologique
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                  Gestion des opérations quotidiennes
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                  Support aux équipes terrain
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                  Coordination avec les partenaires techniques
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                  Veille concurrentielle et technologique
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                  Gestion des ressources humaines
                                </li>
                              </>
                            )}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3 text-sm uppercase tracking-wide">Compétences Requises</h4>
                          <ul className="space-y-2 text-sm">
                            {founder.role === 'founder' && (
                              <>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
                                  Leadership et management d'équipe
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
                                  Vision business et stratégique
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
                                  Négociation commerciale
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
                                  Gestion financière
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
                                  Communication et présentation
                                </li>
                              </>
                            )}
                            {/* ========== START: UPDATED ISLAM'S SKILLS ========== */}
                            {founder.role === 'technical' && (
                              <>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
                                  Réseautage institutionnel (FAF, clubs)
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
                                  Expertise tactique et analyse vidéo professionnelle
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
                                  Formation et pédagogie pour analystes
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
                                  Contrôle qualité et méthodologie de collecte de données
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
                                  Communication et négociation dans le milieu sportif
                                </li>
                              </>
                            )}
                            {/* ========== END: UPDATED ISLAM'S SKILLS ========== */}
                            {founder.role === 'co-founder' && (
                              <>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
                                  Innovation et développement produit
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
                                  Gestion opérationnelle
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
                                  Coordination d'équipes
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
                                  Analyse et optimisation de processus
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
                                  Gestion de projet et planification
                                </li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-lg font-semibold text-primary">{founder.equityPercentage}%</div>
                            <div className="text-xs text-muted-foreground">Participation</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-green-600">{formatCurrency(founder.expectedROI * 1000)}</div>
                            <div className="text-xs text-muted-foreground">Profit/mois estimé</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-blue-600">{formatCurrency(founder.monthlyContribution)}</div>
                            <div className="text-xs text-muted-foreground">Contribution/mois</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-purple-600">
                              {founder.role === 'founder' ? '40h' : founder.role === 'technical' ? '35h' : '30h'}/sem
                            </div>
                            <div className="text-xs text-muted-foreground">Temps de travail</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            {/* Financial Simulation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Simulation Financière (5 ans)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-4">Contrôles de Simulation</h4>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeInvestors"
                        checked={includeInvestors}
                        onChange={(e) => setIncludeInvestors(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="includeInvestors" className="text-sm">Inclure les investisseurs</label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="founder"
                        checked={activePositions.founder}
                        onChange={() => togglePosition('founder')}
                        className="rounded"
                      />
                      <label htmlFor="founder" className="text-xs">Fondateur</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="technicalManager"
                        checked={activePositions.technicalManager}
                        onChange={() => togglePosition('technicalManager')}
                        className="rounded"
                      />
                      <label htmlFor="technicalManager" className="text-xs">Manager Tech</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="cofounder"
                        checked={activePositions.cofounder}
                        onChange={() => togglePosition('cofounder')}
                        className="rounded"
                      />
                      <label htmlFor="cofounder" className="text-xs">Co-fondateur</label>
                    </div>
                    {includeInvestors && (
                      <>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="investor1"
                            checked={activePositions.investor1}
                            onChange={() => togglePosition('investor1')}
                            className="rounded"
                          />
                          <label htmlFor="investor1" className="text-xs">Investisseur 1</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="investor2"
                            checked={activePositions.investor2}
                            onChange={() => togglePosition('investor2')}
                            className="rounded"
                          />
                          <label htmlFor="investor2" className="text-xs">Investisseur 2</label>
                        </div>
                      </>
                    )}
                  </div>
                </div>

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
                            Distribution basée sur les parts d'équité actives
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
                {founders.filter((founder, index) => {
                  if (founder.role === 'founder' && index === 0) return activePositions.founder;
                  if (founder.role === 'co-founder' && index === 1) return activePositions.technicalManager;
                  if (founder.role === 'co-founder' && index === 2) return activePositions.cofounder;
                  if (founder.role === 'investor' && index === 3) return includeInvestors && activePositions.investor1;
                  if (founder.role === 'investor' && index === 4) return includeInvestors && activePositions.investor2;
                  return true;
                }).map((founder) => (
                  <div key={founder.id} className="border rounded-lg p-4">
                    <div className="text-center mb-3">
                      <h4 className="font-semibold">{founder.name}</h4>
                      <Badge variant="outline" className="text-xs mt-1">
                        {founder.equityPercentage}% d'équité
                      </Badge>
                      <Badge 
                        variant={founder.role === 'investor' ? 'secondary' : 'default'} 
                        className="text-xs ml-1"
                      >
                        {getRoleDisplayName(founder.role)}
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
