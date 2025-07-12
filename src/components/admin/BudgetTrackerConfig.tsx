
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { EVENT_TYPES, EVENT_TYPE_LABELS } from '@/constants/eventTypes';
import { 
  Calculator, 
  Settings, 
  TrendingUp, 
  Users, 
  Clock,
  Target,
  DollarSign,
  BarChart3
} from 'lucide-react';

interface EventConfig {
  type: string;
  difficulty: number; // 1-10
  detectionRate: number; // %
  avgTimeSeconds: number;
  costImpact: number; // DZD
}

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

  // Configuration des types d'événements avec difficultés réalistes
  const eventConfigs: EventConfig[] = [
    { type: 'goal', difficulty: 3, detectionRate: 95, avgTimeSeconds: 15, costImpact: 45 },
    { type: 'pass', difficulty: 2, detectionRate: 88, avgTimeSeconds: 4, costImpact: 30 },
    { type: 'shot', difficulty: 4, detectionRate: 92, avgTimeSeconds: 10, costImpact: 60 },
    { type: 'tackle', difficulty: 4, detectionRate: 85, avgTimeSeconds: 8, costImpact: 45 },
    { type: 'foul', difficulty: 5, detectionRate: 78, avgTimeSeconds: 12, costImpact: 75 },
    { type: 'corner', difficulty: 3, detectionRate: 95, avgTimeSeconds: 6, costImpact: 45 },
    { type: 'offside', difficulty: 7, detectionRate: 72, avgTimeSeconds: 8, costImpact: 85 },
    { type: 'yellowCard', difficulty: 4, detectionRate: 98, avgTimeSeconds: 10, costImpact: 60 },
    { type: 'redCard', difficulty: 4, detectionRate: 98, avgTimeSeconds: 12, costImpact: 60 },
    { type: 'substitution', difficulty: 3, detectionRate: 100, avgTimeSeconds: 20, costImpact: 45 },
    { type: 'cross', difficulty: 3, detectionRate: 82, avgTimeSeconds: 5, costImpact: 45 },
    { type: 'dribble', difficulty: 6, detectionRate: 75, avgTimeSeconds: 6, costImpact: 80 },
    { type: 'interception', difficulty: 5, detectionRate: 80, avgTimeSeconds: 4, costImpact: 75 },
    { type: 'clearance', difficulty: 3, detectionRate: 88, avgTimeSeconds: 5, costImpact: 45 },
    { type: 'save', difficulty: 4, detectionRate: 92, avgTimeSeconds: 8, costImpact: 60 },
    { type: 'aerialDuel', difficulty: 6, detectionRate: 70, avgTimeSeconds: 6, costImpact: 80 },
    { type: 'groundDuel', difficulty: 5, detectionRate: 78, avgTimeSeconds: 5, costImpact: 75 },
    { type: 'ballRecovered', difficulty: 4, detectionRate: 85, avgTimeSeconds: 4, costImpact: 60 },
    { type: 'ballLost', difficulty: 4, detectionRate: 82, avgTimeSeconds: 3, costImpact: 60 },
    { type: 'assist', difficulty: 5, detectionRate: 90, avgTimeSeconds: 8, costImpact: 75 }
  ];

  // Calculs automatiques
  const calculations = useMemo(() => {
    // Événements approximatifs par match basés sur les vrais EVENT_TYPES
    const eventFrequencies = {
      pass: 180, shot: 12, tackle: 25, foul: 18, corner: 8, offside: 3,
      goal: 2, assist: 2, yellowCard: 4, redCard: 0.3, substitution: 6,
      cross: 15, dribble: 20, interception: 12, clearance: 18, save: 8,
      aerialDuel: 25, groundDuel: 30, ballRecovered: 35, ballLost: 35,
      throwIn: 15, freeKick: 12, penalty: 0.5, goalKick: 20
    };

    const totalEvents = Object.values(eventFrequencies).reduce((sum, freq) => sum + freq, 0);
    
    // Calcul difficulté moyenne pondérée
    const avgDifficulty = eventConfigs.reduce((sum, config) => {
      const frequency = eventFrequencies[config.type as keyof typeof eventFrequencies] || 5;
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
      difficultyScore: Math.round((avgDifficulty / 10) * 100),
      trackerCostPerMatch,
      socialChargesCost,
      totalCostPerMatch,
      monthlyCosts,
      seasonalCosts
    };
  }, [salaryConfig, matchConfig]);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="h-8 w-8 text-primary" />
            Configuration Budget Tracker
          </h1>
          <p className="text-muted-foreground">
            Paramètres financiers et opérationnels basés sur les vrais types d'événements
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {EVENT_TYPES.length} Types d'Événements
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Salaires & Charges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Configuration Salaires & Charges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                <p className="text-xs text-muted-foreground mt-1">
                  SNMG Algérie ≈ 1,250 DZD/h
                </p>
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
                <p className="text-xs text-muted-foreground mt-1">
                  Bonus événements difficiles
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                <p className="text-xs text-muted-foreground mt-1">
                  Alger: 2000-3000 DZD
                </p>
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
                <p className="text-xs text-muted-foreground mt-1">
                  Algérie: 25-30%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Équipement/Match (DZD)</Label>
                <Input
                  type="number"
                  value={salaryConfig.equipmentPerMatch}
                  onChange={(e) => setSalaryConfig(prev => ({
                    ...prev,
                    equipmentPerMatch: Number(e.target.value)
                  }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tablette + accessoires
                </p>
              </div>
              <div>
                <Label>Taux Heures Sup.</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={salaryConfig.overtimeRate}
                  onChange={(e) => setSalaryConfig(prev => ({
                    ...prev,
                    overtimeRate: Number(e.target.value)
                  }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Standard: 1.5x
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Match & Saison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              Configuration Match & Saison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                <Label>Total Événements</Label>
                <Input
                  type="number"
                  value={calculations.totalEvents}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <Label>Remplacements</Label>
                <Input
                  type="number"
                  value={matchConfig.replacements}
                  onChange={(e) => setMatchConfig(prev => ({
                    ...prev,
                    replacements: Number(e.target.value)
                  }))}
                />
              </div>
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Difficulté Globale</span>
                <span className="text-sm font-bold">{calculations.difficultyScore}/100</span>
              </div>
              <Progress value={calculations.difficultyScore} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Basé sur {eventConfigs.length} types d'événements configurés
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Types d'Événements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            Configuration Types d'Événements (Paramètres Réels)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Type d'Événement</th>
                  <th className="text-center p-2">Difficulté (1-10)</th>
                  <th className="text-center p-2">Détection (%)</th>
                  <th className="text-center p-2">Temps (sec)</th>
                  <th className="text-center p-2">Impact Coût</th>
                </tr>
              </thead>
              <tbody>
                {eventConfigs.slice(0, 10).map((config) => (
                  <tr key={config.type} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {EVENT_TYPE_LABELS[config.type as keyof typeof EVENT_TYPE_LABELS] || config.type}
                        </Badge>
                      </div>
                    </td>
                    <td className="text-center p-2">
                      <Badge 
                        variant={config.difficulty <= 3 ? "default" : config.difficulty <= 6 ? "secondary" : "destructive"}
                        className="w-12"
                      >
                        {config.difficulty}/10
                      </Badge>
                    </td>
                    <td className="text-center p-2">
                      <span className={`font-medium ${
                        config.detectionRate >= 90 ? 'text-green-600' : 
                        config.detectionRate >= 80 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {config.detectionRate}%
                      </span>
                    </td>
                    <td className="text-center p-2">{config.avgTimeSeconds}s</td>
                    <td className="text-center p-2">+{config.costImpact} DZD</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Affichage de 10/{eventConfigs.length} types d'événements configurés
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Calculs Financiers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Analyse des Coûts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Coût Trackers/Match</span>
                <span className="font-medium">{formatCurrency(calculations.trackerCostPerMatch)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Charges Sociales</span>
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
                <span>Coûts Mensuels</span>
                <span className="text-red-600">{formatCurrency(calculations.monthlyCosts)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Coûts Saisonnier</span>
                <span className="text-red-600">{formatCurrency(calculations.seasonalCosts)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Prix d'Abonnements & Marges
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
                  Marge: {pricingCalculations.basicMargin}% • Clubs amateurs
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
                  Marge: {pricingCalculations.premiumMargin}% • Clubs semi-pro
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
                  Marge: {pricingCalculations.enterpriseMargin}% • Clubs pro
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
                  Marge: {pricingCalculations.payPerMatchMargin}% • Usage ponctuel
                </p>
              </div>
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Projection Rentabilité
              </h4>
              <div className="text-sm space-y-1">
                <div>• Break-even: 8-12 clients Premium</div>
                <div>• Objectif An 1: 25 clients actifs</div>
                <div>• Revenus potentiels: {formatCurrency(pricingCalculations.premiumPrice * 25)}/mois</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BudgetTrackerConfig;
