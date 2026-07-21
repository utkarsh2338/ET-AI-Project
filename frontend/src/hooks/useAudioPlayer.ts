import { useState, useCallback, useRef } from 'react';
import { showToast } from './useToast';

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [activeText, setActiveText] = useState<string | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const playText = useCallback((text: string, lang = 'en-US') => {
    if (!('speechSynthesis' in window)) {
      showToast({ type: 'warning', title: 'TTS Unsupported', message: 'Browser does not support Text-to-Speech.' });
      return;
    }

    // Cancel any active audio first
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = playbackRate;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setActiveText(null);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setActiveText(null);
    };

    utteranceRef.current = utterance;
    setActiveText(text);
    setIsPlaying(true);
    setIsPaused(false);

    window.speechSynthesis.speak(utterance);
  }, [playbackRate]);

  const pauseAudio = useCallback(() => {
    if (window.speechSynthesis && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPlaying]);

  const resumeAudio = useCallback(() => {
    if (window.speechSynthesis && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const stopAudio = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setActiveText(null);
    }
  }, []);

  const setSpeed = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (utteranceRef.current && isPlaying) {
      // Re-play with new rate
      const text = activeText;
      stopAudio();
      if (text) playText(text);
    }
  }, [activeText, isPlaying, playText, stopAudio]);

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
