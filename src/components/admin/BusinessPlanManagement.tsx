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
  Shield,
  PieChart,
  Lightbulb,
  Scale
} from 'lucide-react';
import { toast } from 'sonner';
import StartupPitchPresentation from './StartupPitchPresentation';

// --- TYPE DEFINITIONS ---
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
  annualRevenue: number;
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

interface Founder {
  id: string;
  name: string;
  role: string;
  equityPercentage: number;
  responsibilities: string[];
}

interface FinancialProjection {
  year: number;
  clients: number;
  revenue: number;
  expenses: number;
  profit: number;
}

interface CostStructureItem {
  year: number;
  personnel: number;
  infrastructure: number;
  marketing: number;
  operations: number;
  admin: number;
  total: number;
}

const BusinessPlanManagement: React.FC = () => {
  // --- STATE MANAGEMENT ---

  const [goals, setGoals] = useState<BusinessGoal[]>([
    {
      id: '1',
      title: 'Phase 1: Validation (Mois 1-18)',
      description: 'Valider le product-market fit, développer des références et sécuriser un partenariat avec la FAF.',
      target: '3-4 clients pilotes, Endorsement FAF',
      deadline: '2026-12-31',
      status: 'in-progress',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Phase 2: Expansion (Mois 19-42)',
      description: 'Atteindre la rentabilité et optimiser les opérations.',
      target: '8-12 clients payants, Cash flow positif',
      deadline: '2028-06-30',
      status: 'pending',
      priority: 'medium'
    },
    {
        id: '3',
        title: 'Phase 3: Consolidation (Mois 43-60)',
        description: 'Saturer les segments accessibles et optimiser la profitabilité.',
        target: '15-18 clients, Optimisation des marges',
        deadline: '2029-12-31',
        status: 'pending',
        priority: 'low'
    }
  ]);

  const [revenueStreams, setRevenueStreams] = useState<RevenueStream[]>([
    {
      id: '1',
      name: 'Abonnement Ligue 1',
      description: 'Plateforme + Formation + Support premium',
      annualRevenue: 150000,
      status: 'active',
      marketSegment: 'Clubs Ligue 1 Progressistes'
    },
    {
      id: '2',
      name: 'Abonnement Ligue 2',
      description: 'Plateforme + Formation + Support standard',
      annualRevenue: 100000,
      status: 'active',
      marketSegment: 'Ligue 2 Sélective'
    },
    {
        id: '3',
        name: 'Abonnement Académies FAF',
        description: 'Plateforme + Formation + Tarif préférentiel',
        annualRevenue: 75000,
        status: 'active',
        marketSegment: 'Académies FAF'
    },
    {
        id: '4',
        name: 'Services Ponctuels',
        description: 'Analyse de matches + Consulting ponctuel',
        annualRevenue: 20000,
        status: 'active',
        marketSegment: 'Tous segments'
    }
  ]);

  const [regulations] = useState<AlgerianRegulation[]>([
    {
      id: '1',
      name: 'Loi 18-07',
      description: 'Conformité sur la protection des données personnelles. Hébergement et traitement des données exclusivement en Algérie.',
      compliance: 'compliant'
    },
    {
      id: '2',
      name: 'Enregistrement Commercial',
      description: 'Inscription au Registre du Commerce Algérien',
      compliance: 'compliant'
    },
    {
      id: '3',
      name: 'Partenariat FAF',
      description: 'Endorsement officiel de la Fédération Algérienne de Football',
      compliance: 'pending',
      deadline: '2025-12-31'
    }
  ]);

  const [founders] = useState<Founder[]>([
    {
      id: '1',
      name: 'Fondateurs',
      role: 'CEO & CTO',
      equityPercentage: 55,
      responsibilities: ['Stratégie & Ventes', 'Développement Technique', 'Vision Produit', 'Réseau Football']
    },
    {
      id: '2',
      name: 'Équipe',
      role: 'Opérations & Support',
      equityPercentage: 12,
      responsibilities: ['Customer Success', 'Support Bilingue', 'Formation', 'Qualité des Données']
    },
    {
        id: '3',
        name: 'Investisseurs',
        role: 'Capital & Conseil',
        equityPercentage: 25,
        responsibilities: ['Financement', 'Conseil Stratégique', 'Réseau']
    },
    {
        id: '4',
        name: 'Pool d\'options',
        role: 'Futurs Talents',
        equityPercentage: 8,
        responsibilities: ['Incitation pour futurs employés clés']
    }
  ]);

  const [financialProjections] = useState<FinancialProjection[]>([
    { year: 2025, clients: 4, revenue: 450000, expenses: 720000, profit: -270000 },
    { year: 2026, clients: 8, revenue: 950000, expenses: 1100000, profit: -150000 },
    { year: 2027, clients: 12, revenue: 1650000, expenses: 1400000, profit: 250000 },
    { year: 2028, clients: 15, revenue: 2100000, expenses: 1600000, profit: 500000 },
    { year: 2029, clients: 18, revenue: 2350000, expenses: 1800000, profit: 550000 }
  ]);

  const [costStructure] = useState<CostStructureItem[]>([
      { year: 1, personnel: 350000, infrastructure: 120000, marketing: 150000, operations: 80000, admin: 20000, total: 720000 },
      { year: 3, personnel: 700000, infrastructure: 200000, marketing: 250000, operations: 180000, admin: 70000, total: 1400000 },
      { year: 5, personnel: 900000, infrastructure: 250000, marketing: 300000, operations: 250000, admin: 100000, total: 1800000 },
  ]);

  // --- UTILS ---

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalProjectedRevenueY1 = financialProjections[0]?.revenue || 0;

  // --- RENDER ---

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Synthèse du Plan d'Affaires
          </h2>
          <p className="text-muted-foreground">
            SportDataAnalytics - Stratégie pour le marché algérien
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <MapPin className="h-3 w-3 mr-1" />
          Marché Algérien
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="pitch">Pitch Deck</TabsTrigger>
          <TabsTrigger value="goals">Objectifs</TabsTrigger>
          <TabsTrigger value="revenue">Modèle Économique</TabsTrigger>
          <TabsTrigger value="team">Équipe & Capital</TabsTrigger>
          <TabsTrigger value="market">Analyse Marché</TabsTrigger>
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
                    <p className="text-sm text-muted-foreground">Revenus Annuels (An 1)</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(totalProjectedRevenueY1)}
                    </p>
                  </div>
                  <Banknote className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Objectif An 5: {formatCurrency(financialProjections[4]?.revenue)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Break-Even</p>
                    <p className="text-2xl font-bold text-foreground">
                      Mois 22
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  8-10 clients actifs requis
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Marché Potentiel</p>
                    <p className="text-2xl font-bold text-foreground">18-22 Clubs</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Ligue 1, Ligue 2 & Académies FAF
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Financement Requis</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(1800000)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-orange-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Pour 18 mois de runway
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Business Model Canvas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Business Model Canvas - Synthèse
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2"><Lightbulb className="text-primary"/> Proposition de Valeur</h4>
                  <p className="text-sm text-muted-foreground">
                    "La seule plateforme d'analyse football 100% conforme Loi 18-07 avec support local premium"
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2"><Users className="text-primary"/> Segments Clients</h4>
                  <ul className="text-sm text-muted-foreground list-disc pl-4">
                    <li>Clubs Ligue 1 progressistes</li>
                    <li>Académies FAF</li>
                    <li>Clubs Ligue 2 ambitieux</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2"><Banknote className="text-primary"/> Sources de Revenus</h4>
                   <ul className="text-sm text-muted-foreground list-disc pl-4">
                    <li>Abonnements annuels (SaaS)</li>
                    <li>Services premium (analyse à la demande)</li>
                    <li>Consulting et formation</li>
                  </ul>
                </div>
            </CardContent>
          </Card>

          {/* Financial Projections Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Projections Financières (5 ans)</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">
                    (Chart placeholder: Revenue vs Expenses over 5 years)
                  </p>
               </div>
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Objectifs Stratégiques (Go-To-Market)</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        {goal.title}
                        <Badge variant={
                          goal.priority === 'high' ? 'destructive' :
                          goal.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          Priorité {goal.priority}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
                  <div className="text-sm"><strong>Cible:</strong> {goal.target}</div>
                  <div className="text-sm"><strong>Échéance:</strong> {goal.deadline}</div>
                   <div className="text-sm mt-2"><strong>Status:</strong>
                    <Badge variant={goal.status === 'completed' ? 'default' : 'outline'} className="ml-2">
                        {goal.status}
                    </Badge>
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Structure Tarifaire</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {revenueStreams.map(stream => (
                            <div key={stream.id} className="p-3 bg-muted rounded-lg">
                                <h4 className="font-semibold">{stream.name}</h4>
                                <p className="text-sm text-muted-foreground">{stream.description}</p>
                                <p className="text-right font-bold text-primary">{formatCurrency(stream.annualRevenue)}/an</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Unit Economics</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between p-2 bg-muted rounded"><span>CAC moyen (Coût Acquisition Client)</span> <strong>{formatCurrency(25000)}</strong></div>
                        <div className="flex justify-between p-2 bg-muted rounded"><span>LTV (Valeur Vie Client)</span> <strong>{formatCurrency(400000)}</strong></div>
                        <div className="flex justify-between p-2 bg-muted rounded"><span>Ratio LTV/CAC</span> <strong className="text-green-600">16:1</strong></div>
                        <div className="flex justify-between p-2 bg-muted rounded"><span>Période de Payback</span> <strong>6-8 mois</strong></div>
                        <div className="flex justify-between p-2 bg-muted rounded"><span>Taux de Churn Annuel</span> <strong>15%</strong></div>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader><CardTitle>Projections des Revenus (DZD)</CardTitle></CardHeader>
                <CardContent>
                    <table className="w-full text-sm">
                        <thead><tr className="border-b"><th className="text-left p-2">Année</th><th className="text-left p-2">Clients</th><th className="text-left p-2">Revenus</th><th className="text-left p-2">Coûts</th><th className="text-left p-2">Résultat</th></tr></thead>
                        <tbody>
                            {financialProjections.map(p => (
                                <tr key={p.year} className="border-b">
                                    <td className="p-2 font-medium">{p.year} (An {p.year - 2024})</td>
                                    <td className="p-2">{p.clients}</td>
                                    <td className="p-2 text-green-600">{formatCurrency(p.revenue)}</td>
                                    <td className="p-2 text-red-600">{formatCurrency(p.expenses)}</td>
                                    <td className={`p-2 font-semibold ${p.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(p.profit)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Répartition du Capital (Post-financement 1.8M DZD)</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {founders.map(f => (
                        <div key={f.id} className="p-4 border rounded-lg text-center">
                            <h4 className="font-semibold">{f.name}</h4>
                            <p className="text-sm text-muted-foreground">{f.role}</p>
                            <p className="text-3xl font-bold text-primary mt-2">{f.equityPercentage}%</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Équipe de Management</CardTitle></CardHeader>
                <CardContent>
                     <ul className="list-disc pl-5 space-y-2">
                        <li><strong>CEO - Stratégie & Ventes:</strong> Expérience business development, réseau football algérien.</li>
                        <li><strong>CTO - Développement:</strong> 7+ ans dev web, expertise compliance données.</li>
                        <li><strong>Customer Success:</strong> Support technique bilingue, formation utilisateurs.</li>
                        <li><strong>Conseiller Juridique (Temps partiel):</strong> Expert Loi 18-07.</li>
                    </ul>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle>Marché Réaliste Identifié</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Total:</strong> 18-22 clubs potentiels sur 42 professionnels</p>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                        <li><strong>4-6 clubs Ligue 1</strong> progressistes (adoption probable 60%)</li>
                        <li><strong>6-8 clubs Ligue 2</strong> ambitieux (adoption probable 25%)</li>
                        <li><strong>3-5 académies FAF</strong> (adoption probable 80%)</li>
                    </ul>
                    <p className="pt-2"><strong>Potentiel revenus max:</strong> 2.2-2.5M DZD/an</p>
                  </CardContent>
                </Card>
                 <Card>
                  <CardHeader><CardTitle>Analyse Concurrentielle</CardTitle></CardHeader>
                  <CardContent>
                      <p className="font-semibold">Solutions internationales (Wyscout, Hudl, InStat)</p>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground">
                          <li><strong>Prix:</strong> 3,000-30,000 EUR/an</li>
                          <li><strong>Conformité:</strong> ❌ Non-conforme Loi 18-07</li>
                          <li><strong>Support Local:</strong> ❌ Anglais uniquement</li>
                      </ul>
                      <p className="text-sm mt-2"><strong>Notre avantage:</strong> Seule solution conforme avec support local premium, 75% moins cher.</p>
                  </CardContent>
                </Card>
            </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Conformité Réglementaire Algérienne
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {regulations.map((regulation) => (
                  <div key={regulation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold text-foreground">{regulation.name}</h4>
                      <p className="text-sm text-muted-foreground">{regulation.description}</p>
                    </div>
                    <Badge variant={regulation.compliance === 'compliant' ? 'default' : 'secondary'}>
                      {regulation.compliance}
                    </Badge>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessPlanManagement;
