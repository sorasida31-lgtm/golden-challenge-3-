import React from 'react';
import { getMuteState } from '../services/soundService';

interface TextToSpeechProps {
  text: string;
  colorClass?: string;
}

const SpeakerIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);

const TextToSpeech: React.FC<TextToSpeechProps> = ({ text, colorClass = "text-blue-500 hover:text-blue-700" }) => {
  const handleSpeak = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation(); // Prevents any parent onClick events from firing
    if (getMuteState()) return;

    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech before starting a new one
      window.speechSynthesis.cancel();
      
      // FIX: Corrected typo from SpeechSynthesisUtterterance to SpeechSynthesisUtterance.
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // Set language for correct pronunciation
      utterance.rate = 0.9; // Slightly slower for clarity
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Sorry, your browser does not support text-to-speech.');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSpeak(event);
    }
  };

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleSpeak}
      onKeyDown={handleKeyDown}
      className={`${colorClass} transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-full p-1 inline-flex items-center justify-center align-middle cursor-pointer`}
      aria-label="Listen to the text"
      title="Listen"
    >
      <SpeakerIcon />
    </span>
  );
};

export default TextToSpeech;