import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Updated interfaces to match the rich data from the scraper
interface PlayerStats {
  minutes_played: number;
  goals: number;
  matches_played: number;
}

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

interface Club {
  lfp_id: string;
  name: string;
  logo_url: string;
  players: Player[];
  // You can add staff here later if needed
}

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