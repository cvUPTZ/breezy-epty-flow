import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  Database,
  FileSpreadsheet,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Target,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface RealDataInput {
  financial: {
    monthlyRevenue: number;
    monthlyExpenses: number;
    customerAcquisitionCost: number;
    lifetimeValue: number;
    churnRate: number;
    cashFlow: number;
  };
  operations: {
    activeCustomers: number;
    monthlyActiveUsers: number;
    supportTickets: number;
    averageResponseTime: number;
    customerSatisfaction: number;
  };
  market: {
    marketSize: number;
    competitorCount: number;
    marketGrowthRate: number;
    marketPenetration: number;
    brandAwareness: number;
  };
  strategic: {
    projectsInProgress: number;
    teamSize: number;
    productFeatures: number;
    partnershipCount: number;
    complianceScore: number;
  };
}

interface RealDataInputPanelProps {
  onDataUpdate: (data: RealDataInput) => void;
}

const RealDataInputPanel: React.FC<RealDataInputPanelProps> = ({ onDataUpdate }) => {
  const [inputData, setInputData] = useState<RealDataInput>({
    financial: {
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      customerAcquisitionCost: 0,
      lifetimeValue: 0,
      churnRate: 0,
      cashFlow: 0,
    },
    operations: {
      activeCustomers: 0,
      monthlyActiveUsers: 0,
      supportTickets: 0,
      averageResponseTime: 0,
      customerSatisfaction: 0,
    },
    market: {
      marketSize: 0,
      competitorCount: 0,
      marketGrowthRate: 0,
      marketPenetration: 0,
      brandAwareness: 0,
    },
    strategic: {
      projectsInProgress: 0,
      teamSize: 0,
      productFeatures: 0,
      partnershipCount: 0,
      complianceScore: 0,
    },
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dataSource, setDataSource] = useState<'manual' | 'csv' | 'api'>('manual');

  const handleInputChange = (category: keyof RealDataInput, field: string, value: number) => {
    setInputData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleSaveData = () => {
    onDataUpdate(inputData);
    toast.success('Données réelles sauvegardées avec succès!');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate file processing
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsUploading(false);
          toast.success('Fichier CSV importé avec succès!');
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Parse CSV data (mock implementation)
    setTimeout(() => {
      setInputData({
        financial: {
          monthlyRevenue: 125000,
          monthlyExpenses: 98000,
          customerAcquisitionCost: 15000,
          lifetimeValue: 300000,
          churnRate: 8.5,
          cashFlow: 27000,
        },
        operations: {
          activeCustomers: 12,
          monthlyActiveUsers: 156,
          supportTickets: 23,
          averageResponseTime: 4.2,
          customerSatisfaction: 4.3,
        },
        market: {
          marketSize: 2500000,
          competitorCount: 8,
          marketGrowthRate: 15.8,
          marketPenetration: 28.3,
          brandAwareness: 34.2,
        },
        strategic: {
          projectsInProgress: 5,
          teamSize: 8,
          productFeatures: 47,
          partnershipCount: 3,
          complianceScore: 92,
        },
      });
    }, 2500);
  };

  const connectAPI = async () => {
    setIsUploading(true);

    // Simulate API connection
    await new Promise(resolve => setTimeout(resolve, 1500));

    setInputData({
      financial: {
        monthlyRevenue: 89000,
        monthlyExpenses: 78000,
        customerAcquisitionCost: 18500,
        lifetimeValue: 280000,
        churnRate: 12.1,
        cashFlow: 11000,
      },
      operations: {
        activeCustomers: 9,
        monthlyActiveUsers: 134,
        supportTickets: 31,
        averageResponseTime: 5.1,
        customerSatisfaction: 4.1,
      },
      market: {
        marketSize: 2800000,
        competitorCount: 6,
        marketGrowthRate: 18.2,
        marketPenetration: 22.7,
        brandAwareness: 28.9,
      },
      strategic: {
        projectsInProgress: 4,
        teamSize: 7,
        productFeatures: 42,
        partnershipCount: 2,
        complianceScore: 87,
      },
    });

    setIsUploading(false);
    toast.success('Données API synchronisées!');
  };

  const getHealthScore = (category: keyof RealDataInput) => {
    const values = Object.values(inputData[category]);
    const nonZeroValues = values.filter(v => v > 0);
    return Math.round((nonZeroValues.length / values.length) * 100);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Saisie Données Réelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button
              variant={dataSource === 'manual' ? 'default' : 'outline'}
              onClick={() => setDataSource('manual')}
              className="gap-2"
            >
              <Target className="h-4 w-4" />
              Saisie Manuelle
            </Button>
            <Button
              variant={dataSource === 'csv' ? 'default' : 'outline'}
              onClick={() => setDataSource('csv')}
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Import CSV
            </Button>
            <Button
              variant={dataSource === 'api' ? 'default' : 'outline'}
              onClick={() => setDataSource('api')}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              API Connect
            </Button>
          </div>

          {dataSource === 'csv' && (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <div className="space-y-2">
                <Label htmlFor="csv-upload" className="text-lg font-medium cursor-pointer">
                  Glisser-déposer votre fichier CSV ou cliquer pour sélectionner
                </Label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-sm text-muted-foreground">
                  Formats supportés: CSV avec colonnes standardisées
                </p>
              </div>
              {isUploading && (
                <div className="mt-4">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Traitement en cours... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          )}

          {dataSource === 'api' && (
            <div className="text-center space-y-4">
              <div className="text-muted-foreground">
                Connecter aux sources de données externes
              </div>
              <div className="flex justify-center gap-4">
                <Button onClick={connectAPI} disabled={isUploading} className="gap-2">
                  {isUploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                  Synchroniser CRM
                </Button>
                <Button onClick={connectAPI} disabled={isUploading} variant="outline" className="gap-2">
                  {isUploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                  Analytics Dashboard
                </Button>
              </div>
            </div>
          )}

          {dataSource === 'manual' && (
            <Tabs defaultValue="financial" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="financial" className="gap-2">
                  <DollarSign className="h-4 w-4" />
                  Financier
                </TabsTrigger>
                <TabsTrigger value="operations" className="gap-2">
                  <Users className="h-4 w-4" />
                  Opérations
                </TabsTrigger>
                <TabsTrigger value="market" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Marché
                </TabsTrigger>
                <TabsTrigger value="strategic" className="gap-2">
                  <Target className="h-4 w-4" />
                  Stratégique
                </TabsTrigger>
              </TabsList>

              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="monthlyRevenue">Revenus Mensuels (DZD)</Label>
                    <Input
                      id="monthlyRevenue"
                      type="number"
                      value={inputData.financial.monthlyRevenue}
                      onChange={(e) => handleInputChange('financial', 'monthlyRevenue', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlyExpenses">Dépenses Mensuelles (DZD)</Label>
                    <Input
                      id="monthlyExpenses"
                      type="number"
                      value={inputData.financial.monthlyExpenses}
                      onChange={(e) => handleInputChange('financial', 'monthlyExpenses', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerAcquisitionCost">Coût d'Acquisition Client (DZD)</Label>
                    <Input
                      id="customerAcquisitionCost"
                      type="number"
                      value={inputData.financial.customerAcquisitionCost}
                      onChange={(e) => handleInputChange('financial', 'customerAcquisitionCost', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lifetimeValue">Valeur Vie Client (DZD)</Label>
                    <Input
                      id="lifetimeValue"
                      type="number"
                      value={inputData.financial.lifetimeValue}
                      onChange={(e) => handleInputChange('financial', 'lifetimeValue', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="churnRate">Taux de Churn (%)</Label>
                    <Input
                      id="churnRate"
                      type="number"
                      step="0.1"
                      value={inputData.financial.churnRate}
                      onChange={(e) => handleInputChange('financial', 'churnRate', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cashFlow">Cash Flow Mensuel (DZD)</Label>
                    <Input
                      id="cashFlow"
                      type="number"
                      value={inputData.financial.cashFlow}
                      onChange={(e) => handleInputChange('financial', 'cashFlow', Number(e.target.value))}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="operations" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="activeCustomers">Clients Actifs</Label>
                    <Input
                      id="activeCustomers"
                      type="number"
                      value={inputData.operations.activeCustomers}
                      onChange={(e) => handleInputChange('operations', 'activeCustomers', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlyActiveUsers">Utilisateurs Actifs Mensuels</Label>
                    <Input
                      id="monthlyActiveUsers"
                      type="number"
                      value={inputData.operations.monthlyActiveUsers}
                      onChange={(e) => handleInputChange('operations', 'monthlyActiveUsers', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supportTickets">Tickets Support/Mois</Label>
                    <Input
                      id="supportTickets"
                      type="number"
                      value={inputData.operations.supportTickets}
                      onChange={(e) => handleInputChange('operations', 'supportTickets', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="averageResponseTime">Temps Réponse Moyen (heures)</Label>
                    <Input
                      id="averageResponseTime"
                      type="number"
                      step="0.1"
                      value={inputData.operations.averageResponseTime}
                      onChange={(e) => handleInputChange('operations', 'averageResponseTime', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerSatisfaction">Satisfaction Client (/5)</Label>
                    <Input
                      id="customerSatisfaction"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={inputData.operations.customerSatisfaction}
                      onChange={(e) => handleInputChange('operations', 'customerSatisfaction', Number(e.target.value))}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="market" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="marketSize">Taille Marché (DZD)</Label>
                    <Input
                      id="marketSize"
                      type="number"
                      value={inputData.market.marketSize}
                      onChange={(e) => handleInputChange('market', 'marketSize', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="competitorCount">Nombre Concurrents</Label>
                    <Input
                      id="competitorCount"
                      type="number"
                      value={inputData.market.competitorCount}
                      onChange={(e) => handleInputChange('market', 'competitorCount', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="marketGrowthRate">Taux Croissance Marché (%)</Label>
                    <Input
                      id="marketGrowthRate"
                      type="number"
                      step="0.1"
                      value={inputData.market.marketGrowthRate}
                      onChange={(e) => handleInputChange('market', 'marketGrowthRate', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="marketPenetration">Pénétration Marché (%)</Label>
                    <Input
                      id="marketPenetration"
                      type="number"
                      step="0.1"
                      value={inputData.market.marketPenetration}
                      onChange={(e) => handleInputChange('market', 'marketPenetration', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="brandAwareness">Notoriété Marque (%)</Label>
                    <Input
                      id="brandAwareness"
                      type="number"
                      step="0.1"
                      value={inputData.market.brandAwareness}
                      onChange={(e) => handleInputChange('market', 'brandAwareness', Number(e.target.value))}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="strategic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="projectsInProgress">Projets en Cours</Label>
                    <Input
                      id="projectsInProgress"
                      type="number"
                      value={inputData.strategic.projectsInProgress}
                      onChange={(e) => handleInputChange('strategic', 'projectsInProgress', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="teamSize">Taille Équipe</Label>
                    <Input
                      id="teamSize"
                      type="number"
                      value={inputData.strategic.teamSize}
                      onChange={(e) => handleInputChange('strategic', 'teamSize', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="productFeatures">Fonctionnalités Produit</Label>
                    <Input
                      id="productFeatures"
                      type="number"
                      value={inputData.strategic.productFeatures}
                      onChange={(e) => handleInputChange('strategic', 'productFeatures', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="partnershipCount">Nombre Partenariats</Label>
                    <Input
                      id="partnershipCount"
                      type="number"
                      value={inputData.strategic.partnershipCount}
                      onChange={(e) => handleInputChange('strategic', 'partnershipCount', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="complianceScore">Score Conformité (%)</Label>
                    <Input
                      id="complianceScore"
                      type="number"
                      min="0"
                      max="100"
                      value={inputData.strategic.complianceScore}
                      onChange={(e) => handleInputChange('strategic', 'complianceScore', Number(e.target.value))}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-4">
              {Object.entries(inputData).map(([category, data]) => (
                <div key={category} className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {getHealthScore(category as keyof RealDataInput) > 50 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm font-medium capitalize">{category}</span>
                  </div>
                  <Badge variant="outline">
                    {getHealthScore(category as keyof RealDataInput)}%
                  </Badge>
                </div>
              ))}
            </div>
            <Button onClick={handleSaveData} className="gap-2">
              <Save className="h-4 w-4" />
              Sauvegarder Données
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealDataInputPanel;