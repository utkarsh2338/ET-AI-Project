import { useState, useCallback, useRef, useEffect } from 'react';
import { showToast } from './useToast';

const LANG_VOICE_MAP: Record<string, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  pa: 'pa-IN',
};

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [activeText, setActiveText] = useState<string | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const keepAliveIntervalRef = useRef<any>(null);

  const stopAudio = useCallback(() => {
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setActiveText(null);
  }, []);

  const playText = useCallback(
    (text: string, langCode = 'en') => {
      if (!('speechSynthesis' in window)) {
        showToast({ type: 'warning', title: 'TTS Unsupported', message: 'Browser does not support Text-to-Speech.' });
        return;
      }

      stopAudio();

      const utterance = new SpeechSynthesisUtterance(text);
      const bcp47 = LANG_VOICE_MAP[langCode] || 'en-US';
      utterance.lang = bcp47;
      utterance.rate = playbackRate;

      // Voice selection with fallback
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const match = voices.find(
          (v) =>
            v.lang.toLowerCase().replace('_', '-').startsWith(langCode.toLowerCase()) ||
            v.lang.toLowerCase().replace('_', '-').startsWith(bcp47.toLowerCase()),
        );
        if (match) {
          utterance.voice = match;
        }
      }

      utterance.onend = () => {
        stopAudio();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        stopAudio();
      };

      utteranceRef.current = utterance;
      setActiveText(text);
      setIsPlaying(true);
      setIsPaused(false);

      // Chrome long-speech keep-alive hack
      keepAliveIntervalRef.current = setInterval(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);

      window.speechSynthesis.speak(utterance);
      showToast({ type: 'info', title: 'Reading Aloud', message: `Playing audio in ${langCode.toUpperCase()}...` });
    },
    [playbackRate, stopAudio],
  );

  const pauseAudio = useCallback(() => {
    if ('speechSynthesis' in window && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPlaying]);

  const resumeAudio = useCallback(() => {
    if ('speechSynthesis' in window && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const setSpeed = useCallback(
    (rate: number) => {
      setPlaybackRate(rate);
      if (utteranceRef.current && isPlaying) {
        const text = activeText;
        if (text) playText(text);
      }
    },
    [activeText, isPlaying, playText],
  );

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  return {
    isPlaying,
    isPaused,
    playbackRate,
    activeText,
    playText,
    pauseAudio,
    resumeAudio,
    stopAudio,
    setSpeed,
  };
}
