import React from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';

interface TopicSuggestionsProps {
  topics: string[];
  onSelectTopic: (topic: string) => void;
  onBack: () => void;
}

const TopicSuggestions: React.FC<TopicSuggestionsProps> = ({
  topics,
  onSelectTopic,
  onBack,
}) => {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        돌아가기
      </button>

      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-yellow-400" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            추천 주제
          </h2>
          <Sparkles className="w-8 h-8 text-yellow-400" />
        </div>
        <p className="text-gray-400 text-lg">
          분석한 대본 구조에 어울리는 5가지 주제를 추천드립니다.
          <br />
          원하는 주제를 선택하거나, 직접 입력하세요.
        </p>
      </div>

      <div className="grid gap-4 mt-8">
        {topics.map((topic, index) => (
          <button
            key={index}
            onClick={() => onSelectTopic(topic)}
            className="bg-[#1e1e1e] hover:bg-[#252525] border border-gray-800 hover:border-blue-600 rounded-xl p-6 text-left transition-all transform hover:scale-[1.02] active:scale-[0.98] group"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                  {topic}
                </h3>
              </div>
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-blue-400 text-sm font-bold">선택 →</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="pt-4 text-center">
        <p className="text-gray-500 text-sm">
          💡 마음에 드는 주제가 없으신가요? 돌아가서 직접 입력해보세요.
        </p>
      </div>
    </div>
  );
};

export default TopicSuggestions;
