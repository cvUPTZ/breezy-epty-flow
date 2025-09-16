import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * @interface PlayerStats
 * @description Represents the basic statistics for a player.
 * @property {number} minutes_played - Total minutes played.
 * @property {number} goals - Total goals scored.
 * @property {number} matches_played - Total matches played.
 */
interface PlayerStats {
  minutes_played: number;
  goals: number;
  matches_played: number;
}

/**
 * @interface Player
 * @description Represents a single player with their details and stats.
 * @property {string} lfp_id - The unique identifier for the player from the LFP website.
 * @property {string} name - The name of the player.
 * @property {string} photo_url - The URL of the player's photo.
 * @property {number} jersey_number - The player's jersey number.
 * @property {number} age - The age of the player.
 * @property {string} nationality - The nationality of the player.
 * @property {string} position - The player's position on the field.
 * @property {string} contract_expires - The date when the player's contract expires.
 * @property {PlayerStats} stats - An object containing the player's statistics.
 */
interface Player {
  lfp_id: string;
  name: string;
  photo_url: string;
  jersey_number: number;
  age: number;
  nationality: string;
  position: string;
  contract_expires: string;
  stats: PlayerStats;
}

/**
 * @interface Club
 * @description Represents a football club with its details and list of players.
 * @property {string} lfp_id - The unique identifier for the club from the LFP website.
 * @property {string} name - The name of the club.
 * @property {string} logo_url - The URL of the club's logo.
 * @property {Player[]} players - An array of players belonging to the club.
 */
interface Club {
  lfp_id: string;
  name: string;
  logo_url: string;
  players: Player[];
  // You can add staff here later if needed
}

/**
 * @component ClubDetails
 * @description A component that displays detailed information about a specific football club,
 * including its logo, name, and a grid of its players with their photos and basic details.
 * The data is fetched from a Supabase edge function based on the club ID from the URL.
 * @returns {JSX.Element} The rendered ClubDetails component.
 */
const ClubDetails: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClub = async () => {
      if (!clubId) return;
      setLoading(true);
      try {
        // Updated function name and body payload
        const { data, error } = await supabase.functions.invoke('get-clubs', {
          body: { club_lfp_id: clubId }
        });

        if (error) throw error;
        setClub(data);

      } catch (error) {
        console.error('Error fetching club details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClub();
  }, [clubId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-10 w-10" />
        <span className="ml-4 text-lg">Fetching live club data...</span>
      </div>
    );
  }

  if (!club) {
    return <div className="text-center text-red-500">Club not found or failed to load.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6 p-4 bg-card rounded-lg shadow-md">
        <img src={club.logo_url} alt={club.name} className="w-20 h-20 md:w-24 md:h-24 mr-4 object-contain" />
        <h2 className="text-2xl md:text-4xl font-bold">{club.name}</h2>
      </div>

      <h3 className="text-2xl font-bold mb-4 border-b pb-2">Players</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {club.players.map((player) => (
          <Card key={player.lfp_id} className="flex flex-col">
            <CardHeader className="p-4 flex-shrink-0">
               <img 
                 src={player.photo_url} 
                 alt={player.name} 
                 className="w-28 h-28 mx-auto rounded-full object-cover border-4" 
                 onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/112'; }} // Fallback image
               />
            </CardHeader>
            <CardContent className="p-4 flex-grow flex flex-col justify-between">
              <div className="text-center">
                <CardTitle className="text-md">{player.name}</CardTitle>
                <CardDescription>{player.position}</CardDescription>
              </div>
              <div className="text-center text-sm text-muted-foreground mt-2 space-y-1">
                <p><strong>#{player.jersey_number}</strong></p>
                <p>{player.age} years old</p>
                <p>{player.nationality}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClubDetails;