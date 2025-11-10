import React, { useState, useEffect, useCallback } from 'react';
import { useGeminiVoiceRecorder } from '../hooks/useGeminiVoiceRecorder';
import { Mic, MicOff, Loader2, Volume2, VolumeX, CheckCircle2, AlertCircle, Info, CloudCog } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface Player {
  id: number;
  name: string;
  jersey_number?: number;
}

interface EventType {
  key: string;
  label: string;
}

interface CommentatorPanelProps {
  matchId: string;
  assignedPlayers?: {
    home: Player[];
    away: Player[];
  };
  assignedEventTypes?: EventType[];
}

type Feedback = { status: 'info' | 'success' | 'error'; message: string };

export const CommentatorPanel = ({ 
  matchId, 
  assignedPlayers,
  assignedEventTypes 
}: CommentatorPanelProps) => {
  const { 
    isRecording, 
    isProcessing,
    startRecording, 
    stopRecording, 
    events,
    error,
    clearEvents,
    currentTranscript,
    isAudioEnabled,
    toggleAudio,
  } = useGeminiVoiceRecorder(matchId, {
    assignedPlayers,
    assignedEventTypes,
  });

  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // Update feedback based on recording state
  useEffect(() => {
    if (error) {
      setFeedback({ status: 'error', message: error });
    } else if (isProcessing) {
      setFeedback({ status: 'info', message: 'جاري تحليل التعليق الصوتي باستخدام Gemini AI...' });
    } else if (isRecording) {
      setFeedback({ status: 'info', message: 'يتم التسجيل الآن... اضغط لإيقاف التسجيل' });
    } else {
      setFeedback(null);
    }
  }, [error, isProcessing, isRecording]);

  const getStatusText = () => {
    if (isProcessing) return <><CloudCog size={16} className="inline animate-spin ml-1" /> جاري تحليل الأمر...</>;
    if (isRecording) return '🎤 جاري التسجيل...';
    return 'جاهز للتسجيل';
  };

  const getButtonIcon = () => {
    if (isProcessing) return <Loader2 size={32} className="animate-spin" />;
    if (isRecording) return <MicOff size={32} />;
    return <Mic size={32} />;
  };

  const getButtonClass = () => {
    const baseClass = 'flex items-center justify-center w-24 h-24 rounded-full border-4 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105';
    if (isRecording) {
      return `${baseClass} bg-red-500 border-red-700 text-white animate-pulse`;
    }
    if (isProcessing) {
      return `${baseClass} bg-gray-400 border-gray-600 text-white cursor-not-allowed`;
    }
    return `${baseClass} bg-primary border-primary/80 text-primary-foreground hover:bg-primary/90`;
  };

  const toggleRecording = () => {
    if (isProcessing) return;
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto" dir="rtl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">🎙️ نظام التعليق الصوتي الذكي</CardTitle>
          <button 
            className="p-2 rounded-full text-muted-foreground hover:bg-accent flex items-center gap-2" 
            onClick={toggleAudio} 
            aria-label="Toggle audio feedback"
          >
            {isAudioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            <span className="text-sm">{isAudioEnabled ? 'صوت مفعّل' : 'صوت معطّل'}</span>
          </button>
        </div>
        <CardDescription>استخدم صوتك لتسجيل أحداث المباراة بذكاء اصطناعي</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Recording Button */}
        <div className="flex flex-col items-center space-y-4 py-6 bg-background rounded-lg">
          <button
            onClick={toggleRecording}
            className={getButtonClass()}
            disabled={isProcessing}
            aria-label={isRecording ? "إيقاف التسجيل" : "بدء التسجيل"}
          >
            {getButtonIcon()}
          </button>
          <div className="h-5 mt-4">
            <p className="text-sm text-center text-muted-foreground flex items-center justify-center">
              {getStatusText()}
            </p>
          </div>
        </div>
        
        {/* Feedback Message */}
        {feedback && (
          <div className={`flex items-start space-x-3 space-x-reverse p-3 rounded-lg border ${
            feedback.status === 'error' ? 'bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-500/30' :
            feedback.status === 'success' ? 'bg-green-50 text-green-900 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-500/30' :
            'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-500/30'
          }`}>
            <div className="flex-shrink-0 mt-0.5">
              {feedback.status === 'error' && <AlertCircle className="w-5 h-5" />}
              {feedback.status === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {feedback.status === 'info' && (isProcessing ? <CloudCog className="w-5 h-5 animate-spin" /> : <Info className="w-5 h-5" />)}
            </div>
            <p className="text-sm font-medium">{feedback.message}</p>
          </div>
        )}

        {/* Current Transcript */}
        {currentTranscript && !isRecording && !isProcessing && (
          <div className="bg-muted/50 p-3 rounded-lg border">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">آخر نص تم التعرف عليه</p>
            <p className="text-sm italic text-foreground/80 pt-1">"{currentTranscript}"</p>
          </div>
        )}
        
        <Separator />
        
        <div className="space-y-4">
          {/* Available Event Types */}
          {assignedEventTypes && assignedEventTypes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">أنواع الأحداث المتاحة</h4>
              <div className="flex flex-wrap gap-2">
                {assignedEventTypes.map(eventType => (
                  <Badge key={eventType.key} variant="secondary">
                    {eventType.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Events List */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold text-muted-foreground">
                الأحداث المسجلة ({events.length})
              </h4>
              {events.length > 0 && (
                <button
                  onClick={clearEvents}
                  className="text-xs px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                >
                  🗑️ مسح الكل
                </button>
              )}
            </div>
            
            {events.length === 0 ? (
              <div className="bg-muted/50 p-8 rounded-lg border-2 border-dashed text-center">
                <Info className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  لا توجد أحداث بعد. ابدأ التسجيل لإضافة أحداث!
                </p>
              </div>
            ) : (
              <div className="space-y-2 bg-muted/50 p-3 rounded-lg border max-h-96 overflow-y-auto">
                {events.map((event, index) => (
                  <div 
                    key={event.id || index}
                    className="p-3 bg-background rounded-md border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <strong className="text-sm text-foreground">
                          {event.event_type}
                        </strong>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString('ar-DZ', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mr-6 space-x-2 space-x-reverse">
                      {event.details?.player_name && (
                        <span>👤 {event.details.player_name}</span>
                      )}
                      {event.player_id && (
                        <span>#{event.player_id}</span>
                      )}
                      {event.team && (
                        <span>({event.team})</span>
                      )}
                      {event.details?.target_player && (
                        <span>➡️ {event.details.target_player}</span>
                      )}
                    </div>

                    {event.details?.transcript && (
                      <div className="mt-2 p-2 bg-muted rounded-md text-xs text-muted-foreground italic mr-6">
                        💬 "{event.details.transcript}"
                      </div>
                    )}

                    {event.details?.confidence && (
                      <div className="mt-2 mr-6">
                        <Badge 
                          variant={event.details.confidence > 0.8 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          ثقة: {(event.details.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Help Section */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 rounded-lg text-white">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block mb-2 text-sm">💡 نصائح للحصول على أفضل نتائج:</strong>
              <ul className="text-sm space-y-1 list-disc list-inside leading-relaxed">
                <li>تحدث بوضوح وبصوت مسموع</li>
                <li>اذكر اسم اللاعب ونوع الحدث بشكل واضح</li>
                <li>يدعم النظام اللغة العربية بشكل كامل مع Gemini AI</li>
                <li>مثال: "هدف من محمد صلاح" أو "تمريرة حاسمة من ميسي"</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
