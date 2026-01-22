import React, { useEffect, useRef, useState } from 'react';
import { FaVideo, FaVideoSlash } from 'react-icons/fa';
import './WebcamPreview.css';

const WebcamPreview = () => {
  const videoRef = useRef(null);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState(null);
  const [isMirrored, setIsMirrored] = useState(true);

  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        if (isActive) {
          const constraints = {
            video: {
              width: { ideal: 640 },
              height: { ideal: 360 },
              facingMode: 'user'
            }
          };
          
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setError(null);
        } else {
          if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
          }
        }
      } catch (err) {
        console.error("Camera Error:", err);
        setError("Camera access denied or not available");
        setIsActive(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive]);

  const handleToggleCamera = () => {
    setIsActive(!isActive);
  };

  const handleToggleMirror = () => {
    setIsMirrored(!isMirrored);
  };

  return (
    <div className="webcam-container">
      {isActive ? (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="webcam-video"
          style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
        />
      ) : (
        <div className="webcam-placeholder">
          <FaVideoSlash size={40} />
          <p>Camera Off</p>
        </div>
      )}

      {error && (
        <div className="webcam-error">
          <FaVideoSlash size={24} />
          <p>{error}</p>
        </div>
      )}

      <div className="webcam-overlay">
        <div className="webcam-status">
          <div className={`status-indicator ${isActive ? '' : 'off'}`} />
          <span>{isActive ? 'Live' : 'Offline'}</span>
        </div>
        <div className="webcam-controls">
          <button 
            onClick={handleToggleMirror}
            className="webcam-mirror-btn"
            title="Toggle mirror"
          >
            ⟲
          </button>
        </div>
      </div>

      <button 
        onClick={handleToggleCamera}
        className={`webcam-toggle-btn ${isActive ? 'active' : ''}`}
        title={isActive ? "Turn off camera" : "Turn on camera"}
      >
        {isActive ? <FaVideo /> : <FaVideoSlash />}
      </button>
    </div>
  );
};

export default WebcamPreview;