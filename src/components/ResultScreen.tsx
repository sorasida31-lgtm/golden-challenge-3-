import React, { useState, useEffect, useMemo } from 'react';
import type { StudentInfo, Rewards } from '../types';
import { playVictoryCelebrationSound, playUnlockSound } from '../services/soundService';
import TextToSpeech from './TextToSpeech';
import UnlockAnimation from './UnlockAnimation';

interface ResultScreenProps {
  score: number;
  totalQuestions: number;
  onPlayAgain: () => void;
  onStartNextLevel: (nextLevel: 2 | 3) => void;
  studentInfo: StudentInfo | null;
  level: 1 | 2 | 3;
  onGoToStart: () => void;
  onResetGame: () => void;
  onQuit: () => void;
  lastEarnedReward: string | null;
  rewards: Rewards;
  isGameKing: boolean;
  justUnlockedLevel: 2 | 3 | null;
  level2Unlocked: boolean;
  level3Unlocked: boolean;
  isTimedMode: boolean;
  isRetestMode: boolean;
  retestDataCount: number;
  onStartRetest: () => void;
}

const GuidingArrow: React.FC = () => (
    <div className="absolute -top-[4.5rem] left-1/2 -translate-x-1/2 w-32 animate-arrow-bounce z-10 pointer-events-none">
      <div className="relative text-center">
        <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
          이쪽으로!
        </span>
        <svg className="w-full mt-1 h-8 text-red-500 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
);

