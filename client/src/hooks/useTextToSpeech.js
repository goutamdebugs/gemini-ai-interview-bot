import { useCallback, useEffect, useState } from 'react';

const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voice, setVoice] = useState(null);

  // Slightly slower rate + lower pitch = deeper, professional male voice
  const [rate, setRate] = useState(0.95);
  const [pitch, setPitch] = useState(1.0);

  useEffect(() => {
    // Load and select the best available MALE voice
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      // Priority list for best MALE voices (browser dependent)
      const preferredVoice = voices.find(v =>
        v.lang.includes('en') && (
          v.name.includes('Microsoft David') ||   // Windows / Edge (best male)
          v.name.includes('Microsoft Mark') ||
          v.name.includes('Microsoft Ryan') ||
          v.name.includes('Google UK English Male') ||
          v.name.includes('Google US English') || // Chrome (neutral but solid)
          v.name.includes('Daniel') ||             // macOS male
          v.name.includes('Alex')                  // macOS male
        )
      );

      // Fallback: any English voice
      const fallbackVoice =
        voices.find(v => v.lang.includes('en-US')) ||
        voices.find(v => v.lang.includes('en')) ||
        voices[0];

      if (preferredVoice) {
        setVoice(preferredVoice);
      } else if (fallbackVoice) {
        setVoice(fallbackVoice);
      }
    };

    // Load voices immediately + handle async browser behavior
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((text) => {
    if (!text || !window.speechSynthesis) return;

    // Prevent overlapping speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    if (voice) {
      utterance.voice = voice;
    }

    // Male voice tuning
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1;
    utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error('Speech Error:', event);
      setIsSpeaking(false);
    };

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


// import { useState, useCallback, useEffect, useRef } from 'react';
// import axios from 'axios';

// const useTextToSpeech = () => {
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const audioRef = useRef(null); 
//   // Using ref instead of state is better here (reduces unnecessary re-renders)

//   // ElevenLabs Config
//   const VOICE_ID = 'NFG5qt843uXKj4pFvR7C'; // Rachel
//   const API_KEY ='';

//   // 1. Free browser voice (Fallback mechanism)
//   const speakNative = useCallback((text) => {
//     if (!window.speechSynthesis) return;

//     // Stop any ongoing speech
//     window.speechSynthesis.cancel();

//     const utterance = new SpeechSynthesisUtterance(text);
    
//     // Voice selection logic (with some safety)
//     const voices = window.speechSynthesis.getVoices();
//     const preferredVoice = voices.find(v => 
//       (v.name.includes('Google US English') || v.name.includes('Microsoft Zira') || v.lang.includes('en-US'))
//     );

//     if (preferredVoice) utterance.voice = preferredVoice;
    
//     utterance.rate = 1.0;   // Normal speed
//     utterance.pitch = 1.0;
//     utterance.volume = 1.0;

//     utterance.onstart = () => setIsSpeaking(true);
//     utterance.onend = () => setIsSpeaking(false);
//     utterance.onerror = (err) => {
//       console.error("Native Speech Error:", err);
//       setIsSpeaking(false);
//     };

//     window.speechSynthesis.speak(utterance);
//   }, []);

//   // 2. Main function (ElevenLabs -> fallback to Native)
//   const speak = useCallback(async (text) => {
//     if (!text) return;

//     // Stop if something is already speaking
//     stopSpeaking();
//     setIsSpeaking(true);

//     // If API key is missing, directly use native voice
//     if (!API_KEY) {
//       console.warn("Using Native Voice (No API Key)");
//       speakNative(text);
//       return;
//     }

//     try {
//       const response = await axios.post(
//         `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
//         {
//           text: text,
//           model_id: "eleven_monolingual_v1",
//           voice_settings: { stability: 0.5, similarity_boost: 0.75 }
//         },
//         {
//           headers: {
//             'xi-api-key': API_KEY,
//             'Content-Type': 'application/json',
//           },
//           responseType: 'blob'
//         }
//       );

//       // Memory leak fix: clean previous audio URL
//       if (audioRef.current && audioRef.current.src) {
//         URL.revokeObjectURL(audioRef.current.src);
//       }

//       const audioUrl = URL.createObjectURL(response.data);
//       const newAudio = new Audio(audioUrl);
//       audioRef.current = newAudio;

//       newAudio.onended = () => {
//         setIsSpeaking(false);
//         URL.revokeObjectURL(audioUrl); // ✅ memory cleaned
//       };

//       newAudio.onerror = (err) => {
//         console.error("Audio Playback Failed, switching to Native:", err);
//         URL.revokeObjectURL(audioUrl); // cleanup
//         speakNative(text); // backup voice
//       };

//       await newAudio.play();

//     } catch (error) {
//       console.error("ElevenLabs API Error / Quota Exceeded. Switching to Native.");
//       speakNative(text); // backup voice
//     }
//   }, [API_KEY, speakNative]);

//   // Stop speaking function (optimized)
//   const stopSpeaking = useCallback(() => {
//     // Stop ElevenLabs audio
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current.currentTime = 0;

//       // Memory cleanup
//       if (audioRef.current.src) URL.revokeObjectURL(audioRef.current.src);
//       audioRef.current = null;
//     }

//     // Stop browser speech
//     if (window.speechSynthesis) {
//       window.speechSynthesis.cancel();
//     }

//     setIsSpeaking(false);
//   }, []);

//   const pauseSpeaking = useCallback(() => {
//     if (audioRef.current) audioRef.current.pause();
//     if (window.speechSynthesis) window.speechSynthesis.pause();
//     setIsSpeaking(false);
//   }, []);

//   const resumeSpeaking = useCallback(() => {
//     if (audioRef.current) audioRef.current.play();
//     if (window.speechSynthesis) window.speechSynthesis.resume();
//     setIsSpeaking(true);
//   }, []);

//   // Cleanup when component unmounts
//   useEffect(() => {
//     return () => {
//       stopSpeaking();
//     };
//   }, [stopSpeaking]);

//   return {
//     isSpeaking,
//     speak,
//     stopSpeaking,
//     pauseSpeaking,
//     resumeSpeaking,
//   };
// };

// export default useTextToSpeech;
