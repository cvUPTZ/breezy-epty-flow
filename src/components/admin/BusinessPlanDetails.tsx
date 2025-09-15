import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrendingUp,
  Target,
  DollarSign,
  Plus,
  Edit,
  Crown,
  Shield,
  UserCheck,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

// Define interfaces for the props
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

interface Founder {
  id: string;
  name: string;
  role: 'founder' | 'co-founder' | 'technical' | 'investor' | 'advisor' | 'commercial';
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


// Props interface for the component
interface BusinessPlanDetailsProps {
  goals: BusinessGoal[];
  revenueStreams: RevenueStream[];
  founders: Founder[];
  financialProjections: FinancialProjection[];
  interventions: InterventionType[];
  activePositions: any;
  includeInvestors: boolean;
  onNewGoal: (goal: Omit<BusinessGoal, 'id' | 'status'>) => void;
  onNewRevenue: (revenue: Omit<RevenueStream, 'id' | 'growth' | 'status'>) => void;
}

const BusinessPlanDetails: React.FC<BusinessPlanDetailsProps> = ({
  goals,
  revenueStreams,
  founders,
  financialProjections,
  interventions,
  activePositions,
  includeInvestors,
  onNewGoal,
  onNewRevenue,
}) => {
  const [newGoal, setNewGoal] = React.useState<{
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

  const [newRevenue, setNewRevenue] = React.useState({
    name: '',
    description: '',
    monthlyRevenue: 0,
    marketSegment: ''
  });

  const handleAddGoal = () => {
    onNewGoal(newGoal);
    setNewGoal({ title: '', description: '', target: '', deadline: '', priority: 'medium' });
  };

  const handleAddRevenue = () => {
    onNewRevenue(newRevenue);
    setNewRevenue({ name: '', description: '', monthlyRevenue: 0, marketSegment: '' });
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

  return (
    <>
      {/* Goals Content */}
      <div className="space-y-6">
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
                  <Input id="goal-title" value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} placeholder="Ex: Expansion dans 3 nouvelles wilayas" />
                </div>
                <div>
                  <Label htmlFor="goal-description">Description</Label>
                  <Textarea id="goal-description" value={newGoal.description} onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })} placeholder="Description détaillée de l'objectif" />
                </div>
                <div>
                  <Label htmlFor="goal-target">Cible</Label>
                  <Input id="goal-target" value={newGoal.target} onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })} placeholder="Ex: 15 nouveaux clubs" />
                </div>
                <div>
                  <Label htmlFor="goal-deadline">Date Limite</Label>
                  <Input id="goal-deadline" type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="goal-priority">Priorité</Label>
                  <Select value={newGoal.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewGoal({ ...newGoal, priority: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Faible</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Élevée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddGoal} className="w-full">Ajouter l'Objectif</Button>
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
                      <Badge variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'}>{goal.priority === 'high' ? 'Élevée' : goal.priority === 'medium' ? 'Moyenne' : 'Faible'}</Badge>
                      <Badge variant={goal.status === 'completed' ? 'default' : goal.status === 'in-progress' ? 'secondary' : 'outline'}>{goal.status === 'completed' ? 'Terminé' : goal.status === 'in-progress' ? 'En cours' : 'En attente'}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Cible: {goal.target}</span>
                      {goal.deadline && (<span>Échéance: {new Date(goal.deadline).toLocaleDateString('fr-FR')}</span>)}
                    </div>
                  </div>
                  <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Revenue Content */}
      <div className="space-y-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-foreground mb-2">Revenus Mensuels</h4>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalMonthlyRevenue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-foreground mb-2">Revenus Annuels</h4>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalYearlyRevenue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-foreground mb-2">Sources Actives</h4>
                <p className="text-2xl font-bold text-purple-600">{revenueStreams.filter(stream => stream.status === 'active').length}</p>
              </CardContent>
            </Card>
        </div>
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sources de Revenus</h3>
            {revenueStreams.map((stream) => (
              <Card key={stream.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">{stream.name}</h4>
                        <Badge variant={stream.status === 'active' ? 'default' : stream.status === 'planned' ? 'secondary' : 'outline'}>{stream.status === 'active' ? 'Actif' : stream.status === 'planned' ? 'Planifié' : 'Discontinué'}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{stream.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium text-green-600">{formatCurrency(stream.monthlyRevenue)}/mois</span>
                        <span className="text-muted-foreground">Segment: {stream.marketSegment}</span>
                        {stream.growth > 0 && (<span className="text-green-600 flex items-center gap-1"><TrendingUp className="h-3 w-3" />+{stream.growth}%</span>)}
                      </div>
                    </div>
                    <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Founders Content */}
      <div className="space-y-6 mt-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Crown className="h-5 w-5 text-primary" />Structure des Fondateurs</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {founders.map((founder) => (
                <div key={founder.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        {founder.role === 'founder' ? <Crown className="h-4 w-4 text-primary" /> : founder.role === 'co-founder' ? <Shield className="h-4 w-4 text-blue-600" /> : founder.role === 'investor' ? <DollarSign className="h-4 w-4 text-green-600" /> : <UserCheck className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div>
                        <h4 className="font-semibold">{founder.name}</h4>
                        <Badge variant="secondary" className="text-xs">{getRoleDisplayName(founder.role)}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{founder.equityPercentage}%</p>
                      <p className="text-xs text-muted-foreground">Équité</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default BusinessPlanDetails;
