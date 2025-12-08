import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Lightbulb,
  CheckCircle,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Hypothesis {
  id: string;
  category: string;
  hypothesis_name: string;
  hypothesis_description: string;
  assumption_basis: string | null;
  confidence_level: string | null;
  validation_status: string | null;
  impact_if_wrong: string | null;
  is_active: boolean | null;
  created_at: string;
}

const CATEGORIES = [
  { value: 'market', label: 'Marché' },
  { value: 'growth', label: 'Croissance' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'expansion', label: 'Expansion' },
  { value: 'competition', label: 'Concurrence' },
];

const CONFIDENCE_LEVELS = [
  { value: 'high', label: 'Haute', color: 'bg-green-500/10 text-green-600' },
  { value: 'medium', label: 'Moyenne', color: 'bg-yellow-500/10 text-yellow-600' },
  { value: 'low', label: 'Faible', color: 'bg-red-500/10 text-red-600' },
];

const VALIDATION_STATUS = [
  { value: 'pending', label: 'En attente', icon: HelpCircle, color: 'bg-muted text-muted-foreground' },
  { value: 'validated', label: 'Validée', icon: CheckCircle, color: 'bg-green-500/10 text-green-600' },
  { value: 'invalidated', label: 'Invalidée', icon: XCircle, color: 'bg-red-500/10 text-red-600' },
  { value: 'revised', label: 'Révisée', icon: AlertTriangle, color: 'bg-orange-500/10 text-orange-600' },
];

export function StrategicHypothesesManager() {
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Hypothesis | null>(null);
  const [formData, setFormData] = useState({
    category: 'market',
    hypothesis_name: '',
    hypothesis_description: '',
    assumption_basis: '',
    confidence_level: 'medium',
    impact_if_wrong: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchHypotheses();
  }, []);

  const fetchHypotheses = async () => {
    try {
      const { data, error } = await supabase
        .from('strategic_hypotheses')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHypotheses(data || []);
    } catch (error) {
      console.error('Error fetching hypotheses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const payload = {
        user_id: userData.user.id,
        category: formData.category,
        hypothesis_name: formData.hypothesis_name,
        hypothesis_description: formData.hypothesis_description,
        assumption_basis: formData.assumption_basis || null,
        confidence_level: formData.confidence_level,
        impact_if_wrong: formData.impact_if_wrong || null,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('strategic_hypotheses')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast({ title: 'Hypothèse mise à jour' });
      } else {
        const { error } = await supabase
          .from('strategic_hypotheses')
          .insert(payload);
        if (error) throw error;
        toast({ title: 'Hypothèse ajoutée' });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchHypotheses();
    } catch (error) {
      console.error('Error saving:', error);
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
        .from('strategic_hypotheses')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Hypothèse supprimée' });
      fetchHypotheses();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const updateValidationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('strategic_hypotheses')
        .update({ validation_status: status })
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Statut mis à jour' });
      fetchHypotheses();
    } catch (error) {
      console.error('Error updating:', error);
    }
  };

  const handleEdit = (item: Hypothesis) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      hypothesis_name: item.hypothesis_name,
      hypothesis_description: item.hypothesis_description,
      assumption_basis: item.assumption_basis || '',
      confidence_level: item.confidence_level || 'medium',
      impact_if_wrong: item.impact_if_wrong || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      category: 'market',
      hypothesis_name: '',
      hypothesis_description: '',
      assumption_basis: '',
      confidence_level: 'medium',
      impact_if_wrong: '',
    });
    setEditingItem(null);
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    const s = VALIDATION_STATUS.find(v => v.value === status);
    if (!s) return null;
    return (
      <Badge className={s.color}>
        <s.icon className="h-3 w-3 mr-1" />
        {s.label}
      </Badge>
    );
  };

  const getConfidenceBadge = (level: string | null) => {
    if (!level) return null;
    const c = CONFIDENCE_LEVELS.find(l => l.value === level);
    if (!c) return null;
    return <Badge variant="outline" className={c.color}>{c.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            Hypothèses Stratégiques
          </h2>
          <p className="text-muted-foreground">
            Gestion et validation des hypothèses business
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une hypothèse
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Modifier l\'hypothèse' : 'Nouvelle hypothèse stratégique'}
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
                  <Label>Niveau de confiance</Label>
                  <Select 
                    value={formData.confidence_level} 
                    onValueChange={(v) => setFormData({ ...formData, confidence_level: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONFIDENCE_LEVELS.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nom de l'hypothèse</Label>
                <Input
                  value={formData.hypothesis_name}
                  onChange={(e) => setFormData({ ...formData, hypothesis_name: e.target.value })}
                  placeholder="Ex: Le marché algérien suffira pour la validation"
                />
              </div>

              <div className="space-y-2">
                <Label>Description détaillée</Label>
                <Textarea
                  value={formData.hypothesis_description}
                  onChange={(e) => setFormData({ ...formData, hypothesis_description: e.target.value })}
                  placeholder="Décrivez l'hypothèse en détail..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Base / Justification</Label>
                <Textarea
                  value={formData.assumption_basis}
                  onChange={(e) => setFormData({ ...formData, assumption_basis: e.target.value })}
                  placeholder="Sur quoi est basée cette hypothèse?"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Impact si fausse</Label>
                <Textarea
                  value={formData.impact_if_wrong}
                  onChange={(e) => setFormData({ ...formData, impact_if_wrong: e.target.value })}
                  placeholder="Que se passe-t-il si cette hypothèse s'avère incorrecte?"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
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

      {/* Hypotheses Grid */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Chargement...</div>
      ) : hypotheses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">Aucune hypothèse stratégique</p>
            <p className="text-sm text-muted-foreground">
              Documentez vos hypothèses business pour assurer leur cohérence
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="grid gap-4">
            {hypotheses.map((hyp) => (
              <Card key={hyp.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">
                          {CATEGORIES.find(c => c.value === hyp.category)?.label}
                        </Badge>
                        {getConfidenceBadge(hyp.confidence_level)}
                        {getStatusBadge(hyp.validation_status)}
                      </div>
                      <CardTitle className="text-lg">{hyp.hypothesis_name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(hyp)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(hyp.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{hyp.hypothesis_description}</p>
                  
                  {hyp.assumption_basis && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Base de l'hypothèse</p>
                      <p className="text-sm">{hyp.assumption_basis}</p>
                    </div>
                  )}

                  {hyp.impact_if_wrong && (
                    <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                      <p className="text-xs font-medium text-destructive mb-1">Impact si fausse</p>
                      <p className="text-sm">{hyp.impact_if_wrong}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {hyp.validation_status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600"
                          onClick={() => updateValidationStatus(hyp.id, 'validated')}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Valider
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600"
                          onClick={() => updateValidationStatus(hyp.id, 'invalidated')}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Invalider
                        </Button>
                      </>
                    )}
                    {hyp.validation_status !== 'pending' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateValidationStatus(hyp.id, 'revised')}
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Réviser
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
