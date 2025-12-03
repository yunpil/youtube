import React from 'react';
import { Sparkles, Youtube } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="border-b border-gray-800 bg-[#0f0f0f] sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-red-600 to-red-800 p-2 rounded-lg">
            <Youtube className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              ViralCopy
            </h1>
            <p className="text-xs text-gray-500 font-medium tracking-wider">떡상 대본 제조기</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-900 px-3 py-1.5 rounded-full border border-gray-800">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <span>Powered by Gemini 2.5</span>
        </div>
      </div>
    </header>
  );
};

export default Header;