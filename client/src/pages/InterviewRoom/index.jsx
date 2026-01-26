import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRobot,
  FaUser,
  FaMicrophone,
  FaPaperPlane,
  FaStop,
  FaPlay,
  FaPause,
  FaRedo
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { chatAPI } from '../../api';
import useSpeechToText from '../../hooks/useSpeechToText';
import useTextToSpeech from '../../hooks/useTextToSpeech';
import WebcamPreview from '../../components/WebcamPreview';
import './InterviewRoom.css';

const InterviewRoom = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(
    () => localStorage.getItem('sessionId') || `session_${Date.now()}`
  );

  const chatWindowRef = useRef(null);

  const {
    isListening,
    transcript,
    toggleListening,
    stopListening,
    resetTranscript
  } = useSpeechToText();

  const {
    isSpeaking,
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking
  } = useTextToSpeech();

  // Voice → Text sync
  useEffect(() => {
    if (transcript) {
      setInputMessage(transcript);
    }
  }, [transcript]);

  //Echo cancellation (AI speaking → mic off)
  useEffect(() => {
    if (isSpeaking && isListening) {
      stopListening();
    }
  }, [isSpeaking, isListening, stopListening]);
  useEffect(() => {
    
    if (isListening && transcript.trim() && !isSpeaking && !isLoading) {
      
   
      const timer = setTimeout(() => {
        handleSendMessage(); // submit automatic
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [transcript, isListening, isSpeaking, isLoading]);
  // Save session
  useEffect(() => {
    localStorage.setItem('sessionId', sessionId);
  }, [sessionId]);

  // Auto scroll
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTo({
        top: chatWindowRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  // Text-to-speech for AI
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.sender === 'ai' && !lastMessage.spoken) {
      speak(lastMessage.text);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === lastMessage.id ? { ...msg, spoken: true } : msg
        )
      );
    }
  }, [messages, speak]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage;
    setInputMessage('');
    resetTranscript();
    setIsLoading(true);

    const userMessage = {
      id: Date.now(),
      text: userText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const historyPayload = messages
        .filter((msg, index) => !(index === 0 && msg.sender === 'ai'))
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

      const response = await chatAPI.sendMessage({
        message: userText,
        sessionId,
        history: historyPayload
      });

      if (response.success) {
        const aiMessage = {
          id: Date.now() + 1,
          text: response.data.response,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          spoken: false
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to get response from AI');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartInterview = () => {
    setMessages([
      {
        id: Date.now(),
        text:
          'Hello! I am an AI agent developed by Goutam. I am a powerful interviewer here to assess your technical knowledge. Please provide or tell me your skills to start the interview.',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        spoken: false
      }
    ]);
    setSessionId(`session_${Date.now()}`);
  };

  const handleResetInterview = () => {
    setMessages([]);
    stopSpeaking();
    resetTranscript();
    setInputMessage('');
    setSessionId(`session_${Date.now()}`);
  };

  return (
    <motion.div
      className="interview-room"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ToastContainer theme="colored" />

      <div className="room-header">
        <h1>AI Technical Interview</h1>
        <p>Session: {sessionId.slice(-6)}</p>
      </div>

      <div className="camera-wrapper">
        <WebcamPreview />
      </div>

      <div className="chat-container">
        <div className="chat-window" ref={chatWindowRef}>
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div className="empty-state">
                <FaRobot size={50} />
                <h3>Ready to Start?</h3>
                <button
                  className="start-btn-primary"
                  onClick={handleStartInterview}
                >
                  Start Interview
                </button>
              </motion.div>
            ) : (
              messages.map(msg => (
                <motion.div
                  key={msg.id}
                  className={`message ${msg.sender}`}
                >
                  <div className="message-avatar">
                    {msg.sender === 'user' ? <FaUser /> : <FaRobot />}
                  </div>
                  <div className="message-content">
                    <div className="message-bubble">
                      <p>{msg.text}</p>
                    </div>
                    <span className="message-timestamp">
                      {msg.timestamp}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="bottom-area">
          <div className="controls-bar">
            {isSpeaking && (
              <>
                <button onClick={pauseSpeaking}><FaPause /></button>
                <button onClick={resumeSpeaking}><FaPlay /></button>
                <button onClick={stopSpeaking}><FaStop /></button>
              </>
            )}
            <button onClick={handleResetInterview} className="reset-btn">
              <FaRedo />
            </button>
          </div>

          <div className="input-area">
            <textarea
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your answer..."
              disabled={isLoading}
            />

            <button
              className={`mic-button ${isListening ? 'recording' : ''}`}
              onClick={toggleListening}
              disabled={isLoading || isSpeaking}
            >
              {isListening ? <FaStop /> : <FaMicrophone />}
            </button>

            <button
              className="send-button"
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InterviewRoom;
