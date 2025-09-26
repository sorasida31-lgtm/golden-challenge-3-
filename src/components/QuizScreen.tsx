import React, { useState, useEffect } from 'react';
import type { QuizItem, StudentInfo } from '../types';
import TextToSpeech from './TextToSpeech';
import Timer from './Timer';
import { playCorrectSound, playIncorrectSound } from '../services/soundService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const XIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const RightArrowIcon: React.FC = () => (
    <svg className="h-6 w-6 ml-2" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M12 4l8 8-8 8-1.41-1.41L16.17 13H4v-2h12.17l-5.58-5.59L12 4z" clipRule="evenodd" />
    </svg>
);

const MicrophoneIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zm0 12a1 1 0 0 1-1-1V4a1 1 0 0 1 2 0v8a1 1 0 0 1-1 1z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V24h2v-3.06A9 9 0 0 0 21 12v-2z"/>
  </svg>
);

const QUIZ_DURATION = 25;

interface QuizScreenProps {
  quizItem: QuizItem;
  studentInfo: StudentInfo | null;
  onAnswerSelect: (isCorrect: boolean) => void;
  onNext: () => void;
  questionNumber: number;
  totalQuestions: number;
  isTimedMode: boolean;
  isRetestMode: boolean;
  onQuitRequest: () => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ quizItem, studentInfo, onAnswerSelect, onNext, questionNumber, totalQuestions, isTimedMode, isRetestMode, onQuitRequest }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
  const [temporaryMessage, setTemporaryMessage] = useState<string | null>(null);
  
  const {
    transcript,
    startListening,
    isListening,
    error: speechError,
    hasRecognitionSupport,
  } = useSpeechRecognition();

  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setFeedbackMessage(null);
    setTimeLeft(QUIZ_DURATION);
    setTemporaryMessage(null);
  }, [quizItem]);
  
  useEffect(() => {
    if (transcript && !isAnswered) {
      const normalize = (text: string) => text.toLowerCase().replace(/[.,?!]/g, '').trim();
      const normalizedTranscript = normalize(transcript);

      const matchedOption = quizItem.options.find(opt => normalize(opt) === normalizedTranscript);
      
      if (matchedOption) {
        handleOptionClick(matchedOption);
      } else {
        setTemporaryMessage(`'${transcript}'(이)라는 답변을 찾을 수 없어요.`);
        setTimeout(() => setTemporaryMessage(null), 2000); // Clear message after 2 seconds
      }
    }
  }, [transcript]);

  // Timer effect
  useEffect(() => {
    if (!isTimedMode || isAnswered || isRetestMode) return;

    if (timeLeft === 0) {
      handleOptionClick(''); // This will count as incorrect
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [isTimedMode, isAnswered, timeLeft, isRetestMode]);

  useEffect(() => {
    const handleEnter = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && isAnswered) {
        onNext();
      }
    };
    window.addEventListener('keydown', handleEnter);
    return () => {
      window.removeEventListener('keydown', handleEnter);
    };
  }, [isAnswered, onNext]);

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;

    const isCorrect = option === quizItem.correctAnswer;
    if (isCorrect) {
      playCorrectSound();
    } else {
      playIncorrectSound();
    }
    
    if (studentInfo) {
      const name = studentInfo.name;
      if (timeLeft === 0 && !isRetestMode) {
         setFeedbackMessage(`시간 초과, ${name}!`);
      } else if (isCorrect) {
        const messages = [`잘했어, ${name}!`, `오~ ${name}! 대단한데.`, `아니, ${name}! 이걸 맞히다니!`, `${name}, 혹시 천재?`, `정답이야, ${name}! 똑똑하구나.`, `완벽해, ${name}!`];
        setFeedbackMessage(messages[Math.floor(Math.random() * messages.length)]);
      } else {
        const messages = [`아깝다, ${name}!`, `괜찮아, ${name}. 다음엔 맞힐 수 있어.`, `힘내, ${name}!`];
        setFeedbackMessage(messages[Math.floor(Math.random() * messages.length)]);
      }
    }

    setSelectedAnswer(option);
    setIsAnswered(true);
    onAnswerSelect(isCorrect);
  };

  const getButtonClass = (option: string) => {
    if (!isAnswered) {
      return 'bg-white hover:bg-blue-100 text-blue-800';
    }
    // After answering:
    if (option === quizItem.correctAnswer) {
      // Always show the correct answer in green and animate
      return 'bg-green-500 text-white ring-4 ring-green-300 animate-correct-answer-pop';
    }
    if (option === selectedAnswer) {
      // If it's the selected answer and not the correct one, show red and shake
      return 'bg-red-500 text-white opacity-90 animate-shake-horizontal';
    }
    // Other non-selected, non-correct options
    return 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-70';
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div className="flex-grow">
            <p className="text-lg font-semibold text-gray-500 text-left">
             {isRetestMode ? `틀린 문제 다시 풀기 (${questionNumber}/${totalQuestions})` : `Question ${questionNumber} / ${totalQuestions}`}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2.5 rounded-full" style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}></div>
            </div>
        </div>
        <div className="flex items-center ml-4">
            {isTimedMode && !isRetestMode && <Timer timeLeft={timeLeft} duration={QUIZ_DURATION} />}
            <button 
                onClick={onQuitRequest} 
                className="ml-4 bg-stone-600 text-pink-300 font-bold py-2.5 px-4 rounded-xl text-base hover:bg-stone-700 transition transform hover:scale-105 shadow-lg border-b-4 border-stone-800 flex flex-col items-center leading-tight"
            >
                <span>EXIT</span>
                <span>끝내기</span>
            </button>
        </div>
      </div>

      <div className="p-4 bg-blue-100 rounded-lg mb-8">
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                {quizItem.question}
            </h2>
            <TextToSpeech text={quizItem.question} />
             {hasRecognitionSupport && !isAnswered && (
              <button
                onClick={() => startListening()}
                disabled={isListening}
                className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/80 hover:bg-white text-blue-600'}`}
                title="음성으로 답변하기"
              >
                <MicrophoneIcon />
              </button>
            )}
          </div>
          <p className="text-md text-gray-500 mt-1">{quizItem.question_kr}</p>
          <div className="h-6 mt-2">
            {isListening && <p className="text-blue-600 font-semibold animate-pulse">듣고 있어요...</p>}
            {speechError && <p className="text-red-500 font-semibold">{speechError}</p>}
            {temporaryMessage && <p className="text-orange-500 font-semibold">{temporaryMessage}</p>}
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizItem.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(option)}
            disabled={isAnswered}
            className={`flex items-center justify-between w-full p-4 font-semibold rounded-lg shadow-md transition-all duration-300 transform ${!isAnswered ? 'hover:scale-105' : ''} ${getButtonClass(option)}`}
          >
            <span className="flex-grow text-left">{option}</span>
            <div className="flex items-center gap-2">
                <TextToSpeech text={option} />
                {isAnswered && option === quizItem.correctAnswer && <CheckIcon />}
                {isAnswered && option === selectedAnswer && option !== quizItem.correctAnswer && <XIcon />}
            </div>
          </button>
        ))}
      </div>

      {isAnswered && (
        <div className="mt-8 text-center animate-fade-in">
          {feedbackMessage && (
            <div className="relative mb-6 flex justify-center">
                <div className={`text-white font-bold rounded-lg px-4 py-2 shadow-md text-lg ${(selectedAnswer === quizItem.correctAnswer) ? 'bg-sky-400' : 'bg-orange-400'}`}>
                    {feedbackMessage}
                </div>
                <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 ${(selectedAnswer === quizItem.correctAnswer) ? 'border-t-sky-400' : 'border-t-orange-400'}`}></div>
            </div>
          )}
          <button
            onClick={onNext}
            className="px-8 py-3 bg-yellow-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-yellow-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-yellow-300 inline-flex items-center justify-center"
          >
            <span>{questionNumber === totalQuestions ? 'Finish Quiz' : 'Next Question'}</span>
            <span className="text-white"><RightArrowIcon/></span>
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizScreen;