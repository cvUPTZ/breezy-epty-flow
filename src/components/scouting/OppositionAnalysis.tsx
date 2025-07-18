import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Shield, Zap, Target, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Analysis {
  id: string;
  opponent_team: string;
  match_date: string | null;
  formation: string | null;
  playing_style: string | null;
  key_players: any;
  strengths: string[] | null;
  weaknesses: string[] | null;
  tactical_recommendations: string | null;
  set_piece_analysis: any;
  created_at: string | null;
}

const OppositionAnalysis: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newAnalysis, setNewAnalysis] = useState({
    opponent_team: '',
    match_date: '',
    formation: '',
    playing_style: '',
    strengths: '',
    weaknesses: '',
    tactical_recommendations: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('opposition_analysis')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error('Error fetching analyses:', error);
      toast({
        title: "Error",
        description: "Failed to load opposition analyses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnalysis = async () => {
    try {
      const { data, error } = await supabase
        .from('opposition_analysis')
        .insert({
          ...newAnalysis,
          strengths: newAnalysis.strengths.split(',').map(s => s.trim()),
          weaknesses: newAnalysis.weaknesses.split(',').map(s => s.trim()),
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      setAnalyses([data, ...analyses]);
      setNewAnalysis({
        opponent_team: '',
        match_date: '',
        formation: '',
        playing_style: '',
        strengths: '',
        weaknesses: '',
        tactical_recommendations: ''
      });
      setIsDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Opposition analysis added successfully",
      });
    } catch (error) {
      console.error('Error adding analysis:', error);
      toast({
        title: "Error",
        description: "Failed to add analysis",
        variant: "destructive",
      });
    }
  };

  const filteredAnalyses = analyses.filter(analysis =>
    analysis.opponent_team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="text-center">Loading opposition analyses...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-64"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Opposition Analysis</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="opponent_team">Opponent Team</Label>
                  <Input
                    id="opponent_team"
                    value={newAnalysis.opponent_team}
                    onChange={(e) => setNewAnalysis({...newAnalysis, opponent_team: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="match_date">Match Date</Label>
                  <Input
                    id="match_date"
                    type="date"
                    value={newAnalysis.match_date}
                    onChange={(e) => setNewAnalysis({...newAnalysis, match_date: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formation">Formation</Label>
                  <Input
                    id="formation"
                    placeholder="e.g., 4-3-3"
                    value={newAnalysis.formation}
                    onChange={(e) => setNewAnalysis({...newAnalysis, formation: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="playing_style">Playing Style</Label>
                  <Input
                    id="playing_style"
                    placeholder="e.g., Possession-based"
                    value={newAnalysis.playing_style}
                    onChange={(e) => setNewAnalysis({...newAnalysis, playing_style: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="strengths">Strengths (comma-separated)</Label>
                <Textarea
                  id="strengths"
                  placeholder="e.g., Strong midfield, Good set pieces"
                  value={newAnalysis.strengths}
                  onChange={(e) => setNewAnalysis({...newAnalysis, strengths: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="weaknesses">Weaknesses (comma-separated)</Label>
                <Textarea
                  id="weaknesses"
                  placeholder="e.g., Weak left flank, Poor aerial defense"
                  value={newAnalysis.weaknesses}
                  onChange={(e) => setNewAnalysis({...newAnalysis, weaknesses: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="tactical_recommendations">Tactical Recommendations</Label>
                <Textarea
                  id="tactical_recommendations"
                  placeholder="Recommended tactical approach..."
                  value={newAnalysis.tactical_recommendations}
                  onChange={(e) => setNewAnalysis({...newAnalysis, tactical_recommendations: e.target.value})}
                />
              </div>

              <Button onClick={handleAddAnalysis} className="w-full">
                Add Analysis
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analyses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAnalyses.map((analysis) => (
          <Card key={analysis.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{analysis.opponent_team}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Calendar className="w-4 h-4" />
                    {analysis.match_date ? formatDate(analysis.match_date) : 'No date set'}
                  </div>
                </div>
                <Badge variant="outline">
                  {analysis.formation || 'Unknown'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.playing_style && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Playing Style</h4>
                  <p className="text-sm text-muted-foreground">{analysis.playing_style}</p>
                </div>
              )}

              {analysis.strengths && analysis.strengths.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-green-600" />
                    <h4 className="font-medium text-sm">Strengths</h4>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {analysis.strengths.map((strength, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-red-600" />
                    <h4 className="font-medium text-sm">Weaknesses</h4>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {analysis.weaknesses.map((weakness, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {weakness}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {analysis.tactical_recommendations && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-sm">Tactical Recommendations</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {analysis.tactical_recommendations}
                  </p>
                </div>
              )}

              <Button variant="outline" className="w-full mt-4">
                View Full Analysis
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAnalyses.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No opposition analyses found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OppositionAnalysis;