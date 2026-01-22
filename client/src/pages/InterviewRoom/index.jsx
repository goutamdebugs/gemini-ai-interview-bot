import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaUser, FaMicrophone, FaPaperPlane, FaStop, FaPlay, FaPause, FaRedo } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import { chatAPI } from '../../api'; 
import useSpeechToText from '../../hooks/useSpeechToText';
import useTextToSpeech from '../../hooks/useTextToSpeech';
import './InterviewRoom.css';

//web cam-----------------------------
import WebcamPreview from '../../components/WebcamPreview';

const InterviewRoom = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('sessionId') || `session_${Date.now()}`);
  
  const chatWindowRef = useRef(null);
  const { isListening, transcript, toggleListening } = useSpeechToText();
  const { isSpeaking, speak, stopSpeaking, pauseSpeaking, resumeSpeaking } = useTextToSpeech();

  // voice handeling 
  useEffect(() => {
    if (transcript) {
      setInputMessage(transcript);
    }
  }, [transcript]);

  // store session id
  useEffect(() => {
    localStorage.setItem('sessionId', sessionId);
  }, [sessionId]);

  // auto scrolll
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTo({
        top: chatWindowRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isLoading]);

  //  (Text to Speech)
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.sender === 'ai' && !lastMessage.spoken) {
      speak(lastMessage.text);
      setMessages(prev => prev.map(msg => 
        msg.id === lastMessage.id ? { ...msg, spoken: true } : msg
      ));
    }
  }, [messages, speak]);

  // 
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    //
    const userMessage = {
      id: Date.now(),
      text: userText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    // add present meassage in state
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      
      const historyPayload = messages
        .filter((msg, index) => {
           
           if (index === 0 && msg.sender === 'ai') return false;
           return true;
        })
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

      // api call
      const response = await chatAPI.sendMessage({
        message: userText,
        sessionId: sessionId,
        history: historyPayload
      });

      // handeling responce
      if (response.success) {
        const aiText = response.data.response;

        const aiMessage = {
          id: Date.now() + 1,
          text: aiText,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          spoken: false,
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("Chat Error details:", error);
    
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

  const handleStartInterview = () => {
    const welcomeMessage = {
      id: Date.now(),
      text: "Hello! I am an AI agent developed by Goutam. I am a powerful interviewer here to assess your technical knowledge. Please provide or tell me your skills to start the interview.",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      spoken: false,
    };
    setMessages([welcomeMessage]);
    
    // start new session
    const newSession = `session_${Date.now()}`;
    setSessionId(newSession);
  };

  const handleResetInterview = () => {
    setMessages([]);
    stopSpeaking();
    setInputMessage('');
    const newSession = `session_${Date.now()}`;
    setSessionId(newSession);
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
     {/* web cam */}
      <div style={{ width: '300px', flexShrink: 0 }}>
          <WebcamPreview />
        </div>
      <div className="chat-container">
        <div className="chat-window" ref={chatWindowRef}>
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="empty-state"
              >
                <div className="icon-wrapper">
                  <FaRobot size={50} />
                </div>
                <h3>Ready to Start?</h3>
                <p>Click "Start Interview" to begin.</p>
                <button className="start-btn-primary" onClick={handleStartInterview}>
                  Start Interview
                </button>
              </motion.div>
            ) : (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`message ${message.sender}`}
                >
                  <div className="message-avatar">
                    {message.sender === 'user' ? <FaUser /> : <FaRobot />}
                  </div>
                  <div className="message-content">
                    <div className="message-bubble">
                      {message.sender === 'ai' ? (
                        <p className="typewriter">{message.text}</p>
                      ) : (
                        <p>{message.text}</p>
                      )}
                    </div>
                    <span className="message-timestamp">{message.timestamp}</span>
                  </div>
                </motion.div>
              ))
            )}
            
            {/* Loading Animation */}
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="message ai">
                 <div className="message-avatar"><FaRobot /></div>
                 <div className="message-content">
                    <div className="message-bubble loading-bubble">
                      <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input & Controls */}
        <div className="bottom-area">
            <div className="controls-bar">
               {isSpeaking && (
                 <>
                   <button onClick={pauseSpeaking} title="Pause"><FaPause /></button>
                   <button onClick={resumeSpeaking} title="Resume"><FaPlay /></button>
                   <button onClick={stopSpeaking} title="Stop"><FaStop /></button>
                 </>
               )}
               <button onClick={handleResetInterview} className="reset-btn" title="Reset Chat"><FaRedo /></button>
            </div>

            <div className="input-area">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your answer..."
                disabled={isLoading}
              />
              
              <button
                className={`mic-button ${isListening ? 'recording' : ''}`}
                onClick={toggleListening}
                disabled={isLoading}
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