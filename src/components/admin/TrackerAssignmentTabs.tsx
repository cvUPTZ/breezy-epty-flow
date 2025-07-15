
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Target, Shield, Sword, Circle } from 'lucide-react';
import SpecializedTrackerAssignment from './SpecializedTrackerAssignment';
import LineBasedTrackerAssignment from './LineBasedTrackerAssignment';

interface TrackerAssignmentTabsProps {
  matchId: string;
  homeTeamPlayers: any[];
  awayTeamPlayers: any[];
}

const TrackerAssignmentTabs: React.FC<TrackerAssignmentTabsProps> = ({
  matchId,
  homeTeamPlayers,
  awayTeamPlayers
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tracker Assignment Options
          </CardTitle>
          <p className="text-sm text-gray-600">
            Choose how you want to assign trackers to this match
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="player-events" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="player-events" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Assignment by Player & Events
              </TabsTrigger>
              <TabsTrigger value="line-based" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Assignment by Line
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="player-events" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Target className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-blue-900">Player & Event Specific Assignment</h3>
                    <p className="text-sm text-blue-700">
                      Assign trackers to specific players and event types for detailed tracking
                    </p>
                  </div>
                </div>
                <SpecializedTrackerAssignment
                  matchId={matchId}
                  homeTeamPlayers={homeTeamPlayers}
                  awayTeamPlayers={awayTeamPlayers}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="line-based" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-900">Line-Based Assignment</h3>
                    <p className="text-sm text-green-700">
                      Assign trackers to cover entire lines: Attack, Defense, or Midfield
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                    <Sword className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-900">Attack</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Circle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-900">Midfield</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Defense</span>
                  </div>
                </div>
                
                <LineBasedTrackerAssignment />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackerAssignmentTabs;
