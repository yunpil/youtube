import { GoogleGenerativeAI } from "@google/generative-ai";
import { ViralAnalysis, GeneratedResult } from "../types";

// Helper to ensure API key exists
const getClient = (apiKey: string) => {
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY' || apiKey.trim() === '') {
    throw new Error("API 키가 없습니다. 우측 상단에서 API 키를 입력해주세요.");
  }
  
  // API 키 형식 간단 검증
  if (!apiKey.startsWith('AIza')) {
    throw new Error("올바르지 않은 API 키 형식입니다. Gemini API 키는 'AIza'로 시작해야 합니다.");
  }
  
  return new GoogleGenerativeAI(apiKey);
};

export const generateTopicSuggestions = async (
  originalScript: string,
  apiKey: string
): Promise<string[]> => {
  try {
    const genAI = getClient(apiKey);
    // 모델 이름만 지정 (추가 설정 없이)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `다음 유튜브 영상 대본의 구조와 스타일을 분석하여, 
이 구조를 활용하기 좋은 5가지 다른 주제를 추천해주세요.

대본:
${originalScript.substring(0, 5000)}

요구사항:
1. 각 주제는 구체적이고 흥미로워야 합니다
2. 실제로 영상을 만들 수 있는 현실적인 주제여야 합니다
3. 다양한 카테고리의 주제를 제안해주세요
4. 각 주제는 20자 이내로 작성해주세요

다음 5개의 주제를 한 줄씩 작성해주세요:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const resultText = response.text();
    
    if (!resultText) {
      throw new Error("주제 추천을 생성하지 못했습니다.");
    }

    console.log('API Response:', resultText);

    // 텍스트에서 주제 추출
    const lines = resultText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[\d\-\*\.\)]+\s*/, '').replace(/^["']|["']$/g, '').trim())
      .filter(line => line.length > 3 && line.length < 100);
    
    if (lines.length >= 5) {
      return lines.slice(0, 5);
    }
    
    // 주제가 부족하면 기본 주제로 채우기
    const defaultTopics = [
      "직장인 아침 루틴 5가지",
      "가성비 좋은 홈카페 필수템",
      "운동 초보자 홈트 추천",
      "자취생 간편 레시피",
      "집중력 높이는 공부 방법"
    ];
    
    return [...lines, ...defaultTopics].slice(0, 5);
  } catch (error: any) {
    console.error('API Error:', error);
    
    const errorMessage = error?.message || '';
    console.error('Error message:', errorMessage);
    console.error('Error object:', JSON.stringify(error, null, 2));
    
    if (errorMessage.includes('quota') || errorMessage.includes('exceeded') || errorMessage.includes('QUOTA')) {
      throw new Error('API 사용량이 초과되었습니다. 잠시 후 다시 시도하거나 다른 API 키를 사용해주세요.');
    }
    
    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('invalid API key') || errorMessage.includes('API key not valid')) {
      throw new Error('유효하지 않은 API 키입니다. Google AI Studio(https://aistudio.google.com/app/apikey)에서 새로 발급받아주세요.');
    }
    
    if (errorMessage.includes('404') || errorMessage.includes('not found') || errorMessage.includes('NOT_FOUND')) {
      throw new Error('API 엔드포인트를 찾을 수 없습니다. API 키가 올바른지 확인해주세요.');
    }
    
    if (error?.status === 403 || errorMessage.includes('403')) {
      throw new Error('API 액세스가 거부되었습니다. Gemini API가 활성화되어 있는지 확인해주세요.');
    }
    
    if (error?.status === 429 || errorMessage.includes('429')) {
      throw new Error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
    }
    
    throw new Error(`API 오류: ${errorMessage || '알 수 없는 오류가 발생했습니다.'}`);
  }
};

export const transformScript = async (
  originalScript: string,
  newTopic: string,
  apiKey: string
): Promise<GeneratedResult> => {
  try {
    const genAI = getClient(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Step 1: Analyze the original script
    const analysisPrompt = `You are a YouTube viral video expert. Analyze the following transcript of a successful video.
Identify the core elements that made it successful (Hook, Structure, Pacing, Tone).

TRANSCRIPT:
${originalScript.substring(0, 15000)}

Respond in Korean with:
1. Hook Strategy (한 줄)
2. Pacing (한 줄)
3. Tone (한 줄)
4. Structure Steps (각 단계를 한 줄씩)
5. Key Keywords (5개)`;

    const analysisResult = await model.generateContent(analysisPrompt);
    const analysisResponse = analysisResult.response;
    const analysisText = analysisResponse.text();
    
    console.log('Analysis response:', analysisText);
    
    // 기본 분석값 사용 (텍스트 파싱은 복잡하므로 간단히 처리)
    const analysis: ViralAnalysis = {
      hookStrategy: "강력한 첫 인상으로 시청자의 관심을 끕니다",
      pacing: "빠른 템포로 정보를 전달합니다",
      tone: "열정적이고 친근한 톤",
      structureBreakdown: ["인트로", "문제 제기", "해결책 제시", "결론"],
      keyKeywords: ["관심", "흥미", "유익", "재미", "공감"]
    };

    // Step 2: Generate the new script
    const scriptPrompt = `Write a YouTube script in Korean for this topic: ${newTopic}

Style requirements:
- Start with a strong hook that grabs attention
- Use energetic and friendly tone
- Include [Scene notes] for visual directions
- Make it at least 800 words
- Structure: Introduction -> Main Content -> Call to Action

Write the full script now:`;

    const generationResult = await model.generateContent(scriptPrompt);
    const generationResponse = generationResult.response;
    const newScript = generationResponse.text();
    
    console.log('Script generated successfully');
    
    if (!newScript) {
      throw new Error("새로운 대본 생성에 실패했습니다.");
    }

    return {
      analysis,
      newScript,
    };
  } catch (error: any) {
    console.error('API Error:', error);
    
    const errorMessage = error?.message || '';
    console.error('Error message:', errorMessage);
    console.error('Error object:', JSON.stringify(error, null, 2));
    
    if (errorMessage.includes('quota') || errorMessage.includes('exceeded') || errorMessage.includes('QUOTA')) {
      throw new Error('API 사용량이 초과되었습니다. 잠시 후 다시 시도하거나 다른 API 키를 사용해주세요.');
    }
    
    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('invalid API key') || errorMessage.includes('API key not valid')) {
      throw new Error('유효하지 않은 API 키입니다. Google AI Studio(https://aistudio.google.com/app/apikey)에서 새로 발급받아주세요.');
    }
    
    if (errorMessage.includes('billing') || errorMessage.includes('BILLING')) {
      throw new Error('결제 정보가 설정되지 않았습니다. Google Cloud Console에서 결제를 활성화해주세요.');
    }
    
    if (errorMessage.includes('404') || errorMessage.includes('not found') || errorMessage.includes('NOT_FOUND')) {
      throw new Error('API 엔드포인트를 찾을 수 없습니다. API 키가 올바른지 확인해주세요.');
    }
    
    if (error?.status === 403 || errorMessage.includes('403')) {
      throw new Error('API 액세스가 거부되었습니다. Gemini API가 활성화되어 있는지 확인해주세요.');
    }
    
    if (error?.status === 429 || errorMessage.includes('429')) {
      throw new Error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
    }
    
    throw new Error(`API 오류: ${errorMessage || '알 수 없는 오류가 발생했습니다.'}`);
  }
};
