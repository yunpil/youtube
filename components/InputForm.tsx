import React from 'react';
import { ArrowRight, Wand2, FileText, Type } from 'lucide-react';

interface InputFormProps {
  originalScript: string;
  setOriginalScript: (val: string) => void;
  targetTopic: string;
  setTargetTopic: (val: string) => void;
  onSubmit: () => void;
  onGenerateSuggestions: () => void;
  isProcessing: boolean;
}

const InputForm: React.FC<InputFormProps> = ({
  originalScript,
  setOriginalScript,
  targetTopic,
  setTargetTopic,
  onSubmit,
  onGenerateSuggestions,
  isProcessing
}) => {
  const isScriptReady = originalScript.length > 50;
  const isFullyReady = isScriptReady && targetTopic.length > 2;

  return (
    <div className="grid gap-8 animate-fade-in">
      <div className="bg-[#1e1e1e] rounded-2xl p-1 border border-gray-800 shadow-2xl">
        <div className="p-6 md:p-8 space-y-6">
          
          {/* Section 1: Original Script */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-400">
              <FileText className="w-5 h-5" />
              <label className="font-bold text-lg">벤치마킹할 대본 (떡상 영상)</label>
            </div>
            <p className="text-gray-400 text-sm">
              유튜브 자막을 복사해서 붙여넣으세요. 이 영상의 구조와 호흡을 분석합니다.
            </p>
            <textarea
              className="w-full h-48 bg-[#121212] border border-gray-700 rounded-xl p-4 text-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all resize-none text-sm leading-relaxed"
              placeholder="예: 여러분, 이 영상 안 보시면 평생 후회합니다. 오늘 소개해드릴 것은 바로..."
              value={originalScript}
              onChange={(e) => setOriginalScript(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          <div className="flex justify-center">
            <div className="bg-gray-800 rounded-full p-2">
              <ArrowRight className="w-5 h-5 text-gray-500 transform rotate-90" />
            </div>
          </div>

          {/* Section 2: New Topic */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-purple-400">
              <Type className="w-5 h-5" />
              <label className="font-bold text-lg">새로운 주제</label>
            </div>
            <p className="text-gray-400 text-sm">
              위 구조를 적용해서 어떤 주제의 영상을 만들고 싶으신가요?
            </p>
            <input
              type="text"
              className="w-full bg-[#121212] border border-gray-700 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
              placeholder="예: 자취생이 꼭 사야 할 다이소 꿀템 5가지"
              value={targetTopic}
              onChange={(e) => setTargetTopic(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 space-y-3">
            {/* AI 주제 추천 버튼 */}
            <button
              onClick={onGenerateSuggestions}
              disabled={!isScriptReady || isProcessing}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                isScriptReady && !isProcessing
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-blue-500/25 cursor-pointer'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>주제 추천 생성 중...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>마법의 대본 생성하기 (AI 주제 추천)</span>
                </>
              )}
            </button>

            {/* 또는 구분선 */}
            {isScriptReady && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-700"></div>
                <span className="text-gray-500 text-sm">또는</span>
                <div className="flex-1 h-px bg-gray-700"></div>
              </div>
            )}

            {/* 직접 입력하여 생성 버튼 */}
            {isScriptReady && (
              <button
                onClick={() => onSubmit()}
                disabled={!isFullyReady || isProcessing}
                className={`w-full py-3 rounded-xl font-bold text-base shadow-lg flex items-center justify-center gap-3 transition-all ${
                  isFullyReady && !isProcessing
                    ? 'bg-gray-700 text-white hover:bg-gray-600 cursor-pointer'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>직접 입력한 주제로 생성하기</span>
              </button>
            )}

            {!isScriptReady && (
              <p className="text-center text-xs text-gray-600 mt-3">
                * 대본 내용을 충분히 입력해주세요.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputForm;