import React, { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import LoadingView from './components/LoadingView';
import ResultsView from './components/ResultsView';
import TopicSuggestions from './components/TopicSuggestions';
import { transformScript, generateTopicSuggestions } from './services/geminiService';
import { AppState, GeneratedResult } from './types';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [originalScript, setOriginalScript] = useState('');
  const [targetTopic, setTargetTopic] = useState('');
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');

  // Load API key from localStorage on mount
  React.useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleGenerateSuggestions = async () => {
    if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
      setErrorMsg('API 키를 먼저 입력해주세요. 우측 상단의 "API 키 입력" 버튼을 클릭하세요.');
      return;
    }

    try {
      setAppState(AppState.PROCESSING);
      setErrorMsg(null);
      
      const topics = await generateTopicSuggestions(originalScript, apiKey);
      
      setSuggestedTopics(topics);
      setAppState(AppState.TOPIC_SUGGESTIONS);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "주제 추천을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.");
      setAppState(AppState.INPUT);
    }
  };

  const handleSelectTopic = async (topic: string) => {
    setTargetTopic(topic);
    await handleSubmit(topic);
  };

  const handleSubmit = async (topic?: string) => {
    if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
      setErrorMsg('API 키를 먼저 입력해주세요. 우측 상단의 "API 키 입력" 버튼을 클릭하세요.');
      return;
    }

    try {
      setAppState(AppState.PROCESSING);
      setErrorMsg(null);
      
      const finalTopic = topic || targetTopic;
      const data = await transformScript(originalScript, finalTopic, apiKey);
      
      setResult(data);
      setAppState(AppState.RESULTS);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setAppState(AppState.INPUT);
    }
  };

  const handleReset = () => {
    setAppState(AppState.INPUT);
    setResult(null);
    setTargetTopic('');
    setSuggestedTopics([]);
  };

  const handleBackToInput = () => {
    setAppState(AppState.INPUT);
    setSuggestedTopics([]);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-blue-500/30">
      <Header apiKey={apiKey} setApiKey={setApiKey} />
      
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {appState === AppState.INPUT && (
          <>
            <div className="text-center mb-10 space-y-4">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                <span className="block text-white mb-2">벤치마킹만 하세요.</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  대본은 AI가 써드립니다.
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                떡상한 영상의 성공 공식(DNA)을 추출하여 내 주제에 딱 맞는 새로운 대본으로 재탄생시킵니다.
              </p>
            </div>
            
            <InputForm 
              originalScript={originalScript}
              setOriginalScript={setOriginalScript}
              targetTopic={targetTopic}
              setTargetTopic={setTargetTopic}
              onSubmit={handleSubmit}
              onGenerateSuggestions={handleGenerateSuggestions}
              isProcessing={false}
            />
          </>
        )}

        {appState === AppState.TOPIC_SUGGESTIONS && (
          <TopicSuggestions
            topics={suggestedTopics}
            onSelectTopic={handleSelectTopic}
            onBack={handleBackToInput}
          />
        )}

        {appState === AppState.PROCESSING && (
          <LoadingView />
        )}

        {appState === AppState.RESULTS && result && (
          <ResultsView result={result} onReset={handleReset} />
        )}
      </main>
    </div>
  );
};

export default App;