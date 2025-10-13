import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Target, X, PlusCircle } from 'lucide-react';
import { AIProcessingService } from '@/services/aiProcessingService'; // Adjust path
import { useToast } from '@/hooks/use-toast'; // Adjust path

// --- TYPE DEFINITIONS (can be moved to a types.ts file) ---
export type Formation = '4-4-2' | '4-3-3' | '3-5-2' | '4-2-3-1' | '5-3-2' | '3-4-3';

export interface Player {
  id: number;
  name: string;
  number: number | null;
  position: string;
  isSubstitute: boolean;
}

interface TeamSetupSectionProps {
  homeTeamPlayers: Player[];
  awayTeamPlayers: Player[];
  formData: {
    homeTeamFormation: Formation;
    awayTeamFormation: Formation;
    homeTeamFlagUrl: string;
    awayTeamFlagUrl: string;
  };
  onFormDataChange: (field: string, value: string) => void;
  onPlayersChange: (team: 'home' | 'away', players: Player[]) => void;
  onFlagChange: (e: React.ChangeEvent<HTMLInputElement>, team: 'home' | 'away') => void;
  onAddPlayer: (team: 'home' | 'away', isSubstitute: boolean) => void;
  onRemovePlayer: (team: 'home' | 'away', playerId: number) => void;
}

// --- CONSTANTS ---
const FORMATIONS: Formation[] = ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2', '3-4-3'];
const STARTERS_COUNT = 11;

const FOOTBALL_POSITIONS = {
  Goalkeeper: ['GK'],
  Defense: ['CB', 'LB', 'RB', 'LWB', 'RWB', 'SW'],
  Midfield: ['DM', 'CM', 'AM', 'LM', 'RM', 'CDM', 'CAM'],
  Attack: ['CF', 'ST', 'LW', 'RW', 'LF', 'RF', 'SS']
};

const getPositionByFormationAndOrder = (formation: Formation, playerIndex: number): string => {
    const positionMaps: Record<Formation, string[]> = {
      '4-4-2': ['GK', 'RB', 'CB', 'CB', 'LB', 'RM', 'CM', 'CM', 'LM', 'ST', 'ST'],
      '4-3-3': ['GK', 'RB', 'CB', 'CB', 'LB', 'CM', 'CM', 'CM', 'RW', 'ST', 'LW'],
      '3-5-2': ['GK', 'CB', 'CB', 'CB', 'RWB', 'CM', 'CM', 'CM', 'LWB', 'ST', 'ST'],
      '4-2-3-1': ['GK', 'RB', 'CB', 'CB', 'LB', 'CDM', 'CDM', 'CAM', 'CAM', 'CAM', 'ST'],
      '5-3-2': ['GK', 'RB', 'CB', 'CB', 'CB', 'LB', 'CM', 'CM', 'CM', 'ST', 'ST'],
      '3-4-3': ['GK', 'CB', 'CB', 'CB', 'RM', 'CM', 'CM', 'LM', 'RW', 'ST', 'LW']
    };
    const positions = positionMaps[formation] || [];
    return positions[playerIndex] || (playerIndex < 11 ? 'FIELD' : 'SUB');
};


