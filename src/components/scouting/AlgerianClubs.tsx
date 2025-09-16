import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

/**
 * @interface Club
 * @description Represents the data structure for a single Algerian football club.
 * @property {string} lfp_id - The unique identifier for the club from the LFP website.
 * @property {string} name - The name of the club.
 * @property {string} logo_url - The full URL to the club's logo.
 */
interface Club {
  lfp_id: string; // The ID from the LFP website
  name: string;
  logo_url: string; // This is now a full URL
}

/**
 * @component AlgerianClubs
 * @description A component that fetches and displays a grid of Algerian football clubs.
 * It handles loading and error states, and allows navigation to a detailed view for each club.
 * The data is fetched from a Supabase edge function.
 * @returns {JSX.Element} The rendered AlgerianClubs component.
 */
const AlgerianClubs: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      try {
        // Updated function name to 'get-clubs'.
        // We invoke it with an empty body to get the list of all clubs.
        const { data, error } = await supabase.functions.invoke('get-clubs', {
            body: {} // Sending empty body fetches the list of clubs
        });

        if (error) {
          throw new Error(error.message || 'An unknown error occurred.');
        }

        // Ensure data is an array before setting state
        if (Array.isArray(data)) {
          setClubs(data);
        } else {
          throw new Error('Invalid data format received from the server.');
        }

      } catch (err: any) {
        console.error('Error fetching Algerian clubs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  // Skeleton loader for a better user experience
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-3xl font-bold mb-6">Algerian Clubs</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex items-center justify-center p-4">
                <Skeleton className="w-24 h-24 rounded-full" />
              </CardHeader>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-3/4 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Improved error display
  if (error) {
    return (
        <div className="container mx-auto p-4">
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Fetching Clubs</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Algerian Clubs</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {clubs.map((club) => (
          <Card
            key={club.lfp_id} // Use the unique lfp_id as the key
            className="cursor-pointer hover:shadow-xl hover:border-primary transition-shadow duration-300 ease-in-out flex flex-col"
            onClick={() => navigate(`/scouting/club/${club.lfp_id}`)} // Navigate using the lfp_id
          >
            <CardHeader className="flex-grow flex items-center justify-center p-4">
              {/* The logo_url is now a full URL, no need to prepend the domain */}
              <img 
                src={club.logo_url} 
                alt={club.name} 
                className="w-24 h-24 object-contain" 
                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/96'; }} // Fallback
              />
            </CardHeader>
            <CardContent className="p-4 border-t">
              <CardTitle className="text-center text-sm font-semibold">{club.name}</CardTitle>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AlgerianClubs;