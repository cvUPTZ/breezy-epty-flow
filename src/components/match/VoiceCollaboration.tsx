import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, MicOff, Phone, PhoneOff, Volume2, Users, Crown, Shield, Wifi, WifiOff, Activity, AlertTriangle, RefreshCw, Database } from 'lucide-react';
import { useVoiceCollaboration } from '@/hooks/useVoiceCollaboration';
import { useIsMobile } from '@/hooks/use-mobile';
import { VoiceRoomService } from '@/services/voiceRoomService';
import { supabase } from '@/integrations/supabase/client';

interface VoiceCollaborationProps {
  matchId: string;
  userId: string;
  className?: string;
}

const VoiceCollaboration: React.FC<VoiceCollaborationProps> = ({
  matchId,
  userId,
  className = ''
}) => {
  const isMobile = useIsMobile();
  const [userRole, setUserRole] = useState<string>('tracker');
  const [showConnectionDetails, setShowConnectionDetails] = useState(false);
  const [databaseConnected, setDatabaseConnected] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  // Check database connection
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const voiceService = VoiceRoomService.getInstance();
        const connected = await voiceService.testDatabaseConnection();
        setDatabaseConnected(connected);
        setError(null);
        
        if (connected) {
          console.log('VoiceCollaboration: Connected to database, using real-time data');
        } else {
          console.log('VoiceCollaboration: Database connection failed, using offline mode');
        }
      } catch (error: any) {
        console.log('VoiceCollaboration: Database connection failed, using offline mode:', error);
        setDatabaseConnected(false);
        setError(null);
      } finally {
        setInitialized(true);
      }
    };
    
    checkDatabase();
  }, [retryCount]);

  const handleRetryConnection = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
  };
  
  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
        
        if (data && !error) {
          setUserRole(data.role || 'tracker');
          console.log('VoiceCollaboration: User role loaded:', data.role);
        } else {
          console.log('VoiceCollaboration: Could not fetch user role, using default');
          setUserRole('tracker');
        }
      } catch (error) {
        console.log('VoiceCollaboration: Error fetching user role, using default:', error);
        setUserRole('tracker');
      }
    };
    
    if (userId) {
      fetchUserRole();
    }
  }, [userId]);
  
  const {
    isVoiceEnabled,
    isMuted,
    isConnecting,
    connectedTrackers,
    audioLevel,
    toggleMute,
    availableRooms,
    currentRoom,
    isRoomAdmin,
    joinVoiceRoom,
    leaveVoiceRoom,
    connectionQualities,
    retryAttempts,
    isRecovering,
    networkStatus,
    connectionMetrics,
    remoteStreams, // New
    peerStatuses   // New
  } = useVoiceCollaboration({
    matchId,
    userId,
    userRole,
    onUserJoined: (userId) => console.log('User joined voice:', userId),
    onUserLeft: (userId) => console.log('User left voice:', userId),
    onRoomChanged: (room) => console.log('Room changed:', room?.name)
  });

  const AudioLevelIndicator = ({ level }: { level: number }) => (
    <div className="flex items-center gap-1">
      <Volume2 className={`${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'} text-gray-500`} />
      <div className="flex gap-0.5">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`${isMobile ? 'w-0.5 h-2' : 'w-1 h-3'} rounded-sm transition-colors ${
              level > (i + 1) * 0.125 ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
      <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-mono ml-1`}>
        {Math.round(level * 100)}%
      </span>
    </div>
  );

  const getRoleIcon = (role?: string) => {
    const iconSize = isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3';
    switch (role) {
      case 'admin': return <Crown className={`${iconSize} text-yellow-500`} />;
      case 'coordinator': return <Shield className={`${iconSize} text-blue-500`} />;
      default: return null;
    }
  };

  const getRoomColorClass = (roomName: string) => {
    if (roomName.includes('Main')) return 'bg-blue-100 border-blue-300';
    if (roomName.includes('Coordinators')) return 'bg-purple-100 border-purple-300';
    if (roomName.includes('Technical')) return 'bg-gray-100 border-gray-300';
    if (roomName.includes('Emergency')) return 'bg-red-100 border-red-300';
    return 'bg-gray-100 border-gray-300';
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return '🟢';
      case 'good': return '🟡';
      case 'fair': return '🟠';
      case 'poor': return '🔴';
      default: return '⚪';
    }
  };

  const getNetworkIcon = () => {
    switch (networkStatus) {
      case 'online': return <Wifi className="h-3 w-3 text-green-500" />;
      case 'offline': return <WifiOff className="h-3 w-3 text-red-500" />;
      case 'unstable': return <Wifi className="h-3 w-3 text-yellow-500" />;
      default: return <Wifi className="h-3 w-3 text-gray-500" />;
    }
  };

  // Helper function for peer status indicator
  const getPeerStatusIndicator = (status?: string) => {
    const baseClasses = `w-2 h-2 rounded-full ${isMobile ? 'mr-0.5' : 'mr-1'}`;
    if (status === 'connected') return <div className={`${baseClasses} bg-green-500`} title="Connected" />;
    if (status === 'connecting') return <div className={`${baseClasses} bg-yellow-500 animate-pulse`} title="Connecting..." />;
    if (status === 'failed') return <div className={`${baseClasses} bg-red-500`} title="Failed" />;
    if (status === 'closed' || status === 'disconnected') return <div className={`${baseClasses} bg-gray-400`} title="Disconnected" />;
    return <div className={`${baseClasses} bg-gray-300`} title="Unknown status" />; // Default/unknown
  };

  const [audioElements, setAudioElements] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const elements = Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
      <audio
        key={peerId}
        autoPlay
        playsInline
        ref={(audioEl) => {
          if (audioEl && audioEl.srcObject !== stream) {
            audioEl.srcObject = stream;
          }
        }}
        style={{ display: 'none' }}
      />
    ));
    setAudioElements(elements);
  }, [remoteStreams]);

  if (!initialized) {
    return (
      <div className={`space-y-3 sm:space-y-4 ${className}`}>
        {/* Render audio elements even when initializing if they exist */}
        {audioElements}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className={`${isMobile ? 'p-2' : 'p-3 sm:p-4'}`}>
            <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-sm' : 'text-sm sm:text-base'}`}>
              <Users className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-blue-600`} />
              Voice Collaboration Center
            </CardTitle>
          </CardHeader>
          <CardContent className={`${isMobile ? 'p-2' : 'p-3 sm:p-4'} pt-0`}>
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Initializing voice collaboration system...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-3 sm:space-y-4 ${className}`}>
        {audioElements}
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className={`${isMobile ? 'p-2' : 'p-3 sm:p-4'}`}>
            <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-sm' : 'text-sm sm:text-base'}`}>
              <Users className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-red-600`} />
              Voice Collaboration Center
              <WifiOff className="h-3 w-3 text-red-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className={`${isMobile ? 'p-2' : 'p-3 sm:p-4'} pt-0`}>
            <Alert variant="destructive" className="mb-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            <Button 
              onClick={handleRetryConnection}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (availableRooms.length === 0 && !isConnecting && !isVoiceEnabled) {
    return (
      <div className={`space-y-3 sm:space-y-4 ${className}`}>
        {audioElements}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className={`${isMobile ? 'p-2' : 'p-3 sm:p-4'}`}>
            <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-sm' : 'text-sm sm:text-base'}`}>
              <Users className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-blue-600`} />
              Voice Collaboration Center
              {getNetworkIcon()}
              {databaseConnected ? (
                <Database className="h-3 w-3 text-green-500" />
              ) : (
                <Database className="h-3 w-3 text-orange-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className={`${isMobile ? 'p-2' : 'p-3 sm:p-4'} pt-0`}>
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading voice rooms...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-3 sm:space-y-4 ${className}`}>
      {audioElements}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className={`${isMobile ? 'p-2' : 'p-3 sm:p-4'}`}>
          <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-sm' : 'text-sm sm:text-base'}`}>
            <Users className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-blue-600`} />
            Voice Collaboration Center
            {isVoiceEnabled && (
              <Badge variant="secondary" className={`${isMobile ? 'text-[10px] px-1 py-0.5' : 'text-xs'}`}>
                Live • {isMobile ? currentRoom?.name.split(' ')[0] : currentRoom?.name}
              </Badge>
            )}
            {getNetworkIcon()}
            {databaseConnected ? (
              <Database className="h-3 w-3 text-green-500" />
            ) : (
              <Database className="h-3 w-3 text-orange-500" />
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2 mt-2">
            {isRecovering && (
              <Badge variant="destructive" className="animate-pulse">
                <Activity className="h-3 w-3 mr-1" />
                Recovering
              </Badge>
            )}
            {retryAttempts > 0 && !isVoiceEnabled && (
              <Badge variant="outline">
                Retry {retryAttempts}/5
              </Badge>
            )}
            {isVoiceEnabled && (
              <Badge variant="secondary">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                Connected
              </Badge>
            )}
            {availableRooms.length > 0 && !isVoiceEnabled && (
              <Badge variant="outline">
                {availableRooms.length} rooms available
              </Badge>
            )}
            {databaseConnected ? (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                <Database className="h-3 w-3 mr-1" />
                Database Mode
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                <Activity className="h-3 w-3 mr-1" />
                Offline Mode
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className={`${isMobile ? 'p-2' : 'p-3 sm:p-4'} pt-0 space-y-3`}>
          {/* Network Status Alert */}
          {networkStatus !== 'online' && (
            <Alert variant={networkStatus === 'offline' ? 'destructive' : 'default'}>
              <AlertDescription className="text-sm">
                {networkStatus === 'offline' 
                  ? '🔴 Network offline - Voice features unavailable' 
                  : '🟡 Network unstable - Voice quality may be affected'
                }
              </AlertDescription>
            </Alert>
          )}

          {/* Database Status Info */}
          {!databaseConnected && (
            <Alert variant="default">
              <AlertDescription className="text-sm">
                ⚠️ Voice system running in offline mode - database tables not available
              </AlertDescription>
            </Alert>
          )}

          {/* Current Room Status */}
          {isVoiceEnabled && currentRoom && (
            <div className={`${isMobile ? 'p-2' : 'p-3'} rounded border ${getRoomColorClass(currentRoom.name)}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'} flex items-center gap-1`}>
                    {getRoleIcon(userRole)}
                    {isMobile ? currentRoom.name.split(' ')[0] : currentRoom.name}
                    {isRoomAdmin && <Crown className="h-3 w-3 text-yellow-500" />}
                  </div>
                  <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-600`}>
                    {connectedTrackers.length + 1}/{currentRoom.max_participants} participants
                  </div>
                  {currentRoom.description && !isMobile && (
                    <div className="text-xs text-gray-500 mt-1">{currentRoom.description}</div>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    onClick={toggleMute}
                    size={isMobile ? "sm" : "sm"}
                    variant={isMuted ? "destructive" : "secondary"}
                    disabled={isRecovering}
                    className={isMobile ? 'h-6 w-6 p-0' : ''}
                  >
                    {isMuted ? (
                      <MicOff className={`${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} />
                    ) : (
                      <Mic className={`${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} />
                    )}
                  </Button>
                  <Button
                    onClick={leaveVoiceRoom}
                    size={isMobile ? "sm" : "sm"}
                    variant="destructive"
                    disabled={isRecovering}
                    className={isMobile ? 'h-6 w-6 p-0' : ''}
                  >
                    <PhoneOff className={`${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Audio Level Indicator */}
          {isVoiceEnabled && (
            <div className={`flex items-center justify-between ${isMobile ? 'gap-1' : 'gap-2'}`}>
              <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-600`}>
                Your audio:
              </span>
              <AudioLevelIndicator level={audioLevel} />
              {isRecovering && (
                <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-yellow-600`}>• Recovering</span>
              )}
            </div>
          )}

          {/* Available Rooms */}
          {!isVoiceEnabled && availableRooms.length > 0 && (
            <div className="space-y-2">
              <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-700 flex items-center justify-between`}>
                Available Voice Rooms
                <Badge variant="outline" className="text-xs">
                  Role: {userRole}
                </Badge>
              </div>
              <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {availableRooms.map((room) => (
                  <div
                    key={room.id}
                    className={`${isMobile ? 'p-2' : 'p-3'} rounded border ${getRoomColorClass(room.name)} ${
                      (room.participant_count || 0) >= room.max_participants ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'} flex items-center gap-1`}>
                          {room.name}
                          {room.is_private && <Shield className="h-3 w-3 text-blue-500" />}
                        </div>
                        <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-600`}>
                          {room.participant_count || 0}/{room.max_participants} • 
                          {room.is_private ? ' Private' : ' Open'}
                        </div>
                        {!isMobile && room.description && (
                          <div className="text-xs text-gray-500 mt-1 truncate">
                            {room.description}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => joinVoiceRoom(room)}
                        disabled={isConnecting || (room.participant_count || 0) >= room.max_participants || isRecovering || networkStatus === 'offline'}
                        size={isMobile ? "sm" : "sm"}
                        className={`bg-green-600 hover:bg-green-700 text-white ${isMobile ? 'h-6 px-2 text-[10px]' : ''}`}
                      >
                        <Phone className={`${isMobile ? 'h-2 w-2 mr-0.5' : 'h-3 w-3 mr-1'}`} />
                        {isConnecting ? 
                          (retryAttempts > 0 ? `${retryAttempts}/5` : 'Joining...') : 
                          'Join'
                        }
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connected Participants */}
          {isVoiceEnabled && connectedTrackers.length > 0 && (
            <div className="space-y-2">
              <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-700 flex items-center justify-between`}>
                Connected Participants ({connectedTrackers.length})
                {!isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConnectionDetails(!showConnectionDetails)}
                    className="text-xs"
                  >
                    {showConnectionDetails ? 'Hide Details' : 'Show Details'}
                  </Button>
                )}
              </div>
              <div className={`space-y-1 ${isMobile ? 'max-h-24' : 'max-h-32'} overflow-y-auto`}>
                {connectedTrackers.map((tracker) => {
                  const quality = connectionQualities.get(tracker.userId); // This is from the old system
                  const peerStatus = peerStatuses.get(tracker.userId);
                  return (
                    <div
                      key={tracker.userId}
                      className={`flex items-center justify-between ${isMobile ? 'p-1.5' : 'p-2'} rounded bg-white border transition-colors ${
                        tracker.isSpeaking ? 'border-green-300 bg-green-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                        {getPeerStatusIndicator(peerStatus)}
                        {getRoleIcon(tracker.role)}
                        <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} truncate flex-1`}>
                          {tracker.username || `Participant ${tracker.userId.slice(-4)}`}
                        </span>
                        {/* Displaying peerStatus text if relevant, can be adjusted */}
                        {(peerStatus === 'connecting' || peerStatus === 'failed') && !isMobile && (
                          <span className={`text-[10px] ${peerStatus === 'failed' ? 'text-red-500' : 'text-yellow-600'}`}>
                            ({peerStatus})
                          </span>
                        )}
                        {/* Old quality display, can be kept if still relevant or removed/repurposed */}
                        {quality && showConnectionDetails && (
                          <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} ${getQualityColor(quality.quality)}`}>
                            {getQualityIcon(quality.quality)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {tracker.isMuted ? (
                          <MicOff className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'} text-red-500`} />
                        ) : (
                          <Mic className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'} text-green-500`} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Connection Details */}
          {showConnectionDetails && isVoiceEnabled && !isMobile && (
            <div className="text-xs p-2 bg-gray-50 rounded border">
              <div className="font-medium mb-1">Connection Metrics & Statuses</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Total Peers in Room: {connectionMetrics?.totalPeers ?? connectedTrackers.length}</div>
                <div>WebRTC Connected: {Array.from(peerStatuses.values()).filter(s => s === 'connected').length}</div>
                <div>Network: {networkStatus}</div>
                {isRecovering && <div>Status: Recovering...</div>}
                {retryAttempts > 0 && <div>Retries: {retryAttempts}</div>}
              </div>
              {peerStatuses.size > 0 && (
                <div className="mt-2">
                  <div className="font-medium mb-1">Peer Connection Statuses</div>
                  <div className="flex flex-wrap gap-x-2 gap-y-1">
                    {Array.from(peerStatuses.entries()).map(([pId, pStatus]) => (
                      <div key={pId} className="flex items-center">
                        {getPeerStatusIndicator(pStatus)}
                        <span className="text-xs">
                           {connectedTrackers.find(t => t.userId === pId)?.username?.split(' ')[0] || pId.slice(-4)}: {pStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Old connectionQualities display, can be removed if peerStatuses is sufficient */}
              {connectionQualities.size > 0 && (
                <div className="mt-2 pt-1 border-t">
                  <div className="font-medium mb-1 text-gray-500">(Legacy) Quality Metrics</div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(connectionQualities.entries()).map(([cId, cQuality]) => (
                      <span key={cId} className={`${getQualityColor(cQuality.quality)} text-xs`}>
                        {getQualityIcon(cQuality.quality)} {cId.slice(-4)} ({cQuality.rtt}ms)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* System Status */}
          {!isVoiceEnabled && !isConnecting && availableRooms.length > 0 && (
            <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-600 ${isMobile ? 'p-1.5' : 'p-2'} ${databaseConnected ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'} rounded border`}>
              🎤 <strong>Voice System Active</strong>
              <br/>
              {databaseConnected ? (
                <>
                  ✅ Connected to database - real-time collaboration enabled
                  <br/>✅ {availableRooms.length} rooms available with persistent data
                </>
              ) : (
                <>
                  ⚠️ Running in offline mode - demonstration functionality
                  <br/>✅ {availableRooms.length} template rooms available
                </>
              )}
              <br/>✅ Role-based access configured for: {userRole}
              {!databaseConnected && (
                <><br/>⚠️ Contact administrator to enable database tables for full functionality</>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceCollaboration;
