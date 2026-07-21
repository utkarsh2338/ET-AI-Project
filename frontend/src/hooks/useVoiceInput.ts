import { useState, useCallback, useRef, useEffect } from 'react';
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
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast({
        type: 'warning',
        title: 'Speech Recognition Unsupported',
        message: 'Your browser does not support Speech Recognition.',
      });
      return;
    }

    if (isListening) {
      stopListening();
      showToast({ type: 'info', title: 'Recording Stopped', message: 'Transcription completed.' });
      return;
    }

    // Stop any existing instance cleanly
    stopListening();

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        showToast({ type: 'info', title: 'Listening...', message: 'Speak now to transcribe message.' });
      };

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
        recognitionRef.current = null;

        if (event.error === 'not-allowed') {
          showToast({
            type: 'error',
            title: 'Microphone Access Denied',
            message: 'Please allow microphone permissions in your browser.',
          });
        } else if (event.error !== 'aborted') {
          showToast({
            type: 'error',
            title: 'Voice Input Error',
            message: `Speech recognition error: ${event.error}`,
          });
        }
      };

      rec.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.error('Failed to initialize speech recognition:', e);
      setIsListening(false);
      recognitionRef.current = null;
    }
  }, [isListening, onTranscript, stopListening]);

  return { isListening, hasSupport, toggleListening, stopListening };
}
