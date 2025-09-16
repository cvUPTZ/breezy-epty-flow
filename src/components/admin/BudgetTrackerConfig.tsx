
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { EVENT_TYPES, EVENT_TYPE_LABELS } from '@/constants/eventTypes';
import { 
  Calculator, 
  Settings, 
  TrendingUp, 
  Users, 
  Clock,
  Target,
  DollarSign,
  BarChart3,
  Scale,
  FileText,
  Shield,
  Building,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

/**
 * @interface EventConfig
 * @description Defines the configuration for a single trackable event type.
 */
interface EventConfig {
  type: string;
  difficulty: number;
  detectionRate: number;
  avgTimeSeconds: number;
  costImpact: number;
}

/**
 * @interface FinancialProjection
 * @description Represents the financial data for a single year in a multi-year projection.
 */
interface FinancialProjection {
  year: number;
  clients: number;
  revenue: number;
  costs: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
  cashFlow: number;
}

/**
 * @interface LegalRequirement
 * @description Represents a single legal or regulatory requirement for the business.
 */
interface LegalRequirement {
  category: string;
  requirement: string;
  status: 'completed' | 'in_progress' | 'pending';
  priority: 'high' | 'medium' | 'low';
  estimatedCost: number;
  description: string;
}

/**
 * @component BudgetTrackerConfig
 * @description A comprehensive financial and business modeling dashboard.
 * It allows for detailed configuration of operational, business, and legal parameters
 * to generate multi-year financial projections, pricing models, and cost analyses.
 * This component acts as the central business logic calculator for the platform.
 * @returns {React.FC} A React functional component.
 */
const BudgetTrackerConfig: React.FC = () => {
  // Configuration des salaires et charges
  const [salaryConfig, setSalaryConfig] = useState({
    baseSalaryPerHour: 1500, // DZD/h
    complexityMultiplier: 1.3,
    transportPerMatch: 2500, // DZD
    socialCharges: 26, // %
    equipmentPerMatch: 800, // DZD
    overtimeRate: 1.5
  });

  // Configuration match et saison
  const [matchConfig, setMatchConfig] = useState({
    matchDuration: 90, // minutes
    optimalTrackers: 7,
    matchesPerMonth: 16,
    seasonDuration: 10, // mois
    replacements: 3
  });

  // Configuration business
  const [businessConfig, setBusinessConfig] = useState({
    marketingBudget: 50000, // DZD/mois
    developmentCosts: 120000, // DZD/mois
    officeRent: 80000, // DZD/mois
    utilities: 15000, // DZD/mois
    insurance: 25000, // DZD/mois
    legalFees: 30000, // DZD/mois
    softwareLicenses: 40000, // DZD/mois
    clientAcquisitionCost: 15000, // DZD par client
    churnRate: 0.05 // 5% mensuel
  });

  // Configuration des types d'événements avec difficultés réalistes sur 100
  const eventConfigs: EventConfig[] = EVENT_TYPES.map(eventType => {
    const difficultyMap: { [key: string]: number } = {
      'goal': 25, 'pass': 15, 'shot': 35, 'tackle': 40, 'foul': 45,
      'corner': 20, 'offside': 75, 'yellowCard': 30, 'redCard': 30,
      'substitution': 20, 'cross': 25, 'dribble': 55, 'interception': 45,
      'clearance': 25, 'save': 35, 'aerialDuel': 60, 'groundDuel': 50,
      'ballRecovered': 35, 'ballLost': 35, 'assist': 50, 'throwIn': 15,
      'freeKick': 25, 'penalty': 20, 'goalKick': 15
    };
    
    return {
      type: eventType,
      difficulty: difficultyMap[eventType] || 30,
      detectionRate: Math.max(70, 100 - (difficultyMap[eventType] || 30) * 0.4),
      avgTimeSeconds: Math.max(3, Math.min(20, (difficultyMap[eventType] || 30) / 5 + 2)),
      costImpact: 30 + (difficultyMap[eventType] || 30) * 0.8
    };
  });

  // Configuration juridique
  const [legalRequirements, setLegalRequirements] = useState<LegalRequirement[]>([
    {
      category: 'Constitution Société',
      requirement: 'Création SARL/SPA',
      status: 'pending',
      priority: 'high',
      estimatedCost: 150000,
      description: 'Création de la société avec capital minimum et statuts'
    },
    {
      category: 'Propriété Intellectuelle',
      requirement: 'Dépôt Marque INAPI',
      status: 'pending',
      priority: 'high',
      estimatedCost: 25000,
      description: 'Protection de la marque et du nom commercial'
    },
    {
      category: 'Licences & Autorisations',
      requirement: 'Agrément ARPCE',
      status: 'pending',
      priority: 'medium',
      estimatedCost: 100000,
      description: 'Autorisation pour services de communication électronique'
    },
    {
      category: 'Protection Données',
      requirement: 'Conformité GDPR Local',
      status: 'in_progress',
      priority: 'high',
      estimatedCost: 80000,
      description: 'Mise en conformité avec la réglementation sur les données personnelles'
    },
    {
      category: 'Contrats',
      requirement: 'CGV/CGU',
      status: 'in_progress',
      priority: 'medium',
      estimatedCost: 50000,
      description: 'Rédaction des conditions générales de vente et d\'utilisation'
    },
    {
      category: 'Assurances',
      requirement: 'RC Professionnelle',
      status: 'pending',
      priority: 'high',
      estimatedCost: 120000,
      description: 'Assurance responsabilité civile professionnelle annuelle'
    },
    {
      category: 'Fiscal',
      requirement: 'Régime TVA',
      status: 'pending',
      priority: 'medium',
      estimatedCost: 30000,
      description: 'Inscription au régime de TVA et déclarations'
    },
    {
      category: 'Social',
      requirement: 'CNAS/CASNOS',
      status: 'pending',
      priority: 'high',
      estimatedCost: 40000,
      description: 'Inscription sécurité sociale et cotisations'
    }
  ]);

  // Calculs automatiques
  const calculations = useMemo(() => {
    // Événements approximatifs par match basés sur les vrais EVENT_TYPES
    const eventFrequencies: { [key: string]: number } = {
      pass: 180, shot: 12, tackle: 25, foul: 18, corner: 8, offside: 3,
      goal: 2, assist: 2, yellowCard: 4, redCard: 0.3, substitution: 6,
      cross: 15, dribble: 20, interception: 12, clearance: 18, save: 8,
      aerialDuel: 25, groundDuel: 30, ballRecovered: 35, ballLost: 35,
      throwIn: 15, freeKick: 12, penalty: 0.5, goalKick: 20
    };

    const totalEvents = EVENT_TYPES.reduce((sum, eventType) => {
      return sum + (eventFrequencies[eventType] || 5);
    }, 0);
    
    // Calcul difficulté moyenne pondérée
    const avgDifficulty = eventConfigs.reduce((sum, config) => {
      const frequency = eventFrequencies[config.type] || 5;
      return sum + (config.difficulty * frequency);
    }, 0) / totalEvents;

    // Coûts par match
    const baseHourlyRate = salaryConfig.baseSalaryPerHour;
    const complexHourlyRate = baseHourlyRate * salaryConfig.complexityMultiplier;
    const matchHours = matchConfig.matchDuration / 60;
    const trackerCostPerMatch = complexHourlyRate * matchHours * matchConfig.optimalTrackers;
    
    const socialChargesCost = trackerCostPerMatch * (salaryConfig.socialCharges / 100);
    const totalCostPerMatch = trackerCostPerMatch + socialChargesCost + 
                             salaryConfig.transportPerMatch + salaryConfig.equipmentPerMatch;

    // Coûts mensuels et saisonniers
    const monthlyCosts = totalCostPerMatch * matchConfig.matchesPerMonth;
    const seasonalCosts = monthlyCosts * matchConfig.seasonDuration;

    return {
      totalEvents,
      avgDifficulty: Math.round(avgDifficulty * 100) / 100,
      difficultyScore: Math.round(avgDifficulty),
      trackerCostPerMatch,
      socialChargesCost,
      totalCostPerMatch,
      monthlyCosts,
      seasonalCosts
    };
  }, [salaryConfig, matchConfig, eventConfigs]);

  // Calcul des prix d'abonnement avec marges
  const pricingCalculations = useMemo(() => {
    const monthlyCost = calculations.monthlyCosts;
    
    // Marges différenciées par type d'abonnement
    const basicMargin = 0.35; // 35%
    const premiumMargin = 0.65; // 65%
    const enterpriseMargin = 0.80; // 80%

    const basicPrice = Math.round(monthlyCost * (1 + basicMargin));
    const premiumPrice = Math.round(monthlyCost * (1 + premiumMargin));
    const enterprisePrice = Math.round(monthlyCost * (1 + enterpriseMargin));

    // Prix par match pour pay-per-use
    const payPerMatchPrice = Math.round(calculations.totalCostPerMatch * 1.45); // 45% marge

    return {
      basicPrice,
      premiumPrice,
      enterprisePrice,
      payPerMatchPrice,
      basicMargin: basicMargin * 100,
      premiumMargin: premiumMargin * 100,
      enterpriseMargin: enterpriseMargin * 100,
      payPerMatchMargin: 45
    };
  }, [calculations]);

  // Projections financières sur 5 ans
  const financialProjections = useMemo((): FinancialProjection[] => {
    const projections: FinancialProjection[] = [];
    
    for (let year = 1; year <= 5; year++) {
      const baseClients = year === 1 ? 5 : projections[year - 2].clients;
      const clientGrowth = year === 1 ? 5 : Math.round(baseClients * (year <= 2 ? 2.5 : year <= 3 ? 2.0 : 1.5));
      const clients = Math.min(clientGrowth, year * 50); // Plafond réaliste
      
      const avgRevenuePerClient = (pricingCalculations.basicPrice * 0.3 + 
                                  pricingCalculations.premiumPrice * 0.5 + 
                                  pricingCalculations.enterprisePrice * 0.2) * 12;
      
      const revenue = clients * avgRevenuePerClient;
      
      const operationalCosts = calculations.seasonalCosts * (clients / 10); // Scaling costs
      const fixedExpenses = (businessConfig.marketingBudget + 
                           businessConfig.developmentCosts + 
                           businessConfig.officeRent + 
                           businessConfig.utilities + 
                           businessConfig.insurance + 
                           businessConfig.legalFees + 
                           businessConfig.softwareLicenses) * 12;
      
      const totalCosts = operationalCosts;
      const totalExpenses = fixedExpenses + (businessConfig.clientAcquisitionCost * Math.max(0, clients - baseClients));
      
      const grossProfit = revenue - totalCosts;
      const netProfit = grossProfit - totalExpenses;
      const cashFlow = year === 1 ? netProfit : projections[year - 2].cashFlow + netProfit;
      
      projections.push({
        year,
        clients,
        revenue,
        costs: totalCosts,
        grossProfit,
        expenses: totalExpenses,
        netProfit,
        cashFlow
      });
    }
    
    return projections;
  }, [calculations, pricingCalculations, businessConfig]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const updateLegalRequirement = (index: number, field: keyof LegalRequirement, value: any) => {
    setLegalRequirements(prev => prev.map((req, i) => 
      i === index ? { ...req, [field]: value } : req
    ));
  };

  const totalLegalCosts = legalRequirements.reduce((sum, req) => sum + req.estimatedCost, 0);
  const completedRequirements = legalRequirements.filter(req => req.status === 'completed').length;
  const legalProgress = (completedRequirements / legalRequirements.length) * 100;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="h-8 w-8 text-primary" />
            Configuration Budget Tracker - Modèle Financier Complet
          </h1>
          <p className="text-muted-foreground">
            Paramètres financiers, opérationnels et juridiques basés sur {EVENT_TYPES.length} types d'événements
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {EVENT_TYPES.length} Types d'Événements
        </Badge>
      </div>

      {/* Configuration Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Salaires & Charges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Salaires & Charges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label>Salaire Base/Heure (DZD)</Label>
                <Input
                  type="number"
                  value={salaryConfig.baseSalaryPerHour}
                  onChange={(e) => setSalaryConfig(prev => ({
                    ...prev,
                    baseSalaryPerHour: Number(e.target.value)
                  }))}
                />
              </div>
              <div>
                <Label>Multiplicateur Complexité</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={salaryConfig.complexityMultiplier}
                  onChange={(e) => setSalaryConfig(prev => ({
                    ...prev,
                    complexityMultiplier: Number(e.target.value)
                  }))}
                />
              </div>
              <div>
                <Label>Transport/Match (DZD)</Label>
                <Input
                  type="number"
                  value={salaryConfig.transportPerMatch}
                  onChange={(e) => setSalaryConfig(prev => ({
                    ...prev,
                    transportPerMatch: Number(e.target.value)
                  }))}
                />
              </div>
              <div>
                <Label>Charges Sociales (%)</Label>
                <Input
                  type="number"
                  value={salaryConfig.socialCharges}
                  onChange={(e) => setSalaryConfig(prev => ({
                    ...prev,
                    socialCharges: Number(e.target.value)
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Match */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              Match & Saison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label>Durée Match (min)</Label>
                <Input
                  type="number"
                  value={matchConfig.matchDuration}
                  onChange={(e) => setMatchConfig(prev => ({
                    ...prev,
                    matchDuration: Number(e.target.value)
                  }))}
                />
              </div>
              <div>
                <Label>Trackers Optimal</Label>
                <Input
                  type="number"
                  value={matchConfig.optimalTrackers}
                  onChange={(e) => setMatchConfig(prev => ({
                    ...prev,
                    optimalTrackers: Number(e.target.value)
                  }))}
                />
              </div>
              <div>
                <Label>Matchs/Mois</Label>
                <Input
                  type="number"
                  value={matchConfig.matchesPerMonth}
                  onChange={(e) => setMatchConfig(prev => ({
                    ...prev,
                    matchesPerMonth: Number(e.target.value)
                  }))}
                />
              </div>
              <div>
                <Label>Durée Saison (mois)</Label>
                <Input
                  type="number"
                  value={matchConfig.seasonDuration}
                  onChange={(e) => setMatchConfig(prev => ({
                    ...prev,
                    seasonDuration: Number(e.target.value)
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Business */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              Charges Business
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label>Marketing/Mois (DZD)</Label>
                <Input
                  type="number"
                  value={businessConfig.marketingBudget}
                  onChange={(e) => setBusinessConfig(prev => ({
                    ...prev,
                    marketingBudget: Number(e.target.value)
                  }))}
                />
              </div>
              <div>
                <Label>Développement/Mois (DZD)</Label>
                <Input
                  type="number"
                  value={businessConfig.developmentCosts}
                  onChange={(e) => setBusinessConfig(prev => ({
                    ...prev,
                    developmentCosts: Number(e.target.value)
                  }))}
                />
              </div>
              <div>
                <Label>Loyer Bureau/Mois (DZD)</Label>
                <Input
                  type="number"
                  value={businessConfig.officeRent}
                  onChange={(e) => setBusinessConfig(prev => ({
                    ...prev,
                    officeRent: Number(e.target.value)
                  }))}
                />
              </div>
              <div>
                <Label>Coût Acquisition Client (DZD)</Label>
                <Input
                  type="number"
                  value={businessConfig.clientAcquisitionCost}
                  onChange={(e) => setBusinessConfig(prev => ({
                    ...prev,
                    clientAcquisitionCost: Number(e.target.value)
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modèle Financier Complet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-500" />
            Modèle Financier Complet - Projections 5 Ans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left p-3 font-semibold">Année</th>
                  <th className="text-right p-3 font-semibold">Clients</th>
                  <th className="text-right p-3 font-semibold">Revenus</th>
                  <th className="text-right p-3 font-semibold">Coûts Opé.</th>
                  <th className="text-right p-3 font-semibold">Marge Brute</th>
                  <th className="text-right p-3 font-semibold">Charges</th>
                  <th className="text-right p-3 font-semibold">Résultat Net</th>
                  <th className="text-right p-3 font-semibold">Cash Flow</th>
                  <th className="text-right p-3 font-semibold">Marge (%)</th>
                </tr>
              </thead>
              <tbody>
                {financialProjections.map((proj) => (
                  <tr key={proj.year} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">Année {proj.year}</td>
                    <td className="text-right p-3">{proj.clients}</td>
                    <td className="text-right p-3 text-green-600 font-medium">
                      {formatCurrency(proj.revenue)}
                    </td>
                    <td className="text-right p-3 text-red-600">
                      {formatCurrency(proj.costs)}
                    </td>
                    <td className="text-right p-3 text-blue-600 font-medium">
                      {formatCurrency(proj.grossProfit)}
                    </td>
                    <td className="text-right p-3 text-orange-600">
                      {formatCurrency(proj.expenses)}
                    </td>
                    <td className={`text-right p-3 font-bold ${proj.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(proj.netProfit)}
                    </td>
                    <td className={`text-right p-3 font-bold ${proj.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(proj.cashFlow)}
                    </td>
                    <td className="text-right p-3 font-medium">
                      {proj.revenue > 0 ? Math.round((proj.netProfit / proj.revenue) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border">
              <h4 className="font-semibold text-green-800 mb-2">Break-Even</h4>
              <p className="text-sm text-green-700">
                Rentabilité atteinte: Année {financialProjections.findIndex(p => p.netProfit > 0) + 1 || 'N/A'}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Seuil critique: ~{Math.ceil(calculations.monthlyCosts / pricingCalculations.premiumPrice)} clients Premium
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border">
              <h4 className="font-semibold text-blue-800 mb-2">ROI Prévisionnel</h4>
              <p className="text-sm text-blue-700">
                ROI An 5: {financialProjections[4]?.revenue > 0 ? 
                  Math.round((financialProjections[4].netProfit / financialProjections[0].expenses) * 100) : 0}%
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Cash Flow cumulé: {formatCurrency(financialProjections[4]?.cashFlow || 0)}
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border">
              <h4 className="font-semibold text-purple-800 mb-2">Valorisation Estimée</h4>
              <p className="text-sm text-purple-700">
                Valeur An 5: {formatCurrency((financialProjections[4]?.revenue || 0) * 3)}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Multiple x3 du CA (SaaS standard)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Juridique */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-purple-500" />
            Aspects Juridiques & Réglementaires
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Progression Globale</span>
                <span className="font-bold">{Math.round(legalProgress)}%</span>
              </div>
              <Progress value={legalProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {completedRequirements}/{legalRequirements.length} exigences complétées
              </p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-1">Coût Total Estimé</h4>
              <p className="text-lg font-bold text-red-700">{formatCurrency(totalLegalCosts)}</p>
              <p className="text-xs text-red-600">
                Investissement juridique initial
              </p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-1">Priorités Haute</h4>
              <p className="text-lg font-bold text-orange-700">
                {legalRequirements.filter(req => req.priority === 'high').length}
              </p>
              <p className="text-xs text-orange-600">
                Exigences critiques à traiter
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {legalRequirements.map((requirement, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
                    <div>
                      <h4 className="font-semibold text-sm">{requirement.category}</h4>
                      <p className="font-medium">{requirement.requirement}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {requirement.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <select
                        value={requirement.status}
                        onChange={(e) => updateLegalRequirement(index, 'status', e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="pending">En attente</option>
                        <option value="in_progress">En cours</option>
                        <option value="completed">Complété</option>
                      </select>
                      {requirement.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {requirement.status === 'in_progress' && <Clock className="h-4 w-4 text-yellow-500" />}
                      {requirement.status === 'pending' && <XCircle className="h-4 w-4 text-red-500" />}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <select
                        value={requirement.priority}
                        onChange={(e) => updateLegalRequirement(index, 'priority', e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="low">Basse</option>
                        <option value="medium">Moyenne</option>
                        <option value="high">Haute</option>
                      </select>
                      {requirement.priority === 'high' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    </div>
                    
                    <div className="text-right">
                      <Input
                        type="number"
                        value={requirement.estimatedCost}
                        onChange={(e) => updateLegalRequirement(index, 'estimatedCost', Number(e.target.value))}
                        className="text-sm w-full mb-1"
                      />
                      <p className="text-xs text-muted-foreground">DZD</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Recommandations Juridiques
            </h4>
            <ul className="text-sm text-blue-700 space-y-1 ml-4">
              <li>• Priorité absolue: Constitution société et protection marque</li>
              <li>• Consultation avocat spécialisé en droit des nouvelles technologies</li>
              <li>• Anticipation conformité GDPR pour expansion internationale</li>
              <li>• Négociation contrats cadre avec clubs de football professionels</li>
              <li>• Mise en place politique de confidentialité robuste</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Types d'Événements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            Types d'Événements - Paramètres Basés sur {EVENT_TYPES.length} Événements Réels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Difficulté Globale Moyenne</span>
              <span className="text-sm font-bold">{calculations.difficultyScore}/100</span>
            </div>
            <Progress value={calculations.difficultyScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Basé sur {calculations.totalEvents} événements moyens par match
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Type d'Événement</th>
                  <th className="text-center p-2">Difficulté (/100)</th>
                  <th className="text-center p-2">Détection (%)</th>
                  <th className="text-center p-2">Temps (sec)</th>
                  <th className="text-center p-2">Impact Coût</th>
                </tr>
              </thead>
              <tbody>
                {eventConfigs.slice(0, 15).map((config) => (
                  <tr key={config.type} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <Badge variant="outline" className="text-xs">
                        {EVENT_TYPE_LABELS[config.type as keyof typeof EVENT_TYPE_LABELS] || config.type}
                      </Badge>
                    </td>
                    <td className="text-center p-2">
                      <Badge 
                        variant={config.difficulty <= 30 ? "default" : config.difficulty <= 60 ? "secondary" : "destructive"}
                        className="w-16"
                      >
                        {config.difficulty}/100
                      </Badge>
                    </td>
                    <td className="text-center p-2">
                      <span className={`font-medium ${
                        config.detectionRate >= 90 ? 'text-green-600' : 
                        config.detectionRate >= 80 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {Math.round(config.detectionRate)}%
                      </span>
                    </td>
                    <td className="text-center p-2">{Math.round(config.avgTimeSeconds)}s</td>
                    <td className="text-center p-2">+{Math.round(config.costImpact)} DZD</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Affichage de 15/{eventConfigs.length} types d'événements configurés
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Analyse des Prix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Analyse des Coûts Détaillée
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Coût Trackers/Match</span>
                <span className="font-medium">{formatCurrency(calculations.trackerCostPerMatch)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Charges Sociales ({salaryConfig.socialCharges}%)</span>
                <span className="font-medium">{formatCurrency(calculations.socialChargesCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Transport + Équipement</span>
                <span className="font-medium">
                  {formatCurrency(salaryConfig.transportPerMatch + salaryConfig.equipmentPerMatch)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total par Match</span>
                <span className="text-primary">{formatCurrency(calculations.totalCostPerMatch)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Coûts Mensuels ({matchConfig.matchesPerMonth} matchs)</span>
                <span className="text-red-600">{formatCurrency(calculations.monthlyCosts)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Coûts Saisonniers ({matchConfig.seasonDuration} mois)</span>
                <span className="text-red-600">{formatCurrency(calculations.seasonalCosts)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Grille Tarifaire & Marges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="border rounded-lg p-3 bg-green-50/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-green-700">Basique</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(pricingCalculations.basicPrice)}/mois
                  </span>
                </div>
                <p className="text-xs text-green-600">
                  Marge: {pricingCalculations.basicMargin}% • {formatCurrency(pricingCalculations.basicPrice - calculations.monthlyCosts)} profit
                </p>
              </div>

              <div className="border rounded-lg p-3 bg-blue-50/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-blue-700">Premium</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(pricingCalculations.premiumPrice)}/mois
                  </span>
                </div>
                <p className="text-xs text-blue-600">
                  Marge: {pricingCalculations.premiumMargin}% • {formatCurrency(pricingCalculations.premiumPrice - calculations.monthlyCosts)} profit
                </p>
              </div>

              <div className="border rounded-lg p-3 bg-purple-50/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-purple-700">Enterprise</span>
                  <span className="font-bold text-purple-600">
                    {formatCurrency(pricingCalculations.enterprisePrice)}/mois
                  </span>
                </div>
                <p className="text-xs text-purple-600">
                  Marge: {pricingCalculations.enterpriseMargin}% • {formatCurrency(pricingCalculations.enterprisePrice - calculations.monthlyCosts)} profit
                </p>
              </div>

              <div className="border rounded-lg p-3 bg-orange-50/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-orange-700">Pay-per-Match</span>
                  <span className="font-bold text-orange-600">
                    {formatCurrency(pricingCalculations.payPerMatchPrice)}/match
                  </span>
                </div>
                <p className="text-xs text-orange-600">
                  Marge: {pricingCalculations.payPerMatchMargin}% • {formatCurrency(pricingCalculations.payPerMatchPrice - calculations.totalCostPerMatch)} profit
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BudgetTrackerConfig;
