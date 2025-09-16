
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import TeamSetupWithFormation from '@/components/TeamSetupWithFormation';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Team } from '@/types';
import { toast } from 'sonner';
import { createSimulatedTeams } from '@/utils/formationUtils';

/**
 * @interface SetupScreenProps
 * @description Props for the SetupScreen component.
 * @property {Team | null} homeTeam - The current data for the home team, or null if new.
 * @property {Team | null} awayTeam - The current data for the away team, or null if new.
 * @property {(home: Team, away: Team) => void} updateTeams - Callback to update the state of both teams.
 * @property {(home: Team, away: Team) => void} completeSetup - Callback to finalize the setup and proceed.
 * @property {string} [matchId] - The ID of the match if it's being edited, otherwise undefined for a new match.
 */
interface SetupScreenProps {
  homeTeam: Team | null;
  awayTeam: Team | null;
  updateTeams: (home: Team, away: Team) => void;
  completeSetup: (home: Team, away: Team) => void;
  matchId?: string;
}

/**
 * @component SetupScreen
 * @description A full-screen component dedicated to setting up a new match or editing an existing one.
 * It integrates the `TeamSetupWithFormation` component to handle the detailed team and player configuration.
 * It also provides an option to load simulated teams for quick testing.
 * @param {SetupScreenProps} props The props for the component.
 * @returns {JSX.Element} The rendered SetupScreen component.
 */
const SetupScreen: React.FC<SetupScreenProps> = ({
  homeTeam,
  awayTeam,
  updateTeams,
  completeSetup,
  matchId
}) => {
  const safeHomeTeam = homeTeam || {
    id: 'home',
    name: 'Home Team',
    formation: '4-4-2',
    players: []
  };
  
  const safeAwayTeam = awayTeam || {
    id: 'away',
    name: 'Away Team',
    formation: '4-3-3',
    players: []
  };

  const handleStartMatch = () => {
    if (!safeHomeTeam.players?.length || !safeAwayTeam.players?.length) {
      toast.error("Each team must have at least one player.");
      return;
    }
    
    if (!safeHomeTeam.formation || !safeAwayTeam.formation) {
      toast.error("Please select a formation for both teams.");
      return;
    }
    
    completeSetup(safeHomeTeam, safeAwayTeam);
  };
  
  const loadSimulatedTeams = () => {
    const { homeTeam: simulatedHome, awayTeam: simulatedAway } = createSimulatedTeams();
    updateTeams(simulatedHome, simulatedAway);
    toast.success("Simulated teams loaded successfully.");
  };

  const handleTeamsChange = (teams: { home: Team; away: Team }) => {
    updateTeams(teams.home, teams.away);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 md:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" asChild className="text-xs md:text-sm">
            <Link to={matchId ? "/matches" : "/"} className="flex items-center gap-1 md:gap-2">
              <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Back to</span> {matchId ? "Matches" : "Dashboard"}
            </Link>
          </Button>
          <h1 className="text-xl md:text-2xl font-bold text-center">
            {matchId ? "Match Setup" : "New Match Setup"}
          </h1>
          <div className="w-[40px] md:w-[100px]"></div>
        </div>
        
        <Card className="bg-white rounded-lg shadow-lg overflow-hidden">
          <TeamSetupWithFormation
            teams={{ home: safeHomeTeam, away: safeAwayTeam }}
            onTeamsChange={handleTeamsChange}
            onConfirm={handleStartMatch}
          />
          
          <div className="px-6 pb-6 pt-0 flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={loadSimulatedTeams}
              className="w-full md:w-auto"
            >
              Load Simulated Teams
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SetupScreen;
