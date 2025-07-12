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
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import StartupPitchPresentation from './StartupPitchPresentation';

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

  // Nouvelle configuration pour les événements
  const [eventTypes, setEventTypes] = useState<EventTypeConfig[]>([
    { id: '1', name: 'But', difficultyScore: 3, detectionRate: 95, timeRequired: 15 },
    { id: '2', name: 'Passe', difficultyScore: 2, detectionRate: 85, timeRequired: 5 },
    { id: '3', name: 'Tir', difficultyScore: 4, detectionRate: 90, timeRequired: 10 },
    { id: '4', name: 'Faute', difficultyScore: 6, detectionRate: 70, timeRequired: 12 },
    { id: '5', name: 'Hors-jeu', difficultyScore: 8, detectionRate: 65, timeRequired: 20 },
    { id: '6', name: 'Carton', difficultyScore: 2, detectionRate: 98, timeRequired: 8 },
    { id: '7', name: 'Corner', difficultyScore: 3, detectionRate: 92, timeRequired: 6 },
    { id: '8', name: 'Duel aérien', difficultyScore: 7, detectionRate: 75, timeRequired: 18 }
  ]);

  // Configuration budget trackers
  const [budgetConfig, setBudgetConfig] = useState<TrackerBudgetConfig>({
    basePayPerHour: 1500, // DZD par heure
    difficultyMultiplier: 1.2,
    overtimeRate: 1.5,
    transportAllowance: 2000, // DZD par match
    equipmentCost: 500, // DZD par match
    socialCharges: 25 // pourcentage
  });

  // Simulation de match
  const [matchSimulation, setMatchSimulation] = useState({
    duration: 90, // minutes
    totalEvents: 616,
    trackersMinimum: 2,
    trackersOptimal: 3,
    playersToTrack: 22,
    replacements: 1
  });

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

  // Calculs pour l'analyse budgétaire
  const calculateComplexityScore = () => {
    const totalComplexity = eventTypes.reduce((sum, event) => 
      sum + (event.difficultyScore * (matchSimulation.totalEvents / eventTypes.length)), 0
    );
    return Math.round(totalComplexity);
  };

  const calculateTrackerCost = () => {
    const matchDurationHours = matchSimulation.duration / 60;
    const complexityScore = calculateComplexityScore();
    const complexityFactor = (complexityScore / 1000) * budgetConfig.difficultyMultiplier;
    
    const baseCost = matchSimulation.trackersOptimal * matchDurationHours * budgetConfig.basePayPerHour;
    const complexityCost = baseCost * complexityFactor;
    const transportCost = matchSimulation.trackersOptimal * budgetConfig.transportAllowance;
    const equipmentCost = matchSimulation.trackersOptimal * budgetConfig.equipmentCost;
    
    const subtotal = baseCost + complexityCost + transportCost + equipmentCost;
    const socialChargesCost = subtotal * (budgetConfig.socialCharges / 100);
    
    return Math.round(subtotal + socialChargesCost);
  };

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
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="pitch">Pitch Startup</TabsTrigger>
          <TabsTrigger value="goals">Objectifs</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
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
                      {formatCurrency(calculateTrackerCost())}
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
          {/* Analyse des Événements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  📊 Analyse des Événements
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
          </div>

          {/* Coûts par Match */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                💰 Coûts par Match
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Coût Total</h4>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(calculateTrackerCost())}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Pour {matchSimulation.trackersOptimal} trackers
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Détail des Coûts</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Salaire de base:</span>
                      <span>{formatCurrency(matchSimulation.trackersOptimal * (matchSimulation.duration / 60) * budgetConfig.basePayPerHour)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prime complexité:</span>
                      <span>{formatCurrency(Math.round(matchSimulation.trackersOptimal * (matchSimulation.duration / 60) * budgetConfig.basePayPerHour * (calculateComplexityScore() / 1000) * budgetConfig.difficultyMultiplier))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transport:</span>
                      <span>{formatCurrency(matchSimulation.trackersOptimal * budgetConfig.transportAllowance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Équipement:</span>
                      <span>{formatCurrency(matchSimulation.trackersOptimal * budgetConfig.equipmentCost)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span>Charges sociales ({budgetConfig.socialCharges}%):</span>
                      <span>{formatCurrency(Math.round((calculateTrackerCost() / (1 + budgetConfig.socialCharges / 100)) * (budgetConfig.socialCharges / 100)))}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Rentabilité</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Coût par événement:</span>
                      <span>{formatCurrency(Math.round(calculateTrackerCost() / matchSimulation.totalEvents))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coût par minute:</span>
                      <span>{formatCurrency(Math.round(calculateTrackerCost() / matchSimulation.duration))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coût par tracker/heure:</span>
                      <span>{formatCurrency(Math.round(calculateTrackerCost() / (matchSimulation.trackersOptimal * matchSimulation.duration / 60)))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration des Paramètres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration Budget
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="basePayPerHour">Salaire/Heure (DZD)</Label>
                    <Input
                      id="basePayPerHour"
                      type="number"
                      value={budgetConfig.basePayPerHour}
                      onChange={(e) => setBudgetConfig({
                        ...budgetConfig,
                        basePayPerHour: Number(e.target.value)
                      })}
                    />
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
                  </div>
                  <div>
                    <Label htmlFor="transportAllowance">Indemnité Transport (DZD)</Label>
                    <Input
                      id="transportAllowance"
                      type="number"
                      value={budgetConfig.transportAllowance}
                      onChange={(e) => setBudgetConfig({
                        ...budgetConfig,
                        transportAllowance: Number(e.target.value)
                      })}
                    />
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
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Configuration Match
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
                    <Label htmlFor="playersToTrack">Joueurs à Suivre</Label>
                    <Input
                      id="playersToTrack"
                      type="number"
                      value={matchSimulation.playersToTrack}
                      onChange={(e) => setMatchSimulation({
                        ...matchSimulation,
                        playersToTrack: Number(e.target.value)
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Types d'Événements et Difficulté */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Configuration des Types d'Événements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Type d'Événement</th>
                      <th className="text-left p-2">Score Difficulté</th>
                      <th className="text-left p-2">Taux Détection (%)</th>
                      <th className="text-left p-2">Temps Requis (sec)</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventTypes.map((event) => (
                      <tr key={event.id} className="border-b">
                        <td className="p-2 font-medium">{event.name}</td>
                        <td className="p-2">
                          <Badge variant={
                            event.difficultyScore <= 3 ? 'default' :
                            event.difficultyScore <= 6 ? 'secondary' : 'destructive'
                          }>
                            {event.difficultyScore}
                          </Badge>
                        </td>
                        <td className="p-2">{event.detectionRate}%</td>
                        <td className="p-2">{event.timeRequired}s</td>
                        <td className="p-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
      </Tabs>
    </div>
  );
};

export default BusinessPlanManagement;
