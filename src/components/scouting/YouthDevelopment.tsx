import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Star, TrendingUp, Calendar, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface YouthProspect {
  id: string;
  name: string;
  birth_date: string | null;
  position: string | null;
  academy_club: string | null;
  development_stage: string | null;
  potential_rating: number | null;
  character_assessment: string | null;
  recommended_pathway: string | null;
  created_at: string | null;
}

const YouthDevelopment: React.FC = () => {
  const [prospects, setProspects] = useState<YouthProspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [newProspect, setNewProspect] = useState({
    name: '',
    birth_date: '',
    position: '',
    academy_club: '',
    development_stage: '',
    potential_rating: '',
    character_assessment: '',
    recommended_pathway: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchProspects();
  }, []);

  const fetchProspects = async () => {
    try {
      const { data, error } = await supabase
        .from('youth_prospects')
        .select('*')
        .order('potential_rating', { ascending: false });

      if (error) throw error;
      setProspects(data || []);
    } catch (error) {
      console.error('Error fetching prospects:', error);
      toast({
        title: "Error",
        description: "Failed to load youth prospects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProspect = async () => {
    try {
      // Get the current user
      if (!user) return;
      
      if (!user?.id) {
        throw new Error('User not authenticated. Please log in.');
      }
      
      // Get the scout record for this user
      const { data: scout, error: scoutError } = await supabase
        .from('scouts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (scoutError || !scout) {
        throw new Error('Scout record not found. Please contact an administrator.');
      }

      const { data, error } = await supabase
        .from('youth_prospects')
        .insert({
          ...newProspect,
          potential_rating: parseInt(newProspect.potential_rating),
          scout_id: scout.id
        })
        .select()
        .single();

      if (error) throw error;

      setProspects([data, ...prospects]);
      setNewProspect({
        name: '',
        birth_date: '',
        position: '',
        academy_club: '',
        development_stage: '',
        potential_rating: '',
        character_assessment: '',
        recommended_pathway: ''
      });
      setIsDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Youth prospect added successfully",
      });
    } catch (error) {
      console.error('Error adding prospect:', error);
      toast({
        title: "Error",
        description: "Failed to add prospect",
        variant: "destructive",
      });
    }
  };

  const filteredProspects = prospects.filter(prospect => {
    const matchesSearch = prospect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (prospect.academy_club || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'all' || prospect.development_stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getPotentialColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600';
    if (rating >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'youth': return 'bg-blue-100 text-blue-800';
      case 'academy': return 'bg-green-100 text-green-800';
      case 'reserve': return 'bg-yellow-100 text-yellow-800';
      case 'first-team': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center">Loading youth prospects...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prospects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="youth">Youth</SelectItem>
              <SelectItem value="academy">Academy</SelectItem>
              <SelectItem value="reserve">Reserve</SelectItem>
              <SelectItem value="first-team">First Team</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Prospect
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Youth Prospect</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newProspect.name}
                    onChange={(e) => setNewProspect({...newProspect, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="birth_date">Birth Date</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={newProspect.birth_date}
                    onChange={(e) => setNewProspect({...newProspect, birth_date: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Select onValueChange={(value) => setNewProspect({...newProspect, position: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                      <SelectItem value="Defender">Defender</SelectItem>
                      <SelectItem value="Midfielder">Midfielder</SelectItem>
                      <SelectItem value="Forward">Forward</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="academy_club">Academy Club</Label>
                  <Input
                    id="academy_club"
                    value={newProspect.academy_club}
                    onChange={(e) => setNewProspect({...newProspect, academy_club: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="development_stage">Development Stage</Label>
                  <Select onValueChange={(value) => setNewProspect({...newProspect, development_stage: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youth">Youth</SelectItem>
                      <SelectItem value="academy">Academy</SelectItem>
                      <SelectItem value="reserve">Reserve</SelectItem>
                      <SelectItem value="first-team">First Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="potential_rating">Potential Rating (1-10)</Label>
                  <Input
                    id="potential_rating"
                    type="number"
                    min="1"
                    max="10"
                    value={newProspect.potential_rating}
                    onChange={(e) => setNewProspect({...newProspect, potential_rating: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="character_assessment">Character Assessment</Label>
                <Textarea
                  id="character_assessment"
                  placeholder="Assessment of player's character and attitude..."
                  value={newProspect.character_assessment}
                  onChange={(e) => setNewProspect({...newProspect, character_assessment: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="recommended_pathway">Recommended Development Pathway</Label>
                <Textarea
                  id="recommended_pathway"
                  placeholder="Suggested development path for the player..."
                  value={newProspect.recommended_pathway}
                  onChange={(e) => setNewProspect({...newProspect, recommended_pathway: e.target.value})}
                />
              </div>

              <Button onClick={handleAddProspect} className="w-full">
                Add Prospect
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Development Pipeline Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Development Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['youth', 'academy', 'reserve', 'first-team'].map((stage) => {
              const count = prospects.filter(p => p.development_stage === stage).length;
              return (
                <div key={stage} className="text-center">
                  <div className={`rounded-lg p-4 ${getStageColor(stage)}`}>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm capitalize">{stage.replace('-', ' ')}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Prospects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProspects.map((prospect) => (
          <Card key={prospect.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{prospect.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{prospect.position}</p>
                </div>
                <Badge className={getStageColor(prospect.development_stage || '')}>
                  {prospect.development_stage?.replace('-', ' ') || 'Unknown'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{prospect.birth_date ? calculateAge(prospect.birth_date) : 'Unknown'} years</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs">{prospect.academy_club || 'Unknown'}</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Potential Rating</span>
                  <span className={`font-bold ${getPotentialColor(prospect.potential_rating || 0)}`}>
                    {prospect.potential_rating || 0}/10
                  </span>
                </div>
                <Progress value={(prospect.potential_rating || 0) * 10} className="h-2" />
              </div>

              {prospect.character_assessment && (
                <div>
                  <h4 className="font-medium text-sm mb-1">Character</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {prospect.character_assessment}
                  </p>
                </div>
              )}

              {prospect.recommended_pathway && (
                <div>
                  <h4 className="font-medium text-sm mb-1">Development Path</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {prospect.recommended_pathway}
                  </p>
                </div>
              )}

              <Button variant="outline" className="w-full">
                View Profile
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProspects.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No youth prospects found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default YouthDevelopment;