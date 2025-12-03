import React, { useEffect, useState } from 'react';
import { LOADING_MESSAGES } from '../types';
import { Sparkles } from 'lucide-react';

const LoadingView: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8 animate-fade-in">
      <div className="relative">
        <div className="w-24 h-24 border-4 border-gray-800 rounded-full"></div>
        <div className="absolute top-0 left-0 w-24 h-24 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
        <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white w-8 h-8 animate-pulse" />
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          AI 분석 중...
        </h3>
        <p className="text-gray-400 text-lg min-h-[2rem] transition-opacity duration-300">
          {LOADING_MESSAGES[msgIndex]}
        </p>
      </div>
    </div>
  );
};

export default LoadingView;