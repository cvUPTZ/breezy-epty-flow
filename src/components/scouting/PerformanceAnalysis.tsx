import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Activity, Video, FileText, TrendingUp, Star, Target } from 'lucide-react';

/**
 * @component PerformanceAnalysis
 * @description A dashboard component for visualizing and analyzing player performance data.
 * It uses mock data to showcase various analytical tools, including statistical charts (line, bar, radar),
 * key performance indicators (KPIs), video analysis playlists, comparative analysis against benchmarks,
 * and a summary of scout reports. The interface is organized into tabs for clarity.
 * @returns {JSX.Element} The rendered PerformanceAnalysis component.
 */
const PerformanceAnalysis: React.FC = () => {
  const [selectedPlayer, setSelectedPlayer] = useState('player1');
  const [analysisType, setAnalysisType] = useState('overall');

  // Mock data for demonstration
  const performanceData = [
    { match: 'Match 1', rating: 7.5, goals: 1, assists: 0, passes: 45, tackles: 3 },
    { match: 'Match 2', rating: 8.2, goals: 2, assists: 1, passes: 52, tackles: 2 },
    { match: 'Match 3', rating: 6.8, goals: 0, assists: 2, passes: 38, tackles: 5 },
    { match: 'Match 4', rating: 9.1, goals: 3, assists: 1, passes: 58, tackles: 1 },
    { match: 'Match 5', rating: 7.9, goals: 1, assists: 3, passes: 49, tackles: 4 }
  ];

  const radarData = [
    { attribute: 'Pace', value: 85, fullMark: 100 },
    { attribute: 'Shooting', value: 78, fullMark: 100 },
    { attribute: 'Passing', value: 92, fullMark: 100 },
    { attribute: 'Dribbling', value: 88, fullMark: 100 },
    { attribute: 'Defending', value: 45, fullMark: 100 },
    { attribute: 'Physical', value: 76, fullMark: 100 }
  ];

  const comparisonData = [
    { position: 'Midfielder', playerValue: 85, leagueAvg: 72, topTier: 90 },
    { position: 'Forward', playerValue: 78, leagueAvg: 75, topTier: 88 },
    { position: 'Defender', playerValue: 92, leagueAvg: 68, topTier: 85 }
  ];

  const playersList = [
    { id: 'player1', name: 'João Silva', position: 'Midfielder' },
    { id: 'player2', name: 'Marcus Johnson', position: 'Forward' },
    { id: 'player3', name: 'Luis Rodriguez', position: 'Defender' }
  ];

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Analysis Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select Player</label>
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose player" />
                </SelectTrigger>
                <SelectContent>
                  {playersList.map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name} - {player.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Analysis Type</label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger>
                  <SelectValue placeholder="Analysis type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overall">Overall Performance</SelectItem>
                  <SelectItem value="technical">Technical Skills</SelectItem>
                  <SelectItem value="physical">Physical Attributes</SelectItem>
                  <SelectItem value="tactical">Tactical Awareness</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="statistics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="statistics">Statistical Analysis</TabsTrigger>
          <TabsTrigger value="video">Video Analysis</TabsTrigger>
          <TabsTrigger value="comparison">Comparative Analysis</TabsTrigger>
          <TabsTrigger value="reports">Scout Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="statistics" className="space-y-6">
          {/* Key Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Average Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.1</div>
                <div className="text-xs text-green-600">+0.4 from last month</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  Goals/Game
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.4</div>
                <div className="text-xs text-green-600">Above position avg</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Pass Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <div className="text-xs text-muted-foreground">48.4 avg passes</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tackles/Game</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.0</div>
                <div className="text-xs text-red-600">-0.2 from last month</div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="match" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="rating" stroke="#3b82f6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attribute Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="attribute" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Player"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Match Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Match Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="match" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="goals" fill="#22c55e" name="Goals" />
                  <Bar dataKey="assists" fill="#3b82f6" name="Assists" />
                  <Bar dataKey="tackles" fill="#f59e0b" name="Tackles" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Best Goals Compilation', duration: '3:24', type: 'Highlights' },
              { title: 'Defensive Actions', duration: '2:45', type: 'Analysis' },
              { title: 'Passing Masterclass', duration: '4:12', type: 'Skills' },
              { title: 'Full Match vs Barcelona', duration: '15:30', type: 'Full Game' },
              { title: 'Set Piece Specialist', duration: '2:18', type: 'Highlights' },
              { title: 'Weak Foot Analysis', duration: '1:56', type: 'Analysis' }
            ].map((video, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    <Badge variant="outline">{video.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                    <Video className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="font-medium text-sm mb-1">{video.title}</h3>
                  <p className="text-xs text-muted-foreground">Duration: {video.duration}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Position Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="position" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="playerValue" fill="#3b82f6" name="Player Rating" />
                  <Bar dataKey="leagueAvg" fill="#94a3b8" name="League Average" />
                  <Bar dataKey="topTier" fill="#22c55e" name="Top Tier" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['Passing Accuracy', 'Vision', 'Set Pieces', 'Leadership'].map((strength) => (
                    <div key={strength} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['Pace', 'Aerial Duels', 'Weak Foot', 'Defensive Positioning'].map((weakness) => (
                    <div key={weakness} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">{weakness}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Development Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['Speed Training', 'Heading Practice', 'Left Foot Drills', 'Tactical Awareness'].map((plan) => (
                    <div key={plan} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">{plan}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              {
                title: 'Match Performance vs Real Madrid',
                date: '2024-01-15',
                rating: 8.5,
                recommendation: 'sign',
                notes: 'Outstanding performance in midfield, controlled the tempo of the game excellently.'
              },
              {
                title: 'Champions League Analysis',
                date: '2024-01-10',
                rating: 7.8,
                recommendation: 'monitor',
                notes: 'Good overall display but struggled against high-press. Needs improvement in tight spaces.'
              },
              {
                title: 'Derby Match Assessment',
                date: '2024-01-05',
                rating: 9.1,
                recommendation: 'sign',
                notes: 'Exceptional leadership and technical skills. Perfect fit for our tactical system.'
              }
            ].map((report, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{report.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">{report.rating}/10</div>
                      <Badge className={
                        report.recommendation === 'sign' ? 'bg-green-500' :
                        report.recommendation === 'monitor' ? 'bg-yellow-500' : 'bg-red-500'
                      }>
                        {report.recommendation}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{report.notes}</p>
                  <div className="flex gap-2 mt-4">
                    <Badge variant="outline">
                      <FileText className="w-3 h-3 mr-1" />
                      Full Report
                    </Badge>
                    <Badge variant="outline">
                      <Video className="w-3 h-3 mr-1" />
                      Video Analysis
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceAnalysis;