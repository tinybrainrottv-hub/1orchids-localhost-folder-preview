"use client";

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface VoiceTranscribeProps {
  onTranscript: (text: string) => void;
  apiKey: string;
}

const VoiceTranscribe: React.FC<VoiceTranscribeProps> = ({ onTranscript, apiKey }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await transcribeAudio(audioBlob);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", blob, "audio.wav");
      formData.append("model", "whisper-large-v3");
      formData.append("response_format", "json");

      const response = await fetch("https://api.sambanova.ai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.text) {
        onTranscript(data.text);
      }
    } catch (err) {
      console.error("Transcription error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggle = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <StyledWrapper>
      <div className="container-vao">
        <input 
          type="checkbox" 
          className="input-orb" 
          id="v.a.o." 
          name="v.a.o." 
          checked={isListening || isProcessing}
          onChange={handleToggle}
          style={{display: 'none'}} 
        />
        <label htmlFor="v.a.o." className="orb">
          <div className="icons">
            <svg className="svg" xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
              <g className="close">
                <path fill="currentColor" d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59L7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12L5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4" />
              </g>
              <g fill="none" className="mic">
                <rect width={8} height={13} x={8} y={2} fill="currentColor" rx={4} />
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11a7 7 0 1 0 14 0m-7 10v-2" />
              </g>
            </svg>
          </div>
          <div className="ball">
            <div className="container-lines" />
            <div className="container-rings" />
          </div>
          <svg style={{pointerEvents: 'none', position: 'absolute'}}>
            <filter id="gooey">
              <feGaussianBlur in="SourceGraphic" stdDeviation={6} />
              <feColorMatrix values="1 0 0 0 0
          0 1 0 0 0 
          0 0 1 0 0
          0 0 0 20 -10" />
            </filter>
          </svg>
        </label>
        <div className="container-chat-ia">
          <div className="container-title">
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none">
              <path d="M20.5346 6.34625L20.3501 6.7707C20.3213 6.83981 20.2727 6.89885 20.2103 6.94038C20.148 6.98191 20.0748 7.00407 19.9999 7.00407C19.925 7.00407 19.8518 6.98191 19.7895 6.94038C19.7272 6.89885 19.6785 6.83981 19.6497 6.7707L19.4652 6.34625C19.1409 5.59538 18.5469 4.99334 17.8004 4.65894L17.2312 4.40472C17.1622 4.37296 17.1037 4.32206 17.0627 4.25806C17.0217 4.19406 16.9999 4.11965 16.9999 4.04364C16.9999 3.96763 17.0217 3.89322 17.0627 3.82922C17.1037 3.76522 17.1622 3.71432 17.2312 3.68256L17.7689 3.44334C18.5341 3.09941 19.1383 2.47511 19.457 1.69904L19.6475 1.24084C19.6753 1.16987 19.7239 1.10893 19.7869 1.06598C19.8499 1.02303 19.9244 1.00006 20.0007 1.00006C20.0769 1.00006 20.1514 1.02303 20.2144 1.06598C20.2774 1.10893 20.326 1.16987 20.3539 1.24084L20.5436 1.69829C20.8619 2.47451 21.4658 3.09908 22.2309 3.44334L22.7693 3.68331C22.8382 3.71516 22.8965 3.76605 22.9373 3.82997C22.9782 3.89389 22.9999 3.96816 22.9999 4.04402C22.9999 4.11987 22.9782 4.19414 22.9373 4.25806C22.8965 4.32198 22.8382 4.37287 22.7693 4.40472L22.1994 4.65819C21.4531 4.99293 20.8594 5.59523 20.5353 6.34625" fill="currentColor" />
              <path d="M3 14V10" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
              <path d="M21 14V10" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
              <path d="M16.5 18V8" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
              <path d="M12 22V2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
              <path d="M7.5 18V6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
            <p className="text-title">
              <span>{isProcessing ? "Transcribing..." : "I'm Listening..."}</span>
            </p>
          </div>
          <div className="container-chat">
             <div className="flex items-center justify-center h-full text-xs text-white/50 px-4 text-center italic">
                {isProcessing ? "Analyzing your voice..." : "Talk to me, I'm waiting..."}
             </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  z-index: 999;

  .container-vao {
    position: relative;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .input-orb:checked ~ .container-chat-ia {
    width: 260px;
    height: 180px;
    filter: blur(0px);
    opacity: 1;
    pointer-events: all;
    transform: translate(-50%, -100%) translateY(-20px);
  }

  .input-orb:checked ~ .orb {
    filter: drop-shadow(0 0 12px rgba(145, 71, 255, 0.3))
      drop-shadow(0 0 5px rgba(255, 0, 0, 0.3));
    transform: translate(-50%, -50%) scale(1.1);

    & .icons .svg {
      opacity: 1;
      filter: drop-shadow(0 0 4px #ffffff);
    }

    &:hover {
      transform: translate(-50%, -50%) scale(1.2);

      & .icons .svg .mic {
        opacity: 0;
        transform: scale(1.1);
      }

      & .icons .svg .close {
        opacity: 1;
      }
    }
  }

  .input-orb:not(:checked) ~ .container-chat-ia {
    pointer-events: none;
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }

  .input-orb:not(:checked) ~ .orb {
    filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5))
      drop-shadow(0 0 8px rgba(145, 71, 255, 0.3));
    transform: translate(-50%, -50%);

    & .ball {
      animation: circle2 4.2s ease-in-out infinite;
    }

    &:hover {
      transform: translate(-50%, -50%) scale(1.1);
    }
  }

  @keyframes circle2 {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  .container-chat-ia {
    position: absolute;
    left: 50%;
    top: 0;
    opacity: 0;
    filter: blur(20px);
    display: flex;
    flex-direction: column;
    background: rgba(10, 15, 26, 0.95);
    backdrop-blur: 20px;
    padding: 0.75rem;
    border-radius: 1.5rem;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(59, 130, 246, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    gap: 8px;
    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.1);
    z-index: 1000;
  }

  .container-title {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    gap: 8px;

    & svg {
      color: #ff0002;
      animation: animation-color-svg 4s infinite both;
    }

    & .text-title {
      font-size: 13px;
      font-weight: 600;
      background-image: linear-gradient(to left, #ff0002, #3b82f6, #ff0002);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      background-size: 400px;
      animation: animation-color-text 4s infinite linear;
    }
  }

  @keyframes animation-color-svg {
    0%, 100% { color: #ff0002; }
    50% { color: #3b82f6; }
  }

  @keyframes animation-color-text {
    0% { background-position: -400px; }
    100% { background-position: 400px; }
  }

  .container-chat {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 1rem;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .orb {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 44px;
    height: 44px;
    display: flex;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    cursor: pointer;
    z-index: 9999;

    & .icons .svg .close { opacity: 0; }
  }

  .icons {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #ffffff;
    display: flex;
    z-index: 999;
    & .svg {
      width: 20px;
      height: 20px;
      opacity: 0.9;
    }
  }

  .ball {
    display: flex;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #ff0002;
    filter: url(#gooey);
  }

  .container-lines {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 60px;
    background-image: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
    animation: animation-ball 10s infinite ease;
    pointer-events: none;
    opacity: 0.5;
  }

  @keyframes animation-ball {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.5); }
  }

  .container-rings {
    position: absolute;
    inset: -5px;
    border-radius: 50%;
    perspective: 100px;

    &:before, &:after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 2px solid transparent;
      mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
      background: linear-gradient(45deg, #ff0002, #3b82f6) border-box;
      mask-composite: exclude;
    }
    
    &:before { animation: ring180 5s linear infinite; }
    &:after { animation: ring90 5s linear infinite; }
  }

  @keyframes ring180 {
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(360deg); }
  }
  @keyframes ring90 {
    0% { transform: rotateX(0deg); }
    100% { transform: rotateX(360deg); }
  }
`;

export default VoiceTranscribe;
