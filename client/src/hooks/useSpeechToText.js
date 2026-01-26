import { useState, useEffect, useRef, useCallback } from 'react';

const useSpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check for browser support
    if (!('webkitSpeechRecognition' in window)) {
      console.error("Browser does not support speech recognition.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    
    // Key Configuration for seamless dictation
    recognition.continuous = true; // Keep recording even if the user pauses
    recognition.interimResults = true; // Show words as they are being spoken
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';

      // Iterate through all results in the buffer to construct the full sentence
      // This prevents the "wiping" issue when pausing
      for (let i = 0; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        finalTranscript += transcriptSegment;
      }

      setTranscript(finalTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'not-allowed') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // If the user meant to keep listening but the browser stopped it (silence timeout),
      // we don't automatically restart here to allow for cleaner control in the UI.
      // But we update the state to reflect that it stopped.
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        // Clear previous transcript only if starting a fresh session manually
        // You can remove this line if you want to keep appending even after stop/start
        // setTranscript(''); 
        
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting recognition:", error);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Helper to manually clear text after sending a message
  const resetTranscript = useCallback(() => {
    setTranscript('');
    // Also abort the current recognition session to clear the internal buffer
    if (recognitionRef.current) {
        recognitionRef.current.abort(); 
        // If it was listening, we might need to decide if we want to restart or stay stopped.
        // Usually, after sending, we stop listening until the user replies.
        setIsListening(false);
    }
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript
  };
};

export default useSpeechToText;