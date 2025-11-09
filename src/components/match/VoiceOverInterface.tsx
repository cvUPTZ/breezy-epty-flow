import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Send, List, Radio, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Player } from '@/hooks/useFourTrackerSystem';
import { 
  TRACKER_NOMENCLATURE, 
  parseVoiceCommand, 
  formatEventForVoiceOver 
} from '@/types/tracker-nomenclature';

interface VoiceOverInterfaceProps {
  homeTeamPlayers: Player[];
  awayTeamPlayers: Player[];
  homeTeamName: string;
  awayTeamName: string;
  isOnline: boolean;
  onRecordEvent: (playerId: number, eventType: string, details?: any) => void;
}

const VoiceOverInterface: React.FC<VoiceOverInterfaceProps> = ({
  homeTeamPlayers,
  awayTeamPlayers,
  homeTeamName,
  awayTeamName,
  isOnline = true,
  onRecordEvent
}) => {
  const [voiceCommand, setVoiceCommand] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const [parsedPreview, setParsedPreview] = useState<ReturnType<typeof parseVoiceCommand> | null>(null);
  const [showNomenclature, setShowNomenclature] = useState(false);

  const allPlayers = useMemo(() => 
    [...homeTeamPlayers, ...awayTeamPlayers],
    [homeTeamPlayers, awayTeamPlayers]
  );

  // Parse command in real-time as user types
  useEffect(() => {
    if (voiceCommand.trim()) {
      const parsed = parseVoiceCommand(voiceCommand);
      setParsedPreview(parsed);
    } else {
      setParsedPreview(null);
    }
  }, [voiceCommand]);

  const handleSubmitCommand = useCallback(() => {
    if (!voiceCommand.trim() || !isOnline) return;

    const parsed = parseVoiceCommand(voiceCommand);
    
    if (parsed.confidence < 0.5) {
      // Show error for low confidence
      return;
    }

    if (parsed.playerId && parsed.eventType) {
      const player = allPlayers.find(p => p.jersey_number === parsed.playerId);
      
      if (player) {
        const details: any = {
          voice_over_command: voiceCommand,
          confidence: parsed.confidence,
          source: 'voice_commentator'
        };

        if (parsed.targetPlayerId) {
          details.target_player_number = parsed.targetPlayerId;
        }

        onRecordEvent(player.id, parsed.eventType, details);
        
        // Add to recent commands
        setRecentCommands(prev => [voiceCommand, ...prev.slice(0, 9)]);
        setVoiceCommand('');
        setParsedPreview(null);
      }
    }
  }, [voiceCommand, isOnline, allPlayers, onRecordEvent]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitCommand();
    }
  };

  const handleQuickCommand = (playerNumber: number, eventType: string, team: 'home' | 'away') => {
    const command = formatEventForVoiceOver(playerNumber, team, eventType);
    setVoiceCommand(command);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.5) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            <Radio className="h-5 w-5 text-purple-600" />
            <span>Voice-Over Commentator Interface</span>
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? 'Live' : 'Offline'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-700">
            التعليق الصوتي - Use standard nomenclature codes to track players and actions
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNomenclature(!showNomenclature)}
            >
              <List className="h-4 w-4 mr-2" />
              {showNomenclature ? 'Hide' : 'Show'} Nomenclature Guide
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Nomenclature Guide */}
      {showNomenclature && (
        <Card className="border-blue-300">
          <CardHeader>
            <CardTitle className="text-base">Nomenclature Quick Reference</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Player Codes:</h4>
              <p className="text-sm text-gray-600 mb-2">
                Format: <code className="bg-gray-100 px-2 py-1 rounded">P{'{jersey_number}'}</code>
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Examples: P10, P7, P23</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">Event Codes:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(TRACKER_NOMENCLATURE.eventCodes).map(([code, data]) => (
                  <div key={code} className="bg-gray-50 p-2 rounded">
                    <span className="font-mono font-semibold">{code}</span> - {data.fullName}
                    <div className="text-gray-500 mt-1">
                      Arabic: {data.voiceKeywords.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">Command Patterns:</h4>
              <div className="space-y-2 text-xs">
                {TRACKER_NOMENCLATURE.voicePatterns.map((pattern, idx) => (
                  <div key={idx} className="bg-gray-50 p-2 rounded">
                    <div className="font-mono text-purple-700 mb-1">{pattern.pattern}</div>
                    <div className="text-gray-600">
                      Examples: {pattern.examples.join(', ')}
                    </div>
                    <div className="text-gray-500 mt-1">
                      Arabic: {pattern.arabicExamples.join(' | ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Command Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Voice Command Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={voiceCommand}
              onChange={(e) => setVoiceCommand(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter command (e.g., P10 PASS or لاعب 10 تمريرة)"
              className="flex-1 font-mono"
              disabled={!isOnline}
            />
            <Button
              onClick={handleSubmitCommand}
              disabled={!isOnline || !voiceCommand.trim() || (parsedPreview !== null && parsedPreview.confidence < 0.5)}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Record
            </Button>
          </div>

          {/* Real-time parse preview */}
          {parsedPreview && voiceCommand.trim() && (
            <div className={`p-3 rounded-lg border ${getConfidenceColor(parsedPreview.confidence)}`}>
              <div className="flex items-center gap-2 mb-2">
                {parsedPreview.confidence >= 0.5 ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="font-semibold text-sm">
                  Parsed Command (Confidence: {(parsedPreview.confidence * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="text-sm space-y-1">
                {parsedPreview.playerId && (
                  <p>Player: <span className="font-mono">#{parsedPreview.playerId}</span></p>
                )}
                {parsedPreview.eventType && (
                  <p>Event: <span className="font-mono font-semibold">{parsedPreview.eventType.toUpperCase()}</span></p>
                )}
                {parsedPreview.targetPlayerId && (
                  <p>Target: <span className="font-mono">#{parsedPreview.targetPlayerId}</span></p>
                )}
                {parsedPreview.confidence < 0.5 && (
                  <p className="text-xs mt-2">⚠️ Low confidence - check command format</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Home Team */}
            <div>
              <h4 className="text-sm font-semibold mb-2 text-blue-700">{homeTeamName}</h4>
              <div className="grid grid-cols-3 gap-2">
                {homeTeamPlayers.slice(0, 6).map(player => (
                  <div key={player.id} className="space-y-1">
                    <div className="text-xs font-semibold text-center">#{player.jersey_number}</div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-7"
                        onClick={() => handleQuickCommand(player.jersey_number, 'PASS', 'home')}
                      >
                        Pass
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-7"
                        onClick={() => handleQuickCommand(player.jersey_number, 'SHOT', 'home')}
                      >
                        Shot
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Away Team */}
            <div>
              <h4 className="text-sm font-semibold mb-2 text-red-700">{awayTeamName}</h4>
              <div className="grid grid-cols-3 gap-2">
                {awayTeamPlayers.slice(0, 6).map(player => (
                  <div key={player.id} className="space-y-1">
                    <div className="text-xs font-semibold text-center">#{player.jersey_number}</div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-7"
                        onClick={() => handleQuickCommand(player.jersey_number, 'PASS', 'away')}
                      >
                        Pass
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-7"
                        onClick={() => handleQuickCommand(player.jersey_number, 'SHOT', 'away')}
                      >
                        Shot
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Commands */}
      {recentCommands.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Commands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentCommands.map((cmd, idx) => (
                <div
                  key={idx}
                  className="text-sm font-mono bg-gray-50 px-3 py-2 rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => setVoiceCommand(cmd)}
                >
                  {cmd}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VoiceOverInterface;
