import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Target } from 'lucide-react';
import { AIProcessingService } from '@/services/aiProcessingService';
import { useToast } from '@/hooks/use-toast';
import { PlayerPosition } from '@/types/tracking-taxonomy';

type Formation = '4-4-2' | '4-3-3' | '3-5-2' | '4-2-3-1' | '5-3-2' | '3-4-3';

interface Player {
  id: number;
  name: string;
  number: number | null;
  position: PlayerPosition | '';
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
}

const FORMATIONS: Formation[] = ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2', '3-4-3'];
const STARTERS_COUNT = 11;

const GROUPED_PLAYER_POSITIONS: Record<string, PlayerPosition[]> = {
  Goalkeeper: [PlayerPosition.GK],
  Defence: [PlayerPosition.CB, PlayerPosition.RB, PlayerPosition.LB, PlayerPosition.RWB, PlayerPosition.LWB, PlayerPosition.SW],
  Midfield: [PlayerPosition.CDM, PlayerPosition.CM, PlayerPosition.CAM, PlayerPosition.RM, PlayerPosition.LM],
  Attack: [PlayerPosition.ST, PlayerPosition.CF, PlayerPosition.RW, PlayerPosition.LW, PlayerPosition.SS],
};

// Position assignment based on formation and order
const getPositionByFormationAndOrder = (formation: Formation, playerIndex: number): PlayerPosition | '' => {
  const positionMaps: Record<Formation, PlayerPosition[]> = {
    '4-4-2': [PlayerPosition.GK, PlayerPosition.RB, PlayerPosition.CB, PlayerPosition.CB, PlayerPosition.LB, PlayerPosition.RM, PlayerPosition.CM, PlayerPosition.CM, PlayerPosition.LM, PlayerPosition.ST, PlayerPosition.ST],
    '4-3-3': [PlayerPosition.GK, PlayerPosition.RB, PlayerPosition.CB, PlayerPosition.CB, PlayerPosition.LB, PlayerPosition.CM, PlayerPosition.CM, PlayerPosition.CM, PlayerPosition.RW, PlayerPosition.ST, PlayerPosition.LW],
    '3-5-2': [PlayerPosition.GK, PlayerPosition.CB, PlayerPosition.CB, PlayerPosition.CB, PlayerPosition.RWB, PlayerPosition.CM, PlayerPosition.CM, PlayerPosition.CM, PlayerPosition.LWB, PlayerPosition.ST, PlayerPosition.ST],
    '4-2-3-1': [PlayerPosition.GK, PlayerPosition.RB, PlayerPosition.CB, PlayerPosition.CB, PlayerPosition.LB, PlayerPosition.CDM, PlayerPosition.CDM, PlayerPosition.CAM, PlayerPosition.CAM, PlayerPosition.CAM, PlayerPosition.ST],
    '5-3-2': [PlayerPosition.GK, PlayerPosition.RB, PlayerPosition.CB, PlayerPosition.CB, PlayerPosition.CB, PlayerPosition.LB, PlayerPosition.CM, PlayerPosition.CM, PlayerPosition.CM, PlayerPosition.ST, PlayerPosition.ST],
    '3-4-3': [PlayerPosition.GK, PlayerPosition.CB, PlayerPosition.CB, PlayerPosition.CB, PlayerPosition.RM, PlayerPosition.CM, PlayerPosition.CM, PlayerPosition.LM, PlayerPosition.RW, PlayerPosition.ST, PlayerPosition.LW]
  };
  
  const positions = positionMaps[formation] || positionMaps['4-4-2'];
  return positions[playerIndex] || '';
};

