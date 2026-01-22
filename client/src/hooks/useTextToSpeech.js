import { useCallback, useEffect, useState } from 'react';

const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voice, setVoice] = useState(null);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.lang.includes('en') && 
        (v.name.includes('Google') || v.name.includes('Natural'))
      ) || voices.find(v => v.lang.includes('en'));
      
      if (preferredVoice) {
        setVoice(preferredVoice);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((text) => {
    if (!text || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [voice, rate, pitch]);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const pauseSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsSpeaking(false);
    }
  }, []);

  const resumeSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
      setIsSpeaking(true);
    }
  }, []);

  return {
    isSpeaking,
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    setVoice,
    setRate,
    setPitch,
  };
};

export default useTextToSpeech;