import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Slider } from '@/components/ui/slider';
import { Plus, FileText, Calendar, Star, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface Player {
  id: string;
  name: string;
  position: string | null;
  current_club: string | null;
}

interface ScoutReport {
  id: string;
  player_id: string | null;
  performance_rating: number | null;
  recommendation: string | null;
  match_context: string | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  detailed_notes: string | null;
  report_date: string | null;
  created_at?: string | null;
  scouted_players?: {
    name: string;
    position: string | null;
    current_club: string | null;
  } | null;
}

interface PlayerScoutReportProps {
  playerId?: string;
}

const PlayerScoutReport: React.FC<PlayerScoutReportProps> = ({ playerId }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [reports, setReports] = useState<ScoutReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    player_id: playerId || '',
    performance_rating: 7,
    recommendation: '',
    match_context: '',
    strengths: '',
    weaknesses: '',
    detailed_notes: '',
    report_date: new Date().toISOString().split('T')[0]
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch players
      const { data: playersData, error: playersError } = await supabase
        .from('scouted_players')
        .select('id, name, position, current_club')
        .order('name');

      if (playersError) throw playersError;
      setPlayers(playersData || []);

      // Fetch reports
      const reportsQuery = supabase
        .from('scout_reports')
        .select(`
          *,
          scouted_players(name, position, current_club)
        `)
        .order('report_date', { ascending: false });

      if (playerId) {
        reportsQuery.eq('player_id', playerId);
      }

      const { data: reportsData, error: reportsError } = await reportsQuery;

      if (reportsError) throw reportsError;
      setReports(reportsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load scout reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async () => {
    try {
      const { data, error } = await supabase
        .from('scout_reports')
        .insert({
          ...newReport,
          strengths: newReport.strengths.split(',').map(s => s.trim()).filter(Boolean),
          weaknesses: newReport.weaknesses.split(',').map(s => s.trim()).filter(Boolean),
          scout_id: user?.id
        })
        .select(`
          *,
          scouted_players(name, position, current_club)
        `)
        .single();

      if (error) throw error;

      setReports([data, ...reports]);
      setNewReport({
        player_id: playerId || '',
        performance_rating: 7,
        recommendation: '',
        match_context: '',
        strengths: '',
        weaknesses: '',
        detailed_notes: '',
        report_date: new Date().toISOString().split('T')[0]
      });
      setIsDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Scout report created successfully",
      });
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        title: "Error",
        description: "Failed to create scout report",
        variant: "destructive",
      });
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'sign': return 'bg-green-500';
      case 'monitor': return 'bg-yellow-500';
      case 'reject': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600';
    if (rating >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return <div className="text-center">Loading scout reports...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Scout Reports</h2>
          <p className="text-muted-foreground">
            {playerId ? 'Player-specific reports' : 'All scout reports'}
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Scout Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="player_id">Player</Label>
                  {playerId ? (
                    <div className="p-2 bg-muted rounded">
                      {players.find(p => p.id === playerId)?.name || 'Selected Player'}
                    </div>
                  ) : (
                    <Select value={newReport.player_id} onValueChange={(value) => setNewReport({...newReport, player_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map(player => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name} - {player.position} ({player.current_club})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  <Label htmlFor="report_date">Report Date</Label>
                  <Input
                    id="report_date"
                    type="date"
                    value={newReport.report_date}
                    onChange={(e) => setNewReport({...newReport, report_date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="match_context">Match Context</Label>
                <Input
                  id="match_context"
                  placeholder="e.g., vs Real Madrid, Champions League"
                  value={newReport.match_context}
                  onChange={(e) => setNewReport({...newReport, match_context: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="performance_rating">Performance Rating (1-10)</Label>
                <Input
                  id="performance_rating"
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  value={newReport.performance_rating}
                  onChange={(e) => setNewReport({...newReport, performance_rating: parseFloat(e.target.value)})}
                />
              </div>

              <div>
                <Label htmlFor="recommendation">Recommendation</Label>
                <Select value={newReport.recommendation} onValueChange={(value) => setNewReport({...newReport, recommendation: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recommendation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sign">Sign</SelectItem>
                    <SelectItem value="monitor">Monitor</SelectItem>
                    <SelectItem value="reject">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="strengths">Strengths (comma-separated)</Label>
                <Textarea
                  id="strengths"
                  placeholder="e.g., Excellent pace, Strong aerial ability, Good vision"
                  value={newReport.strengths}
                  onChange={(e) => setNewReport({...newReport, strengths: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="weaknesses">Weaknesses (comma-separated)</Label>
                <Textarea
                  id="weaknesses"
                  placeholder="e.g., Weak left foot, Poor defensive positioning"
                  value={newReport.weaknesses}
                  onChange={(e) => setNewReport({...newReport, weaknesses: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="detailed_notes">Detailed Notes</Label>
                <Textarea
                  id="detailed_notes"
                  placeholder="Detailed assessment of the player's performance..."
                  value={newReport.detailed_notes}
                  onChange={(e) => setNewReport({...newReport, detailed_notes: e.target.value})}
                  rows={4}
                />
              </div>

              <Button onClick={handleCreateReport} className="w-full">
                Create Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {report.scouted_players?.name || 'Unknown Player'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {report.scouted_players?.position} • {report.scouted_players?.current_club}
                  </p>
                  {report.match_context && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {report.match_context}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${getRatingColor(report.performance_rating || 0)}`}>
                    {report.performance_rating || 0}/10
                  </div>
                  <Badge className={`${getRecommendationColor(report.recommendation || 'unknown')} text-white`}>
                    {report.recommendation || 'Unknown'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {report.report_date ? new Date(report.report_date).toLocaleDateString() : 'No date'}
              </div>

              {report.strengths && report.strengths.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2 text-green-700">Strengths</h4>
                  <div className="flex flex-wrap gap-1">
                    {report.strengths.map((strength, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {report.weaknesses && report.weaknesses.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2 text-red-700">Weaknesses</h4>
                  <div className="flex flex-wrap gap-1">
                    {report.weaknesses.map((weakness, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-red-100 text-red-800">
                        {weakness}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {report.detailed_notes && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">
                    {report.detailed_notes}
                  </p>
                </div>
              )}

              <Button variant="outline" size="sm" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                View Full Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {reports.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No scout reports found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlayerScoutReport;