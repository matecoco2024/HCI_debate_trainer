import React, { useState, useEffect } from 'react';

interface AnimatedCoachProps {
  isActive: boolean;
  message?: string;
  personality?: 'encouraging' | 'analytical' | 'friendly';
}

const AnimatedCoach: React.FC<AnimatedCoachProps> = ({ 
  isActive, 
  message, 
  personality = 'encouraging' 
}) => {
  const [isTalking, setIsTalking] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [currentMood, setCurrentMood] = useState<'happy' | 'thinking' | 'excited'>('happy');

  useEffect(() => {
    if (isActive && message) {
      setIsTalking(true);
      setShowMessage(true);
      setCurrentMood('excited');
      
      // Stop talking animation after message duration
      const timer = setTimeout(() => {
        setIsTalking(false);
        setCurrentMood('happy');
      }, 3000);

      // Hide message after longer duration
      const hideTimer = setTimeout(() => {
        setShowMessage(false);
      }, 5000);

      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    } else if (isActive && !message) {
      setCurrentMood('thinking');
      setIsTalking(true);
      setShowMessage(false);
    } else {
      setIsTalking(false);
      setShowMessage(false);
      setCurrentMood('happy');
    }
  }, [isActive, message]);

  const getCoachGradient = () => {
    switch (personality) {
      case 'encouraging': return 'from-green-400 to-green-600';
      case 'analytical': return 'from-blue-400 to-blue-600';
      case 'friendly': return 'from-purple-400 to-purple-600';
      default: return 'from-purple-400 to-purple-600';
    }
  };

  const getEyeExpression = () => {
    if (currentMood === 'thinking') {
      return 'animate-pulse opacity-60';
    } else if (currentMood === 'excited') {
      return 'animate-bounce';
    }
    return '';
  };

  const getMouthExpression = () => {
    if (currentMood === 'thinking') {
      return 'bg-gray-300 w-2 h-2 rounded-full';
    } else if (currentMood === 'excited') {
      return 'bg-pink-400 w-4 h-2 rounded-full animate-pulse';
    }
    return 'bg-pink-200 w-3 h-1.5 rounded-full';
  };
  return (
    <div className="relative">      {/* Coach Character */}
      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getCoachGradient()} flex items-center justify-center transition-all duration-500 shadow-lg ${
        isTalking && currentMood === 'excited' ? 'animate-coach-talk shadow-xl' : 
        isTalking && currentMood === 'thinking' ? 'animate-pulse' : 
        'animate-float hover:scale-105'
      }`}>
        
        {/* Sparkle Effects when talking */}
        {isTalking && currentMood === 'excited' && (
          <>
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-300 rounded-full animate-sparkle opacity-75"></div>
            <div className="absolute -top-2 -right-2 w-1 h-1 bg-white rounded-full animate-bounce delay-100"></div>
            <div className="absolute -bottom-1 -left-2 w-1 h-1 bg-yellow-200 rounded-full animate-sparkle delay-200"></div>
          </>
        )}

        {/* Face */}
        <div className="relative">
          {/* Eyes */}
          <div className="flex gap-1 mb-1">
            <div className={`w-2.5 h-2.5 bg-white rounded-full transition-all duration-200 ${getEyeExpression()}`}>
              <div className={`w-1.5 h-1.5 bg-gray-800 rounded-full ml-0.5 mt-0.5 transition-all duration-200 ${
                currentMood === 'thinking' ? 'animate-ping' : ''
              }`}></div>
            </div>
            <div className={`w-2.5 h-2.5 bg-white rounded-full transition-all duration-200 ${getEyeExpression()}`}>
              <div className={`w-1.5 h-1.5 bg-gray-800 rounded-full ml-0.5 mt-0.5 transition-all duration-200 ${
                currentMood === 'thinking' ? 'animate-ping' : ''
              }`}></div>
            </div>
          </div>
          
          {/* Mouth */}
          <div className={`transition-all duration-300 ${getMouthExpression()}`}></div>
          
          {/* Speech indicator when talking */}
          {isTalking && (
            <div className="absolute -top-3 -right-2">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-white rounded-full animate-bounce delay-100"></div>
                <div className="w-1 h-1 bg-white rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
        </div>
      </div>      {/* Speech Bubble */}
      {showMessage && message && (
        <div className="absolute bottom-full right-0 mb-3 z-10 animate-slide-up-fade">
          <div className="bg-white rounded-lg p-3 shadow-xl border-2 border-purple-100 max-w-xs">
            <p className="text-sm text-gray-800 font-medium leading-relaxed">{message}</p>
            {/* Speech bubble tail */}
            <div className="absolute top-full right-6 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-white"></div>
            <div className="absolute top-full right-6 w-0 h-0 border-l-[7px] border-r-[7px] border-t-[7px] border-transparent border-t-purple-100 translate-y-[1px]"></div>
          </div>
        </div>
      )}      {/* Coach Name Tag - Only show when active */}
      {(currentMood === 'thinking' || currentMood === 'excited') && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 animate-in fade-in duration-500">
          <div className="bg-white px-2 py-1 rounded-full shadow-lg border border-purple-200">
            <span className="text-xs text-purple-700 font-bold">Coach Maya</span>
            <div className="text-[10px] text-purple-500 text-center">
              {currentMood === 'thinking' ? '🤔 Analyzing...' : '✨ Coaching!'}
            </div>
          </div>
        </div>
      )}

      {/* Ambient glow when active */}
      {isActive && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-300 to-transparent opacity-20 animate-pulse scale-125 -z-10"></div>
      )}
    </div>
  );
};

export default AnimatedCoach;
