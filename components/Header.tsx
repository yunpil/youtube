import React, { useState, useEffect } from 'react';
import { Sparkles, Youtube, Key, Check } from 'lucide-react';

interface HeaderProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

const Header: React.FC<HeaderProps> = ({ apiKey, setApiKey }) => {
  const [showApiInput, setShowApiInput] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  useEffect(() => {
    setTempApiKey(apiKey);
  }, [apiKey]);

  const handleSaveApiKey = () => {
    setApiKey(tempApiKey);
    localStorage.setItem('gemini_api_key', tempApiKey);
    setShowApiInput(false);
  };

  const hasApiKey = apiKey && apiKey !== 'PLACEHOLDER_API_KEY';

  return (
    <>
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
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowApiInput(!showApiInput)}
              className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border transition-all ${
                hasApiKey
                  ? 'bg-green-900/20 border-green-800 text-green-400 hover:bg-green-900/30'
                  : 'bg-red-900/20 border-red-800 text-red-400 hover:bg-red-900/30'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>{hasApiKey ? 'API 키 설정됨' : 'API 키 입력'}</span>
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-900 px-3 py-1.5 rounded-full border border-gray-800">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span>Powered by Gemini 1.5</span>
            </div>
          </div>
        </div>
      </header>

      {/* API Key Input Modal */}
      {showApiInput && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] rounded-2xl border border-gray-800 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Gemini API 키 설정</h3>
                <p className="text-sm text-gray-400">Google AI Studio에서 발급받은 API 키를 입력하세요</p>
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#121212] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500">
                API 키는 브라우저에만 저장되며 외부로 전송되지 않습니다.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApiInput(false)}
                className="flex-1 py-3 rounded-xl font-bold bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveApiKey}
                disabled={!tempApiKey || tempApiKey.length < 10}
                className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                저장
              </button>
            </div>

            <div className="pt-2 border-t border-gray-800">
              <p className="text-xs text-gray-500 text-center">
                API 키가 없으신가요?{' '}
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  여기서 무료로 발급받기
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;