import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Percent,
  AlertCircle
} from 'lucide-react';

interface PricingTier {
  name: string;
  basePrice: number;
  targetSegment: string;
}

interface SimulationResults {
  tam: number;
  addressableClubs: number;
  year1Revenue: number;
  year5Revenue: number;
  breakEvenYear: number;
  ltv: number;
  ltvCacRatio: number;
  priceElasticity: number;
}

interface PricingStrategySimulatorProps {
  onResultsChange?: (results: SimulationResults) => void;
}

const PricingStrategySimulator: React.FC<PricingStrategySimulatorProps> = ({ onResultsChange }) => {
  const [basicPrice, setBasicPrice] = useState(6000);
  const [professionalPrice, setProfessionalPrice] = useState(12000);
  const [premiumPrice, setPremiumPrice] = useState(18000);
  const [marketPenetration, setMarketPenetration] = useState(25); // %
  const [churnRate, setChurnRate] = useState(12); // %
  const [cac, setCac] = useState(45000);

  const totalClubs = 48; // 16 L1 + 32 L2

  const calculateResults = (): SimulationResults => {
    // Price elasticity: higher prices reduce addressable market
    const priceIndex = (basicPrice + professionalPrice + premiumPrice) / 3;
    const basePriceIndex = 12000; // baseline
    const elasticity = Math.max(0.5, 1 - ((priceIndex - basePriceIndex) / basePriceIndex) * 0.3);
    
    const addressableClubs = Math.round(totalClubs * elasticity);
    const tam = addressableClubs * ((basicPrice * 0.5) + (professionalPrice * 0.3) + (premiumPrice * 0.2));
    
    // Client acquisition based on penetration
    const year1Clients = Math.round(addressableClubs * (marketPenetration / 100) * 0.4);
    const year5Clients = Math.round(addressableClubs * (marketPenetration / 100));
    
    const avgRevenuePerClient = (basicPrice * 0.5) + (professionalPrice * 0.3) + (premiumPrice * 0.2);
    const year1Revenue = year1Clients * avgRevenuePerClient;
    const year5Revenue = year5Clients * avgRevenuePerClient;
    
    // Calculate LTV with churn
    const avgLifetimeYears = 1 / (churnRate / 100);
    const ltv = avgRevenuePerClient * avgLifetimeYears;
    const ltvCacRatio = ltv / cac;
    
    // Break-even calculation (simplified)
    const fixedCosts = 3036000; // from financial projections
    const breakEvenClients = Math.ceil(fixedCosts / avgRevenuePerClient);
    const clientsPerYear = Math.max(1, Math.round(year5Clients / 5));
    const breakEvenYear = Math.min(5, Math.ceil(breakEvenClients / clientsPerYear));
    
    return {
      tam,
      addressableClubs,
      year1Revenue,
      year5Revenue,
      breakEvenYear,
      ltv,
      ltvCacRatio,
      priceElasticity: elasticity
    };
  };

  const [results, setResults] = useState<SimulationResults>(calculateResults());

  useEffect(() => {
    const newResults = calculateResults();
    setResults(newResults);
    onResultsChange?.(newResults);
  }, [basicPrice, professionalPrice, premiumPrice, marketPenetration, churnRate, cac]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getHealthIndicator = (ratio: number) => {
    if (ratio >= 3) return { color: 'text-green-600', icon: TrendingUp, label: 'Excellent' };
    if (ratio >= 2) return { color: 'text-blue-600', icon: TrendingUp, label: 'Bon' };
    if (ratio >= 1) return { color: 'text-orange-600', icon: TrendingDown, label: 'Faible' };
    return { color: 'text-red-600', icon: AlertCircle, label: 'Critique' };
  };

  const health = getHealthIndicator(results.ltvCacRatio);
  const HealthIcon = health.icon;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Simulateur de Stratégie Tarifaire
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ajustez les prix et paramètres pour voir l'impact sur le TAM et les métriques clés
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pricing Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basic-price">Basic (DZD/mois)</Label>
              <Input
                id="basic-price"
                type="number"
                value={basicPrice}
                onChange={(e) => setBasicPrice(Number(e.target.value))}
                min={3000}
                max={15000}
                step={500}
              />
              <p className="text-xs text-muted-foreground">Target: Ligue 2, Académies</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="professional-price">Professional (DZD/mois)</Label>
              <Input
                id="professional-price"
                type="number"
                value={professionalPrice}
                onChange={(e) => setProfessionalPrice(Number(e.target.value))}
                min={8000}
                max={25000}
                step={1000}
              />
              <p className="text-xs text-muted-foreground">Target: Ligue 1 Standard</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="premium-price">Premium (DZD/mois)</Label>
              <Input
                id="premium-price"
                type="number"
                value={premiumPrice}
                onChange={(e) => setPremiumPrice(Number(e.target.value))}
                min={15000}
                max={40000}
                step={1000}
              />
              <p className="text-xs text-muted-foreground">Target: Top Clubs + Consulting</p>
            </div>
          </div>

          {/* Market Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Pénétration Marché: {marketPenetration}%</Label>
              <Slider
                value={[marketPenetration]}
                onValueChange={(v) => setMarketPenetration(v[0])}
                min={10}
                max={50}
                step={5}
              />
              <p className="text-xs text-muted-foreground">Taux de conversion cible</p>
            </div>
            
            <div className="space-y-2">
              <Label>Taux de Churn: {churnRate}%</Label>
              <Slider
                value={[churnRate]}
                onValueChange={(v) => setChurnRate(v[0])}
                min={5}
                max={30}
                step={1}
              />
              <p className="text-xs text-muted-foreground">Annuel</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cac">CAC (DZD)</Label>
              <Input
                id="cac"
                type="number"
                value={cac}
                onChange={(e) => setCac(Number(e.target.value))}
                min={20000}
                max={100000}
                step={5000}
              />
              <p className="text-xs text-muted-foreground">Coût d'acquisition client</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">TAM (Marché Total)</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(results.tam)}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {results.addressableClubs} clubs adressables
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus Année 1</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(results.year1Revenue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Année 5: {formatCurrency(results.year5Revenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ratio LTV/CAC</p>
                <p className="text-2xl font-bold text-foreground">
                  {results.ltvCacRatio.toFixed(1)}:1
                </p>
              </div>
              <HealthIcon className={`h-8 w-8 ${health.color}`} />
            </div>
            <Badge variant="outline" className="mt-2">
              {health.label}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Break-Even</p>
                <p className="text-2xl font-bold text-foreground">
                  Année {results.breakEvenYear}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Élasticité: {(results.priceElasticity * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Recommandations Stratégiques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {results.ltvCacRatio < 2 && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-orange-900">Ratio LTV/CAC trop faible</p>
                <p className="text-xs text-orange-700">
                  Considérez: réduire le CAC, augmenter les prix, ou améliorer la rétention (réduire le churn)
                </p>
              </div>
            </div>
          )}
          
          {results.priceElasticity < 0.7 && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-red-900">Prix trop élevés pour le marché</p>
                <p className="text-xs text-red-700">
                  La sensibilité aux prix réduit significativement votre marché adressable
                </p>
              </div>
            </div>
          )}
          
          {results.ltvCacRatio >= 3 && results.priceElasticity >= 0.8 && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-green-900">Stratégie tarifaire optimale</p>
                <p className="text-xs text-green-700">
                  Excellent équilibre entre rentabilité et accessibilité marché
                </p>
              </div>
            </div>
          )}

          {results.breakEvenYear > 4 && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-yellow-900">Break-even tardif</p>
                <p className="text-xs text-yellow-700">
                  Envisagez d'augmenter les prix ou d'optimiser les coûts opérationnels
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingStrategySimulator;
