import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';

interface Player {
  id: string;
  name: string;
  photo_url: string;
  jersey_number: number;
  age: number;
  nationality: string;
}

interface Club {
  id: string;
  name: string;
  logo_url: string;
  players: Player[];
}

const ClubDetails: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClub = async () => {
      if (!clubId) return;
      try {
        const { data, error } = await supabase.functions.invoke('get-algerian-clubs', {
          body: { club_id: clubId }
        });
        if (error) {
          throw error;
        }
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
    return <div>Loading...</div>;
  }

  if (!club) {
    return <div>Club not found</div>;
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        <img src={`https://lfp.dz/${club.logo_url}`} alt={club.name} className="w-24 h-24 mr-4" />
        <h2 className="text-2xl font-bold">{club.name}</h2>
      </div>
      <h3 className="text-xl font-bold mb-4">Players</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {club.players.map((player) => (
          <Card key={player.id}>
            <CardHeader>
              <img src={`https://lfp.dz/${player.photo_url}`} alt={player.name} className="w-24 h-24 mx-auto" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-center text-sm">{player.name}</CardTitle>
              <div className="text-center text-xs">
                <p>#{player.jersey_number}</p>
                <p>Age: {player.age}</p>
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