const CelebrationEffects: React.FC = () => {
  const confetti = useMemo(() => {
    const colors = ['#fde047', '#f97316', '#22c55e', '#3b82f6', '#ec4899', '#a855f7'];
    return Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      color: colors[i % colors.length],
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 3 + 4}s`,
      animationDelay: `${Math.random() * 5}s`,
      size: `${Math.random() * 0.5 + 0.4}rem`,
    }));
  }, []);

  const fireworks = useMemo(() => {
    const colors = ['#fef08a', '#f9a8d4', '#a5f3fc', '#a78bfa'];
     return Array.from({ length: 5 }).map((_, i) => ({
       id: i,
       color: colors[i % colors.length],
       left: `${10 + Math.random() * 80}%`,
       top: `${10 + Math.random() * 40}%`,
       animationDelay: `${1 + Math.random() * 2}s`,
     }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {confetti.map(c => (
        <div
          key={c.id}
          className="absolute top-0 animate-[confetti-fall_var(--duration)_var(--delay)_linear_infinite]"
          style={{
            left: c.left,
            width: c.size,
            height: c.size,
            backgroundColor: c.color,
            '--duration': c.animationDuration,
            '--delay': c.animationDelay,
          } as React.CSSProperties}
        />
      ))}
      {fireworks.map(f => (
         <div key={f.id} className="absolute w-1 h-1 rounded-full animate-[firework_1.5s_var(--delay)_ease-out_forwards]"
            style={{
                left: f.left,
                top: f.top,
                background: f.color,
                boxShadow: `0 0 5px ${f.color}, 0 0 10px ${f.color}`,
                '--delay': f.animationDelay,
            } as React.CSSProperties}
        />
      ))}
    </div>
  );
};


const GoldenHenFinale: React.FC<{ studentInfo: StudentInfo | null }> = ({ studentInfo }) => {
  const [step, setStep] = useState(0); // 0: initial, 1: cage, 2: door open, 3: hen speaks, 4: hen flies

  useEffect(() => {
    const timeouts = [
      setTimeout(() => setStep(1), 500),    // Cage appears
      setTimeout(() => setStep(2), 2000),   // Door opens
      setTimeout(() => setStep(3), 3200),   // Hen speaks
      setTimeout(() => setStep(4), 10200),  // Hen flies away (3200 + 7000ms)
    ];
    return () => timeouts.forEach(clearTimeout);
  }, []);

  const name = studentInfo?.name || 'friend';
  const thankYouText = `Thank you, ${name}!`;

  return (
    <div className="relative w-full h-80 bg-black rounded-lg overflow-hidden my-4 flex items-center justify-center p-4">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-radial from-gray-800 to-black opacity-80"></div>
      {/* Subtle stars */}
      <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-pulse delay-500"></div>
      <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-pulse delay-200"></div>
      <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse"></div>


      {/* The Cage SVG */}
      <div className={`absolute transition-all duration-1000 ease-out ${step >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          <svg width="250" height="250" viewBox="0 0 100 100">
              <defs>
                  <linearGradient id="gold-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FFFBEB" />
                      <stop offset="50%" stopColor="#FBBF24" />
                      <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                  <filter id="glow">
                      <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                      <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                  </filter>
              </defs>
              <g filter="url(#glow)" opacity="0.8">
                  {/* Base */}
                  <path d="M 15 85 Q 50 95, 85 85 L 80 90 Q 50 100, 20 90 Z" fill="url(#gold-grad)" />
                  <ellipse cx="50" cy="85" rx="35" ry="5" fill="url(#gold-grad)" />
                  
                  {/* Dome */}
                  <path d="M 50 10 C 20 10, 20 50, 20 50 V 85 H 80 V 50 C 80 50, 80 10, 50 10 Z" fill="none" stroke="url(#gold-grad)" strokeWidth="2" />
                  {/* Vertical Bars */}
                  <path d="M 30 20 V 85" stroke="url(#gold-grad)" strokeWidth="1.5" />
                  <path d="M 40 12 V 85" stroke="url(#gold-grad)" strokeWidth="1.5" />
                  <path d="M 60 12 V 85" stroke="url(#gold-grad)" strokeWidth="1.5" />
                  <path d="M 70 20 V 85" stroke="url(#gold-grad)" strokeWidth="1.5" />

                  {/* Top Ornament */}
                  <path d="M 50 10 L 50 5" stroke="url(#gold-grad)" strokeWidth="1.5" />
                  <circle cx="50" cy="4" r="3" fill="url(#gold-grad)" />
                  
                  {/* Cage Door */}
                  <g className={step >= 2 ? 'animate-open-cage-door' : ''}>
                      <path d="M 50 12 V 85" stroke="url(#gold-grad)" strokeWidth="1.5" />
                      <rect x="50" y="30" width="10" height="3" fill="url(#gold-grad)" rx="1" />
                      <rect x="50" y="60" width="10" height="3" fill="url(#gold-grad)" rx="1" />
                  </g>
              </g>
          </svg>
      </div>

      {/* The Hen SVG */}
      <div className={`absolute transition-opacity duration-500 ${step >= 2 ? 'opacity-100' : 'opacity-0'} ${step === 4 ? 'animate-hen-fly-away' : ''}`}>
           <svg width="120" height="120" viewBox="0 0 100 100">
              <g transform="translate(5, 10) scale(0.9)">
                {/* Phoenix-like Tail */}
                <path d="M50 78 C 5 100, -10 40, 25 30 C 40 50, 30 90, 50 78 Z" fill="#FDE68A" />
                <path d="M48 78 C 20 95, 5 60, 35 45 C 45 60, 35 85, 48 78 Z" fill="#FBBF24" />
                <path d="M46 78 C 30 88, 20 70, 40 55 C 45 65, 40 82, 46 78 Z" fill="#F59E0B" />
                {/* Body */}
                <circle cx="60" cy="50" r="18" fill="url(#gold-grad)" />
                {/* Head */}
                <circle cx="75" cy="35" r="12" fill="url(#gold-grad)" />
                {/* Beak */}
                <path d="M 87 35 L 95 38 L 87 41 Z" fill="#FB923C" />
                {/* Eye */}
                <circle cx="78" cy="33" r="2" fill="black" />
                {/* Crest */}
                <path d="M72 23 Q 75 18, 78 23" stroke="#F87171" strokeWidth="2" fill="none" />
                <path d="M75 23 Q 78 18, 81 23" stroke="#F87171" strokeWidth="2" fill="none" />
              </g>
           </svg>
      </div>

      {/* Speech Bubble */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-auto transition-opacity ${step === 3 ? 'animate-text-bubble-pop' : 'opacity-0'}`}>
          <div className="relative bg-white text-gray-800 font-bold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <p>{thankYouText}</p>
              <TextToSpeech text={thankYouText} />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white"></div>
       </div>
    </div>
  );
};

const KeyIcon: React.FC<{ type: 'ruby' | 'sapphire'; sizeClass: string; glowId: string }> = ({ type, sizeClass, glowId }) => {
    const hasGlow = type === 'ruby';
    const fillColor = type === 'ruby' ? '#FF1493' : '#48D1CC'; // Hot Pink, Coral Blue (Medium Turquoise)
    return (
      <div className={sizeClass}>
        <svg viewBox="0 0 64 64" className="w-full h-full">
          {hasGlow && (
            <defs>
              <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3.5" result="blur" />
                <feFlood floodColor="rgba(255, 20, 147, 0.8)" result="floodColor" />
                <feComposite in="floodColor" in2="blur" operator="in" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          )}
          <g transform="rotate(-45 32 32)" filter={hasGlow ? `url(#${glowId})` : 'none'}>
            {/* Black Outline */}
            <circle cx="32" cy="19" r="15" fill="black" />
            <rect x="28" y="32" width="8" height="30" rx="4" fill="black" />
            <rect x="18" y="46" width="14" height="8" rx="4" fill="black" />
            {/* Color Fill */}
            <circle cx="32" cy="19" r="12" fill={fillColor} />
            <rect x="30" y="34" width="4" height="26" rx="2" fill={fillColor} />
            <rect x="20" y="48" width="10" height="4" rx="2" fill={fillColor} />
            {/* Hole */}
            <circle cx="32" cy="19" r="7" fill="black" />
          </g>
        </svg>
      </div>
    );
};


const ResultScreen: React.FC<ResultScreenProps> = ({
  score,
  totalQuestions,
  onPlayAgain,
  onStartNextLevel,
  studentInfo,
  level,
  onGoToStart,
  onResetGame,
  onQuit,
  lastEarnedReward,
  rewards,
  isGameKing,
  justUnlockedLevel,
  level2Unlocked,
  level3Unlocked,
  isTimedMode,
  isRetestMode,
  retestDataCount,
  onStartRetest,
}) => {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const canPlayNextLevel = (level === 1 && level2Unlocked) || (level === 2 && level3Unlocked);
  const nextLevel = level === 1 ? 2 : 3;

  const [rubyKeyAnimation, setRubyKeyAnimation] = useState('');
  const [sapphireKeyAnimation, setSapphireKeyAnimation] = useState('');
  const [goldenKeyAnimation, setGoldenKeyAnimation] = useState('');
  const [hasPlayedVictorySound, setHasPlayedVictorySound] = useState(false);
  const [hasPlayedUnlockSound, setHasPlayedUnlockSound] = useState(false);

  useEffect(() => {
    if (lastEarnedReward?.includes('루비 열쇠')) {
      setRubyKeyAnimation('animate-reward-pop');
      setTimeout(() => setRubyKeyAnimation(''), 500);
    }
    if (lastEarnedReward?.includes('사파이어 열쇠')) {
      setSapphireKeyAnimation('animate-reward-pop');
      setTimeout(() => setSapphireKeyAnimation(''), 500);
    }
    if (lastEarnedReward?.includes('황금 열쇠')) {
      setGoldenKeyAnimation('animate-reward-pop');
      setTimeout(() => setGoldenKeyAnimation(''), 500);
    }
  }, [lastEarnedReward]);
  
  useEffect(() => {
      if (isGameKing && !hasPlayedVictorySound) {
          playVictoryCelebrationSound();
          setHasPlayedVictorySound(true);
      }
  }, [isGameKing, hasPlayedVictorySound]);
  
  useEffect(() => {
    if (justUnlockedLevel && !hasPlayedUnlockSound) {
        playUnlockSound();
        setHasPlayedUnlockSound(true);
    }
  }, [justUnlockedLevel, hasPlayedUnlockSound]);


  const showRetestButton = isTimedMode && retestDataCount > 0 && lastEarnedReward === "아이템 없음" && !isGameKing;
  
  let showArrowOn: 'next' | 'again' | 'retest' | null = null;
  if (!isGameKing) {
      if (showRetestButton) {
        showArrowOn = 'retest';
      } else if (justUnlockedLevel || (level < 3 && canPlayNextLevel)) {
        showArrowOn = 'next';
      } else {
        showArrowOn = 'again';
      }
  }

  const getResultMessage = () => {
    if (isRetestMode) {
      return percentage === 100 ? "재시험 통과! 멋져요! 👍" : "아쉽지만, 재시험에 통과하지 못했어요. 😥";
    }
    const perfectMessages = ["Great!", "Good for you!", "Superb!", "Fantastic!", "Excellent!"];
    if (percentage === 100) {
        const randomMessage = perfectMessages[Math.floor(Math.random() * perfectMessages.length)];
        return `${randomMessage} 넌 정말 최고야! 👍`;
    }
    if (percentage >= 80) return "Excellent! 아주 잘했어! 🎉";
    if (percentage >= 50) return "Good job! 잘했어! 😊";
    return "Keep trying! 조금 더 힘내자! 💪";
  };
  
  const title = studentInfo?.gender === 'male' ? 'Game King' : 'Game Queen';

  return (
    <div className="animate-fade-in text-center relative">
       {isGameKing && <CelebrationEffects />}
      <h2 className="text-3xl font-bold text-blue-800 mb-2">{isRetestMode ? "재시험 결과" : "Quiz Finished!"}</h2>
      {studentInfo && !isGameKing && (
        <p className="text-xl text-gray-700 mb-4">
          {studentInfo.grade}학년 {studentInfo.class}반 {studentInfo.name} 학생, 수고했어요!
        </p>
      )}

      {!isGameKing ? (
        <>
        <div className="bg-blue-100 p-6 rounded-lg shadow-inner mb-6">
            <p className="text-xl font-semibold text-gray-600">Your Score</p>
            <p className="text-6xl font-extrabold text-blue-600 my-2">
            {score} / {totalQuestions}
            </p>
            <p className="text-2xl font-bold text-yellow-600">{getResultMessage()}</p>
        </div>
        <div className="space-y-4 mb-6">
            {lastEarnedReward && lastEarnedReward !== "아이템 없음" && (
                <p className="text-lg font-semibold text-green-600 p-3 bg-green-100 rounded-lg">
                    짜잔! 새로 얻은 아이템: {lastEarnedReward}!
                </p>
            )}
            {justUnlockedLevel && (
                <div className="text-lg font-bold text-purple-600 p-3 bg-purple-100 rounded-lg flex flex-col items-center justify-center animate-fade-in">
                    <UnlockAnimation />
                    <p className="text-2xl mt-[-1rem]">
                        축하합니다! Level {justUnlockedLevel}, 잠금 해제!
                    </p>
                </div>
            )}
        </div>
        </>
      ) : (
        <div className="my-4">
            <h4 className="text-3xl font-bold text-orange-500 mb-2 drop-shadow-sm">
                You are the {title}! ({studentInfo?.gender === 'male' ? '게임 킹' : '게임 퀸'})
            </h4>
            <p className="mb-3 text-lg font-medium text-gray-700">You've freed the Golden Hen! (황금 닭을 구출했어요!)</p>
            <GoldenHenFinale studentInfo={studentInfo} />
        </div>
      )}


      <div className="mb-6 p-4 bg-yellow-100 border-2 border-yellow-300 rounded-lg">
          <h3 className="text-xl font-bold text-yellow-800 mb-3">나의 아이템</h3>
           <div className="flex justify-around items-center">
              <div className={`flex items-center gap-2 ${rubyKeyAnimation}`}>
                  <KeyIcon type="ruby" sizeClass="w-10 h-10" glowId="result-ruby-glow" />
                  <div className="text-left leading-tight">
                      <span className="text-sm font-semibold text-pink-600">루비</span>
                      <p className="font-bold text-lg">{rewards.rubyKeys}</p>
                  </div>
              </div>
              <div className={`flex items-center gap-2 ${sapphireKeyAnimation}`}>
                  <KeyIcon type="sapphire" sizeClass="w-10 h-10" glowId="result-sapphire-glow" />
                  <div className="text-left leading-tight">
                      <span className="text-sm font-semibold text-cyan-600">사파이어</span>
                      <p className="font-bold text-lg">{rewards.sapphireKeys}</p>
                  </div>
              </div>
              <div className={`flex items-center gap-2 ${goldenKeyAnimation}`}>
                  <span className="text-4xl" style={{ color: '#FFD700', textShadow: '0 0 8px #FCE570' }}>🔑</span>
                  <div className="text-left leading-tight">
                      <span className="text-sm font-semibold text-yellow-600">황금</span>
                      <p className="font-bold text-lg">{rewards.goldenKeys}</p>
                  </div>
              </div>
          </div>
      </div>
      
       {showRetestButton && (
           <div className="mb-6 animate-fade-in relative">
               {showArrowOn === 'retest' && <GuidingArrow />}
               <p className="text-lg font-semibold text-amber-800 mb-2">만점을 받지 못했네요. 하지만 괜찮아요!</p>
               <button onClick={onStartRetest} className="w-full max-w-md mx-auto bg-sky-500 text-white font-bold py-4 px-6 rounded-xl text-2xl hover:bg-sky-600 transition transform hover:scale-105 shadow-lg border-b-4 border-sky-700">
                   틀린 문제만 다시 풀기
               </button>
           </div>
       )}

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isGameKing || showRetestButton ? 'mt-8' : 'mt-20'}`}>
        {isGameKing ? (
            <>
                <button onClick={onResetGame} className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-blue-600 transition transform hover:scale-105 shadow-md flex flex-col justify-center h-full leading-tight">
                    <span>Start a New Game</span>
                    <span className="text-sm font-normal mt-1">(새 게임 시작하기)</span>
                </button>
                <button onClick={onQuit} className="w-full bg-stone-600 text-pink-300 font-bold py-2.5 px-4 rounded-xl text-base hover:bg-stone-700 transition transform hover:scale-105 shadow-lg border-b-4 border-stone-800 flex flex-col items-center leading-tight">
                    <span>EXIT</span>
                    <span className="text-sm">(끝내기)</span>
                </button>
            </>
        ) : (
            <>
                <div className="relative">
                    {showArrowOn === 'again' && <GuidingArrow />}
                    <button onClick={onPlayAgain} className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-green-600 transition transform hover:scale-105 shadow-md flex flex-col justify-center h-full leading-tight">
                        <span>Play Level {level} Again</span>
                        <span className="text-sm font-normal mt-1">(레벨 {level} 다시하기)</span>
                    </button>
                </div>
                {level < 3 ? (
                    <div className="relative">
                        {showArrowOn === 'next' && <GuidingArrow />}
                        <button onClick={() => onStartNextLevel(nextLevel as 2 | 3)} disabled={!canPlayNextLevel} className={`w-full text-white font-bold py-3 px-4 rounded-lg text-lg transition transform hover:scale-105 shadow-md flex flex-col justify-center h-full leading-tight ${canPlayNextLevel ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-400 cursor-not-allowed'}`}>
                            <span>Start Level {nextLevel}</span>
                            <span className="text-sm font-normal mt-1">(레벨 {nextLevel} 시작하기)</span>
                        </button>
                    </div>
                ) : (
                    <div></div> // Placeholder for grid alignment when on level 3
                )}
                <button onClick={onGoToStart} className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-blue-600 transition transform hover:scale-105 shadow-md flex flex-col justify-center h-full leading-tight">
                    <span>Back to Start</span>
                    <span className="text-sm font-normal mt-1">(처음으로)</span>
                </button>
                <button onClick={onQuit} className="w-full bg-stone-600 text-pink-300 font-bold py-2.5 px-4 rounded-xl text-base hover:bg-stone-700 transition transform hover:scale-105 shadow-lg border-b-4 border-stone-800 flex flex-col items-center leading-tight">
                    <span>EXIT</span>
                    <span className="text-sm">(끝내기)</span>
                </button>
            </>
        )}
      </div>
    </div>
  );
};

export default ResultScreen;