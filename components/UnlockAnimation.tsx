import React from 'react';

const UnlockAnimation: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center p-4">
            <style>
                {`
                    @keyframes unlock-shake {
                        0%, 100% { transform: translateX(0); }
                        10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
                        20%, 40%, 60%, 80% { transform: translateX(3px); }
                    }
                    @keyframes shackle-open {
                        0% { transform: translateY(0) rotate(0); }
                        20% { transform: translateY(-8px) rotate(0); }
                        100% { transform: translateY(-8px) rotate(-90deg); }
                    }
                    @keyframes unlock-sparkle {
                        0% { transform: scale(0); opacity: 0; }
                        50% { opacity: 1; }
                        100% { transform: scale(1.5); opacity: 0; }
                    }
                    .lock-container { animation: unlock-shake 0.5s ease-in-out 0.2s 1; }
                    .lock-shackle { 
                        transform-origin: 25% 100%; /* bottom-left of the shackle */
                        animation: shackle-open 0.6s ease-out 0.8s forwards; 
                    }
                    .sparkle { 
                        position: absolute;
                        width: 10px;
                        height: 10px;
                        background: #fde047;
                        border-radius: 50%;
                        opacity: 0;
                        animation: unlock-sparkle 0.7s ease-in-out 1s forwards;
                    }
                `}
            </style>
            <div className="relative w-24 h-24">
                <svg viewBox="0 0 50 60" className="w-full h-full lock-container">
                    <defs>
                        <linearGradient id="lock-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#d1d5db" />
                            <stop offset="50%" stopColor="#9ca3af" />
                            <stop offset="100%" stopColor="#6b7280" />
                        </linearGradient>
                    </defs>
                    {/* Shackle */}
                    <path 
                        className="lock-shackle"
                        d="M15 30 V 15 A 10 10 0 0 1 35 15 V 30" 
                        stroke="url(#lock-grad)" 
                        strokeWidth="8" 
                        fill="none" 
                        strokeLinecap="round" 
                    />
                    {/* Body */}
                    <rect x="5" y="25" width="40" height="30" rx="5" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
                    {/* Keyhole */}
                    <circle cx="25" cy="42" r="4" fill="#4b5563" />
                    <rect x="23" y="45" width="4" height="6" fill="#4b5563" />
                </svg>
                {/* Sparkles */}
                <div className="sparkle" style={{ top: '10%', left: '15%', animationDelay: '1.1s' }}></div>
                <div className="sparkle" style={{ top: '30%', left: '80%', animationDelay: '1.2s' }}></div>
                <div className="sparkle" style={{ top: '60%', left: '5%', animationDelay: '1.3s' }}></div>
                <div className="sparkle" style={{ top: '80%', left: '70%', animationDelay: '1.15s' }}></div>
            </div>
        </div>
    );
};

export default UnlockAnimation;