const TeamSetupSection: React.FC<TeamSetupSectionProps> = ({
  homeTeamPlayers,
  awayTeamPlayers,
  formData,
  onFormDataChange,
  onPlayersChange,
  onFlagChange,
  onAddPlayer,
  onRemovePlayer,
}) => {
  const { toast } = useToast();
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);

  const updatePlayer = (team: 'home' | 'away', playerId: number, field: keyof Player, value: any) => {
    const players = team === 'home' ? homeTeamPlayers : awayTeamPlayers;
    const updatedPlayers = players.map(player =>
      player.id === playerId ? { ...player, [field]: value } : player
    );
    onPlayersChange(team, updatedPlayers);
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImageFile(event.target.files[0]);
    } else {
      setSelectedImageFile(null);
    }
  };

  const handleProcessImage = async (team: 'home' | 'away') => {
    if (!selectedImageFile) {
      toast({ title: "No Image Selected", description: "Please select an image file first.", variant: "destructive" });
      return;
    }
    
    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.readAsDataURL(selectedImageFile);
    reader.onload = async () => {
      const base64Image = reader.result as string;
      try {
        const aiResponse = await AIProcessingService.extractPlayersFromImage(base64Image);
        
        const playersToProcess = (team === 'home' ? aiResponse.team_alpha_players : aiResponse.team_beta_players) || [];

        if (playersToProcess.length === 0) {
          toast({ title: "No Players Found", description: `The AI could not identify players for the ${team} team.` });
          return;
        }

        const currentPlayers = team === 'home' ? homeTeamPlayers : awayTeamPlayers;
        const formation = team === 'home' ? formData.homeTeamFormation : formData.awayTeamFormation;
        
        const aiStarters = playersToProcess.filter(p => !p.is_substitute);
        const aiSubs = playersToProcess.filter(p => p.is_substitute);
        
        const newPlayers = [...currentPlayers];
        
        aiStarters.forEach((aiPlayer, index) => {
          if (index < newPlayers.filter(p => !p.isSubstitute).length) {
            const playerToUpdate = newPlayers.filter(p => !p.isSubstitute)[index];
            playerToUpdate.name = aiPlayer.name || playerToUpdate.name;
            playerToUpdate.number = aiPlayer.number !== null ? aiPlayer.number : playerToUpdate.number;
            playerToUpdate.position = getPositionByFormationAndOrder(formation, index);
          }
        });
        
        aiSubs.forEach((aiPlayer, index) => {
          const subsList = newPlayers.filter(p => p.isSubstitute);
          if (index < subsList.length) {
             const playerToUpdate = subsList[index];
             playerToUpdate.name = aiPlayer.name || playerToUpdate.name;
             playerToUpdate.number = aiPlayer.number !== null ? aiPlayer.number : playerToUpdate.number;
             playerToUpdate.position = 'SUB';
          }
        });

        onPlayersChange(team, newPlayers);
        toast({ title: "Processing Successful", description: `The ${team} Team player list has been updated.` });
      } catch (error: any) {
        toast({ title: "Processing Failed", description: error.message || "An unknown error occurred.", variant: "destructive" });
      } finally {
        setIsProcessingImage(false);
      }
    };
    reader.onerror = () => {
      setIsProcessingImage(false);
      toast({ title: "File Reading Error", description: "Could not read the selected image file.", variant: "destructive" });
    };
  };

  const renderPlayerInputs = (players: Player[], team: 'home' | 'away') => (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-2 items-center text-sm font-medium px-2 text-muted-foreground">
        <div className="col-span-2">Number</div>
        <div className="col-span-5">Name</div>
        <div className="col-span-4">Position</div>
        <div className="col-span-1"></div>
      </div>
      {players.map((player) => (
        <div key={player.id} className="grid grid-cols-12 gap-2 items-center text-sm">
          <Input
            type="number"
            value={player.number ?? ''}
            onChange={(e) => updatePlayer(team, player.id, 'number', e.target.value ? parseInt(e.target.value) : null)}
            className="h-8 col-span-2"
            placeholder="#"
          />
          <Input
            value={player.name}
            onChange={(e) => updatePlayer(team, player.id, 'name', e.target.value)}
            placeholder="Player name"
            className="h-8 col-span-5"
          />
          <Select
            value={player.position || 'none'}
            onValueChange={(value) => updatePlayer(team, player.id, 'position', value === 'none' ? '' : value)}
          >
            <SelectTrigger className="h-8 col-span-4">
              <SelectValue placeholder={player.isSubstitute ? 'Substitute' : 'Select position'} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="none">No Position</SelectItem>
                {player.isSubstitute ? (
                  <SelectItem value="SUB">Substitute</SelectItem>
                ) : (
                  Object.entries(FOOTBALL_POSITIONS).map(([group, positions]) => (
                    <React.Fragment key={group}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted">{group}</div>
                      {positions.map(pos => <SelectItem key={pos} value={pos}>{pos}</SelectItem>)}
                    </React.Fragment>
                  ))
                )}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 col-span-1 text-muted-foreground hover:text-destructive"
            onClick={() => onRemovePlayer(team, player.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" /> AI Player Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="image-upload">Upload Team Sheet Image</Label>
            <Input id="image-upload" type="file" accept="image/*" onChange={handleImageFileChange} className="mt-2" />
          </div>
          {selectedImageFile && (
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => handleProcessImage('home')} disabled={isProcessingImage} className="flex-1">
                {isProcessingImage ? 'Processing...' : 'Process for Home Team'}
              </Button>
              <Button type="button" variant="outline" onClick={() => handleProcessImage('away')} disabled={isProcessingImage} className="flex-1">
                {isProcessingImage ? 'Processing...' : 'Process for Away Team'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Home Team</CardTitle>
            <div className="mt-4 space-y-4">
              <div>
                <Label>Formation</Label>
                <Select value={formData.homeTeamFormation} onValueChange={(value: Formation) => onFormDataChange('homeTeamFormation', value)}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{FORMATIONS.map((f) => (<SelectItem key={f} value={f}>{f}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="starters" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="starters">Starters ({homeTeamPlayers.filter(p => !p.isSubstitute).length})</TabsTrigger>
                <TabsTrigger value="subs">Substitutes ({homeTeamPlayers.filter(p => p.isSubstitute).length})</TabsTrigger>
              </TabsList>
              <TabsContent value="starters" className="pt-4 space-y-4">
                {renderPlayerInputs(homeTeamPlayers.filter(p => !p.isSubstitute), 'home')}
                <Button type="button" variant="outline" className="w-full" onClick={() => onAddPlayer('home', false)}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Starter
                </Button>
              </TabsContent>
              <TabsContent value="subs" className="pt-4 space-y-4">
                {renderPlayerInputs(homeTeamPlayers.filter(p => p.isSubstitute), 'home')}
                <Button type="button" variant="outline" className="w-full" onClick={() => onAddPlayer('home', true)}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Substitute
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Away Team</CardTitle>
             <div className="mt-4 space-y-4">
                <Label>Formation</Label>
                <Select value={formData.awayTeamFormation} onValueChange={(value: Formation) => onFormDataChange('awayTeamFormation', value)}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{FORMATIONS.map((f) => (<SelectItem key={f} value={f}>{f}</SelectItem>))}</SelectContent>
                </Select>
              </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="starters" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="starters">Starters ({awayTeamPlayers.filter(p => !p.isSubstitute).length})</TabsTrigger>
                <TabsTrigger value="subs">Substitutes ({awayTeamPlayers.filter(p => p.isSubstitute).length})</TabsTrigger>
              </TabsList>
              <TabsContent value="starters" className="pt-4 space-y-4">
                {renderPlayerInputs(awayTeamPlayers.filter(p => !p.isSubstitute), 'away')}
                <Button type="button" variant="outline" className="w-full" onClick={() => onAddPlayer('away', false)}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Starter
                </Button>
              </TabsContent>
              <TabsContent value="subs" className="pt-4 space-y-4">
                {renderPlayerInputs(awayTeamPlayers.filter(p => p.isSubstitute), 'away')}
                <Button type="button" variant="outline" className="w-full" onClick={() => onAddPlayer('away', true)}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Substitute
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamSetupSection;