const TeamSetupSection: React.FC<TeamSetupSectionProps> = ({
  homeTeamPlayers,
  awayTeamPlayers,
  formData,
  onFormDataChange,
  onPlayersChange,
  onFlagChange,
}) => {
  const { toast } = useToast();
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);

  const updatePlayer = (team: 'home' | 'away', playerId: number, field: keyof Player, value: any) => {
    console.log('updatePlayer called:', { team, playerId, field, value });
    
    const players = team === 'home' ? homeTeamPlayers : awayTeamPlayers;
    console.log('Current players:', players);
    
    const updatedPlayers = players.map(player => {
      console.log('Processing player:', player.id, 'target:', playerId);
      if (player.id === playerId) {
        const updatedPlayer = { ...player, [field]: value };
        console.log('Updated player:', updatedPlayer);
        return updatedPlayer;
      }
      return player;
    });
    
    console.log('Final updated players:', updatedPlayers);
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
      if (!base64Image) {
        toast({ title: "File Reading Error", description: "Could not read the image file.", variant: "destructive" });
        setIsProcessingImage(false);
        return;
      }
      
      try {
        const aiResponse = await AIProcessingService.extractPlayersFromImage(base64Image);
        if (!aiResponse || !aiResponse.players || aiResponse.players.length === 0) {
          toast({ title: "No Players Found", description: `The AI could not identify any players in the image for the ${team} team.` });
          setIsProcessingImage(false);
          return;
        }

        const currentPlayers = team === 'home' ? homeTeamPlayers : awayTeamPlayers;
        const formation = team === 'home' ? formData.homeTeamFormation : formData.awayTeamFormation;
        const aiStarters = aiResponse.players.filter(p => !p.is_substitute);
        const aiSubs = aiResponse.players.filter(p => p.is_substitute);
        
        const newPlayers = [...currentPlayers];
        
        // Process starters with position guessing based on formation and order
        aiStarters.forEach((aiPlayer, index) => {
          if (index < STARTERS_COUNT) {
            const guessedPosition = getPositionByFormationAndOrder(formation, index);
            newPlayers[index] = {
              ...newPlayers[index],
              name: aiPlayer.player_name || newPlayers[index].name,
              number: aiPlayer.jersey_number !== null ? aiPlayer.jersey_number : newPlayers[index].number,
              position: guessedPosition, // Use formation-based position guessing
            };
          }
        });
        
        // Process substitutes
        aiSubs.forEach((aiPlayer, index) => {
          const playerIndex = STARTERS_COUNT + index;
          if (playerIndex < newPlayers.length) {
            newPlayers[playerIndex] = {
              ...newPlayers[playerIndex],
              name: aiPlayer.player_name || newPlayers[playerIndex].name,
              number: aiPlayer.jersey_number !== null ? aiPlayer.jersey_number : newPlayers[playerIndex].number,
              position: '', // Substitutes have no specific position from the enum
            };
          }
        });

        onPlayersChange(team, newPlayers);
        toast({ title: "Processing Successful", description: `The ${team === 'home' ? 'Home' : 'Away'} Team player list has been populated with position assignments based on ${formation} formation.` });
      } catch (error: any) {
        console.error("Error processing image:", error);
        toast({ title: "Processing Failed", description: error.message || "An unknown error occurred.", variant: "destructive" });
      } finally {
        setIsProcessingImage(false);
      }
    };
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      toast({ title: "File Reading Error", description: "Could not read the selected image file.", variant: "destructive" });
      setIsProcessingImage(false);
    };
  };

  const renderPlayerInputs = (players: Player[], team: 'home' | 'away') => (
    <div className="space-y-2">
      <div className="grid grid-cols-5 gap-2 items-center text-sm font-medium px-2 text-muted-foreground">
        <div className="col-span-1">Number</div>
        <div className="col-span-2">Name</div>
        <div className="col-span-2">Position</div>
      </div>
      {players.map((player, index) => {
        return (
          <div key={`${team}-${player.id}-${index}`} className="grid grid-cols-5 gap-2 items-center text-sm">
            <Input
              type="number"
              value={player.number ?? ''}
              onChange={(e) => updatePlayer(team, player.id, 'number', e.target.value ? parseInt(e.target.value) : null)}
              className="h-8 w-16"
              min="1"
              max="99"
              placeholder="#"
            />
            <Input
              value={player.name}
              onChange={(e) => updatePlayer(team, player.id, 'name', e.target.value)}
              placeholder="Player name"
              className="h-8 col-span-2"
            />
            <Select
              value={player.position || 'none'}
              onValueChange={(value) => {
                const newPosition = value === 'none' ? '' : value as PlayerPosition;
                updatePlayer(team, player.id, 'position', newPosition);
              }}
              disabled={player.isSubstitute}
            >
              <SelectTrigger className="h-8 col-span-2">
                <SelectValue placeholder={player.isSubstitute ? 'Substitute' : 'Select position'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Position</SelectItem>
                {Object.entries(GROUPED_PLAYER_POSITIONS).map(([groupName, positions]) => (
                  <div key={groupName}>
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted">{groupName}</div>
                    {positions.map(pos => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            AI Player Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="image-upload">Upload Team Sheet Image</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="mt-2"
            />
          </div>
          {selectedImageFile && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleProcessImage('home')}
                disabled={isProcessingImage}
                className="flex-1"
              >
                {isProcessingImage ? 'Processing...' : 'Process for Home Team'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleProcessImage('away')}
                disabled={isProcessingImage}
                className="flex-1"
              >
                {isProcessingImage ? 'Processing...' : 'Process for Away Team'}
              </Button>
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            <p>Positions will be automatically assigned based on team formation and player order.</p>
            <p>You can modify any position after AI processing.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Home Team</CardTitle>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="home-team-flag-url">Team Flag</Label>
                {formData.homeTeamFlagUrl && (
                  <img 
                    src={formData.homeTeamFlagUrl} 
                    alt="Home team flag preview" 
                    className="w-16 h-12 mt-2 object-contain rounded-md border bg-muted" 
                  />
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    id="home-team-flag-url"
                    type="text"
                    value={formData.homeTeamFlagUrl.startsWith('blob:') ? '' : formData.homeTeamFlagUrl}
                    onChange={(e) => onFormDataChange('homeTeamFlagUrl', e.target.value)}
                    placeholder="Paste image URL or upload"
                    className="flex-grow"
                  />
                  <Button asChild variant="outline" className="shrink-0">
                    <Label htmlFor="home-flag-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                      <Input 
                        id="home-flag-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => onFlagChange(e, 'home')}
                      />
                    </Label>
                  </Button>
                </div>
              </div>
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
                <TabsTrigger value="starters">Starters ({STARTERS_COUNT})</TabsTrigger>
                <TabsTrigger value="subs">Substitutes ({homeTeamPlayers.length - STARTERS_COUNT})</TabsTrigger>
              </TabsList>
              <TabsContent value="starters" className="pt-4">
                {renderPlayerInputs(homeTeamPlayers.filter(p => !p.isSubstitute), 'home')}
              </TabsContent>
              <TabsContent value="subs" className="pt-4">
                {renderPlayerInputs(homeTeamPlayers.filter(p => p.isSubstitute), 'home')}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Away Team</CardTitle>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="away-team-flag-url">Team Flag</Label>
                {formData.awayTeamFlagUrl && (
                  <img 
                    src={formData.awayTeamFlagUrl} 
                    alt="Away team flag preview" 
                    className="w-16 h-12 mt-2 object-contain rounded-md border bg-muted" 
                  />
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    id="away-team-flag-url"
                    type="text"
                    value={formData.awayTeamFlagUrl.startsWith('blob:') ? '' : formData.awayTeamFlagUrl}
                    onChange={(e) => onFormDataChange('awayTeamFlagUrl', e.target.value)}
                    placeholder="Paste image URL or upload"
                    className="flex-grow"
                  />
                  <Button asChild variant="outline" className="shrink-0">
                    <Label htmlFor="away-flag-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                      <Input 
                        id="away-flag-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => onFlagChange(e, 'away')}
                      />
                    </Label>
                  </Button>
                </div>
              </div>
              <div>
                <Label>Formation</Label>
                <Select value={formData.awayTeamFormation} onValueChange={(value: Formation) => onFormDataChange('awayTeamFormation', value)}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{FORMATIONS.map((f) => (<SelectItem key={f} value={f}>{f}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="starters" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="starters">Starters ({STARTERS_COUNT})</TabsTrigger>
                <TabsTrigger value="subs">Substitutes ({awayTeamPlayers.length - STARTERS_COUNT})</TabsTrigger>
              </TabsList>
              <TabsContent value="starters" className="pt-4">
                {renderPlayerInputs(awayTeamPlayers.filter(p => !p.isSubstitute), 'away')}
              </TabsContent>
              <TabsContent value="subs" className="pt-4">
                {renderPlayerInputs(awayTeamPlayers.filter(p => p.isSubstitute), 'away')}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamSetupSection;
