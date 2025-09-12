import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

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
  name:string;
  logo_url: string;
  players: Player[];
}

const AlgerianClubs: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-algerian-clubs');
        if (error) {
          throw error;
        }
        setClubs(data);
      } catch (error: any) {
        console.error('Error fetching Algerian clubs:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Algerian Clubs</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {clubs.map((club) => (
          <Card
            key={club.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/scouting/club/${club.id}`)}
          >
            <CardHeader>
              <img src={`https://lfp.dz/${club.logo_url}`} alt={club.name} className="w-24 h-24 mx-auto" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-center text-sm">{club.name}</CardTitle>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AlgerianClubs;
