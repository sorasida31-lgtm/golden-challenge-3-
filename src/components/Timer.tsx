import React from 'react';

interface TimerProps {
  timeLeft: number;
  duration: number;
}

const Timer: React.FC<TimerProps> = ({ timeLeft, duration }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / duration;
  const strokeDashoffset = circumference * (1 - progress);

  const getTimeColor = () => {
    if (progress > 0.5) return 'stroke-green-500 text-green-600';
    if (progress > 0.2) return 'stroke-yellow-500 text-yellow-600';
    return 'stroke-red-500 text-red-600 animate-pulse';
  };

  const colorClasses = getTimeColor();

  return (
    <div className="relative h-20 w-20">
      <svg className="h-full w-full" viewBox="0 0 70 70">
        <circle
          className="stroke-gray-300"
          strokeWidth="5"
          fill="transparent"
          r={radius}
          cx="35"
          cy="35"
        />
        <circle
          className={`transition-all duration-1000 ease-linear ${colorClasses}`}
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="35"
          cy="35"
          transform="rotate(-90 35 35)"
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-2xl font-bold ${colorClasses}`}>
        {timeLeft}
      </span>
    </div>
  );
};

export default Timer;