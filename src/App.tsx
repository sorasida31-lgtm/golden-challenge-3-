import React, { useState, useEffect, useCallback, useRef } from 'react';
import StartScreen from './components/StartScreen';
import QuizScreen from './components/QuizScreen';
import QuizScreenL2 from './components/QuizScreenL2';
import QuizScreenL3 from './components/QuizScreenL3';
import ResultScreen from './components/ResultScreen';
import Spinner from './components/Spinner';
import InstructionsModal from './components/InstructionsModal';
import TipsModal from './components/TipsModal';
import QuitConfirmationModal from './components/QuitConfirmationModal';
import { generateQuizData, generateLevel2QuizData, generateLevel3QuizData } from './services/geminiService';
import { playPowerDownSound, playSparkleSound, playWarningBeepSound } from './services/soundService';
import { GameState, StudentInfo, Rewards, QuizItem, QuizItemL2, QuizItemL3 } from './types';

// A custom hook to sync state with localStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error("Error reading from localStorage", error);
            return initialValue;
        }
    });

    const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error("Error writing to localStorage", error);
        }
    };

    return [storedValue, setValue];
}

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.Start);
    const [studentInfo, setStudentInfo] = useLocalStorage<StudentInfo | null>('studentInfo', null);
    const [quizData, setQuizData] = useState<Array<QuizItem | QuizItemL2 | QuizItemL3> | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState<1 | 2 | 3>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [rewards, setRewards] = useLocalStorage<Rewards>('rewards', { rubyKeys: 0, sapphireKeys: 0, goldenKeys: 0 });
    const [level2Unlocked, setLevel2Unlocked] = useLocalStorage('level2Unlocked', false);
    const [level3Unlocked, setLevel3Unlocked] = useLocalStorage('level3Unlocked', false);
    const [lastEarnedReward, setLastEarnedReward] = useState<string | null>(null);
    const [justUnlockedLevel, setJustUnlockedLevel] = useState<2 | 3 | null>(null);
    const [isGameKing, setIsGameKing] = useState(false);

    const [isRetestMode, setIsRetestMode] = useState(false);
    const [retestData, setRetestData] = useState<Array<QuizItem | QuizItemL2 | QuizItemL3>>([]);
    const [sessionIncorrectItems, setSessionIncorrectItems] = useState<Array<QuizItem | QuizItemL2 | QuizItemL3>>([]);
    
    const [challengeCount, setChallengeCount] = useLocalStorage('challengeCount', 0);
    const [successCount, setSuccessCount] = useLocalStorage('successCount', 0);
    const [gameKingCount, setGameKingCount] = useLocalStorage('gameKingCount', 0);

    const [isTimedMode, setIsTimedMode] = useLocalStorage('isTimedMode', true);
    
    const [isBookFlipped, setIsBookFlipped] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [isTipsBookFlipped, setIsTipsBookFlipped] = useState(false);
    const [showTips, setShowTips] = useState(false);
    const [showQuitConfirm, setShowQuitConfirm] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const isInitialMount = useRef(true);

    const isDemoMode = !(typeof process !== 'undefined' && process.env && process.env.API_KEY);

    // Effect to watch for changes and show save status
    useEffect(() => {
        // Skip the effect on the initial render
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // This effect will run on subsequent changes.
        setSaveStatus('saving');
        
        // Simulate async save operation
        const saveHandler = setTimeout(() => {
            setSaveStatus('saved');
            const fadeHandler = setTimeout(() => {
                setSaveStatus('idle');
            }, 2000); // Keep 'saved' message for 2 seconds
            return () => clearTimeout(fadeHandler);
        }, 500); // Pretend save takes 0.5s
        
        return () => clearTimeout(saveHandler);

    }, [studentInfo, rewards, level2Unlocked, level3Unlocked, challengeCount, successCount, isTimedMode, gameKingCount]);
    
    useEffect(() => {
        const requiredGoldenKeys = isTimedMode ? 1 : 2;
        if (rewards.goldenKeys >= requiredGoldenKeys && !isGameKing) {
            setIsGameKing(true);
            setGameKingCount(prev => prev + 1);
        }
    }, [rewards, isGameKing, isTimedMode, setGameKingCount]);


    const toggleTimedMode = useCallback(() => {
        setIsTimedMode(prev => !prev);
    }, [setIsTimedMode]);

    const handleInstructionsClick = () => {
        if (isBookFlipped) return;
        setIsBookFlipped(true);
        setTimeout(() => {
            setShowInstructions(true);
        }, 600); // Match animation duration
    };

    const handleModalClose = () => {
        setShowInstructions(false);
        // Allow modal to fade out before flipping back
        setTimeout(() => {
            setIsBookFlipped(false);
        }, 200);
    };

    const handleTipsClick = () => {
        if (isTipsBookFlipped) return;
        setIsTipsBookFlipped(true);
        setTimeout(() => {
            setShowTips(true);
        }, 600);
    };

    const handleTipsModalClose = () => {
        setShowTips(false);
        setTimeout(() => {
            setIsTipsBookFlipped(false);
        }, 200);
    };

    const startQuiz = async (selectedLevel: 1 | 2 | 3) => {
        setChallengeCount(prev => prev + 1); // Increment challenge count
        setIsLoading(true);
        setError(null);
        setGameState(GameState.Playing);
        setLevel(selectedLevel);
        setCurrentQuestionIndex(0);
        setScore(0);
        setLastEarnedReward(null);
        setJustUnlockedLevel(null);
        setSessionIncorrectItems([]); // Reset for new session
        setIsRetestMode(false); // This is not a re-test
        setRetestData([]); // Clear any previous retest data from results

        try {
            let data;
            switch (selectedLevel) {
                case 1:
                    data = await generateQuizData();
                    break;
                case 2:
                    data = await generateLevel2QuizData();
                    break;
                case 3:
                    data = await generateLevel3QuizData();
                    break;
            }
            // The geminiService functions are now guaranteed to return valid data,
            // so we can remove the check that was previously throwing an error.
            setQuizData(data);
        } catch (e: any) {
            console.error("A truly unexpected error occurred in startQuiz:", e);
            setError(e.message || "퀴즈를 불러오는 데 실패했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.");
            setGameState(GameState.Start);
        } finally {
            setIsLoading(false);
        }
    };
    
    const finishQuiz = (finalScore: number) => {
        const totalQuestions = quizData?.length || 0;
        const percentage = totalQuestions > 0 ? (finalScore / totalQuestions) * 100 : 0;
        const isPerfect = percentage === 100;
        
        let newReward = "아이템 없음";
        let newUnlock: 2 | 3 | null = null;
        let updatedRewards = { ...rewards };
    
        // Key awarding logic
        if (isTimedMode) {
            if (isPerfect) { // Perfect score in speed mode (either first try or retest)
                playSparkleSound();
                if (level === 1) { updatedRewards.rubyKeys += 1; newReward = "💖 루비 열쇠"; }
                else if (level === 2) { updatedRewards.sapphireKeys += 1; newReward = "💙 사파이어 열쇠"; }
                else if (level === 3) { updatedRewards.goldenKeys += 1; newReward = "🌟 황금 열쇠"; }
                setRetestData([]); // Clear retest data after success
            } else if (!isRetestMode) { // Failed on first try in speed mode
                setRetestData(sessionIncorrectItems);
            } else { // Failed on retest
                setRetestData([]); // Clear retest data, they have to start over
            }
        } else { // Careful Mode
            if (percentage >= 80) {
                playSparkleSound();
                if (level === 1) { updatedRewards.rubyKeys += 1; newReward = "💖 루비 열쇠"; }
                else if (level === 2) { updatedRewards.sapphireKeys += 1; newReward = "💙 사파이어 열쇠"; }
                else if (level === 3) { updatedRewards.goldenKeys += 1; newReward = "🌟 황금 열쇠"; }
            }
        }
        
        if (newReward !== "아이템 없음") {
            setSuccessCount(prev => prev + 1);
        }

        setRewards(updatedRewards);
    
        // Level unlock logic
        const requiredKeysForUnlock = isTimedMode ? 1 : 2;
        if (level === 1 && percentage >= 80 && !level2Unlocked) {
            if (updatedRewards.rubyKeys >= requiredKeysForUnlock) {
                setLevel2Unlocked(true);
                newUnlock = 2;
            }
        } else if (level === 2 && percentage >= 80 && !level3Unlocked) {
            if (updatedRewards.sapphireKeys >= requiredKeysForUnlock) {
                setLevel3Unlocked(true);
                newUnlock = 3;
            }
        }
    
        setLastEarnedReward(newReward);
        setJustUnlockedLevel(newUnlock);
        setGameState(GameState.Finished);
    };

    const handleAnswer = (isCorrect: boolean) => {
        if (isCorrect) {
            setScore(s => s + 1);
        } else {
           // Track incorrect answers for re-test mode
           if (quizData && isTimedMode && !isRetestMode) {
               setSessionIncorrectItems(prev => [...prev, quizData[currentQuestionIndex]]);
           }
        }
    };
    
    const handleNext = () => {
        const newScore = score; // The score is already updated by handleAnswer
        if (quizData && currentQuestionIndex < quizData.length - 1) {
            setCurrentQuestionIndex(i => i + 1);
        } else {
            finishQuiz(newScore);
        }
    };

    const playAgain = () => startQuiz(level);
    const startNextLevel = (nextLevel: 2 | 3) => startQuiz(nextLevel);
    
    const startRetest = () => {
        if (retestData.length === 0) return;
        setQuizData(retestData);
        setGameState(GameState.Playing);
        setCurrentQuestionIndex(0);
        setScore(0);
        setLastEarnedReward(null);
        setJustUnlockedLevel(null);
        setSessionIncorrectItems([]); // Not needed for retest itself
        setIsRetestMode(true);
    };

    const goToStart = () => {
        setQuizData(null);
        setGameState(GameState.Start);
    };
    
    const resetGame = () => {
        // Clear game-specific data from localStorage, but keep challenge/success counts
        window.localStorage.removeItem('studentInfo');
        window.localStorage.removeItem('rewards');
        window.localStorage.removeItem('level2Unlocked');
        window.localStorage.removeItem('level3Unlocked');
        
        // Reset game-specific state variables
        setStudentInfo(null);
        setRewards({ rubyKeys: 0, sapphireKeys: 0, goldenKeys: 0 });
        setLevel2Unlocked(false);
        setLevel3Unlocked(false);
        
        // Do NOT reset challengeCount, successCount, and gameKingCount
        
        setIsGameKing(false);
        setQuizData(null);
        setGameState(GameState.Start);
        setCurrentQuestionIndex(0);
        setScore(0);
        setError(null);
        setLastEarnedReward(null);
        setJustUnlockedLevel(null);
    };


    const requestQuit = () => {
        playWarningBeepSound();
        setShowQuitConfirm(true);
    };

    const cancelQuit = () => {
        setShowQuitConfirm(false);
    };

    const confirmQuit = () => {
        playPowerDownSound();
        setShowQuitConfirm(false);
        setGameState(GameState.Start);
    };
    
    const SaveStatusIndicator: React.FC = () => {
        if (saveStatus === 'idle') return null;

        return (
            <div className="absolute top-3 right-20 z-30 flex items-center gap-2 text-sm text-gray-500 bg-gray-100/80 py-1 px-3 rounded-full transition-opacity duration-300">
                {saveStatus === 'saving' && (
                    <>
                        <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>저장 중...</span>
                    </>
                )}
                {saveStatus === 'saved' && (
                    <>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-semibold text-green-700">모든 변경사항 저장됨</span>
                    </>
                )}
            </div>
        );
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <Spinner />
                    <p className="mt-4 text-2xl font-bold text-amber-800">퀴즈를 만들고 있어요... 잠시만 기다려주세요!</p>
                </div>
            );
        }

        if (error) {
            return (
                 <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="mb-4 text-2xl font-bold text-red-600">{error}</p>
                    <button onClick={goToStart} className="px-6 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600">
                        처음으로 돌아가기
                    </button>
                </div>
            );
        }

        switch (gameState) {
            case GameState.Playing:
                if (!quizData || !quizData[currentQuestionIndex]) return null;
                const currentQuizItem = quizData[currentQuestionIndex];
                switch (level) {
                    case 1:
                        return <QuizScreen 
                            quizItem={currentQuizItem as QuizItem} 
                            studentInfo={studentInfo}
                            onAnswerSelect={handleAnswer}
                            onNext={handleNext}
                            questionNumber={currentQuestionIndex + 1}
                            totalQuestions={quizData.length}
                            isTimedMode={isTimedMode}
                            isRetestMode={isRetestMode}
                            onQuitRequest={requestQuit}
                        />;
                    case 2:
                        return <QuizScreenL2 
                            quizItem={currentQuizItem as QuizItemL2} 
                            studentInfo={studentInfo}
                            onAnswerSubmit={handleAnswer}
                            onNext={handleNext}
                            questionNumber={currentQuestionIndex + 1}
                            totalQuestions={quizData.length}
                            isTimedMode={isTimedMode}
                            isRetestMode={isRetestMode}
                             onQuitRequest={requestQuit}
                        />;
                    case 3:
                        return <QuizScreenL3 
                            quizItem={currentQuizItem as QuizItemL3} 
                            studentInfo={studentInfo}
                            onAnswerSubmit={handleAnswer}
                            onNext={handleNext}
                            questionNumber={currentQuestionIndex + 1}
                            totalQuestions={quizData.length}
                            isTimedMode={isTimedMode}
                            isRetestMode={isRetestMode}
                             onQuitRequest={requestQuit}
                        />;
                    default: return null;
                }
            case GameState.Finished:
                return <ResultScreen 
                    score={score} 
                    totalQuestions={quizData?.length || 0}
                    onPlayAgain={playAgain}
                    onStartNextLevel={startNextLevel}
                    studentInfo={studentInfo}
                    level={level}
                    onGoToStart={goToStart}
                    onResetGame={resetGame}
                    onQuit={requestQuit}
                    lastEarnedReward={lastEarnedReward}
                    rewards={rewards}
                    isGameKing={isGameKing}
                    justUnlockedLevel={justUnlockedLevel}
                    level2Unlocked={level2Unlocked}
                    level3Unlocked={level3Unlocked}
                    isTimedMode={isTimedMode}
                    isRetestMode={isRetestMode}
                    retestDataCount={retestData.length}
                    onStartRetest={startRetest}
                />;
            case GameState.Start:
            default:
                return <StartScreen 
                    onStartQuiz={startQuiz}
                    studentInfo={studentInfo}
                    setStudentInfo={setStudentInfo}
                    rewards={rewards}
                    level2Unlocked={level2Unlocked}
                    level3Unlocked={level3Unlocked}
                    isTimedMode={isTimedMode}
                    toggleTimedMode={toggleTimedMode}
                    onQuitRequest={requestQuit}
                    challengeCount={challengeCount}
                    successCount={successCount}
                    gameKingCount={gameKingCount}
                    isDemoMode={isDemoMode}
                />;
        }
    };

    return (
        <div className="bg-[#a0d8f0] min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative elements for a storybook feel */}
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-green-300 rounded-full opacity-50 filter blur-sm"></div>
            <div className="absolute -bottom-10 left-10 w-40 h-40 bg-green-400 rounded-full opacity-60 filter blur-sm"></div>
            <div className="absolute top-10 right-10 w-24 h-24 bg-yellow-200 rounded-full opacity-80 filter blur-md"></div>

            <main className="w-full max-w-4xl mx-auto bg-parchment rounded-2xl shadow-2xl p-6 md:p-8 relative border-4 border-amber-800/60" style={{boxShadow: 'inset 0 0 20px rgba(120, 80, 30, 0.2)'}}>
                <div className="absolute top-3 left-3 z-30 group" style={{ perspective: '1000px' }}>
                    <div 
                        className={`relative transition-transform duration-700 ease-in-out ${isBookFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                        style={{ transformStyle: 'preserve-3d' }}
                        title="게임 설명서"
                    >
                        <button
                            onClick={handleInstructionsClick}
                            className="p-2.5 rounded-full shadow-lg bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-400/90 via-rose-300/50 to-transparent"
                            aria-label="게임 설명서 열기"
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            <span className="text-3xl">📕</span>
                        </button>
                        {/* Back face of the card */}
                        <div 
                            className="absolute inset-0 p-2.5 rounded-full shadow-lg bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-400/90 via-rose-300/50 to-transparent flex items-center justify-center"
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                             <span className="text-3xl">📖</span>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-pink-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md relative">
                                게임 시작 전 꼭 읽어보세요
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-pink-400"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="absolute top-3 right-3 z-30 group" style={{ perspective: '1000px' }}>
                    <div 
                        className={`relative transition-transform duration-700 ease-in-out ${isTipsBookFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                        style={{ transformStyle: 'preserve-3d' }}
                        title="게임왕 비법서"
                    >
                        <button
                            onClick={handleTipsClick}
                            className="p-2.5 rounded-full shadow-lg bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-400/90 via-blue-300/50 to-transparent"
                            aria-label="게임왕 비법서 열기"
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            <span className="text-3xl">📘</span>
                        </button>
                        {/* Back face of the card */}
                        <div 
                            className="absolute inset-0 p-2.5 rounded-full shadow-lg bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-400/90 via-blue-300/50 to-transparent flex items-center justify-center"
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                             <span className="text-3xl">📖</span>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-sky-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md relative">
                                문제풀이 꿀팁
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-sky-400"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <SaveStatusIndicator />

                {showInstructions && <InstructionsModal onClose={handleModalClose} isTimedMode={isTimedMode}/>}
                {showTips && <TipsModal onClose={handleTipsModalClose} />}
                {showQuitConfirm && <QuitConfirmationModal onConfirm={confirmQuit} onCancel={cancelQuit} />}
                {renderContent()}
            </main>
        </div>
    );
};

export default App;