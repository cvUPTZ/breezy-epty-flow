import { useState, useRef, useCallback } from 'react'
import { supabase } from '../integrations/supabase/client'

interface VoiceEvent {
  id: string
  timestamp: string
  player_id?: number
  team?: string
  event_type: string
  details?: {
    player_name?: string
    target_player?: string
    transcript?: string
    confidence?: number
    [key: string]: any
  }
  match_id: string
}

interface Player {
  id: number
  name: string
  jersey_number?: number
}

interface EventType {
  key: string
  label: string
}

interface UseGeminiVoiceRecorderOptions {
  assignedPlayers?: {
    home: Player[]
    away: Player[]
  }
  assignedEventTypes?: EventType[]
}

export const useGeminiVoiceRecorder = (
  matchId: string, 
  options?: UseGeminiVoiceRecorderOptions
) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [events, setEvents] = useState<VoiceEvent[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentTranscript, setCurrentTranscript] = useState<string>('')
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)

  // Play success sound
  const playSuccessSound = useCallback(() => {
    if (!isAudioEnabled) return
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      oscillator.frequency.setValueAtTime(900, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.4)
    } catch (e) {
      console.warn('Audio feedback failed:', e)
    }
  }, [isAudioEnabled])

  // Convert audio to base64
  const blobToBase64 = useCallback((blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        if (result) {
          resolve(result.split(',')[1])
        } else {
          reject(new Error('فشل في تحويل الملف الصوتي'))
        }
      }
      reader.onerror = () => reject(new Error('فشل في قراءة الملف الصوتي'))
      reader.readAsDataURL(blob)
    })
  }, [])

  // Process audio with Gemini STT and RAG
  const processAudioWithGemini = useCallback(async (audioBase64: string) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('يجب تسجيل الدخول لتسجيل الأحداث')

      // Step 1: Transcribe audio using Gemini STT
      const { data: transcriptData, error: transcriptError } = await supabase.functions.invoke(
        'gemini-transcribe',
        {
          body: { 
            audioBase64,
            language: 'ar-DZ' // Arabic (Algeria)
          }
        }
      )

      if (transcriptError) throw new Error(transcriptError.message)
      
      const transcript = transcriptData?.transcript || ''
      setCurrentTranscript(transcript)

      if (!transcript.trim()) {
        throw new Error('لم يتم اكتشاف أي كلام في التسجيل')
      }

      // Step 2: Parse command using Gemini with RAG  
      const { data: parsedCommand, error: parseError } = await supabase.functions.invoke(
        'gemini-parse-command',
        {
          body: {
            transcript,
            matchId,
            assignedEventTypes: options?.assignedEventTypes || [],
            assignedPlayers: options?.assignedPlayers || { home: [], away: [] },
          }
        }
      )

      if (parseError) throw new Error(parseError.message)

      // Step 3: Validate parsed command
      if (!parsedCommand || !parsedCommand.eventType || parsedCommand.confidence < 0.5) {
        throw new Error(
          `لم يتم التعرف على الأمر بشكل موثوق: "${transcript}". السبب: ${
            parsedCommand?.reasoning || 'ثقة منخفضة أو لا يوجد نوع حدث'
          }`
        )
      }

      // Step 4: Save to database
      const eventData = {
        match_id: matchId,
        event_type: parsedCommand.eventType.key,
        player_id: parsedCommand.player?.id,
        team: parsedCommand.teamContext || null,
        timestamp: Date.now(), // Use timestamp as bigint (milliseconds since epoch)
        created_by: user.id, // ✅ Add created_by for RLS policy
        details: {
          recorded_via: 'voice_gemini', // ✅ Moved source to details to match schema
          player_name: parsedCommand.player?.name,
          target_player: parsedCommand.targetPlayer?.name,
          transcript,
          confidence: parsedCommand.confidence,
          reasoning: parsedCommand.reasoning,
        },
        // ❌ Removed source field - it doesn't exist in the schema
      }

      const { data: insertedEvent, error: insertError } = await supabase
        .from('match_events')
        .insert([eventData])
        .select()
        .single()

      if (insertError) throw new Error(insertError.message)

      // Step 5: Update local state
      setEvents(prev => [insertedEvent, ...prev])
      playSuccessSound()

      return {
        success: true,
        event: insertedEvent,
        transcript,
        confidence: parsedCommand.confidence,
      }
    } catch (err) {
      throw err
    }
  }, [matchId, options, playSuccessSound])

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setError(null)
      setCurrentTranscript('')
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      })
      
      // Use better audio format for Arabic speech
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      
      mediaRecorder.current = new MediaRecorder(stream, { mimeType })
      audioChunks.current = []
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data)
        }
      }

      mediaRecorder.current.onstop = async () => {
        setIsProcessing(true)
        try {
          const audioBlob = new Blob(audioChunks.current, { type: mimeType })
          const base64 = await blobToBase64(audioBlob)
          
          const result = await processAudioWithGemini(base64)
          
          if (result.success) {
            setError(null)
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
          setError(errorMessage)
          console.error('Error processing audio:', err)
        } finally {
          setIsProcessing(false)
        }
      }

      mediaRecorder.current.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        setError('حدث خطأ أثناء التسجيل')
        setIsRecording(false)
      }

      mediaRecorder.current.start()
      setIsRecording(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في الوصول إلى الميكروفون'
      setError(errorMessage)
      console.error('Error starting recording:', err)
    }
  }, [blobToBase64, processAudioWithGemini])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }, [isRecording])

  // Clear events
  const clearEvents = useCallback(() => {
    setEvents([])
    setError(null)
    setCurrentTranscript('')
  }, [])

  // Toggle audio feedback
  const toggleAudio = useCallback(() => {
    setIsAudioEnabled(prev => !prev)
  }, [])

  return { 
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
  }
}
