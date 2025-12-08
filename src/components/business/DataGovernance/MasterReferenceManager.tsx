import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  History, 
  Database,
  TrendingUp,
  Target,
  DollarSign,
  Globe,
  Save,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReferenceData {
  id: string;
  category: string;
  key_name: string;
  value: number | null;
  value_text: string | null;
  unit: string | null;
  calculation_method: string | null;
  data_source: string | null;
  justification: string | null;
  valid_from: string | null;
  is_active: boolean | null;
}

interface ChangeHistory {
  id: string;
  reference_id: string;
  previous_value: number | null;
  new_value: number | null;
  change_reason: string;
  change_type: string;
  created_at: string;
}

const CATEGORIES = [
  { value: 'financial', label: 'Financier', icon: DollarSign },
  { value: 'market', label: 'Marché', icon: TrendingUp },
  { value: 'strategic', label: 'Stratégique', icon: Target },
  { value: 'expansion', label: 'Expansion', icon: Globe },
];

const COMMON_KEYS = {
  financial: ['TAM', 'SAM', 'SOM', 'ARPU', 'LTV', 'CAC', 'LTV_CAC_RATIO', 'ARR', 'MRR', 'CHURN_RATE', 'GROSS_MARGIN'],
  market: ['MARKET_SIZE', 'MARKET_GROWTH', 'MARKET_SHARE', 'CUSTOMER_COUNT', 'PENETRATION_RATE'],
  strategic: ['BREAK_EVEN_CUSTOMERS', 'BREAK_EVEN_REVENUE', 'TARGET_MARGIN', 'PAYBACK_PERIOD'],
  expansion: ['TARGET_REGIONS', 'EXPANSION_TIMELINE', 'INVESTMENT_REQUIRED'],
};

export function MasterReferenceManager() {
  const [references, setReferences] = useState<ReferenceData[]>([]);
  const [history, setHistory] = useState<ChangeHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<ReferenceData | null>(null);
  const [formData, setFormData] = useState({
    category: 'financial',
    key_name: '',
    value: '',
    value_text: '',
    unit: 'DZD',
    calculation_method: '',
    data_source: '',
    justification: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchReferences();
  }, []);

  const fetchReferences = async () => {
    try {
      const { data, error } = await supabase
        .from('master_reference_data')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setReferences(data || []);
    } catch (error) {
      console.error('Error fetching references:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données de référence',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (referenceId: string) => {
    try {
      const { data, error } = await supabase
        .from('reference_data_history')
        .select('*')
        .eq('reference_id', referenceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
      setIsHistoryDialogOpen(true);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const payload = {
        user_id: userData.user.id,
        category: formData.category,
        key_name: formData.key_name,
        value: formData.value ? parseFloat(formData.value) : null,
        value_text: formData.value_text || null,
        unit: formData.unit,
        calculation_method: formData.calculation_method || null,
        data_source: formData.data_source || null,
        justification: formData.justification || null,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('master_reference_data')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast({ title: 'Donnée mise à jour' });
      } else {
        const { error } = await supabase
          .from('master_reference_data')
          .insert(payload);
        if (error) throw error;
        toast({ title: 'Donnée ajoutée' });
      }

      setIsAddDialogOpen(false);
      setEditingItem(null);
      resetForm();
      fetchReferences();
    } catch (error) {
      console.error('Error saving reference:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('master_reference_data')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Donnée supprimée' });
      fetchReferences();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleEdit = (item: ReferenceData) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      key_name: item.key_name,
      value: item.value?.toString() || '',
      value_text: item.value_text || '',
      unit: item.unit || 'DZD',
      calculation_method: item.calculation_method || '',
      data_source: item.data_source || '',
      justification: item.justification || '',
    });
    setIsAddDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      category: 'financial',
      key_name: '',
      value: '',
      value_text: '',
      unit: 'DZD',
      calculation_method: '',
      data_source: '',
      justification: '',
    });
    setEditingItem(null);
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat ? <cat.icon className="h-4 w-4" /> : <Database className="h-4 w-4" />;
  };

  const filteredReferences = selectedCategory === 'all' 
    ? references 
    : references.filter(r => r.category === selectedCategory);

  const formatValue = (item: ReferenceData) => {
    if (item.value !== null) {
      return `${item.value.toLocaleString('fr-FR')} ${item.unit || ''}`;
    }
    return item.value_text || '-';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Document de Référence Maître
          </h2>
          <p className="text-muted-foreground">
            Chiffres clés et hypothèses stratégiques centralisés
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une donnée
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Modifier la donnée' : 'Nouvelle donnée de référence'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Indicateur</Label>
                  <Select 
                    value={formData.key_name} 
                    onValueChange={(v) => setFormData({ ...formData, key_name: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner ou saisir" />
                    </SelectTrigger>
                    <SelectContent>
                      {(COMMON_KEYS[formData.category as keyof typeof COMMON_KEYS] || []).map(key => (
                        <SelectItem key={key} value={key}>{key}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valeur numérique</Label>
                  <Input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="Ex: 4480000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unité</Label>
                  <Select 
                    value={formData.unit} 
                    onValueChange={(v) => setFormData({ ...formData, unit: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DZD">DZD</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="%">%</SelectItem>
                      <SelectItem value="ratio">Ratio</SelectItem>
                      <SelectItem value="clients">Clients</SelectItem>
                      <SelectItem value="mois">Mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Valeur textuelle (si non numérique)</Label>
                <Input
                  value={formData.value_text}
                  onChange={(e) => setFormData({ ...formData, value_text: e.target.value })}
                  placeholder="Ex: Algérie, Maroc, Tunisie"
                />
              </div>

              <div className="space-y-2">
                <Label>Méthode de calcul</Label>
                <Textarea
                  value={formData.calculation_method}
                  onChange={(e) => setFormData({ ...formData, calculation_method: e.target.value })}
                  placeholder="Décrivez la méthode utilisée pour calculer cette valeur..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Source des données</Label>
                <Input
                  value={formData.data_source}
                  onChange={(e) => setFormData({ ...formData, data_source: e.target.value })}
                  placeholder="Ex: Étude de marché 2024, Rapport FAF..."
                />
              </div>

              <div className="space-y-2">
                <Label>Justification / Notes</Label>
                <Textarea
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  placeholder="Contexte et justification de cette valeur..."
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmit}>
                <Save className="h-4 w-4 mr-2" />
                {editingItem ? 'Mettre à jour' : 'Enregistrer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          {CATEGORIES.map(cat => (
            <TabsTrigger key={cat.value} value={cat.value} className="gap-2">
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Reference Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Données de Référence ({filteredReferences.length})</CardTitle>
          <CardDescription>
            Ces valeurs servent de base pour la validation de cohérence des documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : filteredReferences.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune donnée de référence</p>
              <p className="text-sm">Commencez par ajouter vos chiffres clés</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Indicateur</TableHead>
                    <TableHead>Valeur</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReferences.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {getCategoryIcon(item.category)}
                          {CATEGORIES.find(c => c.value === item.category)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.key_name}</TableCell>
                      <TableCell className="font-mono">{formatValue(item)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {item.data_source || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {item.calculation_method || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => fetchHistory(item.id)}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Historique des modifications</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px]">
            {history.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Aucun historique</p>
            ) : (
              <div className="space-y-3">
                {history.map((h) => (
                  <div key={h.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline">{h.change_type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(h.created_at).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">
                        {h.previous_value?.toLocaleString()} → {h.new_value?.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{h.change_reason}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
