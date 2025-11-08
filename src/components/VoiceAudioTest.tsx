import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, Mic, Square } from 'lucide-react';
import { toast } from 'sonner';
import { useVoiceCollaborationContext } from '@/context/VoiceCollaborationContext';

/**
 * VoiceAudioTest - Independent audio testing component
 * 
 * This component uses completely separate audio resources from the voice chat system
 * to avoid conflicts. It creates its own AudioContext and MediaStream that are
 * independent of the shared AudioManager used by voice chat.
 */
const VoiceAudioTest: React.FC = () => {
  const { isConnected } = useVoiceCollaborationContext();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  
  // Independent audio resources for testing only
  const localAudioContextRef = useRef<AudioContext | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const monitoringIntervalRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (localAudioContextRef.current && localAudioContextRef.current.state !== 'closed') {
      localAudioContextRef.current.close();
      localAudioContextRef.current = null;
    }
  };

  const startRecording = useCallback(async () => {
    if (isConnected) {
      toast.error('Cannot test audio while in a voice room. Please leave the room first.');
      return;
    }

    try {
      console.log('🎙️ Starting independent audio test...');
      
      // Create separate AudioContext for testing
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      localAudioContextRef.current = new AudioContextClass();
      
      // Request microphone independently
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      
      // Set up audio level monitoring
      const analyser = localAudioContextRef.current.createAnalyser();
      const source = localAudioContextRef.current.createMediaStreamSource(localStreamRef.current);
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      
      // Monitor audio levels
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      monitoringIntervalRef.current = window.setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setAudioLevel(Math.min(average / 255, 1));
      }, 100);
      
      // Set up MediaRecorder
      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/ogg';
      
      mediaRecorderRef.current = new MediaRecorder(localStreamRef.current, { 
        mimeType,
        audioBitsPerSecond: 128000 
      });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioElementRef.current) {
          audioElementRef.current.src = audioUrl;
          setHasRecording(true);
        }
      };
      
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      toast.success('Recording started');
      
    } catch (error: any) {
      console.error('❌ Recording failed:', error);
      toast.error('Failed to start recording: ' + error.message);
      cleanup();
    }
  }, [isConnected]);

  const stopRecording = useCallback(() => {
    console.log('🛑 Stopping recording...');
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    cleanup();
    setIsRecording(false);
    setAudioLevel(0);
    toast.success('Recording stopped');
  }, [isRecording]);

  const playRecording = useCallback(async () => {
    if (!audioElementRef.current || !hasRecording) return;
    
    try {
      audioElementRef.current.volume = 1.0;
      await audioElementRef.current.play();
      setIsPlaying(true);
    } catch (error: any) {
      console.error('Playback failed:', error);
      toast.error('Playback failed: ' + error.message);
    }
  }, [hasRecording]);

  const pauseRecording = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const testDirectAudio = useCallback(async () => {
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 1000);
      
      toast.success('Test tone played (440Hz)');
      
    } catch (error: any) {
      console.error('Direct audio test failed:', error);
      toast.error('Test failed: ' + error.message);
    }
  }, []);

  return (
    <Card className="border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-blue-400" />
          Audio Test
          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-300 border-blue-400/20">
            Independent
          </Badge>
        </CardTitle>
        <CardDescription className="text-white/70 text-xs">
          {isConnected 
            ? '⚠️ Leave the voice room to test audio' 
            : 'Test your microphone and speakers independently'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Audio Level Indicator */}
        {isRecording && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span>Input Level:</span>
              <span className="font-mono">{(audioLevel * 100).toFixed(0)}%</span>
            </div>
            <div className="flex gap-1 h-2">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm transition-all ${
                    audioLevel > (i + 1) * 0.1 
                      ? 'bg-emerald-500' 
                      : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recording Controls */}
        <div className="space-y-2">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? "destructive" : "default"}
            className="w-full"
            disabled={isConnected}
          >
            {isRecording ? (
              <>
                <Square className="mr-2 h-4 w-4" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Start Recording
              </>
            )}
          </Button>

          {hasRecording && (
            <div className="flex gap-2">
              <Button
                onClick={isPlaying ? pauseRecording : playRecording}
                variant="outline"
                disabled={!hasRecording || isConnected}
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                {isPlaying ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Play
                  </>
                )}
              </Button>
              <Button
                onClick={testDirectAudio}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
                disabled={isConnected}
              >
                <Volume2 className="mr-2 h-4 w-4" />
                Test Tone
              </Button>
            </div>
          )}
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioElementRef}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          style={{ display: 'none' }}
        />

        {/* Instructions */}
        <div className="text-xs text-white/60 p-3 bg-white/5 rounded-lg border border-white/10">
          <strong className="text-white/80">How it works:</strong>
          <ul className="mt-1 space-y-1 list-disc list-inside">
            <li>Uses separate audio resources from voice chat</li>
            <li>No interference with active voice rooms</li>
            <li>Disabled when connected to voice chat</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceAudioTest;
