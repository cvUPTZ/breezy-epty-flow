
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
  Banknote
} from 'lucide-react';
import { toast } from 'sonner';

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

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: '',
    deadline: '',
    priority: 'medium' as const
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="goals">Objectifs</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="market">Marché Local</TabsTrigger>
          <TabsTrigger value="compliance">Conformité</TabsTrigger>
        </TabsList>

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
                    <p className="text-sm text-muted-foreground">Croissance</p>
                    <p className="text-2xl font-bold text-foreground">+24%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Croissance annuelle
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
