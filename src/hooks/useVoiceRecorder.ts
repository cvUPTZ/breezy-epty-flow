import { useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

interface VoiceEvent {
  id: string
  timestamp: string
  player: string
  team: string
  event_type: string
  target_player?: string
  match_id: string
}

export const useVoiceRecorder = (matchId: string) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [events, setEvents] = useState<VoiceEvent[]>([])
  const [error, setError] = useState<string | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      
      audioChunks.current = []
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data)
        }
      }

      mediaRecorder.current.onstop = async () => {
        setIsProcessing(true)
        try {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' })
          const base64 = await blobToBase64(audioBlob)
          
          // إرسال إلى Supabase Edge Function
          const { data, error: invokeError } = await supabase.functions.invoke('process-commentary', {
            body: { audioBase64: base64, matchId }
          })

          if (invokeError) {
            throw new Error(invokeError.message)
          }

          if (data?.success && data?.data) {
            setEvents(prev => [...prev, data.data])
            setError(null)
          } else {
            throw new Error(data?.error || 'فشل في معالجة التسجيل الصوتي')
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
  }, [matchId])

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }, [isRecording])

  const clearEvents = useCallback(() => {
    setEvents([])
    setError(null)
  }, [])

  return { 
    isRecording, 
    isProcessing,
    startRecording, 
    stopRecording, 
    events,
    error,
    clearEvents
  }
}

const blobToBase64 = (blob: Blob): Promise<string> => {
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
}
