import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Users, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MarketData {
  transferOpportunities: any[];
  contractExpiries: any[];
  marketTrends: any[];
  budgetAnalysis: any;
}

const MarketIntelligence: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData>({
    transferOpportunities: [],
    contractExpiries: [],
    marketTrends: [],
    budgetAnalysis: {}
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      // Fetch players with expiring contracts (within next 12 months)
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      
      const { data: expiringContracts } = await supabase
        .from('scouted_players')
        .select(`
          *,
          scout_reports(recommendation, performance_rating)
        `)
        .lte('contract_expires', nextYear.toISOString().split('T')[0])
        .order('contract_expires', { ascending: true });

      // Fetch all players for market analysis
      const { data: allPlayers } = await supabase
        .from('scouted_players')
        .select(`
          *,
          scout_reports(recommendation, performance_rating)
        `);

      // Calculate transfer opportunities (players with 'sign' recommendation)
      const transferOpportunities = allPlayers?.filter(player => 
        player.scout_reports?.some(report => report.recommendation === 'sign')
      ) || [];

      // Mock market trends data (in real implementation, this would come from external APIs)
      const marketTrends = [
        { position: 'Goalkeeper', avgValue: 15000000, trend: 'up', change: 12 },
        { position: 'Defender', avgValue: 25000000, trend: 'stable', change: 2 },
        { position: 'Midfielder', avgValue: 35000000, trend: 'up', change: 18 },
        { position: 'Forward', avgValue: 45000000, trend: 'down', change: -8 }
      ];

      setMarketData({
        transferOpportunities,
        contractExpiries: expiringContracts || [],
        marketTrends,
        budgetAnalysis: {
          totalBudget: 100000000,
          allocated: 65000000,
          remaining: 35000000
        }
      });
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast({
        title: "Error",
        description: "Failed to load market intelligence data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return <div className="text-center">Loading market intelligence...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">Étude de Marché Fondée sur les Données (V12.0)</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Analyse Rigoureuse du Marché Algérien des Solutions d'Analyse Sportive
        </p>
      </div>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="summary">Résumé Exécutif</TabsTrigger>
          <TabsTrigger value="sizing">Taille du Marché (TAM/SAM/SOM)</TabsTrigger>
          <TabsTrigger value="segmentation">Segmentation</TabsTrigger>
          <TabsTrigger value="competition">Concurrence</TabsTrigger>
          <TabsTrigger value="dynamics">Dynamiques</TabsTrigger>
          <TabsTrigger value="strategy">Stratégie</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Vision Projet Recadrée</CardTitle></CardHeader>
            <CardContent>
              <p>SportDataAnalytics vise à devenir le leader des solutions d'analyse sportive en Algérie en construisant un "moat communautaire" basé sur l'expertise locale, les relations institutionnelles, et la conformité réglementaire. Cette position dominante sur un marché de validation (Phase 1) constitue le tremplin pour une expansion géographique ciblée au Maghreb (Phase 2).</p>
              <Badge variant="destructive" className="mt-2">Correction Fondamentale: Abandon des estimations initiales irréalistes.</Badge>
            </CardContent>
          </Card>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Marché Réaliste Identifié (Phase 1)</CardTitle></CardHeader>
              <CardContent>
                <ul className="list-disc pl-5">
                  <li><strong>Clubs Ligue 1:</strong> 16</li>
                  <li><strong>Clubs Ligue 2:</strong> 32</li>
                  <li><strong>Centres FAF:</strong> 8</li>
                  <li><strong>Total Addressable:</strong> 56 organisations</li>
                  <li className="font-bold">Objectif 5 ans: 15 clients (27% pénétration)</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Positionnement Concurrentiel</CardTitle></CardHeader>
              <CardContent>
                <p className="font-bold">"First-Mover Community Moat"</p>
                <p>Relations + Formation + Data Propriétaires</p>
                <ul className="list-disc pl-5 mt-2 text-sm">
                  <li><strong>Phase 1 Moat:</strong> Réglementaire + Communautaire</li>
                  <li><strong>Phase 2 Moat:</strong> Data + Effets de Réseau</li>
                  <li><strong>Switching Costs Élevés:</strong> Formation obligatoire</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sizing" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Calcul TAM/SAM/SOM Rigoureux</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{new Intl.NumberFormat('fr-FR').format(4480000)} DZD</p>
                  <p className="font-semibold">TAM (Total Addressable Market)</p>
                  <p className="text-xs text-muted-foreground">Scénario 100% Adoption</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{new Intl.NumberFormat('fr-FR').format(2092000)} DZD</p>
                  <p className="font-semibold">SAM (Serviceable Addressable Market)</p>
                  <p className="text-xs text-muted-foreground">Clubs Technologiquement Réceptifs</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{new Intl.NumberFormat('fr-FR').format(2040000)} DZD</p>
                  <p className="font-semibold text-primary">SOM (Serviceable Obtainable Market)</p>
                  <p className="text-xs text-muted-foreground">Objectif Réaliste 5 ans</p>
                </div>
              </div>
              <Progress value={(2.04/4.48)*100} className="mt-4 h-3" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segmentation" className="space-y-4">
          <Card>
              <CardHeader><CardTitle>Matrice de Priorisation des Segments</CardTitle></CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left">Segment</th><th className="text-center">Score</th><th className="text-center">Priorité</th></tr></thead>
                  <tbody>
                    <tr className="border-b"><td>Ligue 1 Elite</td><td className="text-center">30/40</td><td className="text-center"><Badge>1</Badge></td></tr>
                    <tr className="border-b"><td>Centres FAF</td><td className="text-center">30/40</td><td className="text-center"><Badge>1</Badge></td></tr>
                    <tr className="border-b"><td>Ligue 1 Standard</td><td className="text-center">23/40</td><td className="text-center"><Badge variant="secondary">2</Badge></td></tr>
                    <tr><td>Ligue 2 Ambitieux</td><td className="text-center">16/40</td><td className="text-center"><Badge variant="outline">3</Badge></td></tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="competition" className="space-y-4">
           <Card>
              <CardHeader><CardTitle>Analyse des Forces de Porter</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
                <p><strong>Menace Nouveaux Entrants:</strong> <span className="font-bold text-orange-600">MODÉRÉE-ÉLEVÉE</span></p>
                <p><strong>Pouvoir Négociation Clients:</strong> <span className="font-bold text-red-600">ÉLEVÉ</span></p>
                <p><strong>Pouvoir Négociation Fournisseurs:</strong> <span className="font-bold text-green-600">FAIBLE</span></p>
                <p><strong>Menace Produits Substituts:</strong> <span className="font-bold text-red-600">ÉLEVÉE</span></p>
                <p><strong>Intensité Concurrentielle:</strong> <span className="font-bold text-yellow-600">FAIBLE-MODÉRÉE</span></p>
              </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="dynamics" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Cycle d'Adoption Technologique</CardTitle></CardHeader>
            <CardContent>
              <p>Positionnement Actuel du Marché: <strong>Early Adopters (13.5%)</strong></p>
              <p>Stratégie de Franchissement du "Chasm": Cibler 4-6 clubs progressistes pour créer des références incontournables.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategy" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Recommandations Stratégiques Actionnables</CardTitle></CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Approche Séquentielle Rigoureuse:</strong> Focus absolu sur validation Phase 1 avant toute expansion.</li>
                <li><strong>Modèle Économique Hybride:</strong> SaaS + Formation + Consulting pour maximiser l'ARPU.</li>
                <li><strong>Construction Moat Défensif:</strong> Investissement massif dans les relations institutionnelles et les switching costs.</li>
                <li><strong>Préparation Phase 2 Conditionnelle:</strong> Veille active sur les marchés Maghreb (Maroc prioritaire).</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 border-t pt-8">
        <h2 className="text-2xl font-bold text-center mb-6">Live Market Intelligence</h2>
        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transfer Opportunities</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketData.transferOpportunities.length}</div>
            <p className="text-xs text-muted-foreground">
              Recommended signings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Contracts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketData.contractExpiries.length}</div>
            <p className="text-xs text-muted-foreground">
              Within 12 months
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Remaining</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(marketData.budgetAnalysis.remaining || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for transfers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Alert</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Price drops detected
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="opportunities" className="space-y-6">
        <TabsList>
          <TabsTrigger value="opportunities">Transfer Opportunities</TabsTrigger>
          <TabsTrigger value="contracts">Contract Expiries</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
          <TabsTrigger value="budget">Budget Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketData.transferOpportunities.map((player) => (
              <Card key={player.id} className="border-green-200 bg-green-50">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{player.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{player.position}</p>
                    </div>
                    <Badge className="bg-green-500 hover:bg-green-600">
                      Recommended
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Current Club:</span>
                    <span className="font-medium">{player.current_club}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Market Value:</span>
                    <span className="font-medium">{formatCurrency(player.market_value || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Contract Expires:</span>
                    <span className="font-medium">
                      {player.contract_expires ? formatDate(player.contract_expires) : 'Unknown'}
                    </span>
                  </div>

                  {player.scout_reports && player.scout_reports.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Rating:</span>
                      <span className="font-medium">
                        {(player.scout_reports.reduce((sum: number, report: any) => sum + report.performance_rating, 0) / player.scout_reports.length).toFixed(1)}/10
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketData.contractExpiries.map((player) => (
              <Card key={player.id} className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{player.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{player.position}</p>
                    </div>
                    <Badge variant="outline" className="border-orange-500 text-orange-700">
                      Expiring Soon
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Current Club:</span>
                    <span className="font-medium">{player.current_club}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Contract Expires:</span>
                    <span className="font-medium text-orange-700">
                      {formatDate(player.contract_expires)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Market Value:</span>
                    <span className="font-medium">{formatCurrency(player.market_value || 0)}</span>
                  </div>

                  <div className="pt-2">
                    <div className="text-xs text-muted-foreground">Time remaining</div>
                    <Progress 
                      value={Math.max(0, Math.min(100, (new Date(player.contract_expires).getTime() - Date.now()) / (365 * 24 * 60 * 60 * 1000) * 100))} 
                      className="h-2 mt-1" 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {marketData.marketTrends.map((trend) => (
              <Card key={trend.position}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{trend.position}</span>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(trend.trend)}
                      <span className={`text-sm font-medium ${getTrendColor(trend.trend)}`}>
                        {trend.change > 0 ? '+' : ''}{trend.change}%
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Average Market Value</span>
                      <span className="font-medium">{formatCurrency(trend.avgValue)}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Market Movement</span>
                        <span className={getTrendColor(trend.trend)}>
                          {trend.trend === 'up' ? 'Rising' : trend.trend === 'down' ? 'Declining' : 'Stable'}
                        </span>
                      </div>
                      <Progress 
                        value={50 + trend.change} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Transfer Budget Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Budget</span>
                    <span className="font-bold">{formatCurrency(marketData.budgetAnalysis.totalBudget || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Allocated</span>
                    <span className="text-red-600">{formatCurrency(marketData.budgetAnalysis.allocated || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining</span>
                    <span className="text-green-600 font-bold">{formatCurrency(marketData.budgetAnalysis.remaining || 0)}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Budget Utilization</span>
                    <span>{Math.round(((marketData.budgetAnalysis.allocated || 0) / (marketData.budgetAnalysis.totalBudget || 1)) * 100)}%</span>
                  </div>
                  <Progress 
                    value={((marketData.budgetAnalysis.allocated || 0) / (marketData.budgetAnalysis.totalBudget || 1)) * 100} 
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="font-medium text-sm">Priority Position: Midfielder</div>
                    <div className="text-xs text-muted-foreground">Market trending up, invest soon</div>
                  </div>
                  
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-medium text-sm">Value Opportunity: Defenders</div>
                    <div className="text-xs text-muted-foreground">Stable market, good value available</div>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="font-medium text-sm">Wait & Watch: Forwards</div>
                    <div className="text-xs text-muted-foreground">Prices declining, wait for better deals</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketIntelligence;