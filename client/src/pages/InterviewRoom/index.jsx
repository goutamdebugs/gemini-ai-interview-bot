import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaUser, FaMicrophone, FaPaperPlane, FaStop, FaPlay, FaPause, FaRedo } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useSpeechToText from '../../hooks/useSpeechToText';
import useTextToSpeech from '../../hooks/useTextToSpeech';
import { chatAPI } from '../../api';
import './InterviewRoom.css';

const InterviewRoom = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('sessionId') || Date.now().toString());
  const chatWindowRef = useRef(null);

  const { isListening, transcript, startListening, stopListening, toggleListening } = useSpeechToText((text) => {
    setInputMessage(text);
  });

  const { isSpeaking, speak, stopSpeaking, pauseSpeaking, resumeSpeaking } = useTextToSpeech();

  // Save sessionId to localStorage
  useEffect(() => {
    localStorage.setItem('sessionId', sessionId);
  }, [sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-speak AI responses
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.sender === 'ai' && !lastMessage.spoken) {
      speak(lastMessage.text);
      setMessages(prev => prev.map(msg => 
        msg.id === lastMessage.id ? { ...msg, spoken: true } : msg
      ));
    }
  }, [messages, speak]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage({
        message: inputMessage,
        sessionId,
        history: messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        spoken: false,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartInterview = async () => {
    const welcomeMessage = {
      id: Date.now(),
      text: "Hello! I'm your AI Interviewer. I'll be asking you technical questions and evaluating your responses. Let's start with a warm-up question: What's your experience with React and its core concepts?",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      spoken: false,
    };
    
    setMessages([welcomeMessage]);
    setSessionId(Date.now().toString());
  };

  const handleResetInterview = () => {
    setMessages([]);
    setSessionId(Date.now().toString());
    stopSpeaking();
  };

  return (
    <motion.div 
      className="interview-room"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ToastContainer theme={document.documentElement.getAttribute('data-theme') || 'light'} />
      
      <div className="room-header">
        <h1>AI Technical Interview</h1>
        <p>Practice your technical interview skills with our AI interviewer</p>
      </div>

      <div className="chat-container">
        <div className="chat-window" ref={chatWindowRef}>
          <AnimatePresence>
            <div className="messages-container">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="empty-state"
                  style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}
                >
                  <FaRobot size={64} style={{ marginBottom: '20px', opacity: 0.5 }} />
                  <h3 style={{ marginBottom: '10px' }}>No messages yet</h3>
                  <p>Start your interview by clicking the microphone or typing your first response</p>
                </motion.div>
              ) : (
                messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`message ${message.sender}`}
                  >
                    <div className="message-avatar">
                      {message.sender === 'user' ? <FaUser /> : <FaRobot />}
                    </div>
                    <div className="message-content">
                      <div className="message-bubble">
                        {message.sender === 'ai' ? (
                          <div className="typewriter">
                            {message.text}
                          </div>
                        ) : (
                          message.text
                        )}
                      </div>
                      <div className="message-timestamp">{message.timestamp}</div>
                    </div>
                  </motion.div>
                ))
              )}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="message ai"
                >
                  <div className="message-avatar">
                    <FaRobot />
                  </div>
                  <div className="message-content">
                    <div className="message-bubble">
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 0.6 }}
                          style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%' }}
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                          style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%' }}
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                          style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%' }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </AnimatePresence>
        </div>

        <div className="input-area">
          <textarea
            className="message-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer here or use the microphone..."
            rows="2"
            disabled={isLoading}
          />
          
          <button
            className={`mic-button ${isListening ? 'recording' : ''}`}
            onClick={toggleListening}
            disabled={isLoading}
          >
            <FaMicrophone />
            {isListening && <div className="pulse-ring" />}
          </button>
          
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
          >
            <FaPaperPlane />
          </button>
        </div>

        <div className="controls">
          <button className="control-button" onClick={handleStartInterview}>
            <FaPlay /> Start Interview
          </button>
          
          {isSpeaking ? (
            <>
              <button className="control-button" onClick={pauseSpeaking}>
                <FaPause /> Pause
              </button>
              <button className="control-button" onClick={stopSpeaking}>
                <FaStop /> Stop
              </button>
              <button className="control-button" onClick={resumeSpeaking}>
                <FaPlay /> Resume
              </button>
            </>
          ) : null}
          
          <button className="control-button" onClick={handleResetInterview}>
            <FaRedo /> Reset
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default InterviewRoom;