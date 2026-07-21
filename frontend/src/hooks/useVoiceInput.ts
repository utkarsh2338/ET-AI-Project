import { useState, useEffect, useRef, useCallback } from 'react';
import { showToast } from './useToast';

export function useVoiceInput(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [hasSupport, setHasSupport] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setHasSupport(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      if (currentTranscript.trim()) {
        onTranscript(currentTranscript);
      }
    };

    rec.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      showToast({
        type: 'error',
        title: 'Microphone Error',
        message: event.error === 'not-allowed' ? 'Microphone permission denied.' : 'Voice input failed.',
      });
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
  }, [onTranscript]);

  const toggleListening = useCallback(() => {
    if (!hasSupport) {
      showToast({
        type: 'warning',
        title: 'Speech Recognition Unsupported',
        message: 'Your browser does not support voice speech input.',
      });
      return;
    }

    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      showToast({ type: 'info', title: 'Voice Recording Stopped', message: 'Transcription completed.' });
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        showToast({ type: 'info', title: 'Listening...', message: 'Speak now to transcribe message.' });
      } catch (e) {
        console.error('Failed to start speech recognition:', e);
      }
    }
  }, [hasSupport, isListening]);

  return { isListening, hasSupport, toggleListening };
}
