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
      title: 'Phase 1: Domination Algérie (2025-2027)',
      description: 'Valider le product-market fit, construire le moat communautaire et atteindre la rentabilité opérationnelle.',
      target: '15 clients, 2.3M+ DZD ARR, Partenariat FAF officiel',
      deadline: '2027-12-31',
      status: 'in-progress',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Phase 2: Expansion Maghreb (Post-2027)',
      description: 'Expansion géographique ciblée (Maroc/Tunisie) conditionnée par le succès de la Phase 1.',
      target: 'Validation product-market fit Maroc/Tunisie',
      deadline: '2029-12-31',
      status: 'pending',
      priority: 'medium'
    },
    {
        id: '3',
        title: 'Phase 2B: Diversification (Post-2028)',
        description: 'Lancement API B2B et expansion multi-sports (Handball, Basketball).',
        target: '5+ partenaires API, 3 sports couverts',
        deadline: '2030-12-31',
        status: 'pending',
        priority: 'low'
    }
  ]);

  const [revenueStreams, setRevenueStreams] = useState<RevenueStream[]>([
    {
      id: '1',
      name: 'Abonnement Basic',
      description: 'Pour clubs Ligue 2 et académies.',
      annualRevenue: 72000,
      status: 'active',
      marketSegment: 'Ligue 2, académies'
    },
    {
      id: '2',
      name: 'Abonnement Professional',
      description: 'Pour clubs de Ligue 1 moyens.',
      annualRevenue: 144000,
      status: 'active',
      marketSegment: 'Ligue 1 Standard'
    },
    {
        id: '3',
        name: 'Abonnement Premium',
        description: 'Pour top clubs avec consulting inclus.',
        annualRevenue: 216000,
        status: 'active',
        marketSegment: 'Ligue 1 Top'
    },
    {
        id: '4',
        name: 'Formation & Certification',
        description: 'Formation initiale et recertification annuelle.',
        annualRevenue: 25000,
        status: 'active',
        marketSegment: 'Tous segments'
    }
  ]);

  const [regulations] = useState<AlgerianRegulation[]>([
    {
      id: '1',
      name: 'Loi 25-11',
      description: 'Conformité sur la protection des données personnelles. Hébergement et traitement des données en Algérie.',
      compliance: 'compliant'
    },
    {
      id: '2',
      name: 'Endorsement FAF/LFP',
      description: 'Endorsement officiel de la Fédération et de la Ligue.',
      compliance: 'pending',
      deadline: '2026-06-30'
    },
    {
      id: '3',
      name: 'Statut SARL',
      description: 'Société à Responsabilité Limitée enregistrée en Algérie.',
      compliance: 'compliant'
    }
  ]);

  const [founders] = useState<Founder[]>([
    {
      id: '1',
      name: 'Karim Benaissa',
      role: 'CEO / Commercial',
      equityPercentage: 30,
      responsibilities: ['Stratégie & Ventes', 'Réseau FAF/LFP', 'Partenariats']
    },
    {
      id: '2',
      name: 'Yacine Brahimi',
      role: 'CTO',
      equityPercentage: 30,
      responsibilities: ['Architecture Technique', 'Sécurité & Conformité', 'Équipe Produit']
    },
    {
        id: '3',
        name: 'Sarah Mekhancha',
        role: 'Directrice Formation',
        equityPercentage: 15,
        responsibilities: ['Pédagogie & Certification', 'Support Client', 'Adoption Produit']
    },
    {
        id: '4',
        name: 'Investisseurs (Seed)',
        role: 'Capital & Conseil',
        equityPercentage: 25,
        responsibilities: ['Financement', 'Conseil Stratégique']
    }
  ]);

  const [financialProjections] = useState<FinancialProjection[]>([
    { year: 2025, clients: 6, revenue: 900000, expenses: 3036000, profit: -2136000 },
    { year: 2026, clients: 10, revenue: 1500000, expenses: 3036000, profit: -1536000 },
    { year: 2027, clients: 12, revenue: 1800000, expenses: 3036000, profit: -1236000 },
    { year: 2028, clients: 15, revenue: 2250000, expenses: 3036000, profit: -786000 },
    { year: 2029, clients: 15, revenue: 2363000, expenses: 2236000, profit: 127000 }
  ]);

  const [costStructure] = useState<CostStructureItem[]>([
      { year: 1, personnel: 1920000, infrastructure: 300000, marketing: 420000, operations: 276000, admin: 0, total: 2916000 },
      { year: 3, personnel: 2640000, infrastructure: 420000, marketing: 360000, operations: 324000, admin: 0, total: 3744000 },
      { year: 5, personnel: 3120000, infrastructure: 540000, marketing: 240000, operations: 372000, admin: 0, total: 4272000 },
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
            Synthèse du Plan d'Affaires (Révisé V10.0)
          </h2>
          <p className="text-muted-foreground">
            SportDataAnalytics SARL - Stratégie fondée sur les données pour le marché algérien
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <MapPin className="h-3 w-3 mr-1" />
          Focus: Marché Algérien
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
                    <p className="text-sm text-muted-foreground">ARR (An 1)</p>
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
                    <p className="text-sm text-muted-foreground">Point Mort (Break-Even)</p>
                    <p className="text-2xl font-bold text-foreground">
                      Année 4-5
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ~15 clients actifs requis
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Marché Adressable</p>
                    <p className="text-2xl font-bold text-foreground">48 Clubs</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Ligue 1 & Ligue 2
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Financement (Seed)</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(1000000)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-orange-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Pour valider le product-market fit
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Business Model Canvas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Business Model Canvas - Synthèse (V11.0)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2"><Lightbulb className="text-primary"/> Proposition de Valeur</h4>
                  <p className="text-sm text-muted-foreground">
                    "La seule solution d'analyse qui comprend le football algérien et garantit votre conformité légale (Loi 25-11)."
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2"><Users className="text-primary"/> Segments Clients</h4>
                  <ul className="text-sm text-muted-foreground list-disc pl-4">
                    <li>Ligue 1 (16 clubs)</li>
                    <li>Ligue 2 (32 clubs)</li>
                    <li>Centres de Formation FAF</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2"><Banknote className="text-primary"/> Sources de Revenus</h4>
                   <ul className="text-sm text-muted-foreground list-disc pl-4">
                    <li>Abonnements SaaS (70%)</li>
                    <li>Formation & Certification (25%)</li>
                    <li>Services Professionnels (5%)</li>
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
                        <div className="flex justify-between p-2 bg-muted rounded"><span>CAC moyen (Coût Acquisition Client)</span> <strong>{formatCurrency(45000)}</strong></div>
                        <div className="flex justify-between p-2 bg-muted rounded"><span>LTV (Valeur Vie Client)</span> <strong>{formatCurrency(450000)}</strong></div>
                        <div className="flex justify-between p-2 bg-muted rounded"><span>Ratio LTV/CAC</span> <strong className="text-green-600">10:1</strong></div>
                        <div className="flex justify-between p-2 bg-muted rounded"><span>Période de Payback</span> <strong>~12 mois</strong></div>
                        <div className="flex justify-between p-2 bg-muted rounded"><span>Taux de Churn Annuel</span> <strong>&lt;12%</strong></div>
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
                                    <td className="p-2 font-medium">{p.year}</td>
                                    <td className="p-2">{p.clients}</td>
                                    <td className="p-2 text-green-600">{formatCurrency(p.revenue)}</td>
                                    <td className="p-2 text-red-600">{formatCurrency(p.expenses)}</td>
                                    <td className={`p-2 font-semibold ${p.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(p.profit)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Répartition du Capital (Post-Seed)</CardTitle></CardHeader>
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
                <CardHeader><CardTitle>Équipe Fondatrice</CardTitle></CardHeader>
                <CardContent>
                     <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Karim Benaissa - CEO/Commercial:</strong> Ex-Manager Systèmes FAF, réseau clubs.</li>
                        <li><strong>Yacine Brahimi - CTO:</strong> Senior Developer, spécialisation SaaS B2B, conformité GDPR.</li>
                        <li><strong>Sarah Mekhancha - Directrice Formation:</strong> Ex-Analyste Performance USMA, certification UEFA B.</li>
                    </ul>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle>Marché Adressable (TAM)</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Total:</strong> 48 clubs professionnels + 8 centres FAF</p>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                        <li><strong>Ligue 1 (16 clubs):</strong> ~2.88M DZD</li>
                        <li><strong>Ligue 2 (32 clubs):</strong> ~2.88M DZD</li>
                    </ul>
                    <p className="pt-2 font-bold">Potentiel total: 5.76M DZD/an</p>
                  </CardContent>
                </Card>
                 <Card>
                  <CardHeader><CardTitle>Analyse Concurrentielle</CardTitle></CardHeader>
                  <CardContent>
                      <p className="font-semibold">Solutions internationales (Stats Perform, Sportradar)</p>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground">
                          <li><strong>Prix:</strong> Premium USD/EUR</li>
                          <li><strong>Conformité:</strong> ❌ Non-conforme Loi 25-11</li>
                          <li><strong>Support Local:</strong> ❌ Limité / Inexistant</li>
                      </ul>
                      <p className="text-sm mt-2"><strong>Notre avantage:</strong> Seule solution conforme avec support local premium et un prix adapté.</p>
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