import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Button
} from '@/components/ui/button';
import {
  Input
} from '@/components/ui/input';
import {
  Label
} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Badge
} from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Plus,
  Search,
  Star,
  TrendingUp,
  Calendar,
  Flag
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface ScoutReport {
  id: string;
  performance_rating: number | null;
  recommendation: string | null;
}

interface Player {
  id: string;
  name: string;
  position: string | null;
  age: number | null;
  nationality: string | null;
  current_club: string | null;
  league: string | null;
  market_value: number | null;
  contract_expires: string | null;
  created_at: string | null;
  created_by?: string | null;
  updated_at?: string | null;
  scout_reports?: ScoutReport[];
}

const PlayerIdentification: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const [newPlayer, setNewPlayer] = useState({
    name: '',
    position: '',
    age: '',
    nationality: '',
    current_club: '',
    league: 'Algerian Ligue 1',
    market_value: '',
    contract_expires: '',
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scouted_players')
        .select(`
          id, name, position, age, nationality, current_club, league,
          market_value, contract_expires, created_at,
          created_by, updated_at,
          scout_reports(id, performance_rating, recommendation)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error: any) {
      console.error('Error fetching players:', error);
      toast({
        title: "Error",
        description: "Failed to load players",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async () => {
    try {
      const { data, error } = await supabase
        .from('scouted_players')
        .insert({
          ...newPlayer,
          age: newPlayer.age ? parseInt(newPlayer.age) : null,
          market_value: newPlayer.market_value ? parseFloat(newPlayer.market_value) : null,
          contract_expires: newPlayer.contract_expires || null,
          created_by: user?.id
        })
        .select(`
          id, name, position, age, nationality, current_club, league,
          market_value, contract_expires, created_at,
          scout_reports(id, performance_rating, recommendation)
        `)
        .single();

      if (error) throw error;

      setPlayers([data as Player, ...players]);
      setNewPlayer({
        name: '', position: '', age: '', nationality: '', current_club: '',
        league: 'Algerian Ligue 1', market_value: '', contract_expires: ''
      });
      setIsDialogOpen(false);

      toast({ title: "Success", description: "Player added successfully" });
    } catch (error: any) {
      console.error('Error adding player:', error);
      toast({
        title: "Error",
        description: `Failed to add player: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === 'all' || player.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  const getAverageRating = (reports: ScoutReport[]) => {
    if (!reports || reports.length === 0) return 0;
    const total = reports.reduce((sum, report) => sum + (report.performance_rating || 0), 0);
    return (total / reports.length).toFixed(1);
  };

  const getRecommendationBadge = (reports: ScoutReport[]) => {
    if (!reports || reports.length === 0) return null;

    const recommendations = reports.map(r => r.recommendation).filter((rec): rec is string => rec !== null);
    if (recommendations.length === 0) return null;
    
    const counts: Record<string, number> = {};
    for (const rec of recommendations) {
      counts[rec] = (counts[rec] || 0) + 1;
    }

    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (!top) return null;

    return <Badge variant="outline">{top}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
              <SelectItem value="Defender">Defender</SelectItem>
              <SelectItem value="Midfielder">Midfielder</SelectItem>
              <SelectItem value="Forward">Forward</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Player
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Player Manually</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto p-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={newPlayer.name} onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Select onValueChange={(value) => setNewPlayer({ ...newPlayer, position: value })}>
                    <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                      <SelectItem value="Defender">Defender</SelectItem>
                      <SelectItem value="Midfielder">Midfielder</SelectItem>
                      <SelectItem value="Forward">Forward</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" value={newPlayer.age} onChange={(e) => setNewPlayer({ ...newPlayer, age: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input id="nationality" value={newPlayer.nationality} onChange={(e) => setNewPlayer({ ...newPlayer, nationality: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="current_club">Current Club</Label>
                  <Input id="current_club" value={newPlayer.current_club} onChange={(e) => setNewPlayer({ ...newPlayer, current_club: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="league">League</Label>
                  <Input id="league" value={newPlayer.league} onChange={(e) => setNewPlayer({ ...newPlayer, league: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="market_value">Market Value (€)</Label>
                  <Input id="market_value" type="number" placeholder="e.g., 500000" value={newPlayer.market_value} onChange={(e) => setNewPlayer({ ...newPlayer, market_value: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="contract_expires">Contract Expires</Label>
                  <Input id="contract_expires" type="date" value={newPlayer.contract_expires} onChange={(e) => setNewPlayer({ ...newPlayer, contract_expires: e.target.value })} />
                </div>
              </div>
              <Button onClick={handleAddPlayer} className="w-full mt-4">
                Add Player to Database
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlayers.map((player) => (
          <Card key={player.id} className="hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{player.name}</CardTitle>
                    {getRecommendationBadge(player.scout_reports || [])}
                  </div>
                  <p className="text-sm text-muted-foreground">{player.position}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm flex-grow">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-muted-foreground" />
                <span>{player.nationality}, {player.age} years</span>
              </div>
              <div className="font-semibold">{player.current_club} <span className="font-normal text-muted-foreground">({player.league})</span></div>

              {player.market_value && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-medium">€{player.market_value?.toLocaleString()}</span>
                </div>
              )}
              {player.contract_expires && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Contract until {new Date(player.contract_expires).toLocaleDateString()}</span>
                </div>
              )}

              {player.scout_reports && player.scout_reports.length > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t mt-3">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{getAverageRating(player.scout_reports)}/10</span>
                  <span className="text-xs text-muted-foreground">({player.scout_reports.length} reports)</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPlayers.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No players found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlayerIdentification;
