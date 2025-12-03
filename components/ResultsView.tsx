import React, { useState } from 'react';
import { GeneratedResult } from '../types';
import { Copy, Check, RefreshCw, BarChart3, Film } from 'lucide-react';

interface ResultsViewProps {
  result: GeneratedResult;
  onReset: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ result, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'script'>('script');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.newScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Navigation Tabs */}
      <div className="flex bg-[#1e1e1e] p-1 rounded-xl border border-gray-800">
        <button
          onClick={() => setActiveTab('script')}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'script' 
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Film className="w-4 h-4" />
          생성된 대본
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'analysis' 
              ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          분석 리포트
        </button>
      </div>

      <div className="bg-[#1e1e1e] rounded-2xl border border-gray-800 overflow-hidden min-h-[60vh]">
        {/* Script Tab Content */}
        {activeTab === 'script' && (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#252525]">
              <h3 className="font-bold text-gray-200">New Video Script</h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors border border-gray-700"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? '복사됨' : '복사하기'}
              </button>
            </div>
            <div className="p-6 md:p-8 bg-[#121212] flex-grow">
              <article className="prose prose-invert prose-headings:text-blue-400 prose-p:text-gray-300 max-w-none whitespace-pre-wrap leading-relaxed font-medium">
                {result.newScript}
              </article>
            </div>
          </div>
        )}

        {/* Analysis Tab Content */}
        {activeTab === 'analysis' && (
          <div className="p-6 md:p-8 space-y-8 bg-gradient-to-b from-[#1e1e1e] to-[#121212] h-full">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-700">
                <h4 className="text-purple-400 font-bold mb-2 text-sm uppercase tracking-wider">Hook Strategy</h4>
                <p className="text-gray-200 leading-relaxed">{result.analysis.hookStrategy}</p>
              </div>
              <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-700">
                <h4 className="text-blue-400 font-bold mb-2 text-sm uppercase tracking-wider">Tone & Vibe</h4>
                <p className="text-gray-200 leading-relaxed">{result.analysis.tone}</p>
              </div>
            </div>

            <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-700">
              <h4 className="text-green-400 font-bold mb-4 text-sm uppercase tracking-wider">Structural Breakdown</h4>
              <div className="relative border-l-2 border-gray-700 ml-3 space-y-6 pb-2">
                {result.analysis.structureBreakdown.map((step, idx) => (
                  <div key={idx} className="relative pl-6">
                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-gray-800 border-2 border-green-500"></span>
                    <p className="text-gray-200">{step}</p>
                  </div>
                ))}
              </div>
            </div>

             <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-700">
                <h4 className="text-orange-400 font-bold mb-3 text-sm uppercase tracking-wider">Viral Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {result.analysis.keyKeywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
          </div>
        )}
      </div>

      <div className="flex justify-center pt-4 pb-12">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors px-6 py-3 rounded-full hover:bg-gray-800"
        >
          <RefreshCw className="w-4 h-4" />
          새로운 영상 만들기
        </button>
      </div>
    </div>
  );
};

export default ResultsView;