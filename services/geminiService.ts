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
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
    });

    const prompt = `다음 유튜브 영상 대본의 구조와 스타일을 분석하여, 
이 구조를 활용하기 좋은 5가지 다른 주제를 추천해주세요.

대본:
${originalScript.substring(0, 5000)}

요구사항:
1. 각 주제는 구체적이고 흥미로워야 합니다
2. 실제로 영상을 만들 수 있는 현실적인 주제여야 합니다
3. 다양한 카테고리의 주제를 제안해주세요
4. 각 주제는 20자 이내로 작성해주세요
5. JSON 형식으로 응답: {"topics": ["주제1", "주제2", "주제3", "주제4", "주제5"]}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const resultText = response.text();
    
    if (!resultText) {
      throw new Error("주제 추천을 생성하지 못했습니다.");
    }

    console.log('API Response:', resultText);

    // JSON 파싱 시도
    try {
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.topics && Array.isArray(parsed.topics)) {
          return parsed.topics;
        }
      }
    } catch (e) {
      console.log('JSON parsing failed, trying text extraction');
    }
    
    // JSON 파싱 실패 시 텍스트에서 주제 추출
    const lines = resultText.split('\n')
      .filter(line => line.trim() && !line.includes('{') && !line.includes('}') && !line.includes('topics'))
      .map(line => line.replace(/^[\d\-\*\.\)]+\s*/, '').replace(/^["']|["']$/g, '').replace(/,$/, '').trim())
      .filter(line => line.length > 3 && line.length < 50);
    
    if (lines.length >= 5) {
      return lines.slice(0, 5);
    }
    
    // 모두 실패하면 기본 주제 반환
    return [
      "직장인 아침 루틴 5가지",
      "가성비 좋은 홈카페 필수템",
      "운동 초보자 홈트 추천",
      "자취생 간편 레시피",
      "집중력 높이는 공부 방법"
    ];
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
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 8192,
      },
    });

    // Step 1: Analyze the original script
    const analysisPrompt = `You are a YouTube viral video expert. Analyze the following transcript of a successful video.
Identify the core elements that made it successful (Hook, Structure, Pacing, Tone).

TRANSCRIPT:
${originalScript.substring(0, 15000)}

Respond in JSON format with this structure:
{
  "hookStrategy": "How the video grabs attention in Korean",
  "pacing": "Speed and rhythm description in Korean",
  "tone": "Emotional tone in Korean",
  "structureBreakdown": ["Step 1 in Korean", "Step 2 in Korean", ...],
  "keyKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}`;

    const analysisResult = await model.generateContent(analysisPrompt);
    const analysisResponse = await analysisResult.response;
    const analysisJsonString = analysisResponse.text();
    
    console.log('Analysis response:', analysisJsonString);
    
    if (!analysisJsonString) {
      throw new Error("대본 분석에 실패했습니다.");
    }

    let analysis: ViralAnalysis;
    try {
      const jsonMatch = analysisJsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON not found");
      }
    } catch (e) {
      console.log('Analysis JSON parsing failed, using defaults');
      analysis = {
        hookStrategy: "강력한 첫 인상으로 시청자의 관심을 끕니다",
        pacing: "빠른 템포로 정보를 전달합니다",
        tone: "열정적이고 친근한 톤",
        structureBreakdown: ["인트로", "문제 제기", "해결책 제시", "결론"],
        keyKeywords: ["관심", "흥미", "유익", "재미", "공감"]
      };
    }

    // Step 2: Generate the new script based on the analysis
    const scriptPrompt = `Based on the following analysis of a viral video structure, write a NEW YouTube script for a completely different topic.

TARGET TOPIC: ${newTopic}

VIRAL ANALYSIS DATA:
- Hook Strategy: ${analysis.hookStrategy}
- Tone: ${analysis.tone}
- Pacing: ${analysis.pacing}
- Structure: ${analysis.structureBreakdown.join(" -> ")}

INSTRUCTIONS:
1. Write the full script in Korean.
2. Strictly follow the "Structure" identified in the analysis.
3. Mimic the sentence length and energy of the original style.
4. Include [Scene/Visual Notes] in brackets to guide editing.
5. Make the hook extremely strong.
6. Write at least 1000 words.`;

    const generationResult = await model.generateContent(scriptPrompt);
    const generationResponse = await generationResult.response;
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
